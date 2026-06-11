import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type CartItem = {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    stock: number;
  };
};

type CartItemRow = {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  product:
    | {
        id: string;
        name: string;
        price: number;
        image_url: string;
        stock: number;
      }
    | {
        id: string;
        name: string;
        price: number;
        image_url: string;
        stock: number;
      }[]
    | null;
};

type CartContextType = {
  items: CartItem[];
  itemCount: number;
  total: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextType>({
  items: [],
  itemCount: 0,
  total: 0,
  loading: false,
  addToCart: async () => false,
  updateQuantity: async () => {},
  removeItem: async () => {},
  refreshCart: async () => {},
  isOpen: false,
  openCart: () => {},
  closeCart: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  async function getOrCreateCart(): Promise<string | null> {
    if (!user) return null;
    const supabase = createClient();

    const { data: existingCart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existingCart) return existingCart.id;

    const { data: newCart } = await supabase
      .from("carts")
      .insert({ user_id: user.id })
      .select("id")
      .single();

    return newCart?.id ?? null;
  }

  const loadCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { data: cart } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!cart) {
        setItems([]);
        return;
      }

      const { data } = await supabase
        .from("cart_items")
        .select(
          `
          id,
          cart_id,
          product_id,
          quantity,
          product:products (
            id,
            name,
            price,
            image_url,
            stock
          )
        `,
        )
        .eq("cart_id", cart.id);

      const normalizedItems = (data ?? []).flatMap((item) => {
        const row = item as CartItemRow;
        const product = Array.isArray(row.product) ? row.product[0] : row.product;
        if (!product) return [];

        return [
          {
            id: row.id,
            cart_id: row.cart_id,
            product_id: row.product_id,
            quantity: row.quantity,
            product,
          },
        ];
      });

      setItems(normalizedItems);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  async function addToCart(productId: string, quantity = 1): Promise<boolean> {
    if (!user) {
      toast.error("Please sign in to add items to your cart");
      navigate({
        to: "/login",
        search: { redirect: window.location.pathname },
      });
      return false;
    }

    const supabase = createClient();
    const cartId = await getOrCreateCart();
    if (!cartId) {
      toast.error("Could not open your cart. Try again.");
      return false;
    }

    const existing = items.find((item) => item.product_id === productId);

    if (existing) {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id);
      if (error) {
        toast.error("Could not update cart");
        return false;
      }
    } else {
      const { error } = await supabase
        .from("cart_items")
        .insert({ cart_id: cartId, product_id: productId, quantity });
      if (error) {
        toast.error("Could not add to cart");
        return false;
      }
    }

    await loadCart();
    setIsOpen(true);
    toast.success("Added to cart");
    return true;
  }

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return;
    const supabase = createClient();
    await supabase.from("cart_items").update({ quantity }).eq("id", itemId);
    await loadCart();
  }

  async function removeItem(itemId: string) {
    const supabase = createClient();
    await supabase.from("cart_items").delete().eq("id", itemId);
    await loadCart();
    toast.success("Removed from cart");
  }

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        refreshCart: loadCart,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
