'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, MessageCircle, Tag, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/products', label: t('admin.navProducts'), icon: LayoutGrid, roles: ['admin', 'moderator'] },
    { href: '/admin/categories', label: t('admin.navCategories'), icon: Tag, roles: ['admin', 'moderator'] },
    { href: '/admin/support', label: t('admin.navSupport'), icon: MessageCircle, roles: ['admin', 'moderator'] },
    { href: '/admin/users', label: t('admin.navUsers'), icon: Users, roles: ['admin'] },
  ];

  useEffect(() => {
    if (isLoading) return;
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return (
      <div className="container-page py-14">
        <div className="h-8 w-48 animate-pulse rounded bg-line-soft" />
      </div>
    );
  }

  const visibleItems = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-8">
        <span className="eyebrow">{user.role === 'admin' ? t('admin.administration') : t('admin.moderation')}</span>
        <h1 className="mt-2 text-3xl font-bold text-ink">
          {user.role === 'admin' ? t('admin.adminPanel') : t('admin.moderatorPanel')}
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? 'bg-accent-500 text-white' : 'text-ink-soft hover:bg-line-soft'
                }`}
              >
                <Icon size={16} /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
