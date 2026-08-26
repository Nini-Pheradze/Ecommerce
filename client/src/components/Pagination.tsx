import Link from "next/link";

export default function Pagination({
  currentPage,
  totalPages,
  baseParams,
}: {
  currentPage: number;
  totalPages: number;
  baseParams: URLSearchParams;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(page: number) {
    const params = new URLSearchParams(baseParams.toString());
    params.set("page", String(page));
    return `/products?${params.toString()}`;
  }

  return (
    <div className="mt-16 flex items-center justify-center gap-6 label-eyebrow">
      {currentPage > 1 ? (
        <Link href={hrefFor(currentPage - 1)} className="hover:text-rust">
          ← Prev
        </Link>
      ) : (
        <span className="text-ink/30">← Prev</span>
      )}
      <span className="text-ink/60">
        {currentPage} / {totalPages}
      </span>
      {currentPage < totalPages ? (
        <Link href={hrefFor(currentPage + 1)} className="hover:text-rust">
          Next →
        </Link>
      ) : (
        <span className="text-ink/30">Next →</span>
      )}
    </div>
  );
}
