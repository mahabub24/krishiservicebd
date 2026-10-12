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

  const searchForm = (
    <form onSubmit={onSearch} role="search" className="relative w-full">
      <label htmlFor="site-search" className="sr-only">পণ্য খুঁজুন</label>
      <input
        id="site-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="বীজ, সার বা কীটনাশক খুঁজুন..."
        className="input pr-12"
      />
      <button
        type="submit"
        aria-label="অনুসন্ধান করুন"
        className="absolute right-1 top-1 flex h-9 w-10 items-center justify-center rounded-md bg-krishi-primary text-white hover:bg-krishi-dark"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white shadow-sm">
      <div className="container-x flex items-center justify-between gap-4 py-3">
        {/* Left: Logo */}
        <div className="shrink-0">
          <Logo />
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl mx-auto px-2">
          {searchForm}
        </div>

        {/* Right: Phone/Help & Actions */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <a
            href={`tel:${SITE.whatsapp}`}
            className="hidden lg:flex items-center gap-2 text-right border-r border-gray-200 pr-4 hover:text-krishi-primary transition"
          >
            <div className="h-9 w-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Phone className="h-4 w-4" />
            </div>
            <div className="text-left leading-tight">
              <span className="block text-[11px] text-gray-500 font-medium">সহায়তা ও অর্ডার</span>
              <span className="block text-sm font-bold text-gray-900">{SITE.phone}</span>
            </div>
          </a>

          <Link href="/account?tab=wishlist" aria-label="উইশলিস্ট" className="rounded-lg p-2 hover:bg-krishi-light">
            <Heart className="h-5 w-5" />
          </Link>

          {user ? (
            <>
              <Link
                href={isStaff ? "/admin" : "/account"}
                className="flex items-center gap-1 rounded-lg p-2 text-sm font-medium hover:bg-krishi-light"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:inline">{isStaff ? "অ্যাডমিন" : user.name.split(" ")[0]}</span>
              </Link>
              <button
                onClick={async () => { await logout(); router.push("/"); }}
                aria-label="লগআউট"
                className="rounded-lg p-2 hover:bg-krishi-light"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <Link href="/login" className="flex items-center gap-1 rounded-lg p-2 text-sm font-medium hover:bg-krishi-light">
              <User className="h-5 w-5" /> <span className="hidden sm:inline">লগইন</span>
            </Link>
          )}

          <Link href="/cart" aria-label={`কার্ট, ${toBn(count)}টি পণ্য`} className="relative rounded-lg p-2 hover:bg-krishi-light">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-krishi-accent px-1 text-xs font-bold text-krishi-dark">
                {toBn(count)}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
