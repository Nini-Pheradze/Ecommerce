"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/types";
import { productImageUrl } from "@/lib/api";
import Price from "./Price";
import Rating from "./Rating";
import WishlistButton from "./WishlistButton";

export default function ProductCard({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false);
  const img = productImageUrl(product.imageCover);
  const categoryName =
    typeof product.category === "object" ? product.category?.name : undefined;

  return (
    <div className="group relative">
      <Link href={`/products/${product._id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-bone">
          {img && !imgError ? (
            <Image
              src={img}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-display italic text-5xl text-ink/15 select-none">
                {product.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {product.discountPercentage ? (
            <span className="absolute left-3 top-3 bg-ink text-paper text-[11px] uppercase tracking-widest2 px-2 py-1">
              −{product.discountPercentage}%
            </span>
          ) : null}
        </div>
        <div className="mt-4 space-y-1">
          {categoryName && (
            <p className="label-eyebrow text-ink/40">{categoryName}</p>
          )}
          <h3 className="font-body text-[15px] leading-snug">{product.name}</h3>
          <Price price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
          {product.ratingsQuantity > 0 && (
            <Rating average={product.ratingsAverage} quantity={product.ratingsQuantity} />
          )}
        </div>
      </Link>
      <div className="absolute right-3 top-3">
        <WishlistButton productId={product._id} />
      </div>
    </div>
  );
}
