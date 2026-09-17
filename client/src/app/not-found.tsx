'use client';

import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <Compass size={36} strokeWidth={1.25} className="text-ink-faint" />
      <h1 className="font-bold text-3xl text-ink">{t('notFound.title')}</h1>
      <p className="max-w-sm text-sm text-ink-soft">
        {t('notFound.desc')}
      </p>
      <Link href="/" className="btn-primary mt-2">
        {t('notFound.backHome')} <ArrowRight size={16} />
      </Link>
    </div>
  );
}
