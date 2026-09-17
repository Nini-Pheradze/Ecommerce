'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { api, getApiErrorMessage } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiListResponse, ApiResponse, Category } from '@/types';

export default function AdminCategoriesPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  function loadCategories() {
    setLoading(true);
    const url = query ? `/search/categories?query=${encodeURIComponent(query)}` : '/categories';
    api
      .get<ApiListResponse<{ categories: Category[] }>>(url)
      .then((res) => setCategories(res.data.data.categories))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post<ApiResponse<{ category: Category }>>('/categories', {
        name: name.trim(),
        description: description.trim(),
      });
      setCategories((prev) => [...prev, res.data.data.category]);
      setName('');
      setDescription('');
      toast.success(t('admin.categoryAdded'));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t('admin.confirmDeleteCategory'))) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      toast.success(t('admin.deleted'));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function handleSaveEdit(id: string) {
    try {
      const res = await api.patch<ApiResponse<{ category: Category }>>(`/categories/${id}`, {
        name: editName.trim(),
      });
      setCategories((prev) => prev.map((c) => (c._id === id ? res.data.data.category : c)));
      setEditingId(null);
      toast.success(t('admin.categoryUpdated'));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="card space-y-4 p-6">
        <h2 className="text-sm font-bold text-ink">{t('admin.newCategory')}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('admin.categoryName')}
            required
            className="input-field"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('admin.categoryDescOptional')}
            className="input-field"
          />
        </div>
        <button type="submit" disabled={submitting} className="btn-primary">
          <Plus size={16} /> {t('admin.add')}
        </button>
      </form>

      <div>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-ink">{t('admin.categories')}</h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('admin.searchPlaceholder')}
            className="input-field max-w-xs"
          />
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-md bg-line-soft" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-ink-faint">{t('admin.noCategories')}</p>
        ) : (
          <ul className="divide-y divide-line">
            {categories.map((cat) => (
              <li key={cat._id} className="flex items-center justify-between gap-3 py-3">
                {editingId === cat._id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input-field"
                      autoFocus
                    />
                    <button onClick={() => handleSaveEdit(cat._id)} className="btn-primary text-xs">{t('admin.save')}</button>
                    <button onClick={() => setEditingId(null)} className="rounded p-1.5 text-ink-faint hover:text-ink">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium text-ink">{cat.name}</p>
                      {cat.description && <p className="text-xs text-ink-faint">{cat.description}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingId(cat._id);
                          setEditName(cat.name);
                        }}
                        className="rounded p-1.5 text-ink-soft hover:bg-line-soft hover:text-ink"
                        aria-label="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="rounded p-1.5 text-ink-soft hover:bg-line-soft hover:text-clay"
                        aria-label="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
