"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/types";

const SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest" },
  { value: "price", label: "Price: low to high" },
  { value: "-price", label: "Price: high to low" },
  { value: "-ratingsAverage", label: "Top rated" },
];

export default function Filters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  const activeCategory = searchParams.get("category") ?? "";
  const activeSort = searchParams.get("sort") ?? "-createdAt";
  const onSale = searchParams.get("onSale") === "true";

  return (
    <aside className="space-y-10">
      <div>
        <p className="label-eyebrow mb-4">Category</p>
        <ul className="space-y-2 text-sm">
          <li>
            <button
              onClick={() => updateParam("category", null)}
              className={`hover:text-rust transition-colors ${
                !activeCategory ? "text-ink font-medium" : "text-ink/60"
              }`}
            >
              All products
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat._id}>
              <button
                onClick={() => updateParam("category", cat._id)}
                className={`hover:text-rust transition-colors ${
                  activeCategory === cat._id ? "text-ink font-medium" : "text-ink/60"
                }`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="label-eyebrow mb-4">Sort by</p>
        <ul className="space-y-2 text-sm">
          {SORT_OPTIONS.map((opt) => (
            <li key={opt.value}>
              <button
                onClick={() => updateParam("sort", opt.value)}
                className={`hover:text-rust transition-colors ${
                  activeSort === opt.value ? "text-ink font-medium" : "text-ink/60"
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="label-eyebrow mb-4">Availability</p>
        <label className="flex items-center gap-2 text-sm text-ink/70 cursor-pointer">
          <input
            type="checkbox"
            checked={onSale}
            onChange={(e) => updateParam("onSale", e.target.checked ? "true" : null)}
            className="accent-rust h-4 w-4"
          />
          On sale only
        </label>
      </div>
    </aside>
  );
}
