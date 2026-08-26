"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "@/lib/api";
import type { Product } from "@/types";
import { useAuth } from "./AuthContext";

interface WishlistContextValue {
  items: Product[];
  ids: Set<string>;
  loading: boolean;
  toggle: (productId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, ready } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get<{ data: { wishlist: Product[] } }>("/wishlist", true);
      setItems(res.data.wishlist);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (ready) refresh();
  }, [ready, refresh]);

  const ids = useMemo(() => new Set(items.map((p) => p._id)), [items]);

  const toggle = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) return;
      if (ids.has(productId)) {
        const res = await api.delete<{ data: { wishlist: Product[] } }>(
          `/wishlist/${productId}`,
          true
        );
        setItems(res.data.wishlist);
      } else {
        const res = await api.post<{ data: { wishlist: Product[] } }>(
          "/wishlist",
          { productId },
          true
        );
        setItems(res.data.wishlist);
      }
    },
    [ids, isAuthenticated]
  );

  const value = useMemo(
    () => ({ items, ids, loading, toggle, refresh }),
    [items, ids, loading, toggle, refresh]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
