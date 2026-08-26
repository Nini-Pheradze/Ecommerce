"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import Price from "@/components/Price";

export default function CheckoutPage() {
  const { isAuthenticated, ready } = useAuth();
  const { cart, subtotal, refresh } = useCart();
  const router = useRouter();

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (ready && !isAuthenticated) {
    return (
      <div className="container-edge py-24 text-center">
        <p className="font-display italic text-3xl mb-4">Log in to check out</p>
        <Link href="/login" className="btn-primary">
          Log in
        </Link>
      </div>
    );
  }

  const items = cart?.items ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await api.post<{ sessionUrl?: string; data: { order: unknown } }>(
        "/orders",
        {
          shippingAddress: { address, city, phone },
          ...(couponCode ? { couponCode } : {}),
        },
        true
      );
      await refresh();
      if (res.sessionUrl) {
        window.location.href = res.sessionUrl;
      } else {
        router.push("/account");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Could not place order");
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-edge py-24 text-center">
        <p className="font-display italic text-3xl mb-4">Your cart is empty</p>
        <Link href="/products" className="btn-primary">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-edge py-14">
      <h1 className="font-display italic text-4xl md:text-5xl mb-10">Checkout</h1>
      <div className="grid md:grid-cols-[1fr_360px] gap-12">
        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
          <p className="label-eyebrow">Shipping address</p>
          <div>
            <label className="label-eyebrow block mb-2">Address</label>
            <input
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-field"
              placeholder="12 Rustaveli Ave"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-eyebrow block mb-2">City</label>
              <input
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input-field"
                placeholder="Tbilisi"
              />
            </div>
            <div>
              <label className="label-eyebrow block mb-2">Phone</label>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                placeholder="+995 5xx xx xx xx"
              />
            </div>
          </div>

          <div>
            <label className="label-eyebrow block mb-2">Coupon code (optional)</label>
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="input-field"
              placeholder="WELCOME10"
            />
          </div>

          {status === "error" && <p className="text-sm text-rust">{errorMsg}</p>}

          <button type="submit" disabled={status === "loading"} className="btn-primary w-full">
            {status === "loading" ? "Redirecting to payment…" : "Place order & pay"}
          </button>
          <p className="text-xs text-ink/40">
            You&apos;ll be redirected to Stripe to complete payment securely.
          </p>
        </form>

        <div className="border border-line p-6 h-fit space-y-4">
          <p className="label-eyebrow">Order summary</p>
          <div className="divide-y divide-line">
            {items.map((item) => (
              <div key={item.product._id} className="flex justify-between py-3 text-sm">
                <span className="text-ink/70">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="font-mono">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-3 border-t border-line">
            <span className="label-eyebrow">Subtotal</span>
            <Price price={subtotal} />
          </div>
        </div>
      </div>
    </div>
  );
}
