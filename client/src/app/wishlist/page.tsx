"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import ProductGrid from "@/components/ProductGrid";

export default function WishlistPage() {
  const { isAuthenticated, ready } = useAuth();
  const { items, loading } = useWishlist();

  if (ready && !isAuthenticated) {
    return (
      <div className="container-edge py-24 text-center">
        <p className="font-display italic text-3xl mb-4">Your wishlist</p>
        <p className="text-ink/60 mb-8">Log in to save products for later.</p>
        <Link href="/login" className="btn-primary">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="container-edge py-14">
      <p className="label-eyebrow mb-3">Saved</p>
      <h1 className="font-display italic text-4xl md:text-5xl mb-10">Wishlist</h1>

      {loading ? (
        <p className="text-ink/50">Loading…</p>
      ) : (
        <ProductGrid products={items} />
      )}
    </div>
  );
}
