'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { apiFetch, formatTaka, toBn } from '@/lib/api';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle,
  Users,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role === 'CUSTOMER')) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'CUSTOMER') {
      apiFetch<any>('/admin/dashboard')
        .then((res) => setStats(res))
        .catch((err) => console.error(err))
        .finally(() => setFetching(false));
    }
  }, [user, loading, router]);

  if (loading || fetching) {
    return <p className="text-gray-500">ড্যাশবোর্ড ডেটা লোড হচ্ছে...</p>;
  }

  if (!stats) {
    return <p className="text-red-500">ড্যাশবোর্ড অ্যাক্সেস করা সম্ভব হয়নি।</p>;
  }

  const statCards = [
    { title: 'মোট বিক্রয়', value: formatTaka(stats.totalSales), icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { title: 'মোট অর্ডার', value: toBn(stats.totalOrders), icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
    { title: 'অপেক্ষমাণ অর্ডার', value: toBn(stats.pendingOrders), icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { title: 'সম্পন্ন অর্ডার', value: toBn(stats.completedOrders), icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
    { title: 'মোট গ্রাহক', value: toBn(stats.totalCustomers), icon: Users, color: 'text-indigo-600 bg-indigo-50' },
    { title: 'কম স্টকের পণ্য', value: toBn(stats.lowStock?.length || 0), icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ড্যাশবোর্ড ওভারভিউ</h1>
        <p className="text-sm text-gray-500">আপনার অনলাইন এগ্রিকালচার স্টোরের সাম্প্রতিক পরিসংখ্যান</p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="card p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400">{c.title}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{c.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="font-bold text-gray-900">সাম্প্রতিক অর্ডারসমূহ</h2>
            <Link href="/admin/orders" className="text-xs font-semibold text-krishi-primary hover:underline">
              সকল অর্ডার দেখুন
            </Link>
          </div>

          <div className="mt-4 divide-y divide-gray-100">
            {stats.recentOrders?.length > 0 ? (
              stats.recentOrders.map((o: any) => (
                <div key={o.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-mono font-bold text-gray-900 block">{o.orderNumber}</span>
                    <span className="text-xs text-gray-400">{o.customerName}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-krishi-dark block">{formatTaka(o.totalAmount)}</span>
                    <span className="text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                      {o.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-4 text-center">কোনো সাম্প্রতিক অর্ডার নেই</p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card p-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="font-bold text-gray-900">কম স্টকের সতর্কতা (Low Stock)</h2>
            <Link href="/admin/inventory" className="text-xs font-semibold text-krishi-primary hover:underline">
              ইনভেন্টরি দেখুন
            </Link>
          </div>

          <div className="mt-4 divide-y divide-gray-100">
            {stats.lowStock?.length > 0 ? (
              stats.lowStock.map((p: any) => (
                <div key={p.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-semibold text-gray-900 block">{p.nameBn}</span>
                    <span className="text-xs text-gray-400 font-mono">SKU: {p.sku}</span>
                  </div>
                  <span className="rounded-md bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                    স্টক: {toBn(p.stockQuantity)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-4 text-center">কোনো পণ্য কম স্টকে নেই</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
