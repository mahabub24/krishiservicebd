'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Warehouse,
  BarChart3,
  FileText,
  Settings,
  Sprout,
} from 'lucide-react';

const adminNav = [
  { href: '/admin', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
  { href: '/admin/products', label: 'পণ্য ব্যবস্থাপনা', icon: Package },
  { href: '/admin/categories', label: 'ক্যাটাগরি', icon: Layers },
  { href: '/admin/orders', label: 'অর্ডার তালিকা', icon: ShoppingBag },
  { href: '/admin/customers', label: 'গ্রাহক তালিকা', icon: Users },
  { href: '/admin/inventory', label: 'ইনভেন্টরি ও স্টক', icon: Warehouse },
  { href: '/admin/reports', label: 'বিক্রয় রিপোর্ট', icon: BarChart3 },
  { href: '/admin/articles', label: 'কৃষি নিবন্ধ', icon: FileText },
  { href: '/admin/settings', label: 'স্টোর সেটিংস', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:block">
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <Sprout className="h-6 w-6 text-krishi-primary" />
        <span className="font-bold text-gray-900">কৃষি সার্ভিস অ্যাডমিন</span>
      </div>

      <nav className="p-4 space-y-1">
        {adminNav.map((item) => {
          const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? 'bg-krishi-light text-krishi-primary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
