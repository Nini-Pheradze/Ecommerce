'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-page grid grid-cols-2 gap-8 py-12 sm:grid-cols-4">
        <div>
          <h4 className="eyebrow mb-3">{t('footer.shop')}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/products" className="link-accent">{t('footer.allProducts')}</Link></li>
            <li><Link href="/products?onSale=true" className="link-accent">{t('nav.deals')}</Link></li>
            <li><Link href="/wishlist" className="link-accent">{t('nav.wishlist')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="eyebrow mb-3">{t('footer.account')}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/account" className="link-accent">{t('nav.myAccount')}</Link></li>
            <li><Link href="/cart" className="link-accent">{t('nav.cart')}</Link></li>
            <li><Link href="/login" className="link-accent">{t('nav.login')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="eyebrow mb-3">{t('footer.support')}</h4>
          <ul className="space-y-2 text-sm text-ink-soft">
            <li>support@shopspace.dev</li>
            <li>{t('footer.hours')}</li>
          </ul>
        </div>
        <div>
          <h4 className="eyebrow mb-3">ShopSpace</h4>
          <p className="text-sm leading-relaxed text-ink-soft">
            {t('footer.tagline')}
          </p>
        </div>
      </div>
      <div className="border-t border-line bg-line-soft py-4 text-center text-xs text-ink-faint">
        © {new Date().getFullYear()} ShopSpace. {t('footer.rights')}
      </div>
    </footer>
  );
}
