export default function LoadingProduct() {
  return (
    <div className="container-edge py-14">
      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        <div className="aspect-[4/5] bg-bone animate-pulse" />
        <div className="space-y-4">
          <div className="h-3 w-24 bg-bone animate-pulse" />
          <div className="h-10 w-3/4 bg-bone animate-pulse" />
          <div className="h-6 w-32 bg-bone animate-pulse" />
          <div className="h-24 w-full bg-bone animate-pulse" />
        </div>
      </div>
    </div>
  );
}
