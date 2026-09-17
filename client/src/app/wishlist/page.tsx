'use client';

import Link from 'next/link';
import { ArrowRight, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import ProductGrid from '@/components/ProductGrid';
import { useLanguage } from '@/context/LanguageContext';

export default function WishlistPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { items, isLoading } = useWishlist();
  const { t } = useLanguage();

  if (!authLoading && !user) {
    return (
      <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
        <Heart size={32} strokeWidth={1.25} className="text-ink-faint" />
        <p className="text-sm text-ink-soft">{t('wishlist.loginRequired')}</p>
        <Link href="/login" className="btn-primary">{t('nav.login')}</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="mb-8 font-bold text-3xl text-ink">{t('wishlist.title')}</h1>
      {!isLoading && items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <Heart size={32} strokeWidth={1.25} className="text-ink-faint" />
          <p className="text-sm text-ink-soft">{t('wishlist.empty')}</p>
          <Link href="/products" className="btn-primary">
            {t('checkout.browseShop')} <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <ProductGrid products={items} loading={isLoading} />
      )}
    </div>
  );
}
