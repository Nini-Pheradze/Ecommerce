import ProductGrid from '@/components/ProductGrid';

export default function ProductsLoading() {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-8">
        <div className="h-3 w-16 animate-pulse rounded bg-line-soft" />
        <div className="mt-3 h-8 w-56 animate-pulse rounded bg-line-soft" />
      </div>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <div className="hidden lg:block">
          <div className="h-64 animate-pulse rounded-md bg-line-soft" />
        </div>
        <ProductGrid products={[]} loading />
      </div>
    </div>
  );
}
