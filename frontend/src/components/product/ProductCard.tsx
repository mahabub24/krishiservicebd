"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ShoppingCart, Zap } from "lucide-react";
import { effectivePrice, formatTaka, hasDiscount, primaryImage, toBn, type Product } from "@/lib/api";
import { useCart } from "@/features/cart/CartContext";

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const out = product.stockQuantity <= 0;
  const discounted = hasDiscount(product);
  const pct = discounted
    ? Math.round((1 - effectivePrice(product) / Number(product.price)) * 100)
    : 0;

  const onAdd = () => {
    const r = add(product, 1);
    if (r.ok) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  const onOrderNow = () => {
    if (out) return;
    add(product, 1);
    router.push("/checkout");
  };

  return (
    <article className="card group flex flex-col overflow-hidden transition hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-krishi-light">
        <Image
          src={primaryImage(product)}
          alt={product.images?.[0]?.altText || product.nameBn}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {discounted && !out && (
          <span className="absolute left-2 top-2 rounded-full bg-krishi-accent px-2 py-0.5 text-xs font-bold text-krishi-dark">
            {toBn(pct)}% ছাড়
          </span>
        )}
        {out && (
          <span className="absolute left-2 top-2 rounded-full bg-gray-800 px-2 py-0.5 text-xs font-semibold text-white">
            স্টকে নেই
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {product.category && <p className="text-xs text-krishi-primary">{product.category.nameBn}</p>}
        <h3 className="mt-1 line-clamp-2 min-h-[2.75rem] font-semibold leading-snug text-gray-900">
          <Link href={`/products/${product.slug}`} className="hover:text-krishi-primary">
            {product.nameBn}
          </Link>
        </h3>
        <p className="text-xs text-gray-500">{product.unitSize}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-krishi-dark">{formatTaka(effectivePrice(product))}</span>
          {discounted && <span className="text-sm text-gray-400 line-through">{formatTaka(product.price)}</span>}
        </div>
        <div className="mt-3 space-y-2">
          <button
            onClick={onAdd}
            disabled={out}
            className="btn-outline w-full !py-2 text-sm flex items-center justify-center gap-1.5"
            aria-label={`${product.nameBn} কার্টে যোগ করুন`}
          >
            {added ? <Check className="h-4 w-4 text-emerald-600" /> : <ShoppingCart className="h-4 w-4" />}
            {out ? "স্টক শেষ" : added ? "যোগ হয়েছে" : "কার্টে যোগ করুন"}
          </button>

          <button
            onClick={onOrderNow}
            disabled={out}
            className="btn-primary w-full !py-2 text-sm flex items-center justify-center gap-1.5 shadow-sm"
            aria-label={`${product.nameBn} অর্ডার করুন`}
          >
            <Zap className="h-4 w-4" />
            {out ? "স্টক শেষ" : "অর্ডার করুন"}
          </button>
        </div>
      </div>
    </article>
  );
}
