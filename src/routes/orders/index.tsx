import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Package, ChevronRight } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ORDER_STATUS_COLORS, normalizeOrderStatus, type OrderStatus } from "@/lib/orders";

export const Route = createFileRoute("/orders/")({
  component: OrdersPage,
});

type Order = {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
};

function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    void loadOrders();
  }, [user]);

  async function loadOrders() {
    const supabase = createClient();
    const { data } = await supabase
      .from("orders")
      .select("id, order_number, total_amount, status, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    setOrders(data ?? []);
    setLoading(false);
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navigation />

      <main className="mx-auto max-w-[900px] px-6 pb-32 pt-36 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="eyebrow">Account</div>
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] text-primary">My orders</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tap an order to view tracking, items, and request cancellation.
          </p>
        </motion.div>

        <div className="mt-12">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-sm bg-secondary/50" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center py-24 text-center">
              <Package className="h-12 w-12 text-primary/20" strokeWidth={1} />
              <p className="mt-4 font-display text-xl text-primary">No orders yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Your completed orders will appear here.
              </p>
              <Link
                to="/shop"
                className="mt-8 rounded-full bg-primary px-8 py-3 text-[11px] uppercase tracking-[0.2em] text-primary-foreground transition hover:bg-accent"
              >
                Shop collection
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, i) => {
                const status = normalizeOrderStatus(order.status);

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.06 }}
                  >
                    <Link
                      to="/orders/$orderId"
                      params={{ orderId: order.id }}
                      className="group flex w-full cursor-pointer items-center justify-between gap-4 rounded-sm p-6 transition hover:shadow-md"
                      style={{
                        background: "color-mix(in oklab, var(--secondary) 30%, transparent)",
                        border: "1px solid color-mix(in oklab, var(--primary) 8%, transparent)",
                      }}
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="font-display text-lg text-primary group-hover:text-accent transition-colors">
                          {order.order_number}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-primary/40">
                          View details →
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-4 sm:gap-6">
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.15em] ${ORDER_STATUS_COLORS[status as OrderStatus]}`}
                        >
                          {status}
                        </span>
                        <p className="font-display text-lg text-primary">
                          ₹{order.total_amount.toLocaleString("en-IN")}
                        </p>
                        <ChevronRight className="h-4 w-4 text-primary/30 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
