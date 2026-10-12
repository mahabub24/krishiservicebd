'use client';

import { useAuth } from '@/features/auth/AuthContext';
import { useEffect, useState } from 'react';
import { apiFetch, formatTaka, toBn } from '@/lib/api';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, MapPin, LogOut } from 'lucide-react';

export default function CustomerAccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      apiFetch<any[]>('/orders/my-orders')
        .then((res) => setOrders(res))
        .catch(() => setOrders([]))
        .finally(() => setFetching(false));
    }
  }, [user, loading, router]);

  if (loading || fetching) {
    return (
      <div className="container-x py-16 text-center">
        <p className="text-gray-500">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: 'হোম', href: '/' }, { label: 'আমার অ্যাকাউন্ট' }]} />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-sm text-gray-500">মোবাইল: {user.phone}</p>
        </div>
        <button
          onClick={async () => {
            await logout();
            router.push('/');
          }}
          className="btn-outline !py-2 text-sm text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-1.5"
        >
          <LogOut className="h-4 w-4" />
          <span>লগআউট</span>
        </button>
      </div>

      <div className="mt-8 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="h-5 w-5 text-krishi-primary" />
          <span>আপনার অর্ডারসমূহ ({toBn(orders.length)})</span>
        </h2>

        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="card p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="font-mono font-bold text-gray-900 block text-base">
                    {order.orderNumber}
                  </span>
                  <span className="text-xs text-gray-400">
                    তারিখ: {new Date(order.createdAt).toLocaleDateString('bn-BD')}
                  </span>
                  <p className="mt-1 text-sm font-semibold text-krishi-dark">
                    মোট: {formatTaka(order.totalAmount)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="rounded-full bg-krishi-light px-3 py-1 text-xs font-bold text-krishi-primary">
                    {order.status}
                  </span>
                  <Link
                    href={`/orders/${order.orderNumber}`}
                    className="btn-primary !py-1.5 !px-3 text-xs"
                  >
                    বিস্তারিত
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
            <p className="text-gray-500">আপনার কোনো পূর্ববর্তী অর্ডার নেই</p>
            <Link href="/products" className="btn-primary mt-4 inline-block">
              কেনাকাটা শুরু করুন
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
