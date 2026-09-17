'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/lib/api';
import ProductForm from '@/components/ProductForm';
import type { ApiResponse, Product } from '@/types';

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    api
      .get<ApiResponse<{ product: Product }>>(`/products/${id}`)
      .then((res) => {
        const p = res.data.data.product;
        const sellerId = p.seller && typeof p.seller === 'object' ? p.seller._id : p.seller;
        if (sellerId !== user._id && user.role !== 'admin' && user.role !== 'moderator') {
          setForbidden(true);
          return;
        }
        setProduct(p);
      })
      .finally(() => setLoading(false));
  }, [id, user]);

  if (authLoading || !user || loading) {
    return (
      <div className="container-page py-14">
        <div className="h-8 w-48 animate-pulse rounded bg-line-soft" />
      </div>
    );
  }

  if (forbidden || !product) {
    return (
      <div className="container-page py-24 text-center">
        <p className="text-sm text-ink-soft">{t('listings.noPermission')}</p>
      </div>
    );
  }

  return (
    <div className="container-page max-w-2xl py-10 sm:py-14">
      <span className="eyebrow">{t('sell.eyebrow')}</span>
      <h1 className="mt-2 mb-8 text-3xl font-bold text-ink">{t('listings.editTitle')}</h1>
      <ProductForm product={product} />
    </div>
  );
}
