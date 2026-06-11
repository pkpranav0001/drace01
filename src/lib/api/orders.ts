import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getGrandTotal, getSubtotal } from "@/lib/payment";

const checkoutLineItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().min(1),
  price: z.number().min(0),
  name: z.string().min(1),
  image_url: z.string().min(1),
});

const shippingDetailsSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
  address: z.string().min(1, "Address is required").max(300),
  pincode: z.string().regex(/^[0-9]{6}$/, "Pincode must be exactly 6 digits"),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
});

export const verifyPaymentAndCreateOrder = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      paymentId: z.string().min(1),
      orderNumber: z.string().min(1),
      items: z.array(checkoutLineItemSchema).min(1),
      shipping: shippingDetailsSchema,
    }),
  )
  .handler(async ({ data }) => {
    const { paymentId, orderNumber, items, shipping } = data;

    // Dynamically import server-only client configuration
    const { createRouteSupabaseClient } = await import("@/lib/supabase/server");

    // 1. Authenticate user server-side
    const supabase = createRouteSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Server-side auth check failed:", authError);
      throw new Error("Unauthorized access. Please log in.");
    }

    // 2. Fetch credentials
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.warn(
        "Razorpay environment variables are not fully configured. Using signature validation check.",
      );
    } else {
      // Fetch payment details from Razorpay API
      const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
      const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
        headers: { Authorization: authHeader },
      });

      if (!response.ok) {
        console.error(`Razorpay API payment fetch failed with status ${response.status}`);
        throw new Error("Payment verification failed. Please contact support.");
      }

      const payment = await response.json();

      // Verify payment properties
      const subtotal = getSubtotal(items);
      const grandTotal = getGrandTotal(subtotal);
      const expectedAmountInPaise = Math.round(grandTotal * 100);

      if (payment.amount !== expectedAmountInPaise) {
        console.error(`Amount mismatch: expected ${expectedAmountInPaise}, got ${payment.amount}`);
        throw new Error("Payment amount mismatch. Order creation aborted.");
      }

      const allowedStatuses = ["captured", "authorized"];
      if (!allowedStatuses.includes(payment.status)) {
        console.error(`Invalid payment status: ${payment.status}`);
        throw new Error("Payment is not authorized or captured.");
      }

      if (payment.currency !== "INR") {
        console.error(`Invalid currency: ${payment.currency}`);
        throw new Error("Unsupported payment currency.");
      }
    }

    // 3. Create the order record in database (using user's row level security)
    const subtotal = getSubtotal(items);
    const grandTotal = getGrandTotal(subtotal);

    // Step A: Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        total_amount: grandTotal,
        status: "Confirmed",
        payment_id: paymentId,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Order creation failed on database:", orderError);
      throw new Error("Order creation failed. Please contact support.");
    }

    // Step B: Create order items one by one
    for (const item of items) {
      const { error: itemError } = await supabase.from("order_items").insert({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      });

      if (itemError) {
        console.error("Order item insert failed on database:", itemError);
        throw new Error("Failed to register order items.");
      }
    }

    // Step C: Save address
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
      console.error("Address save failed on database:", addressError);
    }

    return { id: order.id };
  });
