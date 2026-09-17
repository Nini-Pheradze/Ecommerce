'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Heart, Menu, Moon, Plus, Search, ShoppingBag, Sun, User, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

export default function Header() {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const { t, locale, toggleLocale } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const categoryLinks = [
    { label: t('nav.allCategories'), href: '/products' },
    { label: t('nav.deals'), href: '/products?onSale=true' },
    { label: t('nav.new'), href: '/products?sort=-createdAt' },
    { label: t('nav.topRated'), href: '/products?sort=-ratingsAverage' },
    { label: t('nav.wishlist'), href: '/wishlist' },
  ];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?query=${encodeURIComponent(query.trim())}`);
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 bg-surface">
      <div className="border-b border-line">
        <div className="container-page flex h-16 items-center gap-4">
          <button
            className="p-1 text-ink lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link href="/" className="shrink-0 text-2xl font-extrabold tracking-tight text-ink">
            Shop<span className="text-accent-500">Space</span>
          </Link>

          <Link
            href="/sell"
            className="hidden shrink-0 items-center gap-1.5 rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-600 sm:inline-flex"
          >
            <Plus size={16} /> {t('nav.addListing')}
          </Link>

          <form
            onSubmit={handleSearch}
            className="hidden flex-1 items-stretch overflow-hidden rounded-full border border-line bg-paper focus-within:border-accent-400 sm:flex"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder={t('nav.searchPlaceholder')}
              className="w-full bg-transparent px-4 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center justify-center rounded-full bg-accent-500 px-5 text-white transition-colors hover:bg-accent-600"
              aria-label="Search"
            >
              <Search size={17} />
            </button>
          </form>

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-ink-soft transition-colors hover:bg-line-soft hover:text-ink"
              aria-label="Toggle dark mode"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={toggleLocale}
              className="hidden rounded-full border border-line px-2.5 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-accent-400 hover:text-ink sm:inline-flex"
              aria-label="Switch language"
              title={locale === 'en' ? 'ქართულად' : 'In English'}
            >
              {t('lang.switchTo')}
            </button>
            <Link
              href={user ? '/account' : '/login'}
              className="hidden items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm text-ink-soft transition-colors hover:bg-line-soft hover:text-ink sm:flex"
            >
              <User size={18} />
              {user ? user.name.split(' ')[0] : t('nav.login')}
            </Link>
            <Link
              href="/wishlist"
              className="hidden rounded-full p-2 text-ink-soft transition-colors hover:bg-line-soft hover:text-ink sm:inline-flex"
              aria-label="Wishlist"
            >
              <Heart size={19} />
            </Link>
            <Link
              href="/cart"
              className="relative rounded-full p-2 text-ink-soft transition-colors hover:bg-line-soft hover:text-ink"
              aria-label="Cart"
            >
              <ShoppingBag size={19} />
              {itemCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-clay text-[10px] font-bold text-white">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="flex items-stretch gap-2 sm:hidden mx-4 mb-3">
          <form onSubmit={handleSearch} className="flex flex-1 items-stretch overflow-hidden rounded-full border border-line bg-paper">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder={t('nav.searchPlaceholderShort')}
              className="w-full bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none"
            />
            <button type="submit" className="flex items-center justify-center rounded-full bg-accent-500 px-4 text-white" aria-label="Search">
              <Search size={16} />
            </button>
          </form>
          <button
            onClick={toggleLocale}
            className="flex shrink-0 items-center justify-center rounded-full border border-line px-3 text-xs font-semibold text-ink-soft"
            aria-label="Switch language"
          >
            {t('lang.switchTo')}
          </button>
          <button
            onClick={toggleTheme}
            className="flex shrink-0 items-center justify-center rounded-full border border-line p-2.5 text-ink-soft"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link
            href="/sell"
            className="flex shrink-0 items-center justify-center rounded-full bg-accent-500 p-2.5 text-white"
            aria-label="Add listing"
          >
            <Plus size={18} />
          </Link>
        </div>
      </div>

      <nav className="hidden border-b border-line bg-surface lg:block">
        <div className="container-page flex h-10 items-center gap-6 text-sm">
          {categoryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-medium text-ink-soft transition-colors hover:text-accent-500"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {menuOpen && (
        <div className="border-b border-line bg-surface px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-3 text-sm">
            {categoryLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="font-medium text-ink-soft hover:text-accent-500">
                {link.label}
              </Link>
            ))}
            <Link href="/cart" onClick={() => setMenuOpen(false)} className="font-medium text-ink-soft hover:text-accent-500">
              {t('nav.cart')}
            </Link>
            <Link href={user ? '/account' : '/login'} onClick={() => setMenuOpen(false)} className="font-medium text-ink-soft hover:text-accent-500">
              {user ? t('nav.myAccount') : t('nav.login')}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
