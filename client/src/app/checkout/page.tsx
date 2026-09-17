'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getApiErrorMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiResponse, Order } from '@/types';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export default function CheckoutPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { items, subtotal, isLoading } = useCart();
  const { t } = useLanguage();
  const router = useRouter();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post<ApiResponse<{ order: Order }> & { sessionUrl?: string }>(
        '/orders',
        {
          shippingAddress: { address, city, phone },
          couponCode: couponCode.trim() || undefined,
        }
      );
      toast.success(t('checkout.orderCreated'));
      if (res.data.sessionUrl) {
        window.location.href = res.data.sessionUrl;
      } else {
        router.push('/account');
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (!authLoading && !user) {
    return (
      <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-sm text-ink-soft">{t('checkout.loginRequired')}</p>
        <Link href="/login" className="btn-primary">{t('nav.login')}</Link>
      </div>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-sm text-ink-soft">{t('checkout.emptyCart')}</p>
        <Link href="/products" className="btn-primary">
          {t('checkout.browseShop')} <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="mb-8 font-bold text-3xl text-ink">{t('checkout.title')}</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-field" htmlFor="address">{t('checkout.address')}</label>
            <input
              id="address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-field"
              placeholder={t('checkout.addressPlaceholder')}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label-field" htmlFor="city">{t('checkout.city')}</label>
              <input
                id="city"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input-field"
                placeholder="Tbilisi"
              />
            </div>
            <div>
              <label className="label-field" htmlFor="phone">{t('checkout.phone')}</label>
              <input
                id="phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                placeholder="+995 5xx xxx xxx"
              />
            </div>
          </div>
          <div>
            <label className="label-field" htmlFor="coupon">{t('checkout.couponCode')}</label>
            <div className="relative">
              <Tag size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                id="coupon"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="input-field pl-9"
                placeholder="SAVE10"
              />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 sm:w-auto">
            {submitting ? t('checkout.processing') : t('checkout.confirmOrder')} <ArrowRight size={16} />
          </button>
        </form>

        <div className="h-fit card space-y-4 p-6">
          <h2 className="eyebrow">{t('checkout.order')}</h2>
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.product._id} className="flex justify-between text-sm text-ink-soft">
                <span className="truncate pr-2">{item.product.name} × {item.quantity}</span>
                <span className="shrink-0 text-ink">{formatPrice(item.product.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-line pt-4 flex justify-between text-sm font-medium">
            <span>{t('cart.subtotal')}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
