'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { api, getApiErrorMessage } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

type Status = 'verifying' | 'success' | 'error';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [status, setStatus] = useState<Status>('verifying');
  const [message, setMessage] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage(t('auth.verificationTokenMissing'));
      return;
    }

    api
      .post('/auth/verify-email', { token })
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setMessage(getApiErrorMessage(err));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      {status === 'verifying' && (
        <>
          <Loader2 size={32} className="animate-spin text-accent-500" />
          <p className="text-sm text-ink-soft">{t('auth.verifyingEmail')}</p>
        </>
      )}
      {status === 'success' && (
        <>
          <CheckCircle2 size={36} className="text-leaf" strokeWidth={1.5} />
          <h1 className="text-2xl font-bold text-ink">{t('auth.emailVerified')}</h1>
          <p className="max-w-sm text-sm text-ink-soft">{t('auth.emailVerifiedDesc')}</p>
          <Link href="/account" className="btn-primary mt-2">{t('auth.goToAccount')}</Link>
        </>
      )}
      {status === 'error' && (
        <>
          <XCircle size={36} className="text-clay" strokeWidth={1.5} />
          <h1 className="text-2xl font-bold text-ink">{t('auth.verificationFailed')}</h1>
          <p className="max-w-sm text-sm text-ink-soft">{message}</p>
          <Link href="/account" className="btn-secondary mt-2">{t('auth.backToAccount')}</Link>
        </>
      )}
    </div>
  );
}
