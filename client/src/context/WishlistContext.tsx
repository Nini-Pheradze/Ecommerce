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
import type { ApiResponse, Product } from '@/types';

interface WishlistContextValue {
  items: Product[];
  isLoading: boolean;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) {
      setItems([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.get<ApiResponse<{ wishlist: Product[] }>>('/wishlist');
      setItems(res.data.data.wishlist);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isWishlisted = useCallback(
    (productId: string) => items.some((p) => p._id === productId),
    [items]
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (!token) {
        toast.error(t('toast.loginRequired'));
        return;
      }
      try {
        if (isWishlisted(productId)) {
          const res = await api.delete<ApiResponse<{ wishlist: Product[] }>>(
            `/wishlist/${productId}`
          );
          setItems(res.data.data.wishlist);
          toast.success(t('toast.removedFromWishlist'));
        } else {
          const res = await api.post<ApiResponse<{ wishlist: Product[] }>>('/wishlist', {
            productId,
          });
          setItems(res.data.data.wishlist);
          toast.success(t('toast.addedToWishlist'));
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error));
      }
    },
    [token, isWishlisted, t]
  );

  const value = useMemo(
    () => ({ items, isLoading, isWishlisted, toggleWishlist }),
    [items, isLoading, isWishlisted, toggleWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
}
