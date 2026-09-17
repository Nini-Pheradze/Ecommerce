'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { t } = useLanguage();

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <CheckCircle2 size={40} className="text-leaf" strokeWidth={1.5} />
      <h1 className="text-2xl font-bold text-ink">{t('checkout.orderCreated')}</h1>
      {orderId && (
        <p className="text-sm text-ink-faint">
          {t('account.order')} #{orderId.slice(-6).toUpperCase()}
        </p>
      )}
      <div className="flex gap-3">
        <Link href="/account" className="btn-primary">{t('account.tabOrders')}</Link>
        <Link href="/products" className="btn-secondary">{t('checkout.browseShop')}</Link>
      </div>
    </div>
  );
}
