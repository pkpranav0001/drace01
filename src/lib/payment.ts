import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export type CheckoutLineItem = {
  product_id: string;
  quantity: number;
  price: number;
  name: string;
  image_url: string;
};

export type ShippingDetails = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
};

export function getSubtotal(items: CheckoutLineItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getShippingCost(subtotal: number): number {
  return subtotal >= 999 ? 0 : 99;
}

export function getGrandTotal(subtotal: number): number {
  return subtotal + getShippingCost(subtotal);
}

export function openRazorpayCheckout({
  amountInPaise,
  orderNumber,
  shipping,
  onSuccess,
  onDismiss,
}: {
  amountInPaise: number;
  orderNumber: string;
  shipping: ShippingDetails;
  onSuccess: (paymentId: string) => Promise<void>;
  onDismiss: () => void;
}) {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: amountInPaise,
    currency: "INR",
    name: "Drace Core",
    description: `Order ${orderNumber}`,
    prefill: {
      name: shipping.fullName,
      email: shipping.email,
      contact: shipping.phone,
    },
    theme: { color: "#2D2A26" },
    handler: async function (response: { razorpay_payment_id: string }) {
      await onSuccess(response.razorpay_payment_id);
    },
    modal: {
      ondismiss: onDismiss,
    },
  };

  // @ts-expect-error: Razorpay is loaded dynamically via script tag on window
  const rzp = new window.Razorpay(options);
  rzp.open();
}

export async function createOrderRecord({
  user,
  orderNumber,
  items,
  paymentId,
  shipping,
}: {
  user: User;
  orderNumber: string;
  items: CheckoutLineItem[];
  paymentId: string;
  shipping?: ShippingDetails;
}) {
  const supabase = createClient();

  const subtotal = getSubtotal(items);
  const grandTotal = getGrandTotal(subtotal);

  // Step 1 — Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      order_number: orderNumber,
      total_amount: grandTotal,
      status: "Confirmed",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("Order creation failed:", orderError);
    throw new Error("Order creation failed");
  }

  // Step 2 — Create order items one by one
  for (const item of items) {
    const { error: itemError } = await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    });

    if (itemError) {
      console.error("Order item insert failed:", itemError);
      throw new Error("Order item insert failed");
    }
  }

  // Step 3 — Save address if provided
  if (shipping) {
    const { error: addressError } = await supabase.from("addresses").insert({
      user_id: user.id,
      name: shipping.fullName,
      phone: shipping.phone,
      address: shipping.address,
      city: shipping.city,
      state: shipping.state,
      pincode: shipping.pincode,
      is_default: false,
    });

    if (addressError) {
      console.error("Address save failed:", addressError);
    }
  }

  return order;
}

export async function clearCartItems(itemIds: string[]) {
  const supabase = createClient();

  for (const id of itemIds) {
    await supabase.from("cart_items").delete().eq("id", id);
  }
}
