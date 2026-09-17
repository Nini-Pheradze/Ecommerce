'use client';

import ProductForm from '@/components/ProductForm';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminNewProductPage() {
  const { t } = useLanguage();

  return (
    <div>
      <h2 className="mb-6 text-lg font-bold text-ink">{t('admin.addProduct')}</h2>
      <ProductForm redirectTo="/admin/products" />
    </div>
  );
}
