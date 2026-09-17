'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import GoogleAuthButton from '@/components/GoogleAuthButton';

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(name, email, password);
      toast.success(t('auth.accountCreated'));
      router.push('/account');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-14">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-bold text-3xl text-ink">{t('auth.signUp')}</h1>
          <p className="mt-2 text-sm text-ink-faint">{t('auth.createNewAccount')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field" htmlFor="name">{t('auth.name')}</label>
            <input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder={t('auth.namePlaceholder')}
            />
          </div>
          <div>
            <label className="label-field" htmlFor="email">{t('auth.email')}</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label-field" htmlFor="password">{t('auth.password')}</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder={t('auth.passwordMin')}
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
            {submitting ? t('auth.creatingAccount') : t('auth.createAccount')} <ArrowRight size={16} />
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <span className="text-xs text-ink-faint">{t('auth.or')}</span>
          <div className="h-px flex-1 bg-line" />
        </div>
        <GoogleAuthButton />

        <p className="mt-6 text-center text-sm text-ink-faint">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link href="/login" className="font-medium text-ink hover:underline">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
