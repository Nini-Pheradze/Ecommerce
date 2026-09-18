'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <OAuthCallbackContent />
    </Suspense>
  );
}

function OAuthCallbackContent() {
  const { loginWithToken, completeTwoFactorLogin } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending2FA, setPending2FA] = useState<{ method: 'app' | 'sms'; tempToken: string } | null>(null);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (searchParams.get('requires2FA') === '1') {
      const tempToken = searchParams.get('tempToken');
      const method = searchParams.get('method') as 'app' | 'sms' | null;
      if (!tempToken || !method) {
        setError(t('auth.authorizationFailed'));
        return;
      }
      setPending2FA({ method, tempToken });
      return;
    }

    const token = searchParams.get('token');
    if (!token) {
      setError(t('auth.authorizationFailed'));
      return;
    }
    loginWithToken(token)
      .then(() => router.replace('/account'))
      .catch((err) => setError(getApiErrorMessage(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loginWithToken, router]);

  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault();
    if (!pending2FA) return;
    setVerifying(true);
    try {
      await completeTwoFactorLogin(pending2FA.tempToken, code);
      router.replace('/account');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setVerifying(false);
    }
  }

  if (pending2FA) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-14">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="font-bold text-3xl text-ink">{t('auth.twoFactorTitle')}</h1>
            <p className="mt-2 text-sm text-ink-faint">
              {pending2FA.method === 'app' ? t('auth.twoFactorAppDesc') : t('auth.twoFactorSmsDesc')}
            </p>
          </div>
          <form onSubmit={handleVerify2FA} className="space-y-4">
            <input
              required
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="input-field"
              placeholder="123456"
              maxLength={6}
            />
            <button type="submit" disabled={verifying} className="btn-primary w-full py-3">
              {verifying ? t('auth.verifying') : t('auth.verify')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      {error ? (
        <>
          <p className="text-sm text-clay">{error}</p>
          <button onClick={() => router.push('/login')} className="btn-primary">
            {t('auth.backToLogin')}
          </button>
        </>
      ) : (
        <>
          <Loader2 size={28} className="animate-spin text-accent-500" />
          <p className="text-sm text-ink-soft">{t('auth.signingIn')}</p>
        </>
      )}
    </div>
  );
}
