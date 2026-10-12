'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ShoppingCart, Phone, MessageCircle } from 'lucide-react';
import { useCart } from '@/features/cart/CartContext';
import { SITE } from '@/lib/site';
import { toBn } from '@/lib/api';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { count } = useCart();

  // Hide on admin routes or single landing pages if desired, but keep on shop pages
  if (pathname.startsWith('/admin')) return null;

  const items = [
    { href: '/', label: 'হোম', icon: Home, isLink: true },
    { href: '/products', label: 'পণ্যসমূহ', icon: Package, isLink: true },
    { href: '/cart', label: 'কার্ট', icon: ShoppingCart, isLink: true, badge: count },
    {
      href: `https://wa.me/88${SITE.whatsapp}`,
      label: 'হোয়াটসঅ্যাপ',
      icon: MessageCircle,
      isExternal: true,
      color: 'text-emerald-600',
    },
    {
      href: `tel:${SITE.whatsapp}`,
      label: 'কল করুন',
      icon: Phone,
      isExternal: true,
      color: 'text-green-700',
    },
  ];

  return (
    <nav
      aria-label="মোবাইল বটম মেনু"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 py-1.5 px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const active = item.isLink && (item.href === '/' ? pathname === '/' : pathname.startsWith(item.href));
          const Icon = item.icon;

          if (item.isExternal) {
            return (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex flex-col items-center justify-center py-1 px-2 text-gray-600 hover:text-krishi-primary transition active:scale-95"
              >
                <Icon className={`h-5 w-5 ${item.color || ''}`} />
                <span className="text-[10px] font-semibold mt-1">{item.label}</span>
              </a>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-2 transition active:scale-95 ${
                active ? 'text-[#116e2d] font-bold' : 'text-gray-600 hover:text-krishi-primary'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 text-white text-[9px] font-bold px-1">
                    {toBn(item.badge!)}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
