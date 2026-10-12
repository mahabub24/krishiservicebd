'use client';

import { useEffect, useState } from 'react';
import { apiFetch, formatTaka, toBn } from '@/lib/api';
import { BarChart3, TrendingUp, DollarSign, Package } from 'lucide-react';

export default function AdminReportsPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [statusReport, setStatusReport] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiFetch<any[]>(`/reports/sales?period=${period}&format=json`).catch(() => []),
      apiFetch<any[]>('/reports/order-status?format=json').catch(() => []),
      apiFetch<any[]>('/reports/best-sellers?limit=10&format=json').catch(() => []),
    ])
      .then(([salesRes, statusRes, bestRes]) => {
        setSales(salesRes || []);
        setStatusReport(statusRes || []);
        setBestSellers(bestRes || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [period]);

  const totalRevenue = sales.reduce((acc, curr) => acc + (Number(curr.sales) || 0), 0);
  const totalOrdersCount = sales.reduce((acc, curr) => acc + (Number(curr.orders) || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">বিক্রয় ও পারফরম্যান্স রিপোর্ট</h1>
          <p className="text-sm text-gray-500">স্টোরের সামগ্রিক বিক্রয় বিশ্লেষণ ও সর্বাধিক বিক্রিত পণ্য</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="input !w-auto text-xs font-semibold"
          >
            <option value="daily">দৈনিক রিপোর্ট</option>
            <option value="weekly">সাপ্তাহিক রিপোর্ট</option>
            <option value="monthly">মাসিক রিপোর্ট</option>
          </select>
        </div>
      </div>

      {/* Top Aggregates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400">মোট বিক্রয় (বাছাইকৃত সময়)</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{formatTaka(totalRevenue)}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400">মোট সম্পন্ন অর্ডার</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{toBn(totalOrdersCount)}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="card overflow-hidden">
        <div className="border-b border-gray-100 p-4 font-bold text-gray-900">
          সময়ভিত্তিক বিক্রয় পরিসংখ্যান ({period === 'daily' ? 'দিন' : period === 'weekly' ? 'সপ্তাহ' : 'মাস'})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">সময়কাল</th>
                <th className="px-6 py-4">মোট অর্ডার</th>
                <th className="px-6 py-4">ডেলিভারি চার্জ</th>
                <th className="px-6 py-4">ছাড়</th>
                <th className="px-6 py-4 text-right">নিট বিক্রয়</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : sales.length > 0 ? (
                sales.map((s, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-mono font-semibold text-gray-900">{s.period}</td>
                    <td className="px-6 py-4 font-bold text-blue-600">{toBn(s.orders)} টি</td>
                    <td className="px-6 py-4">{formatTaka(s.delivery)}</td>
                    <td className="px-6 py-4 text-gray-400">{formatTaka(s.discounts)}</td>
                    <td className="px-6 py-4 text-right font-bold text-krishi-dark">
                      {formatTaka(s.sales)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    উক্ত সময়ে কোনো বিক্রয়ের তথ্য নেই
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Best Sellers */}
      <div className="card overflow-hidden">
        <div className="border-b border-gray-100 p-4 font-bold text-gray-900">
          সর্বাধিক বিক্রিত পণ্য (Best Sellers)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">পণ্যের নাম</th>
                <th className="px-6 py-4">মোট বিক্রি</th>
                <th className="px-6 py-4 text-right">মোট অর্জিত আয়</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bestSellers.length > 0 ? (
                bestSellers.map((b, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{b.name}</td>
                    <td className="px-6 py-4 font-bold text-emerald-700">{toBn(b.quantity)} টি</td>
                    <td className="px-6 py-4 text-right font-bold text-krishi-dark">
                      {formatTaka(b.revenue)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-6 text-center text-gray-400 text-xs">
                    এখনও কোনো পণ্য বিক্রয়ের রেকর্ড নেই
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
