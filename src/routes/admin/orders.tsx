import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AdminLayout } from "@/components/AdminLayout";
import { createClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrdersPage,
});

type Order = {
  id: string;
  order_number: string;
  total_amount: number;
  status: "Pending" | "Confirmed" | "Packed" | "Out For Delivery";
  created_at: string;
  profiles: { name: string; email: string; phone?: string } | null;
  order_items: { quantity: number; price: number; product: { name: string } | null }[];
};

type OrderRow = {
  id: string;
  order_number: string;
  total_amount: number;
  status: Order["status"];
  created_at: string;
  profiles:
    | { name: string; email: string; phone?: string }
    | { name: string; email: string; phone?: string }[]
    | null;
  order_items: {
    quantity: number;
    price: number;
    product: { name: string } | { name: string }[] | null;
  }[];
};

const statusOptions = ["Pending", "Confirmed", "Packed", "Out For Delivery"] as const;

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Packed: "bg-purple-100 text-purple-700",
  "Out For Delivery": "bg-green-100 text-green-700",
};

function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const supabase = typeof window !== "undefined" ? createClient() : null!;

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const { data } = await supabase
      .from("orders")
      .select(
        `
        id, order_number, total_amount, status, created_at,
        profiles ( name, email ),
        order_items (
          quantity, price,
          product:products ( name )
        )
      `,
      )
      .order("created_at", { ascending: false });

    const normalizedOrders = (data ?? []).map((order: OrderRow) => {
      const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
      const orderItems = order.order_items.map((item) => {
        const product = Array.isArray(item.product) ? item.product[0] : item.product;
        return {
          quantity: item.quantity,
          price: item.price,
          product: product ?? null,
        };
      });

      return {
        id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at,
        profiles: profile ?? null,
        order_items: orderItems,
      };
    });

    setOrders(normalizedOrders);
    setLoading(false);
  }

  async function updateStatus(orderId: string, status: string) {
    setUpdating(orderId);
    await supabase.from("orders").update({ status }).eq("id", orderId);
    await loadOrders();
    setUpdating(null);
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl text-[#2D2A26]">Orders</h1>
          <p className="mt-1 text-sm text-[#2D2A26]/50">{orders.length} total orders</p>
        </div>

        <div
          className="rounded-sm overflow-hidden"
          style={{ border: "1px solid color-mix(in oklab, #2D2A26 8%, transparent)" }}
        >
          {loading ? (
            <div className="space-y-px">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse bg-[#E8D8C8]/30" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-[#2D2A26]/40">No orders yet.</p>
          ) : (
            <div className="divide-y divide-[#2D2A26]/5">
              {orders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  {/* Order Row */}
                  <div
                    className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 cursor-pointer hover:bg-[#2D2A26]/2 transition"
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  >
                    <div>
                      <p className="font-display text-sm text-[#2D2A26]">{order.order_number}</p>
                      <p className="text-xs text-[#2D2A26]/50">
                        {order.profiles?.name || order.profiles?.email || "Unknown"} ·{" "}
                        {new Date(order.created_at).toLocaleDateString("en-IN")}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.12em] ${statusColors[order.status]}`}
                      >
                        {order.status}
                      </span>
                      <p className="font-display text-sm text-[#2D2A26]">
                        ₹{order.total_amount.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expanded === order.id && (
                    <div
                      className="px-6 pb-6 space-y-4"
                      style={{ background: "color-mix(in oklab, #E8D8C8 20%, transparent)" }}
                    >
                      {/* Items */}
                      <div className="space-y-2 pt-2">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-[#2D2A26]/50">
                          Items
                        </p>
                        {order.order_items.map((item, j) => (
                          <div key={j} className="flex justify-between text-sm text-[#2D2A26]">
                            <span>
                              {item.product?.name ?? "Unknown"} × {item.quantity}
                            </span>
                            <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                      </div>

                      {/* Customer */}
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-[#2D2A26]/50 mb-1">
                          Customer
                        </p>
                        <p className="text-sm text-[#2D2A26]">{order.profiles?.name}</p>
                        <p className="text-xs text-[#2D2A26]/50">{order.profiles?.email}</p>
                      </div>

                      {/* Update Status */}
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-[#2D2A26]/50 mb-2">
                          Update status
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {statusOptions.map((s) => (
                            <button
                              key={s}
                              onClick={() => updateStatus(order.id, s)}
                              disabled={order.status === s || updating === order.id}
                              className={`rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.12em] transition ${
                                order.status === s
                                  ? "bg-[#2D2A26] text-white"
                                  : "border border-[#2D2A26]/20 text-[#2D2A26]/60 hover:border-[#2D2A26] hover:text-[#2D2A26]"
                              } disabled:opacity-40`}
                            >
                              {updating === order.id ? "Updating..." : s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
