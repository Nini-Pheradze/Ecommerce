'use client';

import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function CheckoutCancelPage() {
  const { t } = useLanguage();

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <XCircle size={40} className="text-clay" strokeWidth={1.5} />
      <h1 className="text-2xl font-bold text-ink">{t('checkout.cancelled')}</h1>
      <p className="max-w-sm text-sm text-ink-soft">{t('checkout.cancelledDesc')}</p>
      <div className="flex gap-3">
        <Link href="/cart" className="btn-primary">{t('checkout.backToCart')}</Link>
        <Link href="/products" className="btn-secondary">{t('checkout.browseShop')}</Link>
      </div>
    </div>
  );
}
