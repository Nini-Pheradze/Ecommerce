'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import ProductForm from '@/components/ProductForm';

export default function SellPage() {
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="container-page py-14">
        <div className="h-8 w-48 animate-pulse rounded bg-line-soft" />
      </div>
    );
  }

  return (
    <div className="container-page max-w-2xl py-10 sm:py-14">
      <span className="eyebrow">{t('sell.eyebrow')}</span>
      <h1 className="mt-2 mb-8 text-3xl font-bold text-ink">{t('sell.title')}</h1>
      <ProductForm />
    </div>
  );
}
