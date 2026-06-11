import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AdminLayout } from "@/components/AdminLayout";
import { createClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomersPage,
});

type Customer = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  order_count: number;
  total_spend: number;
};

function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = typeof window !== "undefined" ? createClient() : null!;

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, email, created_at")
      .eq("role", "customer")
      .order("created_at", { ascending: false });

    if (!profiles) {
      setLoading(false);
      return;
    }

    const enriched = await Promise.all(
      profiles.map(async (profile) => {
        const { data: orders } = await supabase
          .from("orders")
          .select("total_amount")
          .eq("user_id", profile.id);

        const order_count = orders?.length || 0;
        const total_spend = (orders || []).reduce((sum, o) => sum + o.total_amount, 0);

        return { ...profile, order_count, total_spend };
      }),
    );

    setCustomers(enriched);
    setLoading(false);
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl text-[#2D2A26]">Customers</h1>
          <p className="mt-1 text-sm text-[#2D2A26]/50">{customers.length} registered customers</p>
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
          ) : customers.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-[#2D2A26]/40">No customers yet.</p>
          ) : (
            <div className="divide-y divide-[#2D2A26]/5">
              {customers.map((customer, i) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex flex-wrap items-center justify-between gap-4 px-6 py-4"
                >
                  <div>
                    <p className="font-display text-sm text-[#2D2A26]">
                      {customer.name || "No name"}
                    </p>
                    <p className="text-xs text-[#2D2A26]/50">{customer.email}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-display text-lg text-[#2D2A26]">{customer.order_count}</p>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-[#2D2A26]/40">
                        Orders
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-display text-lg text-[#2D2A26]">
                        ₹{customer.total_spend.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-[#2D2A26]/40">
                        Spent
                      </p>
                    </div>
                    <p className="text-xs text-[#2D2A26]/40">
                      Joined {new Date(customer.created_at).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
