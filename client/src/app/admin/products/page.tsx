'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ImageOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, getApiErrorMessage, productImageUrl } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiListResponse, Product } from '@/types';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export default function AdminProductsPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ApiListResponse<{ products: Product[] }>>('/products?limit=100&sort=-createdAt')
      .then((res) => setProducts(res.data.data.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!window.confirm(t('admin.confirmDeleteProduct'))) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success(t('admin.deleted'));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">{t('admin.allProducts')}</h2>
        <Link href="/admin/products/new" className="btn-primary">
          <Plus size={16} /> {t('admin.add')}
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-md bg-line-soft" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-sm text-ink-faint">{t('admin.noProducts')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wideish text-ink-faint">
                <th className="py-2 pr-4">{t('admin.tableProduct')}</th>
                <th className="py-2 pr-4">{t('admin.tablePrice')}</th>
                <th className="py-2 pr-4">{t('admin.tableStock')}</th>
                <th className="py-2 pr-4">{t('admin.tableSeller')}</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((product) => {
                const imageUrl = productImageUrl(product.imageCover);
                return (
                  <tr key={product._id}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-line bg-white">
                          {imageUrl ? (
                            <Image src={imageUrl} alt="" fill sizes="40px" className="object-contain p-0.5" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-ink-faint">
                              <ImageOff size={14} />
                            </div>
                          )}
                        </div>
                        <Link href={`/products/${product._id}`} className="font-medium text-ink hover:underline">
                          {product.name}
                        </Link>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-ink-soft">{formatPrice(product.price)}</td>
                    <td className="py-3 pr-4 text-ink-soft">{product.stock}</td>
                    <td className="py-3 pr-4 text-ink-soft">
                      {product.seller && typeof product.seller === 'object' ? product.seller.name : '—'}
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/admin/products/${product._id}/edit`}
                          className="rounded p-1.5 text-ink-soft hover:bg-line-soft hover:text-ink"
                          aria-label="Edit"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="rounded p-1.5 text-ink-soft hover:bg-line-soft hover:text-clay"
                          aria-label="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
