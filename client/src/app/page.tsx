import Link from "next/link";
import { api } from "@/lib/api";
import type { Category, ProductListResponse } from "@/types";
import ProductGrid from "@/components/ProductGrid";

async function getNewArrivals() {
  try {
    const res = await api.get<ProductListResponse>(
      "/products?sort=-createdAt&limit=8"
    );
    return res.data.products;
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const res = await api.get<{ data: { categories: Category[] } }>("/categories");
    return res.data.categories.slice(0, 4);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([getNewArrivals(), getCategories()]);

  return (
    <div>
      {/* Hero */}
      <section className="container-edge pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8">
            <p className="label-eyebrow mb-6">Considered goods, since day one</p>
            <h1 className="font-display italic text-[13vw] md:text-[6vw] leading-[0.95] tracking-tight">
              Fewer things,
              <br />
              made well.
            </h1>
          </div>
          <div className="md:col-span-4 flex flex-col gap-6 md:items-end text-right">
            <p className="text-ink/60 max-w-[32ch] md:text-right text-left">
              NodeShip is a small marketplace for objects built to be used, not just owned.
            </p>
            <Link href="/products" className="btn-primary self-start md:self-end">
              Shop the catalogue
            </Link>
          </div>
        </div>
      </section>

      <div className="border-t border-line" />

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container-edge py-16">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-display italic text-3xl">Browse by category</h2>
            <Link href="/products" className="btn-ghost hidden sm:inline-flex">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/products?category=${cat._id}`}
                className="group relative aspect-[3/2] bg-bone flex items-end p-5 overflow-hidden"
              >
                <span className="relative z-10 font-body text-lg group-hover:text-rust transition-colors">
                  {cat.name}
                </span>
                <span className="absolute inset-0 bg-ink/0 group-hover:bg-ink/5 transition-colors" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New arrivals */}
      <section className="container-edge py-16">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-display italic text-3xl">New arrivals</h2>
          <Link href="/products?sort=-createdAt" className="btn-ghost hidden sm:inline-flex">
            View all
          </Link>
        </div>
        <ProductGrid products={products} />
      </section>
    </div>
  );
}
