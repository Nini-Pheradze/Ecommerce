'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { ApiListResponse, Product } from '@/types';
import ProductGrid from '@/components/ProductGrid';
import Filters from '@/components/Filters';
import Pagination from '@/components/Pagination';
import { useLanguage } from '@/context/LanguageContext';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    setLoading(true);
    api
      .get<ApiListResponse<{ products: Product[] }>>(`/products?${searchParams.toString()}`)
      .then((res) => {
        setProducts(res.data.data.products);
        setTotalPages(res.data.totalPages ?? 1);
        setCurrentPage(res.data.currentPage ?? 1);
        setTotalResults(res.data.totalProducts ?? res.data.results);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-8">
        <span className="eyebrow">{t('products.catalog')}</span>
        <h1 className="mt-2 font-bold text-3xl text-ink">{t('products.allProducts')}</h1>
        {!loading && <p className="mt-2 text-sm text-ink-faint">{totalResults} {t('products.count')}</p>}
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <Filters />
        <div>
          <ProductGrid products={products} loading={loading} />
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
