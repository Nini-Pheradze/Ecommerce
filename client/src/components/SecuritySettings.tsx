'use client';

import { useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { ShieldCheck, Smartphone } from 'lucide-react';
import { api, getApiErrorMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiResponse } from '@/types';

export default function SecuritySettings() {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();

  const [qrCode, setQrCode] = useState<string | null>(null);
  const [authCode, setAuthCode] = useState('');
  const [generating, setGenerating] = useState(false);
  const [verifyingAuth, setVerifyingAuth] = useState(false);

  const [smsSent, setSmsSent] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [sendingSms, setSendingSms] = useState(false);
  const [verifyingSms, setVerifyingSms] = useState(false);

  async function handleGenerateQr() {
    setGenerating(true);
    try {
      const res = await api.post<ApiResponse<{ qrCode: string }> & { qrCode: string }>('/auth/2fa/generate');
      setQrCode(res.data.qrCode);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setGenerating(false);
    }
  }

  async function handleVerifyAuth(e: React.FormEvent) {
    e.preventDefault();
    setVerifyingAuth(true);
    try {
      await api.post('/auth/2fa/verify', { token: authCode });
      toast.success(t('security.authEnabled'));
      setQrCode(null);
      setAuthCode('');
      await refreshUser();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setVerifyingAuth(false);
    }
  }

  async function handleSendSms() {
    setSendingSms(true);
    try {
      await api.post('/auth/sms-2fa/send');
      setSmsSent(true);
      toast.success(t('security.smsSent'));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSendingSms(false);
    }
  }

  async function handleVerifySms(e: React.FormEvent) {
    e.preventDefault();
    setVerifyingSms(true);
    try {
      await api.post('/auth/sms-2fa/verify', { code: smsCode });
      toast.success(t('security.smsEnabled'));
      setSmsSent(false);
      setSmsCode('');
      await refreshUser();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setVerifyingSms(false);
    }
  }

  if (!user) return null;

  if (user.twoFactorEnabled) {
    return (
      <div className="card flex items-start gap-3 p-6">
        <ShieldCheck size={22} className="mt-0.5 shrink-0 text-leaf" />
        <div>
          <h3 className="text-sm font-bold text-ink">{t('security.enabledTitle')}</h3>
          <p className="mt-1 text-sm text-ink-soft">{t('security.enabledDesc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-4 p-6">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-accent-500" />
          <h3 className="text-sm font-bold text-ink">{t('security.authApp')}</h3>
        </div>
        <p className="text-sm text-ink-soft">
          {t('security.authAppDesc')}
        </p>
        {!qrCode ? (
          <button onClick={handleGenerateQr} disabled={generating} className="btn-secondary">
            {generating ? t('security.loading') : t('security.generateQr')}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="w-fit rounded-md border border-line p-3">
              <Image src={qrCode} alt="2FA QR code" width={180} height={180} unoptimized />
            </div>
            <form onSubmit={handleVerifyAuth} className="flex flex-wrap items-center gap-3">
              <input
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="input-field w-32"
              />
              <button type="submit" disabled={verifyingAuth} className="btn-primary">
                {verifyingAuth ? t('security.verifying') : t('security.confirm')}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="card space-y-4 p-6">
        <div className="flex items-center gap-2">
          <Smartphone size={18} className="text-accent-500" />
          <h3 className="text-sm font-bold text-ink">{t('security.smsCode')}</h3>
        </div>
        <p className="text-sm text-ink-soft">
          {t('security.smsCodeDesc')}
        </p>
        {!smsSent ? (
          <button onClick={handleSendSms} disabled={sendingSms} className="btn-secondary">
            {sendingSms ? t('security.sending') : t('security.sendCode')}
          </button>
        ) : (
          <form onSubmit={handleVerifySms} className="flex flex-wrap items-center gap-3">
            <input
              value={smsCode}
              onChange={(e) => setSmsCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
              className="input-field w-32"
            />
            <button type="submit" disabled={verifyingSms} className="btn-primary">
              {verifyingSms ? t('security.verifying') : t('security.confirm')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
