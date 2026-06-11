import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Save, Star, Sparkles, Check } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/homepage")({
  component: AdminHomepageManagementPage,
});

type Product = {
  id: string;
  name: string;
  category: string;
  image_url: string;
  is_active: boolean;
  is_best_seller: boolean;
  show_on_homepage: boolean;
};

function AdminHomepageManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedBestSellers, setSelectedBestSellers] = useState<string[]>([]);
  const [selectedHomepage, setSelectedHomepage] = useState<string[]>([]);
  const supabase = typeof window !== "undefined" ? createClient() : null!;

  useEffect(() => {
    void loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, category, image_url, is_active, is_best_seller, show_on_homepage")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;

      const activeProducts = data || [];
      setProducts(activeProducts);

      // Initialize selected lists from DB
      setSelectedBestSellers(activeProducts.filter((p) => p.is_best_seller).map((p) => p.id));
      setSelectedHomepage(activeProducts.filter((p) => p.show_on_homepage).map((p) => p.id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  function toggleBestSeller(id: string) {
    if (selectedBestSellers.includes(id)) {
      setSelectedBestSellers((prev) => prev.filter((item) => item !== id));
    } else {
      if (selectedBestSellers.length >= 4) {
        toast.error("Maximum 4 Best Sellers allowed. Please deselect another product first.");
        return;
      }
      setSelectedBestSellers((prev) => [...prev, id]);
    }
  }

  function toggleHomepage(id: string) {
    if (selectedHomepage.includes(id)) {
      setSelectedHomepage((prev) => prev.filter((item) => item !== id));
    } else {
      if (selectedHomepage.length >= 6) {
        toast.error(
          "Maximum 6 Featured Collection products allowed. Please deselect another product first.",
        );
        return;
      }
      setSelectedHomepage((prev) => [...prev, id]);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const allIds = products.map((p) => p.id);

      // 1. Reset all products' flags in bulk
      if (allIds.length > 0) {
        const { error: resetError } = await supabase
          .from("products")
          .update({ is_best_seller: false, show_on_homepage: false })
          .in("id", allIds);

        if (resetError) throw resetError;
      }

      // 2. Set new Best Sellers
      if (selectedBestSellers.length > 0) {
        const { error: bsError } = await supabase
          .from("products")
          .update({ is_best_seller: true })
          .in("id", selectedBestSellers);

        if (bsError) throw bsError;
      }

      // 3. Set new Homepage Collection
      if (selectedHomepage.length > 0) {
        const { error: hpError } = await supabase
          .from("products")
          .update({ show_on_homepage: true })
          .in("id", selectedHomepage);

        if (hpError) throw hpError;
      }

      toast.success("Homepage settings saved successfully!");
      await loadProducts();
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        {/* Sticky Header Actions */}
        <div className="flex flex-col gap-4 border-b border-[#2D2A26]/8 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-3xl text-[#2D2A26]">Homepage Curation</h1>
            <p className="mt-1 text-sm text-[#2D2A26]/50">
              Manage the curated products displayed on the homepage.
            </p>
          </div>
          <button
            onClick={() => void handleSave()}
            disabled={saving || loading}
            className="flex items-center justify-center gap-2 rounded-full bg-[#2D2A26] px-6 py-3 text-[11px] uppercase tracking-[0.2em] text-white transition hover:bg-[#C97B63] disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving Changes..." : "Save Settings"}
          </button>
        </div>

        {loading ? (
          <div className="space-y-8">
            <div className="h-48 animate-pulse rounded-sm bg-[#E8D8C8]/20" />
            <div className="h-64 animate-pulse rounded-sm bg-[#E8D8C8]/20" />
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-sm border border-[#2D2A26]/8 p-8 text-center text-sm text-[#2D2A26]/40">
            No active products found in your catalog. Add active products first in the Products
            panel.
          </div>
        ) : (
          <div className="space-y-10">
            {/* Best Sellers Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#2D2A26]/5 pb-3">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-[#C97B63]" strokeWidth={1.8} />
                  <h2 className="font-display text-xl text-[#2D2A26]">Best Sellers</h2>
                </div>
                <span
                  className={`text-xs uppercase tracking-wider font-semibold px-3 py-1 rounded-full ${
                    selectedBestSellers.length === 4
                      ? "bg-amber-100 text-amber-800"
                      : "bg-[#2D2A26]/5 text-[#2D2A26]/60"
                  }`}
                >
                  Selected: {selectedBestSellers.length} / 4
                </span>
              </div>
              <p className="text-xs text-[#2D2A26]/50 leading-relaxed max-w-xl">
                Only selected products will appear in the "Featured / Best Sellers" slider. Maximum
                4 products allowed.
              </p>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {products.map((product) => {
                  const isSelected = selectedBestSellers.includes(product.id);
                  return (
                    <div
                      key={`bs-${product.id}`}
                      onClick={() => toggleBestSeller(product.id)}
                      className={`relative flex flex-col justify-between rounded-sm p-4 border transition cursor-pointer select-none group bg-white/40 hover:bg-white/80 ${
                        isSelected ? "border-[#C97B63] shadow-md" : "border-[#E8D8C8] opacity-80"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#C97B63] text-white">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      <div className="space-y-3">
                        <div className="aspect-[4/5] w-full overflow-hidden rounded-sm bg-neutral-100">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div>
                          <p className="font-display text-sm text-[#2D2A26] line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-[#2D2A26]/40 uppercase tracking-widest mt-0.5">
                            {product.category}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Homepage Featured Collection Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#2D2A26]/5 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#C97B63]" strokeWidth={1.8} />
                  <h2 className="font-display text-xl text-[#2D2A26]">Featured Collection</h2>
                </div>
                <span
                  className={`text-xs uppercase tracking-wider font-semibold px-3 py-1 rounded-full ${
                    selectedHomepage.length === 6
                      ? "bg-amber-100 text-amber-800"
                      : "bg-[#2D2A26]/5 text-[#2D2A26]/60"
                  }`}
                >
                  Selected: {selectedHomepage.length} / 6
                </span>
              </div>
              <p className="text-xs text-[#2D2A26]/50 leading-relaxed max-w-xl">
                Curation of products listed on the main homepage Grid section. Maximum 6 products
                allowed.
              </p>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {products.map((product) => {
                  const isSelected = selectedHomepage.includes(product.id);
                  return (
                    <div
                      key={`hp-${product.id}`}
                      onClick={() => toggleHomepage(product.id)}
                      className={`relative flex flex-col justify-between rounded-sm p-4 border transition cursor-pointer select-none group bg-white/40 hover:bg-white/80 ${
                        isSelected ? "border-[#C97B63] shadow-md" : "border-[#E8D8C8] opacity-80"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#C97B63] text-white">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      <div className="space-y-3">
                        <div className="aspect-[4/5] w-full overflow-hidden rounded-sm bg-neutral-100">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div>
                          <p className="font-display text-sm text-[#2D2A26] line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-[#2D2A26]/40 uppercase tracking-widest mt-0.5">
                            {product.category}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
