export default function LoadingProducts() {
  return (
    <div className="container-edge py-14">
      <div className="h-10 w-56 bg-bone animate-pulse mb-10" />
      <div className="grid md:grid-cols-[220px_1fr] gap-12">
        <div className="hidden md:block space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 w-32 bg-bone animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-bone animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
