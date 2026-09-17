'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MailCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getApiErrorMessage } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-14">
      <div className="w-full max-w-sm">
        {sent ? (
          <div className="text-center">
            <MailCheck size={32} className="mx-auto text-accent-500" strokeWidth={1.5} />
            <h1 className="mt-4 text-2xl font-bold text-ink">{t('auth.checkEmail')}</h1>
            <p className="mt-2 text-sm text-ink-soft">
              {t('auth.resetSentTo')} <strong>{email}</strong>.
            </p>
            <Link href="/login" className="btn-primary mt-6 inline-flex">
              {t('auth.backToLogin')}
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-ink">{t('auth.resetPasswordTitle')}</h1>
              <p className="mt-2 text-sm text-ink-faint">
                {t('auth.resetPasswordSubtitle')}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
                {submitting ? t('auth.sending') : t('auth.sendResetLink')} <ArrowRight size={16} />
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-ink-faint">
              <Link href="/login" className="font-medium text-ink hover:underline">
                {t('auth.backToLogin')}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
