"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, LogOut, Phone, Search, ShoppingCart, User } from "lucide-react";
import { Logo } from "./Logo";
import { SITE } from "@/lib/site";
import { useCart } from "@/features/cart/CartContext";
import { useAuth } from "@/features/auth/AuthContext";
import { toBn } from "@/lib/api";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { count } = useCart();
  const { user, logout, isStaff } = useAuth();
  const [q, setQ] = useState("");

  if (pathname.startsWith("/admin")) return null;

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/products?search=${encodeURIComponent(term)}` : "/products");
  };

  const desktopSearchForm = (
    <form onSubmit={onSearch} role="search" className="relative w-full">
      <label htmlFor="desktop-search" className="sr-only">পণ্য খুঁজুন</label>
      <input
        id="desktop-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="বীজ, সার বা যেকোনো কৃষি পণ্য খুঁজুন..."
        className="w-full h-12 pl-4 pr-12 rounded-xl border-2 border-emerald-600/30 focus:border-krishi-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-base text-gray-900 placeholder:text-gray-400 bg-gray-50/50 shadow-inner transition"
      />
      <button
        type="submit"
        aria-label="অনুসন্ধান করুন"
        className="absolute right-1.5 top-1.5 bottom-1.5 flex w-11 items-center justify-center rounded-lg bg-[#116e2d] hover:bg-[#0d5623] text-white shadow-sm transition"
      >
        <Search className="h-5 w-5" />
      </button>
    </form>
  );

  const mobileSearchForm = (
    <form onSubmit={onSearch} role="search" className="relative w-full">
      <label htmlFor="mobile-search" className="sr-only">পণ্য খুঁজুন</label>
      <input
        id="mobile-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="বীজ, সার বা যেকোনো কৃষি পণ্য খুঁজুন..."
        className="w-full h-12 pl-4 pr-12 rounded-xl border-2 border-emerald-600/30 focus:border-krishi-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-base text-gray-900 placeholder:text-gray-400 bg-gray-50 shadow-inner"
      />
      <button
        type="submit"
        aria-label="অনুসন্ধান করুন"
        className="absolute right-1.5 top-1.5 bottom-1.5 flex w-11 items-center justify-center rounded-lg bg-[#116e2d] hover:bg-[#0d5623] text-white shadow-sm"
      >
        <Search className="h-5 w-5" />
      </button>
    </form>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white shadow-sm">
      {/* 1. Desktop & Tablet Header: Big Logo, Big Search Bar, Wishlist, Login & Cart preserved */}
      <div className="container-x hidden md:flex items-center justify-between gap-4 py-3.5">
        {/* Left: Large Logo */}
        <div className="shrink-0">
          <Logo />
        </div>

        {/* Center: Large Centered Search Bar */}
        <div className="flex-1 max-w-2xl mx-auto px-4">
          {desktopSearchForm}
        </div>

        {/* Right: Phone, Wishlist, Login, Cart (Desktops only) */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={`tel:${SITE.whatsapp}`}
            className="flex items-center gap-2.5 text-right border-r border-gray-200 pr-3 hover:text-krishi-primary transition"
          >
            <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Phone className="h-5 w-5" />
            </div>
            <div className="text-left leading-tight">
              <span className="block text-[11px] text-gray-500 font-semibold">সহায়তা ও অর্ডার</span>
              <span className="block text-sm font-extrabold text-gray-900">{SITE.phone}</span>
            </div>
          </a>

          {/* Desktop Wishlist */}
          <Link
            href="/account?tab=wishlist"
            aria-label="উইশলিস্ট"
            className="rounded-xl p-2.5 hover:bg-emerald-50 text-gray-700 transition"
          >
            <Heart className="h-5 w-5" />
          </Link>

          {/* Desktop User Login / Account */}
          {user ? (
            <>
              <Link
                href={isStaff ? "/admin" : "/account"}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-gray-800 hover:bg-emerald-50 transition"
              >
                <User className="h-5 w-5 text-krishi-primary" />
                <span>{isStaff ? "অ্যাডমিন" : user.name.split(" ")[0]}</span>
              </Link>
              <button
                onClick={async () => { await logout(); router.push("/"); }}
                aria-label="লগআউট"
                className="rounded-xl p-2.5 hover:bg-red-50 text-gray-600 hover:text-red-600 transition"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-gray-800 hover:bg-emerald-50 transition border border-gray-200"
            >
              <User className="h-4 w-4" />
              <span>লগইন</span>
            </Link>
          )}

          {/* Desktop Cart */}
          <Link
            href="/cart"
            aria-label={`কার্ট, ${toBn(count)}টি পণ্য`}
            className="relative flex items-center gap-2 rounded-xl bg-gray-50 hover:bg-emerald-50 px-3.5 py-2.5 text-gray-800 transition border border-gray-200"
          >
            <ShoppingCart className="h-5 w-5 text-[#116e2d]" />
            <span className="text-sm font-bold">কার্ট</span>
            {count > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                {toBn(count)}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* 2. Mobile Header: Big Logo on top + Big Search Bar below (Wishlist & Login removed on mobile) */}
      <div className="md:hidden px-4 pt-3 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <Logo />
          {/* Quick Phone Call on mobile header */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${SITE.whatsapp}`}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs"
              aria-label="সহায়তা ও ফোন"
            >
              <Phone className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Big prominent mobile search bar */}
        <div>{mobileSearchForm}</div>
      </div>
    </header>
  );
}
