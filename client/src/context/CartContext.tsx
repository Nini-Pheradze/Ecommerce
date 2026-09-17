'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import toast from 'react-hot-toast';
import { api, getApiErrorMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiResponse, Cart, CartItem } from '@/types';

interface CartContextValue {
  cart: Cart | null;
  items: CartItem[];
  isLoading: boolean;
  itemCount: number;
  subtotal: number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) {
      setCart(null);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.get<ApiResponse<{ cart: Cart }>>('/cart');
      setCart(res.data.data.cart);
    } catch {
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      if (!token) {
        toast.error(t('toast.loginRequired'));
        throw new Error('Not authenticated');
      }
      try {
        const res = await api.post<ApiResponse<{ cart: Cart }>>('/cart', { productId, quantity });
        setCart(res.data.data.cart);
        toast.success(t('toast.addedToCart'));
      } catch (error) {
        toast.error(getApiErrorMessage(error));
        throw error;
      }
    },
    [token, t]
  );

  const removeFromCart = useCallback(async (productId: string) => {
    try {
      const res = await api.delete<ApiResponse<{ cart: Cart }>>(`/cart/${productId}`);
      setCart(res.data.data.cart);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      throw error;
    }
  }, []);

  const items = useMemo(() => cart?.items.filter((i) => i.product) ?? [], [cart]);
  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({ cart, items, isLoading, itemCount, subtotal, addToCart, removeFromCart, refresh }),
    [cart, items, isLoading, itemCount, subtotal, addToCart, removeFromCart, refresh]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
