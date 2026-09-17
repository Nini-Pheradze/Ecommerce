export default function ProductDetailLoading() {
  return (
    <div className="container-page py-14">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-md bg-line-soft" />
        <div className="space-y-4">
          <div className="h-4 w-24 animate-pulse rounded bg-line-soft" />
          <div className="h-8 w-2/3 animate-pulse rounded bg-line-soft" />
          <div className="h-6 w-24 animate-pulse rounded bg-line-soft" />
          <div className="h-24 w-full animate-pulse rounded bg-line-soft" />
        </div>
      </div>
    </div>
  );
}
