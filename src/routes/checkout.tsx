import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { z } from "zod";
import { toast } from "sonner";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Navigation } from "@/components/Navigation";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { fetchProductById } from "@/lib/products";
import {
  type CheckoutLineItem,
  type ShippingDetails,
  clearCartItems,
  createOrderRecord,
  getGrandTotal,
  getShippingCost,
  getSubtotal,
  openRazorpayCheckout,
} from "@/lib/payment";
import { verifyPaymentAndCreateOrder } from "@/lib/api/orders";

const shippingDetailsSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
  address: z.string().min(1, "Address is required").max(300),
  pincode: z.string().regex(/^[0-9]{6}$/, "Pincode must be exactly 6 digits"),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
});

const checkoutSearchSchema = z.object({
  buyNow: z.string().optional(),
  qty: z.coerce.number().min(1).optional(),
});

export const Route = createFileRoute("/checkout")({
  validateSearch: checkoutSearchSchema,
  component: CheckoutPage,
});

function CheckoutPage() {
  const { buyNow, qty } = Route.useSearch();
  const isBuyNow = Boolean(buyNow);
  const { items, itemCount, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [buyNowItem, setBuyNowItem] = useState<CheckoutLineItem | null>(null);
  const [buyNowLoading, setBuyNowLoading] = useState(isBuyNow);
  const [form, setForm] = useState<ShippingDetails>({
    fullName: "",
    email: user?.email ?? "",
    phone: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
  });
  const [errors, setErrors] = useState<Partial<ShippingDetails>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setForm((prev) => ({ ...prev, email: user.email ?? prev.email }));
    }
  }, [user?.email]);

  useEffect(() => {
    if (!buyNow) return;
    setBuyNowLoading(true);
    fetchProductById(buyNow).then((product) => {
      if (!product) {
        toast.error("Product not found");
        navigate({ to: "/shop" });
        return;
      }
      setBuyNowItem({
        product_id: product.id,
        quantity: qty ?? 1,
        price: product.price,
        name: product.name,
        image_url: product.image_url,
      });
      setBuyNowLoading(false);
    });
  }, [buyNow, qty, navigate]);

  const lineItems: CheckoutLineItem[] = useMemo(() => {
    if (isBuyNow) return buyNowItem ? [buyNowItem] : [];
    return items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product.price,
      name: item.product.name,
      image_url: item.product.image_url,
    }));
  }, [isBuyNow, buyNowItem, items]);

  const subtotal = getSubtotal(lineItems);
  const shipping = getShippingCost(subtotal);
  const grandTotal = getGrandTotal(subtotal);

  function validate(): boolean {
    try {
      shippingDetailsSchema.parse(form);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Partial<ShippingDetails> = {};
        err.errors.forEach((e) => {
          const path = e.path[0] as keyof ShippingDetails;
          if (path) {
            fieldErrors[path] = e.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  }

  async function handlePayment() {
    if (!validate()) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (lineItems.length === 0) return;

    setLoading(true);

    try {
      const orderNumber = `DC-${Date.now()}`;

      openRazorpayCheckout({
        amountInPaise: Math.round(grandTotal * 100),
        orderNumber,
        shipping: form,
        onDismiss: () => setLoading(false),
        onSuccess: async (paymentId) => {
          try {
            await verifyPaymentAndCreateOrder({
              data: {
                paymentId,
                orderNumber,
                items: lineItems,
                shipping: form,
              },
            });

            if (!isBuyNow) {
              await clearCartItems(items.map((item) => item.id));
              await refreshCart();
            }

            toast.success("Payment successful! Your order is confirmed.");
            navigate({ to: "/orders" });
          } catch (err) {
            console.error("Order save failed:", err);
            toast.error(
              err instanceof Error
                ? err.message
                : "Payment received but order save failed. Contact support.",
            );
            setLoading(false);
          }
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Could not start payment. Check Razorpay configuration.");
      setLoading(false);
    }
  }

  if (buyNowLoading || (!isBuyNow && itemCount === 0)) {
    const isEmpty = !isBuyNow && itemCount === 0 && !buyNowLoading;
    if (isEmpty) {
      return (
        <div className="relative min-h-screen">
          <AnimatedBackground />
          <Navigation />
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <p className="font-display text-2xl text-primary">Your cart is empty</p>
              <button
                onClick={() => navigate({ to: "/shop" })}
                className="mt-6 rounded-full bg-primary px-8 py-3 text-[11px] uppercase tracking-[0.2em] text-primary-foreground transition hover:bg-accent"
              >
                Browse collection
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="relative min-h-screen">
        <AnimatedBackground />
        <Navigation />
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-muted-foreground">Preparing checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navigation />

      <main className="mx-auto max-w-[1400px] px-6 pb-32 pt-36 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="eyebrow">{isBuyNow ? "Buy now" : "Checkout"}</div>
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] text-primary">
            {isBuyNow ? "Complete your purchase" : "Complete your order"}
          </h1>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_420px]">
          {/* Left — Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-8"
          >
            <FormSection title="Contact details">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Full Name"
                  value={form.fullName}
                  onChange={(v) => setForm({ ...form, fullName: v })}
                  error={errors.fullName}
                  placeholder="Pranav Kumar"
                />
                <Field
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                  error={errors.email}
                  placeholder="you@example.com"
                />
                <Field
                  label="Phone"
                  type="tel"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                  error={errors.phone}
                  placeholder="9876543210"
                />
              </div>
            </FormSection>

            <FormSection title="Shipping address">
              <div className="grid grid-cols-1 gap-4">
                <Field
                  label="Address"
                  value={form.address}
                  onChange={(v) => setForm({ ...form, address: v })}
                  error={errors.address}
                  placeholder="Flat 4B, MG Road"
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field
                    label="City"
                    value={form.city}
                    onChange={(v) => setForm({ ...form, city: v })}
                    error={errors.city}
                    placeholder="Bengaluru"
                  />
                  <Field
                    label="State"
                    value={form.state}
                    onChange={(v) => setForm({ ...form, state: v })}
                    error={errors.state}
                    placeholder="Karnataka"
                  />
                  <Field
                    label="Pincode"
                    value={form.pincode}
                    onChange={(v) => setForm({ ...form, pincode: v })}
                    error={errors.pincode}
                    placeholder="560001"
                    maxLength={6}
                  />
                </div>
              </div>
            </FormSection>
          </motion.div>

          {/* Right — Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div
              className="space-y-6 rounded-sm p-6"
              style={{
                background: "color-mix(in oklab, var(--secondary) 30%, transparent)",
                border: "1px solid color-mix(in oklab, var(--primary) 8%, transparent)",
              }}
            >
              <h2 className="font-display text-xl text-primary">Order summary</h2>

              <div className="space-y-4">
                {lineItems.map((item) => (
                  <div key={item.product_id} className="flex gap-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-sm">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-center">
                      <p className="text-sm font-medium text-primary">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm text-primary">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>

              <div className="h-px bg-primary/10" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>
                <div className="h-px bg-primary/10" />
                <div className="flex justify-between font-display text-lg text-primary">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full rounded-full bg-primary py-4 text-[11px] uppercase tracking-[0.22em] text-primary-foreground transition hover:bg-accent disabled:opacity-50"
              >
                {loading ? "Processing..." : `Pay ₹${grandTotal.toLocaleString("en-IN")}`}
              </button>

              <p className="text-center text-xs text-muted-foreground">
                Secured by Razorpay · UPI · Cards · Net Banking
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="space-y-6 rounded-sm p-8"
      style={{
        background: "color-mix(in oklab, var(--secondary) 30%, transparent)",
        border: "1px solid color-mix(in oklab, var(--primary) 8%, transparent)",
      }}
    >
      <h2 className="font-display text-xl text-primary">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase tracking-[0.2em] text-primary/60">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full rounded-sm border bg-white/60 px-4 py-3 text-sm text-primary placeholder:text-primary/30 outline-none transition focus:border-accent ${
          error ? "border-red-400" : "border-primary/15"
        }`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
