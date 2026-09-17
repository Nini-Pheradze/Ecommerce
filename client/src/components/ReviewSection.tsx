'use client';

import { useEffect, useMemo, useState } from 'react';
import { Pencil, Star, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getApiErrorMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiListResponse, ApiResponse, Review } from '@/types';

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button type="button" key={i} onClick={() => onChange(i + 1)} aria-label={`Rate ${i + 1}`}>
          <Star
            size={22}
            className={i + 1 <= value ? 'fill-clay text-clay' : 'fill-transparent text-line'}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ productId }: { productId: string }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editText, setEditText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    api
      .get<ApiListResponse<{ reviews: Review[] }>>(`/reviews?product=${productId}`)
      .then((res) => setReviews(res.data.data.reviews))
      .finally(() => setLoading(false));
  }, [productId]);

  const myReview = useMemo(
    () => reviews.find((r) => (typeof r.user === 'object' ? r.user._id : r.user) === user?._id),
    [reviews, user]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post<ApiResponse<{ review: Review }>>('/reviews', {
        product: productId,
        rating,
        review: text.trim(),
      });
      setReviews((prev) => [res.data.data.review, ...prev]);
      setText('');
      toast.success(t('reviews.thankYou'));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(review: Review) {
    setEditingId(review._id);
    setEditRating(review.rating);
    setEditText(review.review);
  }

  async function handleSaveEdit(id: string) {
    setSavingEdit(true);
    try {
      const res = await api.patch<ApiResponse<{ review: Review }>>(`/reviews/${id}`, {
        rating: editRating,
        review: editText.trim(),
      });
      setReviews((prev) => prev.map((r) => (r._id === id ? res.data.data.review : r)));
      setEditingId(null);
      toast.success(t('reviews.updated'));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t('reviews.confirmDelete'))) return;
    try {
      await api.delete(`/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      toast.success(t('reviews.deleted'));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  const canManage = (review: Review) => {
    if (!user) return false;
    const isOwner = (typeof review.user === 'object' ? review.user._id : review.user) === user._id;
    return isOwner || user.role === 'admin' || user.role === 'moderator';
  };

  return (
    <div className="space-y-8">
      {user && !myReview && (
        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          <div>
            <span className="label-field">{t('reviews.yourReview')}</span>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('reviews.placeholder')}
            rows={3}
            className="input-field resize-none"
          />
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? t('reviews.submitting') : t('reviews.submit')}
          </button>
          <p className="text-xs text-ink-faint">{t('reviews.purchaseNote')}</p>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-ink-faint">{t('reviews.loading')}</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-ink-faint">{t('reviews.none')}</p>
      ) : (
        <ul className="space-y-6">
          {reviews.map((r) => (
            <li key={r._id} className="border-b border-line pb-6 last:border-0">
              {editingId === r._id ? (
                <div className="space-y-3">
                  <StarPicker value={editRating} onChange={setEditRating} />
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    className="input-field resize-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(r._id)} disabled={savingEdit} className="btn-primary text-xs">
                      {savingEdit ? t('form.saving') : t('reviews.save')}
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn-ghost text-xs">{t('reviews.cancel')}</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            className={i + 1 <= r.rating ? 'fill-clay text-clay' : 'fill-transparent text-line'}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-medium text-ink-soft">
                        {typeof r.user === 'object' ? r.user.name : t('reviews.anonymous')}
                      </span>
                    </div>
                    {canManage(r) && (
                      <div className="flex gap-1">
                        {(typeof r.user === 'object' ? r.user._id : r.user) === user?._id && (
                          <button onClick={() => startEdit(r)} className="rounded p-1 text-ink-faint hover:text-ink" aria-label="Edit">
                            <Pencil size={14} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(r._id)} className="rounded p-1 text-ink-faint hover:text-clay" aria-label="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-ink-soft">{r.review}</p>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
