'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ImageOff, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { productImageUrl } from '@/lib/api';
import Price from '@/components/Price';
import { useLanguage } from '@/context/LanguageContext';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export default function CartPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { items, subtotal, isLoading, removeFromCart, addToCart } = useCart();
  const { t } = useLanguage();

  if (!authLoading && !user) {
    return (
      <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
        <ShoppingBag size={32} strokeWidth={1.25} className="text-ink-faint" />
        <p className="text-sm text-ink-soft">{t('cart.loginRequired')}</p>
        <Link href="/login" className="btn-primary">{t('nav.login')}</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="mb-8 font-bold text-3xl text-ink">{t('cart.title')}</h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-md bg-line-soft" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <ShoppingBag size={32} strokeWidth={1.25} className="text-ink-faint" />
          <p className="text-sm text-ink-soft">{t('cart.empty')}</p>
          <Link href="/products" className="btn-primary">
            {t('cart.startShopping')} <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <ul className="divide-y divide-line">
            {items.map((item) => {
              const imageUrl = productImageUrl(item.product.imageCover);
              return (
                <li key={item.product._id} className="flex gap-4 py-6 first:pt-0">
                  <Link
                    href={`/products/${item.product._id}`}
                    className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-line-soft"
                  >
                    {imageUrl ? (
                      <Image src={imageUrl} alt={item.product.name} fill sizes="96px" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-ink-faint">
                        <ImageOff size={20} strokeWidth={1.25} />
                      </div>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link href={`/products/${item.product._id}`} className="text-sm font-medium text-ink hover:underline">
                          {item.product.name}
                        </Link>
                        <p className="mt-1 text-xs text-ink-faint">
                          {formatPrice(item.product.price)} × {item.quantity}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product._id)}
                        className="rounded-full p-1.5 text-ink-faint transition-colors hover:bg-line-soft hover:text-clay"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center rounded-md border border-line">
                        <button
                          onClick={async () => {
                            const remaining = item.quantity - 1;
                            await removeFromCart(item.product._id);
                            if (remaining > 0) await addToCart(item.product._id, remaining);
                          }}
                          className="p-2 text-ink-soft hover:text-ink"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item.product._id, 1)}
                          className="p-2 text-ink-soft hover:text-ink"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <Price price={item.product.price * item.quantity} size="sm" />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="h-fit card space-y-4 p-6">
            <h2 className="eyebrow">{t('cart.summary')}</h2>
            <div className="flex justify-between text-sm text-ink-soft">
              <span>{t('cart.subtotal')}</span>
              <span className="text-ink">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-ink-soft">
              <span>{t('cart.delivery')}</span>
              <span className="text-ink">{t('cart.calculatedAtCheckout')}</span>
            </div>
            <div className="border-t border-line pt-4">
              <Link href="/checkout" className="btn-primary w-full py-3.5">
                {t('cart.proceedToCheckout')} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
