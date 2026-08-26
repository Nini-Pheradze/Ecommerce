import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-edge py-32 text-center">
      <p className="font-display italic text-6xl mb-6">404</p>
      <p className="text-ink/60 mb-8">We couldn&apos;t find what you were looking for.</p>
      <Link href="/products" className="btn-primary">
        Back to shop
      </Link>
    </div>
  );
}
