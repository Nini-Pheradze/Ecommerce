"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { productImageUrl } from "@/lib/api";
import Price from "@/components/Price";

export default function CartPage() {
  const { isAuthenticated, ready } = useAuth();
  const { cart, loading, subtotal, removeItem, updateQuantity } = useCart();

  if (ready && !isAuthenticated) {
    return (
      <div className="container-edge py-24 text-center">
        <p className="font-display italic text-3xl mb-4">Your cart is waiting</p>
        <p className="text-ink/60 mb-8">Log in to view items you&apos;ve added.</p>
        <Link href="/login" className="btn-primary">
          Log in
        </Link>
      </div>
    );
  }

  const items = cart?.items ?? [];

  return (
    <div className="container-edge py-14">
      <h1 className="font-display italic text-4xl md:text-5xl mb-10">Your cart</h1>

      {loading && items.length === 0 ? (
        <p className="text-ink/50">Loading…</p>
      ) : items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-ink/60 mb-8">Your cart is empty.</p>
          <Link href="/products" className="btn-primary">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-[1fr_340px] gap-12">
          <div className="divide-y divide-line border-y border-line">
            {items.map((item) => {
              const img = productImageUrl(item.product.imageCover);
              return (
                <div key={item.product._id} className="flex gap-5 py-6">
                  <div className="relative w-24 h-28 bg-bone shrink-0 overflow-hidden">
                    {img ? (
                      <Image src={img} alt={item.product.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="font-display italic text-3xl text-ink/15">
                          {item.product.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          href={`/products/${item.product._id}`}
                          className="hover:text-rust transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <div className="mt-1">
                          <Price price={item.product.price} size="sm" />
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.product._id)}
                        className="text-xs uppercase tracking-widest2 text-ink/40 hover:text-rust"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="inline-flex items-center border border-line w-fit">
                      <button
                        onClick={() =>
                          updateQuantity(item.product._id, Math.max(1, item.quantity - 1))
                        }
                        className="w-8 h-8 hover:bg-bone transition-colors text-sm"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        className="w-8 h-8 hover:bg-bone transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border border-line p-6 h-fit">
            <p className="label-eyebrow mb-4">Order summary</p>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-ink/60">Subtotal</span>
              <span className="font-mono">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-ink/40 mb-6">Shipping and coupons applied at checkout.</p>
            <Link href="/checkout" className="btn-primary w-full">
              Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
