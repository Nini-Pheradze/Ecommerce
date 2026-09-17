'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import ProductForm from '@/components/ProductForm';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiResponse, Product } from '@/types';

export default function AdminEditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ApiResponse<{ product: Product }>>(`/products/${id}`)
      .then((res) => setProduct(res.data.data.product))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="h-8 w-48 animate-pulse rounded bg-line-soft" />;
  }

  if (!product) {
    return <p className="text-sm text-ink-soft">{t('admin.productNotFound')}</p>;
  }

  return (
    <div>
      <h2 className="mb-6 text-lg font-bold text-ink">{t('admin.editProduct')}</h2>
      <ProductForm product={product} redirectTo="/admin/products" />
    </div>
  );
}
