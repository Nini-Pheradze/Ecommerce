"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Review } from "@/types";

export default function ReviewSection({
  productId,
  initialReviews,
}: {
  productId: string;
  initialReviews: Review[];
}) {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await api.post<{ data: { review: Review } }>(
        "/reviews",
        { product: productId, rating, review: text },
        true
      );
      setReviews((prev) => [res.data.review, ...prev]);
      setText("");
      setRating(5);
      setStatus("idle");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Could not submit review");
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-12">
      <div>
        <p className="label-eyebrow mb-6">
          {reviews.length} review{reviews.length !== 1 ? "s" : ""}
        </p>
        <div className="space-y-8">
          {reviews.length === 0 && (
            <p className="text-sm text-ink/50">No reviews yet — be the first.</p>
          )}
          {reviews.map((r) => (
            <div key={r._id} className="border-b border-line pb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {typeof r.user === "object" ? r.user.name : "Customer"}
                </span>
                <span className="text-xs font-mono text-ink/50">
                  {"★".repeat(r.rating)}
                  <span className="text-ink/20">{"★".repeat(5 - r.rating)}</span>
                </span>
              </div>
              <p className="text-sm text-ink/70">{r.review}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="label-eyebrow mb-6">Write a review</p>
        {isAuthenticated ? (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label-eyebrow block mb-2">Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="input-field"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} star{n !== 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-eyebrow block mb-2">Your review</label>
              <textarea
                required
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="input-field resize-none"
                placeholder="Tell us what you thought…"
              />
            </div>
            {status === "error" && <p className="text-sm text-rust">{errorMsg}</p>}
            <button type="submit" disabled={status === "loading"} className="btn-secondary">
              {status === "loading" ? "Submitting…" : "Submit review"}
            </button>
            <p className="text-xs text-ink/40">
              Reviews are limited to customers who have purchased this product.
            </p>
          </form>
        ) : (
          <p className="text-sm text-ink/50">Log in to leave a review.</p>
        )}
      </div>
    </div>
  );
}
