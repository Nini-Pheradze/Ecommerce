"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Order } from "@/types";

const STATUS_STYLES: Record<Order["status"], string> = {
  Pending: "text-ink/60",
  Processing: "text-ink/60",
  Shipped: "text-moss",
  Delivered: "text-moss",
  Cancelled: "text-rust",
};

export default function AccountPage() {
  const { isAuthenticated, ready, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    api
      .get<{ data: { orders: Order[] } }>("/orders/my-orders", true)
      .then((res) => setOrders(res.data.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [ready, isAuthenticated]);

  if (ready && !isAuthenticated) {
    return (
      <div className="container-edge py-24 text-center">
        <p className="font-display italic text-3xl mb-4">Your account</p>
        <p className="text-ink/60 mb-8">Log in to view your order history.</p>
        <Link href="/login" className="btn-primary">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="container-edge py-14">
      <div className="flex items-baseline justify-between mb-10">
        <h1 className="font-display italic text-4xl md:text-5xl">Your orders</h1>
        <button onClick={logout} className="btn-ghost">
          Log out
        </button>
      </div>

      {loading ? (
        <p className="text-ink/50">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-ink/60 mb-8">You haven&apos;t placed any orders yet.</p>
          <Link href="/products" className="btn-primary">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {orders.map((order) => {
            const items = order.orderItems ?? order.items ?? [];
            return (
              <div key={order._id} className="py-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-sm text-ink/50">#{order._id.slice(-8)}</p>
                  <p className="text-sm text-ink/60">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                    {order.createdAt && ` · ${new Date(order.createdAt).toLocaleDateString()}`}
                  </p>
                </div>
                <span className={`label-eyebrow ${STATUS_STYLES[order.status]}`}>
                  {order.status}
                </span>
                <span className="font-mono">${order.totalPrice.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
