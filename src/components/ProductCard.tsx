import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/products";
import { useWishlist } from "@/contexts/WishlistContext";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay: index * 0.06, ease: [0.2, 0.7, 0.2, 1] }}
      className="group relative flex flex-col"
    >
      <Link to="/products/$productId" params={{ productId: product.id }}>
        <div
          className="relative aspect-[4/5] w-full overflow-hidden rounded-sm"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
          />

          {/* Category badge */}
          <div className="absolute left-4 top-4 rounded-full bg-background/70 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-primary/80 backdrop-blur">
            {product.category}
          </div>

          {/* Wishlist heart */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-background/70 backdrop-blur transition hover:scale-110"
          >
            <Heart
              className={`h-4 w-4 transition-colors duration-300 ${
                wishlisted ? "fill-accent text-accent" : "text-primary/60"
              }`}
            />
          </button>

          {/* Hover CTA */}
          <div className="absolute inset-x-4 bottom-4 translate-y-3 rounded-full bg-primary py-3 text-center text-[11px] uppercase tracking-[0.22em] text-primary-foreground opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-accent">
            View Product
          </div>
        </div>

        <div className="mt-5 flex items-baseline justify-between gap-4">
          <div>
            <h3 className="font-display text-[1.35rem] leading-tight text-primary">
              {product.name}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {product.description?.slice(0, 55)}...
            </p>
          </div>
          <div className="font-display text-lg text-primary">
            ₹{product.price.toLocaleString("en-IN")}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
