'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getApiErrorMessage } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const { t } = useLanguage();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { newPassword });
      toast.success(t('auth.passwordChanged'));
      router.push('/login');
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
          <h1 className="text-3xl font-bold text-ink">{t('auth.newPassword')}</h1>
          <p className="mt-2 text-sm text-ink-faint">{t('auth.newPassword')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field" htmlFor="newPassword">{t('auth.newPassword')}</label>
            <input
              id="newPassword"
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
              placeholder={t('auth.passwordMin')}
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
            {submitting ? t('auth.saving') : t('auth.updatePassword')} <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
