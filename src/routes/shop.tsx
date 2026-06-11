import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Navigation } from "@/components/Navigation";
import { FloatingActions } from "@/components/FloatingActions";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { fetchProductsByCategory, categories } from "@/lib/products";
import type { Product } from "@/lib/products";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Drace Core" },
      {
        name: "description",
        content: "Browse the full Drace Core collection of handcrafted skincare.",
      },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchProductsByCategory(activeCategory).then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, [activeCategory]);

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navigation />
      <FloatingActions />

      <main className="mx-auto max-w-[1400px] px-6 pb-24 pt-44 lg:px-12">
        {/* Header */}
        <div className="eyebrow">Shop</div>
        <h1 className="mt-3 font-display text-[clamp(2.4rem,6vw,4.6rem)] leading-[1.02] text-primary">
          The full collection.
        </h1>
        <p className="mt-6 max-w-md text-[15px] text-muted-foreground">
          Every product is handcrafted in small batches using natural ingredients. Made in India.
        </p>

        {/* Category Filter */}
        <div className="mt-12 flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-5 py-2 text-[11px] uppercase tracking-[0.2em] transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "border border-primary/20 text-primary/60 hover:border-primary/60 hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="mt-16">
          {loading ? (
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <div className="aspect-[4/5] w-full animate-pulse rounded-sm bg-secondary/50" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-secondary/50" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-secondary/50" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center text-muted-foreground">
              No products found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
