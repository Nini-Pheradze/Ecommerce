'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { api, getApiErrorMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiResponse, User } from '@/types';

export default function ProfileSettings() {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState(user?.name ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.patch<ApiResponse<{ user: User }>>('/auth/me', { name, phoneNumber });
      await refreshUser();
      toast.success(t('profile.updated'));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingPassword(true);
    try {
      const res = await api.patch<ApiResponse<{ token?: string }>>('/auth/update-password', {
        currentPassword,
        newPassword,
      });
      if (res.data.token) {
        window.localStorage.setItem('shopspace_token', res.data.token);
      }
      setCurrentPassword('');
      setNewPassword('');
      toast.success(t('profile.passwordChanged'));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSavingPassword(false);
    }
  }

  if (!user) return null;

  return (
    <div className="space-y-8">
      <form onSubmit={handleProfileSubmit} className="card space-y-4 p-6">
        <h3 className="text-sm font-bold text-ink">{t('profile.info')}</h3>
        <div>
          <label className="label-field" htmlFor="name">{t('profile.name')}</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="label-field">{t('profile.email')}</label>
          <input value={user.email} disabled className="input-field bg-line-soft text-ink-faint" />
        </div>
        <div>
          <label className="label-field" htmlFor="phone">{t('profile.phone')}</label>
          <input
            id="phone"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+995 5xx xxx xxx"
            className="input-field"
          />
          <p className="mt-1 text-xs text-ink-faint">{t('profile.phoneHint')}</p>
        </div>
        <button type="submit" disabled={savingProfile} className="btn-primary">
          {savingProfile ? t('form.saving') : t('profile.save')}
        </button>
      </form>

      {!user.googleId && (
        <form onSubmit={handlePasswordSubmit} className="card space-y-4 p-6">
          <h3 className="text-sm font-bold text-ink">{t('profile.changePassword')}</h3>
          <div>
            <label className="label-field" htmlFor="currentPassword">{t('profile.currentPassword')}</label>
            <input
              id="currentPassword"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-field" htmlFor="newPassword">{t('profile.newPassword')}</label>
            <input
              id="newPassword"
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
            />
          </div>
          <button type="submit" disabled={savingPassword} className="btn-primary">
            {savingPassword ? t('form.saving') : t('profile.updatePassword')}
          </button>
        </form>
      )}
    </div>
  );
}
