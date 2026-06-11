import { motion, AnimatePresence } from "motion/react";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCart } from "@/contexts/CartContext";
import { getGrandTotal, getShippingCost } from "@/lib/payment";

export function CartDrawer() {
  const { items, itemCount, total, loading, updateQuantity, removeItem, isOpen, closeCart } =
    useCart();

  const shipping = getShippingCost(total);
  const grandTotal = getGrandTotal(total);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-primary/20 backdrop-blur-sm"
          />

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
            <div className="flex items-center justify-between border-b border-primary/10 px-6 py-5">
              <div>
                <h2 className="font-display text-xl text-primary">Your cart</h2>
                <p className="text-xs text-muted-foreground">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </p>
              </div>
              <button
                onClick={closeCart}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/15 text-primary/60 transition hover:bg-primary/5 hover:text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

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
                  <ShoppingBag className="h-12 w-12 text-primary/20" strokeWidth={1} />
                  <p className="mt-4 font-display text-lg text-primary">Your cart is empty</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Add something beautiful to get started.
                  </p>
                  <Link
                    to="/shop"
                    onClick={closeCart}
                    className="mt-6 rounded-full border border-primary/20 px-6 py-2.5 text-[11px] uppercase tracking-[0.2em] text-primary transition hover:bg-primary hover:text-primary-foreground"
                  >
                    Browse collection
                  </Link>
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
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm">
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-display text-[0.95rem] leading-tight text-primary">
                              {item.product.name}
                            </p>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-primary/30 transition hover:text-red-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/20 text-primary transition hover:border-primary disabled:opacity-30"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-5 text-center text-sm text-primary">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stock}
                                className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/20 text-primary transition hover:border-primary disabled:opacity-30"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <p className="font-display text-sm text-primary">
                              ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="space-y-4 border-t border-primary/10 px-6 py-6">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{total.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                  </div>
                  <div className="flex items-center justify-between font-display text-lg text-primary">
                    <span>Total</span>
                    <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="flex w-full items-center justify-center rounded-full bg-primary py-4 text-[11px] uppercase tracking-[0.22em] text-primary-foreground transition hover:bg-accent"
                >
                  Proceed to checkout
                </Link>

                <Link
                  to="/shop"
                  onClick={closeCart}
                  className="flex w-full items-center justify-center rounded-full border border-primary/20 py-3 text-[11px] uppercase tracking-[0.2em] text-primary transition hover:bg-primary/5"
                >
                  Continue shopping
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
