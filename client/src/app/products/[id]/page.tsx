import Image from "next/image";
import { notFound } from "next/navigation";
import { api, productImageUrl } from "@/lib/api";
import type { Product, Review } from "@/types";
import Price from "@/components/Price";
import Rating from "@/components/Rating";
import AddToCartPanel from "@/components/AddToCartPanel";
import ReviewSection from "@/components/ReviewSection";
import ProductGrid from "@/components/ProductGrid";

interface Props {
  params: { id: string };
}

async function getProduct(id: string) {
  try {
    const res = await api.get<{ data: { product: Product } }>(`/products/${id}`);
    return res.data.product;
  } catch {
    return null;
  }
}

async function getReviews(id: string) {
  try {
    const res = await api.get<{ data: { reviews: Review[] } }>(`/reviews`);
    // The reviews route isn't nested under /products/:id on the backend, so it
    // always returns every review — filter down to this product on the client.
    return res.data.reviews.filter((r) => r.product === id);
  } catch {
    return [];
  }
}

async function getRelated(categoryId: string, excludeId: string) {
  try {
    const res = await api.get<{ data: { products: Product[] } }>(
      `/products?category=${categoryId}&limit=4`
    );
    return res.data.products.filter((p) => p._id !== excludeId);
  } catch {
    return [];
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  const categoryId =
    typeof product.category === "object" ? product.category._id : product.category;
  const categoryName =
    typeof product.category === "object" ? product.category.name : undefined;

  const [reviews, related] = await Promise.all([
    getReviews(product._id),
    getRelated(categoryId, product._id),
  ]);

  const coverImg = productImageUrl(product.imageCover);
  const galleryImgs = (product.images ?? []).map((f) => productImageUrl(f)).filter(Boolean) as string[];

  return (
    <div className="container-edge py-14">
      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-[4/5] bg-bone overflow-hidden">
            {coverImg ? (
              <Image src={coverImg} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-display italic text-8xl text-ink/15">
                  {product.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          {galleryImgs.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {galleryImgs.map((src, i) => (
                <div key={i} className="relative aspect-square bg-bone overflow-hidden">
                  <Image src={src} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {categoryName && <p className="label-eyebrow mb-3 text-ink/50">{categoryName}</p>}
          <h1 className="font-display italic text-3xl md:text-4xl mb-3">{product.name}</h1>
          {product.ratingsQuantity > 0 && (
            <div className="mb-4">
              <Rating average={product.ratingsAverage} quantity={product.ratingsQuantity} size="md" />
            </div>
          )}
          <div className="mb-6">
            <Price price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
          </div>
          {product.description && (
            <p className="text-ink/70 leading-relaxed mb-8 max-w-[54ch]">{product.description}</p>
          )}

          <AddToCartPanel product={product} />

          <dl className="mt-10 pt-8 border-t border-line grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="label-eyebrow text-ink/40">SKU</dt>
              <dd className="font-mono mt-1">{product.sku}</dd>
            </div>
            <div>
              <dt className="label-eyebrow text-ink/40">Availability</dt>
              <dd className="mt-1">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-24 pt-16 border-t border-line">
        <h2 className="font-display italic text-3xl mb-10">Reviews</h2>
        <ReviewSection productId={product._id} initialReviews={reviews} />
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-24 pt-16 border-t border-line">
          <h2 className="font-display italic text-3xl mb-10">You might also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
