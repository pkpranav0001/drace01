import { motion, AnimatePresence } from "motion/react";
import { X, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { Link } from "@tanstack/react-router";

export function WishlistDrawer() {
  const { items, loading, removeFromWishlist, isOpen, closeWishlist } = useWishlist();
  const { addToCart } = useCart();

  async function handleMoveToCart(productId: string) {
    await addToCart(productId, 1);
    await removeFromWishlist(productId);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeWishlist}
            className="fixed inset-0 z-50 bg-primary/20 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col"
            style={{
              background: "color-mix(in oklab, var(--background) 95%, transparent)",
              backdropFilter: "blur(20px)",
              borderLeft: "1px solid color-mix(in oklab, var(--primary) 10%, transparent)",
              boxShadow: "-8px 0 40px rgba(0,0,0,0.08)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-primary/10 px-6 py-5">
              <div>
                <h2 className="font-display text-xl text-primary">Wishlist</h2>
                <p className="text-xs text-muted-foreground">
                  {items.length} {items.length === 1 ? "item" : "items"} saved
                </p>
              </div>
              <button
                onClick={closeWishlist}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/15 text-primary/60 transition hover:bg-primary/5 hover:text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="h-20 w-20 animate-pulse rounded-sm bg-secondary/50" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-2/3 animate-pulse rounded bg-secondary/50" />
                        <div className="h-3 w-1/3 animate-pulse rounded bg-secondary/50" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Heart className="h-12 w-12 text-primary/20" strokeWidth={1} />
                  <p className="mt-4 font-display text-lg text-primary">Nothing saved yet</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Tap the heart on any product to save it here.
                  </p>
                  <button
                    onClick={closeWishlist}
                    className="mt-6 rounded-full border border-primary/20 px-6 py-2.5 text-[11px] uppercase tracking-[0.2em] text-primary transition hover:bg-primary hover:text-primary-foreground"
                  >
                    Browse collection
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        transition={{ duration: 0.3 }}
                        className="flex gap-4"
                      >
                        {/* Image */}
                        <Link
                          to="/products/$productId"
                          params={{ productId: item.product_id }}
                          onClick={closeWishlist}
                          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm"
                        >
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="h-full w-full object-cover transition hover:scale-105 duration-500"
                          />
                        </Link>

                        {/* Details */}
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-display text-[0.95rem] leading-tight text-primary">
                                {item.product.name}
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {item.product.category}
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromWishlist(item.product_id)}
                              className="text-primary/30 transition hover:text-red-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="font-display text-sm text-primary">
                              ₹{item.product.price.toLocaleString("en-IN")}
                            </p>
                            <button
                              onClick={() => handleMoveToCart(item.product_id)}
                              className="flex items-center gap-1.5 rounded-full border border-primary/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] text-primary transition hover:bg-primary hover:text-primary-foreground"
                            >
                              <ShoppingBag className="h-3 w-3" />
                              Add to cart
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
