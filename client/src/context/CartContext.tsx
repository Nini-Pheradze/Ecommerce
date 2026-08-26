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
import type { Cart } from "@/types";
import { useAuth } from "./AuthContext";

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  subtotal: number;
  refresh: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, ready } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get<{ data: { cart: Cart } }>("/cart", true);
      setCart(res.data.cart);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (ready) refresh();
  }, [ready, refresh]);

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      const res = await api.post<{ data: { cart: Cart } }>(
        "/cart",
        { productId, quantity },
        true
      );
      setCart(res.data.cart);
    },
    []
  );

  const removeItem = useCallback(async (productId: string) => {
    const res = await api.delete<{ data: { cart: Cart } }>(`/cart/${productId}`, true);
    setCart(res.data.cart);
  }, []);

  // The API only supports incrementing quantity or removing an item entirely,
  // so "setting" a quantity is done by removing then re-adding at the target count.
  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    await api.delete<{ data: { cart: Cart } }>(`/cart/${productId}`, true);
    if (quantity > 0) {
      const res = await api.post<{ data: { cart: Cart } }>(
        "/cart",
        { productId, quantity },
        true
      );
      setCart(res.data.cart);
    } else {
      const res = await api.get<{ data: { cart: Cart } }>("/cart", true);
      setCart(res.data.cart);
    }
  }, []);

  const itemCount = useMemo(
    () => cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    [cart]
  );

  const subtotal = useMemo(
    () =>
      cart?.items?.reduce(
        (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
        0
      ) ?? 0,
    [cart]
  );

  const value = useMemo(
    () => ({ cart, loading, itemCount, subtotal, refresh, addItem, removeItem, updateQuantity }),
    [cart, loading, itemCount, subtotal, refresh, addItem, removeItem, updateQuantity]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
