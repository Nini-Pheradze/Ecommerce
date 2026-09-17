function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

export default function Price({
  price,
  compareAtPrice,
  size = 'md',
}: {
  price: number;
  compareAtPrice?: number | null;
  size?: 'sm' | 'md' | 'lg';
}) {
  const hasDiscount = !!compareAtPrice && compareAtPrice > price;
  const sizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-3xl',
  };

  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className={`font-bold text-ink ${sizes[size]}`}>{formatPrice(price)}</span>
      {hasDiscount && (
        <span className="text-sm text-ink-faint line-through">{formatPrice(compareAtPrice!)}</span>
      )}
    </div>
  );
}
