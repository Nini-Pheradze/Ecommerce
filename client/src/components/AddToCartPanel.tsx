"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import WishlistButton from "./WishlistButton";

export default function AddToCartPanel({ product }: { product: Product }) {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();

  const sizes = useMemo(
    () => Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean))),
    [product.variants]
  );
  const colors = useMemo(
    () => Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean))),
    [product.variants]
  );

  const [size, setSize] = useState<string | undefined>(sizes[0] as string | undefined);
  const [color, setColor] = useState<string | undefined>(colors[0] as string | undefined);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const outOfStock = product.stock <= 0;

  async function handleAdd() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      await addItem(product._id, quantity);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 1800);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Could not add to cart");
    }
  }

  return (
    <div className="space-y-6">
      {sizes.length > 0 && (
        <div>
          <p className="label-eyebrow mb-3">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s as string)}
                className={`px-4 py-2 text-sm border transition-colors ${
                  size === s ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div>
          <p className="label-eyebrow mb-3">Color</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c as string)}
                className={`px-4 py-2 text-sm border transition-colors ${
                  color === c ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="label-eyebrow mb-3">Quantity</p>
        <div className="inline-flex items-center border border-line">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-10 hover:bg-bone transition-colors"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-10 text-center text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="w-10 h-10 hover:bg-bone transition-colors"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleAdd}
          disabled={outOfStock || status === "loading"}
          className="btn-primary flex-1"
        >
          {outOfStock
            ? "Out of stock"
            : status === "loading"
            ? "Adding…"
            : status === "done"
            ? "Added ✓"
            : "Add to cart"}
        </button>
        <div className="border border-line h-[46px] w-[46px] flex items-center justify-center">
          <WishlistButton productId={product._id} />
        </div>
      </div>

      {status === "error" && <p className="text-sm text-rust">{errorMsg}</p>}
    </div>
  );
}
