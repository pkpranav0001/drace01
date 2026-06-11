import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Plus, Pencil, Trash2, X, Star, Upload, Loader } from "lucide-react";
import { z } from "zod";
import { AdminLayout } from "@/components/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/testimonials")({
  component: AdminTestimonialsPage,
});

type Testimonial = {
  id: string;
  name: string;
  location: string | null;
  review: string;
  rating: number;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
};

type TestimonialForm = {
  name: string;
  location: string;
  review: string;
  rating: number;
  image_url: string;
  display_order: string;
  is_active: boolean;
};

const emptyForm: TestimonialForm = {
  name: "",
  location: "",
  review: "",
  rating: 5,
  image_url: "",
  display_order: "0",
  is_active: true,
};

function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TestimonialForm>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = typeof window !== "undefined" ? createClient() : null!;

  useEffect(() => {
    void loadTestimonials();
  }, []);

  async function loadTestimonials() {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load testimonials.");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(t: Testimonial) {
    setForm({
      name: t.name,
      location: t.location || "",
      review: t.review,
      rating: t.rating,
      image_url: t.image_url || "",
      display_order: String(t.display_order),
      is_active: t.is_active,
    });
    setEditingId(t.id);
    setShowForm(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and WEBP formats are allowed.");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `customer-avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("testimonials")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("testimonials").getPublicUrl(filePath);

      setForm((prev) => ({ ...prev, image_url: publicUrl }));
      toast.success("Image uploaded and linked successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Image upload failed. Check bucket permissions.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    const testimonialSchema = z.object({
      name: z.string().min(1, "Customer name is required").max(100),
      location: z.string().max(100).optional(),
      review: z.string().min(1, "Review text is required").max(2000),
      rating: z.coerce.number().int().min(1).max(5),
      image_url: z.string().url("Invalid photo URL").or(z.string().length(0)).optional().nullable(),
      display_order: z.coerce.number().int().default(0),
      is_active: z.boolean(),
    });

    const parsed = testimonialSchema.safeParse({
      name: form.name.trim(),
      location: form.location.trim(),
      review: form.review.trim(),
      rating: form.rating,
      image_url: form.image_url.trim() || null,
      display_order: form.display_order,
      is_active: form.is_active,
    });

    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: parsed.data.name,
        location: parsed.data.location || null,
        review: parsed.data.review,
        rating: parsed.data.rating,
        image_url: parsed.data.image_url || null,
        display_order: parsed.data.display_order,
        is_active: parsed.data.is_active,
      };

      if (editingId) {
        const { error } = await supabase.from("testimonials").update(payload).eq("id", editingId);
        if (error) throw error;
        toast.success("Testimonial updated!");
      } else {
        const { error } = await supabase.from("testimonials").insert(payload);
        if (error) throw error;
        toast.success("Testimonial added!");
      }

      setShowForm(false);
      await loadTestimonials();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save testimonial.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
      toast.success("Testimonial deleted.");
      await loadTestimonials();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete testimonial.");
    }
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({ is_active: !current })
        .eq("id", id);
      if (error) throw error;
      await loadTestimonials();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status.");
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-[#2D2A26]">Testimonials</h1>
            <p className="mt-1 text-sm text-[#2D2A26]/50">
              {testimonials.length} reviews · Managed dynamically on storefront
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-full bg-[#2D2A26] px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-white transition hover:bg-[#C97B63] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Testimonial
          </button>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
            />
            <div
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-sm p-8 space-y-5"
              style={{
                background: "#FAF7F4",
                border: "1px solid color-mix(in oklab, #2D2A26 10%, transparent)",
              }}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-[#2D2A26]">
                  {editingId ? "Edit Testimonial" : "Add Testimonial"}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-[#2D2A26]/40 hover:text-[#2D2A26]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Name & Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#2D2A26]/50">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-sm border border-[#E8D8C8] bg-white/70 px-4 py-2.5 text-sm text-[#2D2A26] outline-none focus:border-[#C97B63]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#2D2A26]/50">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, IN"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full rounded-sm border border-[#E8D8C8] bg-white/70 px-4 py-2.5 text-sm text-[#2D2A26] outline-none focus:border-[#C97B63]"
                  />
                </div>
              </div>

              {/* Rating & Display Order */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#2D2A26]/50">
                    Rating (1-5)
                  </label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) })}
                    className="w-full rounded-sm border border-[#E8D8C8] bg-white/70 px-4 py-2.5 text-sm text-[#2D2A26] outline-none focus:border-[#C97B63]"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>
                        {"★".repeat(r) + "☆".repeat(5 - r)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#2D2A26]/50">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: e.target.value })}
                    className="w-full rounded-sm border border-[#E8D8C8] bg-white/70 px-4 py-2.5 text-sm text-[#2D2A26] outline-none focus:border-[#C97B63]"
                  />
                </div>
              </div>

              {/* Review Text */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#2D2A26]/50">
                  Review Text
                </label>
                <textarea
                  rows={4}
                  value={form.review}
                  onChange={(e) => setForm({ ...form, review: e.target.value })}
                  className="w-full rounded-sm border border-[#E8D8C8] bg-white/70 px-4 py-2.5 text-sm text-[#2D2A26] outline-none focus:border-[#C97B63] resize-none"
                />
              </div>

              {/* Avatar Upload */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#2D2A26]/50">
                  Customer Photo
                </label>
                <div className="flex items-center gap-4">
                  {form.image_url ? (
                    <img
                      src={form.image_url}
                      alt="Avatar Preview"
                      className="h-14 w-14 rounded-full object-cover border border-[#E8D8C8]"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-[#E8D8C8] bg-white/50 text-[#2D2A26]/30">
                      Photo
                    </div>
                  )}
                  <label className="flex items-center gap-2 rounded-full border border-[#E8D8C8] bg-white/70 px-4 py-2 text-xs uppercase tracking-wider text-[#2D2A26]/70 transition hover:bg-[#2D2A26]/5 cursor-pointer select-none">
                    {uploading ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {uploading ? "Uploading..." : "Upload Photo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => void handleImageUpload(e)}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="is_active" className="text-sm text-[#2D2A26]">
                  Active (Visible on homepage)
                </label>
              </div>

              <button
                onClick={() => void handleSave()}
                disabled={saving || uploading}
                className="w-full rounded-full bg-[#2D2A26] py-3 text-[11px] uppercase tracking-[0.2em] text-white transition hover:bg-[#C97B63] disabled:opacity-50 cursor-pointer font-medium"
              >
                {saving ? "Saving..." : editingId ? "Update Testimonial" : "Create Testimonial"}
              </button>
            </div>
          </div>
        )}

        {/* Testimonials List */}
        <div
          className="rounded-sm overflow-hidden bg-white/40"
          style={{ border: "1px solid color-mix(in oklab, #2D2A26 8%, transparent)" }}
        >
          {loading ? (
            <div className="space-y-px">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 animate-pulse bg-[#E8D8C8]/20" />
              ))}
            </div>
          ) : testimonials.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-[#2D2A26]/40">
              No testimonials added yet.
            </p>
          ) : (
            <div className="divide-y divide-[#2D2A26]/5">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#E8D8C8]">
                      {t.image_url ? (
                        <img
                          src={t.image_url}
                          alt={t.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#2D2A26]/5 font-display text-sm text-[#2D2A26]/50">
                          {t.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-display text-sm text-[#2D2A26]">{t.name}</p>
                        {t.location && (
                          <span className="text-[10px] text-[#2D2A26]/40 uppercase tracking-wider">
                            · {t.location}
                          </span>
                        )}
                        <span className="text-[10px] text-amber-500 flex items-center">
                          {"★".repeat(t.rating)}
                        </span>
                      </div>
                      <p className="text-xs text-[#2D2A26]/60 truncate max-w-md mt-0.5">
                        {t.review}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-[#2D2A26]/40">Order: {t.display_order}</span>
                    <button
                      onClick={() => void toggleActive(t.id, t.is_active)}
                      className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.12em] transition cursor-pointer ${
                        t.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {t.is_active ? "Active" : "Disabled"}
                    </button>
                    <button
                      onClick={() => openEdit(t)}
                      className="text-[#2D2A26]/40 transition hover:text-[#2D2A26] cursor-pointer"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => void handleDelete(t.id)}
                      className="text-[#2D2A26]/40 transition hover:text-red-500 cursor-pointer"
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
