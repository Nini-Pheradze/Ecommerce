'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle, Ban, ShieldCheck, Trash2 } from 'lucide-react';
import { api, getApiErrorMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiListResponse, ApiResponse, User } from '@/types';

const ROLES: User['role'][] = ['user', 'moderator', 'admin'];

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  function loadUsers() {
    setLoading(true);
    const url = query ? `/search/users?query=${encodeURIComponent(query)}` : '/admin/users';
    api
      .get<ApiListResponse<{ users: User[] }>>(url)
      .then((res) => setUsers(res.data.data.users))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timeout = setTimeout(loadUsers, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function handleRoleChange(id: string, role: User['role']) {
    try {
      const res = await api.patch<ApiResponse<{ user: User }>>(`/admin/users/${id}/role`, { role });
      setUsers((prev) => prev.map((u) => (u._id === id ? res.data.data.user : u)));
      toast.success(t('admin.roleChanged'));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function handleToggleBlock(id: string) {
    try {
      const res = await api.patch<ApiResponse<{ user: User }>>(`/admin/users/${id}/block`);
      setUsers((prev) => prev.map((u) => (u._id === id ? res.data.data.user : u)));
      toast.success(t('admin.statusUpdated'));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function handleWarn(id: string) {
    try {
      const res = await api.patch<ApiResponse<{ user: User }>>(`/admin/users/${id}/warn`);
      setUsers((prev) => prev.map((u) => (u._id === id ? res.data.data.user : u)));
      toast.success(t('admin.warningIssued'));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t('admin.confirmDeleteUser'))) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success(t('admin.deleted'));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-ink">{t('admin.users')}</h2>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('admin.searchUsers')}
          className="input-field max-w-xs"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-md bg-line-soft" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <p className="text-sm text-ink-faint">{t('admin.noUsers')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wideish text-ink-faint">
                <th className="py-2 pr-4">{t('admin.tableUser')}</th>
                <th className="py-2 pr-4">{t('admin.tableRole')}</th>
                <th className="py-2 pr-4">{t('admin.tableStatus')}</th>
                <th className="py-2 pr-4">{t('admin.tableWarnings')}</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-ink">{u.name}</p>
                    <p className="text-xs text-ink-faint">{u.email}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <select
                      value={u.role}
                      disabled={u._id === currentUser?._id}
                      onChange={(e) => handleRoleChange(u._id, e.target.value as User['role'])}
                      className="input-field py-1.5 text-xs"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${u.isBlocked ? 'bg-clay/10 text-clay' : 'bg-accent-50 text-accent-700'}`}>
                      {u.isBlocked ? t('admin.blocked') : t('admin.active')}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-ink-soft">{u.warningsCount ?? 0}</td>
                  <td className="py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleWarn(u._id)}
                        className="rounded p-1.5 text-ink-soft hover:bg-line-soft hover:text-gold"
                        aria-label="Warn"
                        title={t('admin.warn')}
                      >
                        <AlertTriangle size={15} />
                      </button>
                      <button
                        onClick={() => handleToggleBlock(u._id)}
                        className="rounded p-1.5 text-ink-soft hover:bg-line-soft hover:text-clay"
                        aria-label="Block"
                        title={u.isBlocked ? t('admin.unblock') : t('admin.block')}
                      >
                        {u.isBlocked ? <ShieldCheck size={15} /> : <Ban size={15} />}
                      </button>
                      {u._id !== currentUser?._id && (
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="rounded p-1.5 text-ink-soft hover:bg-line-soft hover:text-clay"
                          aria-label="Delete"
                          title={t('admin.delete')}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
