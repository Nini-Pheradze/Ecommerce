'use client';

import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';

export default function WishlistButton({
  productId,
  className = '',
}: {
  productId: string;
  className?: string;
}) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const active = isWishlisted(productId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(productId);
      }}
      aria-pressed={active}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`inline-flex items-center justify-center rounded-full border border-line bg-surface/95 p-1.5 text-ink-soft shadow-card transition-colors hover:text-clay ${className}`}
    >
      <Heart size={15} className={active ? 'fill-clay text-clay' : ''} />
    </button>
  );
}
