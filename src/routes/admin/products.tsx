import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { AdminLayout } from "@/components/AdminLayout";
import { createClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/products")({
  component: AdminProductsPage,
});

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
  is_active: boolean;
};

type ProductForm = {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  image_url: string;
  video_url: string;
  is_active: boolean;
};

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "Face Care",
  image_url: "",
  video_url: "",
  is_active: true,
};

const categories = ["Face Care", "Body Care", "Lip Care", "Eye Care"];

function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const supabase = typeof window !== "undefined" ? createClient() : null!;

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const { data } = await supabase
      .from("products")
      .select("id, name, price, stock, category, image_url, is_active")
      .order("created_at", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(product: Product) {
    setForm({
      name: product.name,
      description: "",
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
      image_url: product.image_url,
      video_url: "",
      is_active: product.is_active,
    });
    setEditingId(product.id);
    setShowForm(true);
  }

  async function handleSave() {
    const productSchema = z.object({
      name: z.string().min(1, "Name is required").max(100),
      description: z.string().max(1000).optional(),
      price: z.coerce.number().min(0, "Price must be non-negative"),
      stock: z.coerce.number().int().min(0, "Stock must be a non-negative integer"),
      category: z.string().min(1, "Category is required"),
      image_url: z.string().min(1, "Image URL is required"),
      video_url: z.string().url("Invalid video URL").or(z.string().length(0)).optional(),
      is_active: z.boolean(),
    });

    const parsed = productSchema.safeParse({
      name: form.name.trim(),
      description: form.description.trim(),
      price: form.price,
      stock: form.stock,
      category: form.category,
      image_url: form.image_url.trim(),
      video_url: form.video_url.trim(),
      is_active: form.is_active,
    });

    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setSaving(true);

    const payload = {
      name: parsed.data.name,
      description: parsed.data.description || "",
      price: parsed.data.price,
      stock: parsed.data.stock,
      category: parsed.data.category,
      image_url: parsed.data.image_url,
      video_url: parsed.data.video_url || null,
      is_active: parsed.data.is_active,
    };

    if (editingId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingId);
      if (error) {
        toast.error(`Update failed: ${error.message}`);
      } else {
        toast.success("Product updated successfully!");
      }
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) {
        toast.error(`Create failed: ${error.message}`);
      } else {
        toast.success("Product created successfully!");
      }
    }

    await loadProducts();
    setShowForm(false);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    await loadProducts();
  }

  async function toggleVisibility(id: string, current: boolean) {
    await supabase.from("products").update({ is_active: !current }).eq("id", id);
    await loadProducts();
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-[#2D2A26]">Products</h1>
            <p className="mt-1 text-sm text-[#2D2A26]/50">{products.length} products</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-full bg-[#2D2A26] px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-white transition hover:bg-[#C97B63]"
          >
            <Plus className="h-4 w-4" />
            Add product
          </button>
        </div>

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
            />
            <div
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-sm p-8 space-y-4"
              style={{
                background: "#FAF7F4",
                border: "1px solid color-mix(in oklab, #2D2A26 10%, transparent)",
              }}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-[#2D2A26]">
                  {editingId ? "Edit product" : "New product"}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-[#2D2A26]/40 hover:text-[#2D2A26]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {[
                { label: "Name", key: "name", type: "text" },
                { label: "Description", key: "description", type: "text" },
                { label: "Price (₹)", key: "price", type: "number" },
                { label: "Stock", key: "stock", type: "number" },
                { label: "Image URL", key: "image_url", type: "text" },
                { label: "Video URL (optional)", key: "video_url", type: "text" },
              ].map(({ label, key, type }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#2D2A26]/50">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={form[key as keyof ProductForm] as string}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full rounded-sm border border-[#E8D8C8] bg-white/70 px-4 py-2.5 text-sm text-[#2D2A26] outline-none focus:border-[#C97B63]"
                  />
                </div>
              ))}

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#2D2A26]/50">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-sm border border-[#E8D8C8] bg-white/70 px-4 py-2.5 text-sm text-[#2D2A26] outline-none focus:border-[#C97B63]"
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="is_active" className="text-sm text-[#2D2A26]">
                  Visible on store
                </label>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-full bg-[#2D2A26] py-3 text-[11px] uppercase tracking-[0.2em] text-white transition hover:bg-[#C97B63] disabled:opacity-50"
              >
                {saving ? "Saving..." : editingId ? "Update product" : "Create product"}
              </button>
            </div>
          </div>
        )}

        {/* Products Table */}
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
          ) : products.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-[#2D2A26]/40">No products yet.</p>
          ) : (
            <div className="divide-y divide-[#2D2A26]/5">
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-sm">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-display text-sm text-[#2D2A26]">{product.name}</p>
                      <p className="text-xs text-[#2D2A26]/50">
                        {product.category} · Stock: {product.stock}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="font-display text-sm text-[#2D2A26]">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>
                    <button
                      onClick={() => toggleVisibility(product.id, product.is_active)}
                      className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.12em] transition ${
                        product.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {product.is_active ? "Active" : "Hidden"}
                    </button>
                    <button
                      onClick={() => openEdit(product)}
                      className="text-[#2D2A26]/40 transition hover:text-[#2D2A26]"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-[#2D2A26]/40 transition hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
