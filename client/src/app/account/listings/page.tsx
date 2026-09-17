'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ImageOff, Pencil, Plus, Store, Trash2 } from 'lucide-react';
import { api, getApiErrorMessage, productImageUrl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiListResponse, Product } from '@/types';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export default function MyListingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    api
      .get<ApiListResponse<{ products: Product[] }>>(`/products?seller=${user._id}&limit=100`)
      .then((res) => setProducts(res.data.data.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleDelete(id: string) {
    if (!window.confirm(t('listings.confirmDelete'))) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success(t('listings.deleted'));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  if (authLoading || !user) {
    return (
      <div className="container-page py-14">
        <div className="h-8 w-48 animate-pulse rounded bg-line-soft" />
      </div>
    );
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="eyebrow">{t('sell.eyebrow')}</span>
          <h1 className="mt-2 text-3xl font-bold text-ink">{t('listings.title')}</h1>
        </div>
        <Link href="/sell" className="btn-primary">
          <Plus size={16} /> {t('listings.addNew')}
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-md bg-line-soft" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-md border border-dashed border-line py-16 text-center">
          <Store size={28} strokeWidth={1.25} className="text-ink-faint" />
          <p className="text-sm text-ink-soft">{t('listings.empty')}</p>
          <Link href="/sell" className="btn-primary">{t('listings.startSelling')}</Link>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {products.map((product) => {
            const imageUrl = productImageUrl(product.imageCover);
            return (
              <li key={product._id} className="flex items-center gap-4 py-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-line bg-white">
                  {imageUrl ? (
                    <Image src={imageUrl} alt={product.name} fill sizes="64px" className="object-contain p-1" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-ink-faint">
                      <ImageOff size={18} strokeWidth={1.25} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Link href={`/products/${product._id}`} className="text-sm font-medium text-ink hover:underline">
                    {product.name}
                  </Link>
                  <p className="mt-1 text-xs text-ink-faint">
                    {formatPrice(product.price)} · {t('products.inStock')} {product.stock}
                  </p>
                </div>
                <Link
                  href={`/account/listings/${product._id}/edit`}
                  className="rounded-md p-2 text-ink-soft transition-colors hover:bg-line-soft hover:text-ink"
                  aria-label="Edit"
                >
                  <Pencil size={16} />
                </Link>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="rounded-md p-2 text-ink-soft transition-colors hover:bg-line-soft hover:text-clay"
                  aria-label="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
