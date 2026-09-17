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

export default function LoginPage() {
  const { login, completeTwoFactorLogin } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [pending2FA, setPending2FA] = useState<{ method: 'app' | 'sms'; tempToken: string } | null>(null);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.requires2FA) {
        setPending2FA({ method: result.method, tempToken: result.tempToken });
      } else {
        toast.success(t('auth.welcomeBack'));
        router.push('/account');
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault();
    if (!pending2FA) return;
    setVerifying(true);
    try {
      await completeTwoFactorLogin(pending2FA.tempToken, code);
      toast.success(t('auth.welcomeBack'));
      router.push('/account');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setVerifying(false);
    }
  }

  if (pending2FA) {
    return (
      <div className="container-page flex min-h-[70vh] items-center justify-center py-14">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="font-bold text-3xl text-ink">{t('auth.twoFactorTitle')}</h1>
            <p className="mt-2 text-sm text-ink-faint">
              {pending2FA.method === 'app' ? t('auth.twoFactorAppDesc') : t('auth.twoFactorSmsDesc')}
            </p>
          </div>

          <form onSubmit={handleVerify2FA} className="space-y-4">
            <div>
              <label className="label-field" htmlFor="code">{t('auth.verificationCode')}</label>
              <input
                id="code"
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="input-field"
                placeholder="123456"
                maxLength={6}
              />
            </div>
            <button type="submit" disabled={verifying} className="btn-primary w-full py-3">
              {verifying ? t('auth.verifying') : t('auth.verify')} <ArrowRight size={16} />
            </button>
          </form>

          <button
            onClick={() => {
              setPending2FA(null);
              setCode('');
            }}
            className="mt-5 w-full text-center text-sm link-accent"
          >
            {t('auth.backToCredentials')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-14">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-bold text-3xl text-ink">{t('auth.login')}</h1>
          <p className="mt-2 text-sm text-ink-faint">{t('auth.continueToAccount')}</p>
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
          <div>
            <div className="flex items-center justify-between">
              <label className="label-field" htmlFor="password">{t('auth.password')}</label>
              <Link href="/forgot-password" className="mb-1.5 text-xs link-accent">
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
            {submitting ? t('auth.loggingIn') : t('auth.login')} <ArrowRight size={16} />
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <span className="text-xs text-ink-faint">{t('auth.or')}</span>
          <div className="h-px flex-1 bg-line" />
        </div>
        <GoogleAuthButton />

        <p className="mt-6 text-center text-sm text-ink-faint">
          {t('auth.noAccount')}{' '}
          <Link href="/register" className="font-medium text-ink hover:underline">
            {t('auth.signUp')}
          </Link>
        </p>
      </div>
    </div>
  );
}
