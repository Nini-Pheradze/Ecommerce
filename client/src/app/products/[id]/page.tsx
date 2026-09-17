'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, ImageOff } from 'lucide-react';
import { api, productImageUrl } from '@/lib/api';
import type { ApiResponse, Category, Product } from '@/types';
import Price from '@/components/Price';
import Rating from '@/components/Rating';
import AddToCartPanel from '@/components/AddToCartPanel';
import ReviewSection from '@/components/ReviewSection';
import { useLanguage } from '@/context/LanguageContext';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api
      .get<ApiResponse<{ product: Product }>>(`/products/${id}`)
      .then((res) => {
        const p = res.data.data.product;
        setProduct(p);
        setActiveImage(p.imageCover ?? p.images?.[0] ?? null);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-md bg-line-soft" />
          <div className="space-y-4">
            <div className="h-4 w-24 animate-pulse rounded bg-line-soft" />
            <div className="h-8 w-2/3 animate-pulse rounded bg-line-soft" />
            <div className="h-6 w-24 animate-pulse rounded bg-line-soft" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="container-page py-24 text-center">
        <p className="text-sm text-ink-soft">{t('products.notFound')}</p>
        <Link href="/products" className="btn-secondary mt-6 inline-flex">
          {t('products.backToCatalog')}
        </Link>
      </div>
    );
  }

  const gallery = [product.imageCover, ...(product.images ?? [])].filter(
    (v, i, arr): v is string => !!v && arr.indexOf(v) === i
  );
  const categoryName =
    product.category && typeof product.category === 'object' ? product.category.name : undefined;
  const activeImageUrl = productImageUrl(activeImage);

  return (
    <div className="container-page py-10 sm:py-14">
      <nav className="mb-8 flex items-center gap-1.5 text-xs text-ink-faint">
        <Link href="/" className="hover:text-ink">{t('products.home')}</Link>
        <ChevronRight size={12} />
        <Link href="/products" className="hover:text-ink">{t('products.products')}</Link>
        <ChevronRight size={12} />
        <span className="text-ink-soft">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-md bg-line-soft">
            {activeImageUrl ? (
              <Image src={activeImageUrl} alt={product.name} fill sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-ink-faint">
                <ImageOff size={40} strokeWidth={1.25} />
              </div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-4 flex gap-3">
              {gallery.map((img) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(img)}
                  className={`relative h-16 w-16 overflow-hidden rounded-xl border transition-colors ${
                    activeImage === img ? 'border-ink' : 'border-line'
                  }`}
                >
                  <Image src={productImageUrl(img)!} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {categoryName && <span className="eyebrow">{categoryName}</span>}
          <h1 className="mt-2 font-bold text-3xl text-ink sm:text-4xl">{product.name}</h1>
          <div className="mt-3">
            <Rating average={product.ratingsAverage} count={product.ratingsQuantity} />
          </div>
          <div className="mt-5">
            <Price price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
          </div>
          {product.description && (
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-ink-soft">
              {product.description}
            </p>
          )}
          <div className="mt-8 border-t border-line pt-8">
            <AddToCartPanel product={product} />
          </div>
        </div>
      </div>

      <div className="mt-20 max-w-2xl border-t border-line pt-12">
        <h2 className="mb-6 font-bold text-2xl text-ink">{t('products.reviews')}</h2>
        <ReviewSection productId={product._id} />
      </div>
    </div>
  );
}
