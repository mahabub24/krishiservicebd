"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, LogOut, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { Logo } from "./Logo";
import { NAV_LINKS } from "@/lib/site";
import { useCart } from "@/features/cart/CartContext";
import { useAuth } from "@/features/auth/AuthContext";
import { toBn } from "@/lib/api";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { count } = useCart();
  const { user, logout, isStaff } = useAuth();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  if (pathname.startsWith("/admin")) return null;

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/products?search=${encodeURIComponent(term)}` : "/products");
    setOpen(false);
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
      <div className="container-x flex items-center gap-4 py-3">
        <button
          className="rounded-lg p-2 hover:bg-krishi-light lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <Logo />
        <div className="mx-6 hidden max-w-xl flex-1 md:block">{searchForm}</div>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
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

      <div className="container-x pb-3 md:hidden">{searchForm}</div>

      <nav aria-label="প্রধান মেনু" className="hidden border-t border-gray-100 bg-krishi-light lg:block">
        <ul className="container-x flex items-center gap-1">
          {NAV_LINKS.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`block px-4 py-3 text-sm font-medium transition hover:text-krishi-primary ${
                    active ? "border-b-2 border-krishi-primary text-krishi-primary" : "text-gray-700"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {open && (
        <nav aria-label="মোবাইল মেনু" className="border-t border-gray-100 bg-white lg:hidden">
          <ul className="container-x py-2">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 font-medium hover:bg-krishi-light">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
