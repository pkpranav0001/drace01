import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ShoppingBag, Package, Users, TrendingUp } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { createClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

type Stats = {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: {
    id: string;
    order_number: string;
    total_amount: number;
    status: string;
    created_at: string;
    profiles: { name: string; email: string } | null;
  }[];
};

function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const supabase = typeof window !== "undefined" ? createClient() : null!;

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const [ordersRes, productsRes, customersRes, recentRes] = await Promise.all([
      supabase.from("orders").select("total_amount", { count: "exact" }),
      supabase.from("products").select("id", { count: "exact" }),
      supabase.from("profiles").select("id", { count: "exact" }).eq("role", "customer"),
      supabase
        .from("orders")
        .select("id, order_number, total_amount, status, created_at, profiles(name, email)")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const revenue = (ordersRes.data || []).reduce((sum, o) => sum + o.total_amount, 0);

    const recentOrders = (recentRes.data ?? []).map((order) => {
      const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
      return {
        id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at,
        profiles: profile ?? null,
      };
    });

    setStats({
      totalOrders: ordersRes.count || 0,
      totalRevenue: revenue,
      totalProducts: productsRes.count || 0,
      totalCustomers: customersRes.count || 0,
      recentOrders,
    });
    setLoading(false);
  }

  const cards = [
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, format: "number" },
    { label: "Revenue", value: stats.totalRevenue, icon: TrendingUp, format: "currency" },
    { label: "Products", value: stats.totalProducts, icon: Package, format: "number" },
    { label: "Customers", value: stats.totalCustomers, icon: Users, format: "number" },
  ];

  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    Confirmed: "bg-blue-100 text-blue-700",
    Packed: "bg-purple-100 text-purple-700",
    "Out For Delivery": "bg-green-100 text-green-700",
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl text-[#2D2A26]">Dashboard</h1>
          <p className="mt-1 text-sm text-[#2D2A26]/50">Welcome back, here's what's happening.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, icon: Icon, format }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-sm p-6"
              style={{
                background: "color-mix(in oklab, #E8D8C8 30%, transparent)",
                border: "1px solid color-mix(in oklab, #2D2A26 8%, transparent)",
              }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.15em] text-[#2D2A26]/50">{label}</p>
                <Icon className="h-4 w-4 text-[#C97B63]" />
              </div>
              <p className="mt-3 font-display text-3xl text-[#2D2A26]">
                {loading
                  ? "—"
                  : format === "currency"
                    ? `₹${value.toLocaleString("en-IN")}`
                    : value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Recent Orders */}
        <div
          className="rounded-sm"
          style={{
            border: "1px solid color-mix(in oklab, #2D2A26 8%, transparent)",
          }}
        >
          <div className="border-b border-[#2D2A26]/8 px-6 py-4">
            <h2 className="font-display text-lg text-[#2D2A26]">Recent orders</h2>
          </div>
          <div className="divide-y divide-[#2D2A26]/5">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-4 w-32 animate-pulse rounded bg-[#E8D8C8]" />
                  <div className="h-4 w-24 animate-pulse rounded bg-[#E8D8C8]" />
                </div>
              ))
            ) : stats.recentOrders.length === 0 ? (
              <p className="px-6 py-8 text-sm text-[#2D2A26]/40">No orders yet.</p>
            ) : (
              stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-6 py-4"
                >
                  <div>
                    <p className="font-display text-sm text-[#2D2A26]">{order.order_number}</p>
                    <p className="text-xs text-[#2D2A26]/50">
                      {order.profiles?.name || order.profiles?.email || "Unknown"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.12em] ${statusColors[order.status] || ""}`}
                    >
                      {order.status}
                    </span>
                    <p className="font-display text-sm text-[#2D2A26]">
                      ₹{order.total_amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
