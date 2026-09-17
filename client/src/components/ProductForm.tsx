'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ImagePlus } from 'lucide-react';
import { api, getApiErrorMessage, productImageUrl } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiListResponse, ApiResponse, Category, Product } from '@/types';

export default function ProductForm({
  product,
  redirectTo = '/account/listings',
}: {
  product?: Product;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const isEdit = !!product;

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState(product?.name ?? '');
  const [sku, setSku] = useState(product?.sku ?? '');
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [compareAtPrice, setCompareAtPrice] = useState(
    product?.compareAtPrice ? String(product.compareAtPrice) : ''
  );
  const [description, setDescription] = useState(product?.description ?? '');
  const [stock, setStock] = useState(product ? String(product.stock) : '1');
  const [categoryId, setCategoryId] = useState(
    product?.category && typeof product.category === 'object'
      ? product.category._id
      : (product?.category as string) ?? ''
  );
  const [imageCover, setImageCover] = useState<File | null>(null);
  const [images, setImages] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get<ApiListResponse<{ categories: Category[] }>>('/categories')
      .then((res) => {
        setCategories(res.data.data.categories);
        if (!categoryId && res.data.data.categories[0]) {
          setCategoryId(res.data.data.categories[0]._id);
        }
      })
      .catch(() => setCategories([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('sku', sku);
    formData.append('price', price);
    if (compareAtPrice) formData.append('compareAtPrice', compareAtPrice);
    formData.append('description', description);
    formData.append('stock', stock);
    formData.append('category', categoryId);
    if (imageCover) formData.append('imageCover', imageCover);
    if (images) Array.from(images).forEach((file) => formData.append('images', file));

    try {
      if (isEdit) {
        await api.patch<ApiResponse<{ product: Product }>>(`/products/${product._id}`, formData);
        toast.success(t('form.updated'));
      } else {
        await api.post<ApiResponse<{ product: Product }>>('/products', formData);
        toast.success(t('form.published'));
      }
      router.push(redirectTo);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const currentImageUrl = productImageUrl(product?.imageCover);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label-field" htmlFor="name">{t('form.name')}</label>
          <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="label-field" htmlFor="sku">{t('form.sku')}</label>
          <input id="sku" required value={sku} onChange={(e) => setSku(e.target.value)} className="input-field" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className="label-field" htmlFor="price">{t('form.price')}</label>
          <input id="price" type="number" min={0} step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="label-field" htmlFor="compareAtPrice">{t('form.compareAtPrice')}</label>
          <input id="compareAtPrice" type="number" min={0} step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} className="input-field" placeholder={t('form.compareAtPriceOptional')} />
        </div>
        <div>
          <label className="label-field" htmlFor="stock">{t('form.stock')}</label>
          <input id="stock" type="number" min={0} required value={stock} onChange={(e) => setStock(e.target.value)} className="input-field" />
        </div>
      </div>

      <div>
        <label className="label-field" htmlFor="category">{t('form.category')}</label>
        <select id="category" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input-field">
          {categories.length === 0 && <option value="">{t('form.noCategories')}</option>}
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-field" htmlFor="description">{t('form.description')}</label>
        <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="input-field resize-none" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label-field">{t('form.mainImage')}</label>
          {currentImageUrl && !imageCover && (
            <img src={currentImageUrl} alt="" className="mb-2 h-24 w-24 rounded-md border border-line object-cover" />
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-line px-4 py-3 text-sm text-ink-soft hover:border-accent-400">
            <ImagePlus size={16} />
            {imageCover ? imageCover.name : t('form.upload')}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageCover(e.target.files?.[0] ?? null)} />
          </label>
        </div>
        <div>
          <label className="label-field">{t('form.additionalImages')}</label>
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-line px-4 py-3 text-sm text-ink-soft hover:border-accent-400">
            <ImagePlus size={16} />
            {images && images.length > 0 ? `${images.length} ${t('form.filesSelected')}` : t('form.uploadMax')}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setImages(e.target.files)} />
          </label>
        </div>
      </div>

      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? t('form.saving') : isEdit ? t('form.saveChanges') : t('form.publish')}
      </button>
    </form>
  );
}
