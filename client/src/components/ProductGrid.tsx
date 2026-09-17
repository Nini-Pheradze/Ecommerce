'use client';

import type { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import { PackageSearch } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ProductGrid({
  products,
  loading = false,
}: {
  products: Product[];
  loading?: boolean;
}) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-md border border-line bg-surface p-3">
            <div className="aspect-square rounded bg-line-soft" />
            <div className="mt-3 h-3.5 w-3/4 rounded bg-line-soft" />
            <div className="mt-2 h-3 w-1/3 rounded bg-line-soft" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-line py-24 text-center">
        <PackageSearch size={32} strokeWidth={1.25} className="text-ink-faint" />
        <p className="text-sm text-ink-soft">{t('products.noneFound')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
