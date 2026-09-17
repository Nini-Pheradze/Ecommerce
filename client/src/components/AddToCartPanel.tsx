'use client';

import { useMemo, useState } from 'react';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export default function AddToCartPanel({ product }: { product: Product }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const sizes = useMemo(
    () => Array.from(new Set((product.variants ?? []).map((v) => v.size).filter(Boolean))) as string[],
    [product.variants]
  );
  const colors = useMemo(
    () => Array.from(new Set((product.variants ?? []).map((v) => v.color).filter(Boolean))) as string[],
    [product.variants]
  );

  const outOfStock = product.stock <= 0;

  async function handleAdd() {
    if (!user) {
      router.push('/login');
      return;
    }
    setSubmitting(true);
    try {
      await addToCart(product._id, quantity);
    } catch {
      // toast handled in context
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {sizes.length > 0 && (
        <div>
          <span className="label-field">{t('addToCart.size')}</span>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`rounded-md border px-4 py-1.5 text-sm transition-colors ${
                  size === s
                    ? 'border-ink bg-ink text-paper'
                    : 'border-line text-ink-soft hover:border-ink/40'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div>
          <span className="label-field">{t('addToCart.color')}</span>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`rounded-md border px-4 py-1.5 text-sm transition-colors ${
                  color === c
                    ? 'border-ink bg-ink text-paper'
                    : 'border-line text-ink-soft hover:border-ink/40'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <span className="label-field">{t('addToCart.quantity')}</span>
        <div className="inline-flex items-center rounded-md border border-line">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="p-2.5 text-ink-soft hover:text-ink"
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
            className="p-2.5 text-ink-soft hover:text-ink"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <button
        onClick={handleAdd}
        disabled={outOfStock || submitting}
        className="btn-primary w-full py-3.5"
      >
        <ShoppingBag size={16} />
        {outOfStock ? t('addToCart.outOfStock') : submitting ? t('addToCart.adding') : t('addToCart.add')}
      </button>

      <p className="text-xs text-ink-faint">
        {outOfStock ? t('addToCart.currentlyUnavailable') : `${t('addToCart.inStock')} ${product.stock}`}
      </p>
    </div>
  );
}
