import { Star } from 'lucide-react';

export default function Rating({
  average,
  count,
  size = 13,
}: {
  average: number;
  count?: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= Math.round(average);
          return (
            <Star
              key={i}
              size={size}
              className={filled ? 'fill-gold text-gold' : 'fill-transparent text-line'}
              strokeWidth={1.5}
            />
          );
        })}
      </div>
      {typeof count === 'number' && (
        <span className="text-xs link-accent">({count})</span>
      )}
    </div>
  );
}
