import { api } from "@/lib/api";
import type { Category, ProductListResponse } from "@/types";
import Filters from "@/components/Filters";
import ProductGrid from "@/components/ProductGrid";
import Pagination from "@/components/Pagination";

interface Props {
  searchParams: Record<string, string | undefined>;
}

async function getCategories() {
  try {
    const res = await api.get<{ data: { categories: Category[] } }>("/categories");
    return res.data.categories;
  } catch {
    return [];
  }
}

async function getProducts(searchParams: Props["searchParams"]) {
  const params = new URLSearchParams();
  if (searchParams.category) params.set("category", searchParams.category);
  if (searchParams.sort) params.set("sort", searchParams.sort);
  if (searchParams.onSale) params.set("onSale", searchParams.onSale);
  if (searchParams.page) params.set("page", searchParams.page);
  params.set("limit", "12");

  try {
    const res = await api.get<ProductListResponse>(`/products?${params.toString()}`);
    return res;
  } catch {
    return {
      status: "fail",
      results: 0,
      totalProducts: 0,
      currentPage: 1,
      totalPages: 1,
      data: { products: [] },
    } as ProductListResponse;
  }
}

export default async function ProductsPage({ searchParams }: Props) {
  const [categories, productsRes] = await Promise.all([
    getCategories(),
    getProducts(searchParams),
  ]);

  const baseParams = new URLSearchParams();
  if (searchParams.category) baseParams.set("category", searchParams.category);
  if (searchParams.sort) baseParams.set("sort", searchParams.sort);
  if (searchParams.onSale) baseParams.set("onSale", searchParams.onSale);

  return (
    <div className="container-edge py-14">
      <div className="mb-10">
        <p className="label-eyebrow mb-3">Catalogue</p>
        <h1 className="font-display italic text-4xl md:text-5xl">All products</h1>
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-12">
        <Filters categories={categories} />
        <div>
          <p className="text-sm text-ink/50 mb-6">
            {productsRes.totalProducts} result{productsRes.totalProducts !== 1 ? "s" : ""}
          </p>
          <ProductGrid products={productsRes.data.products} />
          <Pagination
            currentPage={productsRes.currentPage}
            totalPages={productsRes.totalPages}
            baseParams={baseParams}
          />
        </div>
      </div>
    </div>
  );
}
