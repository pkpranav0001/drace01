import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Package, MessageCircle } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_STEPS,
  getOrderStatusStep,
  normalizeOrderStatus,
  openCancellationWhatsApp,
  type OrderStatus,
} from "@/lib/orders";

export const Route = createFileRoute("/orders/$orderId")({
  component: OrderDetailPage,
});

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image_url: string;
    category: string;
  } | null;
};

type OrderItemRow = {
  id: string;
  quantity: number;
  price: number;
  product:
    | {
        id: string;
        name: string;
        image_url: string;
        category: string;
      }
    | {
        id: string;
        name: string;
        image_url: string;
        category: string;
      }[]
    | null;
};

type Order = {
  id: string;
  order_number: string;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  order_items: OrderItem[];
};

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        total_amount,
        status,
        created_at,
        order_items (
          id,
          quantity,
          price,
          product:products (
            id,
            name,
            image_url,
            category
          )
        )
      `,
      )
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      navigate({ to: "/orders" });
      return;
    }

    const orderItems = (data.order_items ?? []).map((item: OrderItemRow) => {
      const product = Array.isArray(item.product) ? item.product[0] : item.product;
      return {
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        product: product ?? null,
      };
    });

    setOrder({
      id: data.id,
      order_number: data.order_number,
      total_amount: data.total_amount,
      status: normalizeOrderStatus(data.status),
      created_at: data.created_at,
      order_items: orderItems,
    });
    setLoading(false);
  }, [orderId, user, navigate]);

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login", search: { redirect: `/orders/${orderId}` } });
      return;
    }
    void loadOrder();
  }, [user, orderId, navigate, loadOrder]);

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <AnimatedBackground />
        <Navigation />
        <div className="mx-auto max-w-[900px] space-y-6 px-6 pt-44 lg:px-12">
          <div className="h-8 w-48 animate-pulse rounded bg-secondary/50" />
          <div className="h-32 animate-pulse rounded-sm bg-secondary/50" />
          <div className="h-48 animate-pulse rounded-sm bg-secondary/50" />
        </div>
      </div>
    );
  }

  if (!order) return null;

  const currentStep = getOrderStatusStep(order.status);
  const progressPercent =
    ORDER_STATUS_STEPS.length > 1 ? (currentStep / (ORDER_STATUS_STEPS.length - 1)) * 100 : 0;

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navigation />

      <main className="mx-auto max-w-[900px] px-6 pb-32 pt-36 lg:px-12">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-[0.78rem] uppercase tracking-[0.2em] text-primary/50 transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to orders
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-8"
        >
          <div className="eyebrow">Order details</div>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] text-primary">
                {order.order_number}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Placed on{" "}
                {new Date(order.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <span
              className={`rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.15em] ${ORDER_STATUS_COLORS[order.status]}`}
            >
              {order.status}
            </span>
          </div>
        </motion.div>

        {/* Order tracking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 rounded-sm p-6 md:p-8"
          style={{
            background: "color-mix(in oklab, var(--secondary) 30%, transparent)",
            border: "1px solid color-mix(in oklab, var(--primary) 8%, transparent)",
          }}
        >
          <h2 className="mb-8 font-display text-lg text-primary">Order tracking</h2>

          <div className="relative">
            <div className="absolute left-4 top-4 hidden h-px w-full bg-primary/10 md:block" />
            <div
              className="absolute left-4 top-4 hidden h-px bg-accent transition-all duration-700 md:block"
              style={{ width: `${progressPercent}%` }}
            />
            <div className="absolute left-4 top-4 h-[calc(100%-2rem)] w-px bg-primary/10 md:hidden" />
            <div
              className="absolute left-4 top-4 w-px bg-accent transition-all duration-700 md:hidden"
              style={{ height: `${progressPercent}%` }}
            />

            <div className="relative flex flex-col gap-8 md:flex-row md:justify-between">
              {ORDER_STATUS_STEPS.map((step, i) => {
                const isCompleted = i <= currentStep;
                const isCurrent = i === currentStep;

                return (
                  <div
                    key={step}
                    className="flex items-start gap-4 md:flex-col md:items-center md:gap-3"
                  >
                    <div
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                        isCompleted ? "border-accent bg-accent" : "border-primary/20 bg-background"
                      }`}
                    >
                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="h-2.5 w-2.5 rounded-full bg-white"
                        />
                      )}
                    </div>
                    <div className="md:text-center">
                      <p
                        className={`text-sm font-medium ${isCompleted ? "text-primary" : "text-primary/30"}`}
                      >
                        {step}
                      </p>
                      {isCurrent && <p className="mt-0.5 text-xs text-accent">Current status</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Items ordered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 rounded-sm p-6 md:p-8"
          style={{
            background: "color-mix(in oklab, var(--secondary) 30%, transparent)",
            border: "1px solid color-mix(in oklab, var(--primary) 8%, transparent)",
          }}
        >
          <h2 className="mb-6 font-display text-lg text-primary">Items ordered</h2>

          {order.order_items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items found for this order.</p>
          ) : (
            <div className="space-y-5">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-sm">
                    {item.product?.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-secondary/50">
                        <Package className="h-6 w-6 text-primary/20" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <p className="font-display text-base text-primary">
                      {item.product?.name ?? "Product unavailable"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.product?.category ?? "—"} · Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-base text-primary">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      ₹{item.price.toLocaleString("en-IN")} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-between border-t border-primary/10 pt-5">
            <span className="text-sm text-muted-foreground">Total paid</span>
            <span className="font-display text-xl text-primary">
              ₹{order.total_amount.toLocaleString("en-IN")}
            </span>
          </div>
        </motion.div>

        {/* Request cancellation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 rounded-sm p-6 md:p-8"
          style={{
            background: "color-mix(in oklab, var(--secondary) 30%, transparent)",
            border: "1px solid color-mix(in oklab, var(--primary) 8%, transparent)",
          }}
        >
          <h2 className="mb-2 font-display text-lg text-primary">Need help?</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            To cancel or modify your order, contact us on WhatsApp. We&apos;ll assist you within a
            few hours.
          </p>
          <button
            type="button"
            onClick={() => openCancellationWhatsApp(order.order_number)}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-6 py-3 text-[11px] uppercase tracking-[0.2em] text-primary transition hover:bg-primary hover:text-primary-foreground"
          >
            <MessageCircle className="h-4 w-4" />
            Request cancellation
          </button>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
