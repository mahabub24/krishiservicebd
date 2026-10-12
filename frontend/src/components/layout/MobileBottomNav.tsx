'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/features/cart/CartContext';
import { useAuth } from '@/features/auth/AuthContext';
import { toBn } from '@/lib/api';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { count } = useCart();
  const { user, isStaff } = useAuth();

  if (pathname.startsWith('/admin')) return null;

  const items = [
    { href: '/', label: 'হোম', icon: Home },
    { href: '/products', label: 'পণ্যসমূহ', icon: Package },
    { href: '/cart', label: 'কার্ট', icon: ShoppingCart, badge: count },
    {
      href: user ? (isStaff ? '/admin' : '/account') : '/login',
      label: 'লগ ইন',
      icon: User,
    },
  ];

  return (
    <nav
      aria-label="মোবাইল বটম মেনু"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 py-2 px-3 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-3 transition active:scale-95 ${
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
              <span className="text-[11px] font-semibold mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
