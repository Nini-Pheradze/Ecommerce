'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Percent, Rocket, Search, ShieldCheck, Sparkles, Store, Truck } from 'lucide-react';
import { api } from '@/lib/api';
import type { ApiListResponse, Category, Product } from '@/types';
import ProductGrid from '@/components/ProductGrid';
import { useLanguage } from '@/context/LanguageContext';

export default function HomePage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<ApiListResponse<{ products: Product[] }>>('/products?limit=10&sort=-createdAt'),
      api.get<ApiListResponse<{ categories: Category[] }>>('/categories'),
    ])
      .then(([productsRes, categoriesRes]) => {
        setProducts(productsRes.data.data.products);
        setCategories(categoriesRes.data.data.categories);
      })
      .catch(() => {
        setProducts([]);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const quickLinks = [
    { label: t('home.onSale'), href: '/products?onSale=true', icon: Percent },
    { label: t('home.newListings'), href: '/products?sort=-createdAt', icon: Sparkles },
    { label: t('home.topRated'), href: '/products?sort=-ratingsAverage', icon: Rocket },
    { label: t('home.myListings'), href: '/account/listings', icon: Store },
  ];

  return (
    <div>
      <section className="border-b border-line bg-surface">
        <div className="container-page py-10 sm:py-14">
          <h1 className="text-center text-2xl font-extrabold text-ink sm:text-3xl">
            {t('home.heroTitle')}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-center text-sm text-ink-soft">
            {t('home.heroSubtitle')}
          </p>

          <form action="/search" className="mx-auto mt-6 flex max-w-2xl items-stretch overflow-hidden rounded-full border-2 border-ink/80 bg-surface focus-within:border-accent-500">
            <input
              name="query"
              type="text"
              placeholder={t('home.searchPlaceholder')}
              className="w-full bg-transparent px-5 py-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center gap-2 bg-accent-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-600"
            >
              <Search size={16} /> {t('home.search')}
            </button>
          </form>

          <div className="mx-auto mt-6 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="card flex flex-col items-center gap-2 px-3 py-4 text-center hover:border-accent-300"
                >
                  <Icon size={20} className="text-accent-500" strokeWidth={1.5} />
                  <span className="text-xs font-medium text-ink-soft">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-paper py-4">
        <div className="container-page flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-around sm:gap-2">
          <div className="flex items-center gap-2.5 text-sm text-ink-soft">
            <Truck size={18} className="text-accent-500" /> {t('home.freeDelivery')}
          </div>
          <div className="flex items-center gap-2.5 text-sm text-ink-soft">
            <ShieldCheck size={18} className="text-accent-500" /> {t('home.buyerProtection')}
          </div>
          <div className="flex items-center gap-2.5 text-sm text-ink-soft">
            <Store size={18} className="text-accent-500" /> {t('home.sellYours')}
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="container-page py-8">
          <h2 className="mb-4 text-lg font-bold text-ink">{t('home.browseByCategory')}</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/products?category=${cat._id}`}
                className="card flex min-w-[140px] shrink-0 flex-col items-center justify-center gap-2 px-6 py-6 text-center hover:border-accent-300"
              >
                <span className="text-sm font-semibold text-ink">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container-page py-8 sm:py-10">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket size={18} className="text-accent-500" />
            <h2 className="text-lg font-bold text-ink sm:text-xl">{t('home.latestListings')}</h2>
          </div>
          <Link href="/products" className="flex items-center gap-1 text-sm font-medium link-accent">
            {t('home.viewAll')} <ArrowRight size={14} />
          </Link>
        </div>
        <ProductGrid products={products} loading={loading} />
      </section>
    </div>
  );
}
