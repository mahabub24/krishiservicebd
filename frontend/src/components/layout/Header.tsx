"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Phone, Search, ShoppingCart } from "lucide-react";
import { Logo } from "./Logo";
import { SITE } from "@/lib/site";
import { useCart } from "@/features/cart/CartContext";
import { toBn } from "@/lib/api";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { count } = useCart();
  const [q, setQ] = useState("");

  if (pathname.startsWith("/admin")) return null;

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/products?search=${encodeURIComponent(term)}` : "/products");
  };

  const searchForm = (
    <form onSubmit={onSearch} role="search" className="relative w-full">
      <label htmlFor="site-search" className="sr-only">পণ্য খুঁজুন</label>
      <input
        id="site-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="বীজ, সার বা যেকোনো কৃষি পণ্য খুঁজুন..."
        className="w-full h-11 sm:h-12 pl-4 pr-12 rounded-xl border-2 border-emerald-600/30 focus:border-krishi-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 bg-gray-50/50 shadow-inner transition"
      />
      <button
        type="submit"
        aria-label="অনুসন্ধান করুন"
        className="absolute right-1.5 top-1.5 bottom-1.5 flex w-10 sm:w-11 items-center justify-center rounded-lg bg-[#116e2d] hover:bg-[#0d5623] text-white shadow-sm transition"
      >
        <Search className="h-5 w-5" />
      </button>
    </form>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white shadow-sm">
      {/* Desktop & Tablet Header */}
      <div className="container-x hidden sm:flex items-center justify-between gap-4 py-3">
        {/* Left: Big Logo */}
        <div className="shrink-0">
          <Logo />
        </div>

        {/* Center: Large Centered Search Bar */}
        <div className="flex-1 max-w-2xl mx-auto px-4">
          {searchForm}
        </div>

        {/* Right: Phone & Cart Only (Wishlist and Login removed as requested) */}
        <div className="flex items-center gap-4 shrink-0">
          <a
            href={`tel:${SITE.whatsapp}`}
            className="flex items-center gap-2.5 text-right border-r border-gray-200 pr-4 hover:text-krishi-primary transition"
          >
            <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
              <Phone className="h-5 w-5" />
            </div>
            <div className="text-left leading-tight">
              <span className="block text-[11px] text-gray-500 font-semibold">সহায়তা ও অর্ডার</span>
              <span className="block text-sm font-extrabold text-gray-900">{SITE.phone}</span>
            </div>
          </a>

          <Link
            href="/cart"
            aria-label={`কার্ট, ${toBn(count)}টি পণ্য`}
            className="relative flex items-center gap-2 rounded-xl bg-gray-50 hover:bg-emerald-50 px-3.5 py-2.5 text-gray-800 transition border border-gray-200/80"
          >
            <ShoppingCart className="h-5 w-5 text-[#116e2d]" />
            <span className="text-sm font-bold hidden md:inline">কার্ট</span>
            {count > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                {toBn(count)}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Header: Big Logo on top + Big Search Bar & Quick Cart */}
      <div className="sm:hidden px-4 pt-3 pb-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <a
              href={`tel:${SITE.whatsapp}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100"
              aria-label="সহায়তা ও ফোন"
            >
              <Phone className="h-4 w-4" />
            </a>
            <Link
              href="/cart"
              aria-label={`কার্ট, ${toBn(count)}টি পণ্য`}
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-800"
            >
              <ShoppingCart className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-0.5 text-[10px] font-bold text-white">
                  {toBn(count)}
                </span>
              )}
            </Link>
          </div>
        </div>
        {/* Full-width Big Mobile Search Bar */}
        <div>{searchForm}</div>
      </div>
    </header>
  );
}
