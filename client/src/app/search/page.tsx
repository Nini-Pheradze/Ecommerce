import { api } from "@/lib/api";
import type { Product } from "@/types";
import ProductGrid from "@/components/ProductGrid";

interface Props {
  searchParams: { q?: string };
}

async function search(query: string) {
  if (!query) return [];
  try {
    const res = await api.get<{ data: { products: Product[] } }>(
      `/search/products?query=${encodeURIComponent(query)}`
    );
    return res.data.products;
  } catch {
    return [];
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams.q?.trim() ?? "";
  const products = await search(query);

  return (
    <div className="container-edge py-14">
      <p className="label-eyebrow mb-3">Search</p>
      <h1 className="font-display italic text-4xl md:text-5xl mb-2">
        {query ? `“${query}”` : "Search NodeShip"}
      </h1>
      <p className="text-sm text-ink/50 mb-10">
        {query ? `${products.length} result${products.length !== 1 ? "s" : ""}` : "Type something in the search bar above."}
      </p>
      <ProductGrid products={products} />
    </div>
  );
}
