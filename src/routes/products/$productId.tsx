import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Navigation } from "@/components/Navigation";
import { FloatingActions } from "@/components/FloatingActions";
import { Footer } from "@/components/Footer";
import { fetchProductById } from "@/lib/products";
import type { Product } from "@/lib/products";
import { useCart } from "@/contexts/CartContext";

export const Route = createFileRoute("/products/$productId")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchProductById(productId).then((data) => {
      if (!data) navigate({ to: "/shop" });
      setProduct(data);
      setLoading(false);
    });
  }, [productId]);

  async function handleAddToCart() {
    if (!product) return;
    setAdding(true);
    await addToCart(product.id, quantity);
    setAdding(false);
  }

  function handleBuyNow() {
    if (!product || product.stock === 0) return;
    navigate({
      to: "/checkout",
      search: { buyNow: product.id, qty: quantity },
    });
  }

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <AnimatedBackground />
        <Navigation />
        <div className="mx-auto max-w-[1400px] px-6 pt-44 lg:px-12">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            <div className="aspect-[4/5] animate-pulse rounded-sm bg-secondary/50" />
            <div className="space-y-6 pt-8">
              <div className="h-6 w-1/3 animate-pulse rounded bg-secondary/50" />
              <div className="h-12 w-2/3 animate-pulse rounded bg-secondary/50" />
              <div className="h-4 w-1/4 animate-pulse rounded bg-secondary/50" />
              <div className="h-24 animate-pulse rounded bg-secondary/50" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navigation />
      <FloatingActions />

      <main className="mx-auto max-w-[1400px] px-6 pb-32 pt-36 lg:px-12">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-[0.78rem] uppercase tracking-[0.2em] text-primary/50 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to shop
          </Link>
        </motion.div>

        {/* Main Grid */}
        <div className="mt-10 grid grid-cols-1 gap-16 lg:grid-cols-2">
          {/* Left — Image */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
            className="relative aspect-[4/5] overflow-hidden rounded-sm"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <img
              src={product.image_url}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute left-4 top-4 rounded-full bg-background/70 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-primary/80 backdrop-blur">
              {product.category}
            </div>
          </motion.div>

          {/* Right — Details */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.2, 0.7, 0.2, 1] }}
            className="flex flex-col justify-start lg:pt-4"
          >
            <div className="eyebrow">{product.category}</div>
            <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3.2rem)] leading-tight text-primary">
              {product.name}
            </h1>

            <div className="mt-4 font-display text-2xl text-primary">
              ₹{product.price.toLocaleString("en-IN")}
            </div>

            <div className="mt-2 text-xs text-muted-foreground">
              {product.stock > 10
                ? "In stock"
                : product.stock > 0
                  ? `Only ${product.stock} left`
                  : "Out of stock"}
            </div>

            <div className="my-8 h-px bg-primary/10" />

            <div>
              <div className="eyebrow mb-3">About</div>
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>

            <div className="my-8 h-px bg-primary/10" />

            {/* Quantity */}
            <div>
              <div className="eyebrow mb-4">Quantity</div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 text-primary transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-6 text-center font-display text-xl text-primary">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 text-primary transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="my-8 h-px bg-primary/10" />

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || adding}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-[11px] uppercase tracking-[0.22em] text-primary-foreground transition-all duration-300 hover:bg-accent disabled:opacity-40"
              >
                <ShoppingBag className="h-4 w-4" />
                {adding ? "Adding..." : "Add to cart"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex flex-1 items-center justify-center rounded-full border border-primary px-8 py-4 text-[11px] uppercase tracking-[0.22em] text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground disabled:opacity-40"
              >
                Buy now
              </button>
            </div>

            <div className="my-8 h-px bg-primary/10" />

            <div className="space-y-5 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                Free shipping on orders above ₹999
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                Handcrafted in small batches in Bengaluru
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                Natural ingredients · Cruelty free · Made in India
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
