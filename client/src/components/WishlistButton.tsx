"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistButton({ productId }: { productId: string }) {
  const { isAuthenticated } = useAuth();
  const { ids, toggle } = useWishlist();
  const router = useRouter();
  const active = ids.has(productId);

  return (
    <button
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
          router.push("/login");
          return;
        }
        toggle(productId);
      }}
      className={`h-8 w-8 flex items-center justify-center rounded-full bg-paper/90 backdrop-blur transition-colors ${
        active ? "text-rust" : "text-ink/50 hover:text-ink"
      }`}
    >
      {active ? "♥" : "♡"}
    </button>
  );
}
