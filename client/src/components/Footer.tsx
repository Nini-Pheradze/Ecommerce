import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="container-edge py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <span className="font-display text-2xl italic">NodeShip</span>
          <p className="mt-3 text-sm text-ink/60 max-w-[26ch]">
            Considered objects, shipped with care. No noise, no clutter — just good things.
          </p>
        </div>
        <div>
          <p className="label-eyebrow mb-4">Shop</p>
          <ul className="space-y-2 text-sm text-ink/70">
            <li><Link href="/products" className="hover:text-ink">All products</Link></li>
            <li><Link href="/products?onSale=true" className="hover:text-ink">Sale</Link></li>
            <li><Link href="/wishlist" className="hover:text-ink">Wishlist</Link></li>
          </ul>
        </div>
        <div>
          <p className="label-eyebrow mb-4">Account</p>
          <ul className="space-y-2 text-sm text-ink/70">
            <li><Link href="/account" className="hover:text-ink">Orders</Link></li>
            <li><Link href="/login" className="hover:text-ink">Log in</Link></li>
            <li><Link href="/register" className="hover:text-ink">Create account</Link></li>
          </ul>
        </div>
        <div>
          <p className="label-eyebrow mb-4">Info</p>
          <ul className="space-y-2 text-sm text-ink/70">
            <li>Shipping &amp; returns</li>
            <li>Contact</li>
            <li>© {new Date().getFullYear()} NodeShip</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
