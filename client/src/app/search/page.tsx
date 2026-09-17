'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import type { ApiListResponse, Product } from '@/types';
import ProductGrid from '@/components/ProductGrid';
import { useLanguage } from '@/context/LanguageContext';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const query = searchParams.get('query') ?? '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get<ApiListResponse<{ products: Product[] }>>(`/search/products?query=${encodeURIComponent(query)}`)
      .then((res) => setProducts(res.data.data.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-8 flex items-center gap-2 text-ink-faint">
        <Search size={16} />
        <span className="text-sm">{t('search.resultsFor')}</span>
      </div>
      <h1 className="mb-8 font-bold text-3xl text-ink">&ldquo;{query}&rdquo;</h1>
      <ProductGrid products={products} loading={loading} />
    </div>
  );
}
