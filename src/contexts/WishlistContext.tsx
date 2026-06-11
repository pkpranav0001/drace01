import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type WishlistItem = {
  id: string;
  wishlist_id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    category: string;
  };
};

type WishlistItemRow = {
  id: string;
  wishlist_id: string;
  product_id: string;
  product:
    | {
        id: string;
        name: string;
        price: number;
        image_url: string;
        category: string;
      }
    | {
        id: string;
        name: string;
        price: number;
        image_url: string;
        category: string;
      }[]
    | null;
};

type WishlistContextType = {
  items: WishlistItem[];
  itemCount: number;
  loading: boolean;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
};

const WishlistContext = createContext<WishlistContextType>({
  items: [],
  itemCount: 0,
  loading: false,
  isInWishlist: () => false,
  addToWishlist: async () => {},
  removeFromWishlist: async () => {},
  toggleWishlist: async () => {},
  isOpen: false,
  openWishlist: () => {},
  closeWishlist: () => {},
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const itemCount = items.length;

  async function getOrCreateWishlist(): Promise<string | null> {
    if (!user) return null;
    const supabase = createClient();

    const { data: existing } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existing) return existing.id;

    const { data: created } = await supabase
      .from("wishlists")
      .insert({ user_id: user.id })
      .select("id")
      .single();

    return created?.id ?? null;
  }

  const loadWishlist = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { data: wishlist } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!wishlist) {
        setItems([]);
        return;
      }

      const { data } = await supabase
        .from("wishlist_items")
        .select(
          `
          id,
          wishlist_id,
          product_id,
          product:products (
            id,
            name,
            price,
            image_url,
            category
          )
        `,
        )
        .eq("wishlist_id", wishlist.id);

      const normalizedItems = (data ?? []).flatMap((item) => {
        const row = item as WishlistItemRow;
        const product = Array.isArray(row.product) ? row.product[0] : row.product;
        if (!product) return [];

        return [
          {
            id: row.id,
            wishlist_id: row.wishlist_id,
            product_id: row.product_id,
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
    void loadWishlist();
  }, [loadWishlist]);

  function isInWishlist(productId: string): boolean {
    return items.some((item) => item.product_id === productId);
  }

  async function addToWishlist(productId: string) {
    if (!user) return;
    const supabase = createClient();
    const wishlistId = await getOrCreateWishlist();
    if (!wishlistId) return;

    await supabase
      .from("wishlist_items")
      .insert({ wishlist_id: wishlistId, product_id: productId });
    await loadWishlist();
  }

  async function removeFromWishlist(productId: string) {
    const item = items.find((i) => i.product_id === productId);
    if (!item) return;

    const supabase = createClient();
    await supabase.from("wishlist_items").delete().eq("id", item.id);
    await loadWishlist();
  }

  async function toggleWishlist(productId: string) {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount,
        loading,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isOpen,
        openWishlist: () => setIsOpen(true),
        closeWishlist: () => setIsOpen(false),
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
