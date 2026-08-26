"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="container-edge flex h-20 items-center justify-between gap-6">
        <Link
          href="/"
          className="font-display text-2xl italic tracking-tight text-ink shrink-0"
        >
          NodeShip
        </Link>

        <nav className="hidden md:flex items-center gap-8 label-eyebrow">
          <Link href="/products" className="hover:text-rust transition-colors">
            Shop
          </Link>
          <Link href="/products?onSale=true" className="hover:text-rust transition-colors">
            Sale
          </Link>
          <Link href="/wishlist" className="hover:text-rust transition-colors">
            Wishlist
          </Link>
        </nav>

        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-xs items-center border-b border-line focus-within:border-ink transition-colors"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-ink/40"
          />
          <button aria-label="Search" className="text-ink/60 hover:text-ink px-1">
            →
          </button>
        </form>

        <div className="flex items-center gap-5 label-eyebrow shrink-0">
          {isAuthenticated ? (
            <>
              <Link href="/account" className="hidden sm:inline hover:text-rust transition-colors">
                Account
              </Link>
              <button onClick={logout} className="hidden sm:inline hover:text-rust transition-colors">
                Log out
              </button>
            </>
          ) : (
            <Link href="/login" className="hidden sm:inline hover:text-rust transition-colors">
              Log in
            </Link>
          )}
          <Link href="/cart" className="relative hover:text-rust transition-colors">
            Cart
            {itemCount > 0 && (
              <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-rust text-[10px] text-paper">
                {itemCount}
              </span>
            )}
          </Link>
          <button
            className="md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-line bg-paper px-6 py-4 space-y-4">
          <form onSubmit={handleSearch} className="flex items-center border-b border-line pb-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
            />
          </form>
          <div className="flex flex-col gap-3 label-eyebrow">
            <Link href="/products" onClick={() => setMenuOpen(false)}>Shop</Link>
            <Link href="/products?onSale=true" onClick={() => setMenuOpen(false)}>Sale</Link>
            <Link href="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</Link>
            {isAuthenticated ? (
              <>
                <Link href="/account" onClick={() => setMenuOpen(false)}>Account</Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="text-left">
                  Log out
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
