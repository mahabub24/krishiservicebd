'use client';

import { useEffect, useState } from 'react';
import { apiFetch, formatTaka, toBn } from '@/lib/api';

const ORDER_STATUS_OPTIONS = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    apiFetch<{ orders: any[] }>('/admin/orders')
      .then((res) => setOrders(res.orders))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await apiFetch(`/admin/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">অর্ডার ব্যবস্থাপনা</h1>
        <p className="text-sm text-gray-500">গ্রাহকের অর্ডার পর্যালোচনা ও ডেলিভারি স্ট্যাটাস আপডেট</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">অর্ডার নম্বর</th>
                <th className="px-6 py-4">গ্রাহক ও মোবাইল</th>
                <th className="px-6 py-4">ঠিকানা</th>
                <th className="px-6 py-4">মোট টাকা</th>
                <th className="px-6 py-4">স্ট্যাটাস</th>
                <th className="px-6 py-4">স্ট্যাটাস পরিবর্তন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">
                      {o.orderNumber}
                      <span className="block text-xs font-sans text-gray-400">
                        {new Date(o.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{o.customerName}</div>
                      <div className="text-xs text-gray-500">{o.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 text-xs max-w-xs truncate">
                      {o.fullAddress}, {o.unionArea}, {o.upazila}, {o.district}
                    </td>
                    <td className="px-6 py-4 font-bold text-krishi-dark">
                      {formatTaka(o.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-krishi-primary"
                      >
                        {ORDER_STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    কোনো অর্ডার পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
