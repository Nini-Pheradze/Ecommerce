'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ImageOff, Package } from 'lucide-react';
import type { Product } from '@/types';
import { productImageUrl } from '@/lib/api';
import Price from '@/components/Price';
import Rating from '@/components/Rating';
import WishlistButton from '@/components/WishlistButton';
import { useLanguage } from '@/context/LanguageContext';
import type { Locale } from '@/lib/translations';

function timeAgo(dateStr: string | undefined, t: (key: string) => string, locale: Locale) {
  if (!dateStr) return '';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return t('products.justNow');
  if (mins < 60) return `${mins}${t('products.minAgo')}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}${t('products.hourAgo')}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}${t('products.dayAgo')}`;
  return new Date(dateStr).toLocaleDateString(locale === 'ka' ? 'ka-GE' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function ProductCard({ product }: { product: Product }) {
  const { t, locale } = useLanguage();
  const imageUrl = productImageUrl(product.imageCover);
  const outOfStock = product.stock <= 0;
  const categoryName = product.category && typeof product.category === 'object' ? product.category.name : undefined;
  const sellerName = product.seller && typeof product.seller === 'object' ? product.seller.name : undefined;

  return (
    <Link href={`/products/${product._id}`} className="card group block overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden border-b border-line bg-white">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-faint">
            <ImageOff size={28} strokeWidth={1.25} />
          </div>
        )}

        {!!product.discountPercentage && product.discountPercentage > 0 && (
          <span className="absolute left-2 top-2 rounded bg-clay px-1.5 py-0.5 text-[11px] font-bold text-white">
            -{product.discountPercentage}%
          </span>
        )}

        <WishlistButton productId={product._id} className="absolute right-2 top-2" />

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <span className="rounded border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-ink-soft">
              {t('products.outOfStock')}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1.5 p-3">
        <Price price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm text-ink group-hover:text-accent-500 group-hover:underline">
          {product.name}
        </h3>
        <Rating average={product.ratingsAverage} count={product.ratingsQuantity} size={12} />

        <div className="flex items-center gap-1.5 border-t border-line pt-2 text-xs text-ink-faint">
          <Package size={12} />
          <span>{categoryName ?? t('products.product')}</span>
          <span className="ml-auto truncate">
            {sellerName ? `${sellerName} · ` : ''}
            {timeAgo(product.createdAt, t, locale)}
          </span>
        </div>
      </div>
    </Link>
  );
}
