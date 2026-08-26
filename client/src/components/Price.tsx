export default function Price({
  price,
  compareAtPrice,
  size = "md",
}: {
  price: number;
  compareAtPrice?: number | null;
  size?: "sm" | "md" | "lg";
}) {
  const onSale = !!compareAtPrice && compareAtPrice > price;
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
  };

  return (
    <span className={`font-mono ${sizes[size]} flex items-baseline gap-2`}>
      <span className={onSale ? "text-rust" : "text-ink"}>${price.toFixed(2)}</span>
      {onSale && (
        <span className="text-ink/40 line-through text-[0.8em]">
          ${compareAtPrice!.toFixed(2)}
        </span>
      )}
    </span>
  );
}
