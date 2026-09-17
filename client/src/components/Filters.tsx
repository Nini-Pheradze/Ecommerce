'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { api } from '@/lib/api';
import type { ApiListResponse, Category } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

export default function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryQuery, setCategoryQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(searchParams.get('price[gte]') ?? '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('price[lte]') ?? '');

  const sortOptions = [
    { value: '-createdAt', label: t('filters.newest') },
    { value: 'price', label: t('filters.priceLowHigh') },
    { value: '-price', label: t('filters.priceHighLow') },
    { value: '-ratingsAverage', label: t('filters.rating') },
  ];

  useEffect(() => {
    const timeout = setTimeout(() => {
      const url = categoryQuery
        ? `/search/categories?query=${encodeURIComponent(categoryQuery)}`
        : '/categories';
      api
        .get<ApiListResponse<{ categories: Category[] }>>(url)
        .then((res) => setCategories(res.data.data.categories))
        .catch(() => setCategories([]));
    }, 250);
    return () => clearTimeout(timeout);
  }, [categoryQuery]);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  function applyPriceRange(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set('price[gte]', minPrice);
    else params.delete('price[gte]');
    if (maxPrice) params.set('price[lte]', maxPrice);
    else params.delete('price[lte]');
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
    setMobileOpen(false);
  }

  function clearAll() {
    setMinPrice('');
    setMaxPrice('');
    router.push(pathname);
    setMobileOpen(false);
  }

  const activeCategory = searchParams.get('category') ?? '';
  const activeSort = searchParams.get('sort') ?? '-createdAt';
  const onSale = searchParams.get('onSale') === 'true';
  const hasActiveFilters = !!activeCategory || onSale || !!minPrice || !!maxPrice;

  const body = (
    <div className="space-y-8">
      <div>
        <h4 className="eyebrow mb-3">{t('filters.sort')}</h4>
        <select
          value={activeSort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="input-field"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h4 className="eyebrow mb-3">{t('filters.category')}</h4>
        <input
          value={categoryQuery}
          onChange={(e) => setCategoryQuery(e.target.value)}
          placeholder={t('filters.searchCategories')}
          className="input-field mb-3 text-xs"
        />
        <div className="flex flex-col gap-2">
          <button
            onClick={() => updateParam('category', null)}
            className={`text-left text-sm transition-colors ${
              !activeCategory ? 'font-medium text-ink' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {t('filters.all')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => updateParam('category', cat._id)}
              className={`text-left text-sm transition-colors ${
                activeCategory === cat._id ? 'font-medium text-ink' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="eyebrow mb-3">{t('filters.price')}</h4>
        <form onSubmit={applyPriceRange} className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            className="input-field"
          />
          <span className="text-ink-faint">–</span>
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            className="input-field"
          />
        </form>
        <button onClick={applyPriceRange} className="btn-secondary mt-3 w-full text-xs">
          {t('filters.apply')}
        </button>
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={onSale}
          onChange={(e) => updateParam('onSale', e.target.checked ? 'true' : null)}
          className="h-4 w-4 rounded border-line text-accent-600 focus:ring-accent-200"
        />
        {t('filters.onSaleOnly')}
      </label>

      {hasActiveFilters && (
        <button onClick={clearAll} className="btn-ghost px-0 text-xs">
          <X size={14} /> {t('filters.clear')}
        </button>
      )}
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="btn-secondary mb-4 w-full lg:hidden"
      >
        <SlidersHorizontal size={15} /> {t('filters.filters')}
      </button>

      <aside className="hidden lg:block">{body}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm overflow-y-auto bg-paper p-6 shadow-soft animate-fadeIn">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-bold text-lg">{t('filters.filters')}</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            {body}
          </div>
        </div>
      )}
    </>
  );
}
