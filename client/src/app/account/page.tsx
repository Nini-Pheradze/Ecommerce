'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Package, ShieldAlert, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getApiErrorMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import ProfileSettings from '@/components/ProfileSettings';
import SecuritySettings from '@/components/SecuritySettings';
import SupportPanel from '@/components/SupportPanel';
import type { ApiListResponse, Order } from '@/types';

const STATUS_STYLES: Record<Order['status'], string> = {
  Pending: 'bg-line-soft text-ink-soft',
  Processing: 'bg-accent-50 text-accent-700',
  Shipped: 'bg-accent-100 text-accent-800',
  Delivered: 'bg-accent-600 text-white',
  Cancelled: 'bg-clay/10 text-clay',
};

const STATUS_LABEL_KEY: Record<Order['status'], string> = {
  Pending: 'account.statusPending',
  Processing: 'account.statusProcessing',
  Shipped: 'account.statusShipped',
  Delivered: 'account.statusDelivered',
  Cancelled: 'account.statusCancelled',
};

const STATUS_DESC_KEY: Record<Order['status'], string> = {
  Pending: 'account.statusPendingDesc',
  Processing: 'account.statusProcessingDesc',
  Shipped: 'account.statusShippedDesc',
  Delivered: 'account.statusDeliveredDesc',
  Cancelled: 'account.statusCancelledDesc',
};

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

type TabKey = 'orders' | 'profile' | 'security' | 'support';

export default function AccountPage() {
  const { user, isLoading, logout } = useAuth();
  const { t, locale } = useLanguage();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [resendingVerification, setResendingVerification] = useState(false);

  async function handleResendVerification() {
    setResendingVerification(true);
    try {
      await api.post('/auth/resend-verification');
      toast.success(t('auth.verificationEmailSent'));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setResendingVerification(false);
    }
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'orders', label: t('account.tabOrders') },
    { key: 'profile', label: t('account.tabProfile') },
    { key: 'security', label: t('account.tabSecurity') },
    { key: 'support', label: t('account.tabSupport') },
  ];

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    api
      .get<ApiListResponse<{ orders: Order[] }>>('/orders/my-orders')
      .then((res) => setOrders(res.data.data.orders))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [user]);

  if (isLoading || !user) {
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
          <span className="eyebrow">{t('nav.myAccount')}</span>
          <h1 className="mt-2 text-3xl font-bold text-ink">{t('account.greeting')}, {user.name.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-ink-faint">{user.email}</p>
          {user.isVerified === false && (
            <p className="mt-2 text-xs text-clay">
              {t('auth.notVerified')}{' '}
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendingVerification}
                className="underline disabled:opacity-60"
              >
                {resendingVerification ? t('auth.sendingVerification') : t('auth.verifyNow')}
              </button>
            </p>
          )}
        </div>
        <button
          onClick={() => {
            logout();
            router.push('/');
          }}
          className="btn-secondary"
        >
          <LogOut size={15} /> {t('account.logout')}
        </button>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        <Link href="/account/listings" className="card flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-ink hover:border-accent-300">
          <Store size={16} className="text-accent-500" /> {t('account.myListings')}
        </Link>
        {(user.role === 'admin' || user.role === 'moderator') && (
          <Link href="/admin" className="card flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-ink hover:border-accent-300">
            <ShieldAlert size={16} className="text-accent-500" />
            {user.role === 'admin' ? t('account.adminPanel') : t('account.moderatorPanel')}
          </Link>
        )}
      </div>

      <div className="mb-6 flex gap-1 border-b border-line">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === tabItem.key
                ? 'border-accent-500 text-accent-500'
                : 'border-transparent text-ink-soft hover:text-ink'
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div>
          {ordersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-md bg-line-soft" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-md border border-dashed border-line py-16 text-center">
              <Package size={28} strokeWidth={1.25} className="text-ink-faint" />
              <p className="text-sm text-ink-soft">{t('account.noOrders')}</p>
              <Link href="/products" className="btn-primary">{t('account.browseShop')}</Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {orders.map((order) => (
                <li key={order._id} className="card space-y-3 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{t('account.order')} #{order._id.slice(-6).toUpperCase()}</p>
                      <p className="mt-1 text-xs text-ink-faint">
                        {new Date(order.createdAt).toLocaleDateString(locale === 'ka' ? 'ka-GE' : 'en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}{' '}
                        · {order.orderItems.length} {t('account.items')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[order.status]}`}
                        title={t(STATUS_DESC_KEY[order.status])}
                      >
                        {t(STATUS_LABEL_KEY[order.status])}
                      </span>
                      <span className="text-sm font-medium text-ink">{formatPrice(order.totalPrice)}</span>
                    </div>
                  </div>
                  {order.orderItems.length > 0 && (
                    <ul className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3">
                      {order.orderItems.map((item, i) => (
                        <li key={i}>
                          <Link
                            href={`/products/${item.product}`}
                            className="text-xs link-accent"
                          >
                            {item.name ?? t('products.product')} × {item.quantity}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'profile' && <ProfileSettings />}
      {tab === 'security' && <SecuritySettings />}
      {tab === 'support' && <SupportPanel />}
    </div>
  );
}
