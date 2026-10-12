'use client';

import { useEffect, useState } from 'react';
import { apiFetch, toBn } from '@/lib/api';
import { Warehouse, AlertTriangle, ArrowUpDown, Check } from 'lucide-react';

export default function AdminInventoryPage() {
  const [data, setData] = useState<{ threshold: number; products: any[] }>({ threshold: 5, products: [] });
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('নিয়মিত স্টক সমন্বয়');
  const [saving, setSaving] = useState(false);

  const fetchInventory = () => {
    setLoading(true);
    Promise.all([
      apiFetch<{ threshold: number; products: any[] }>('/admin/inventory/low-stock'),
      apiFetch<any[]>('/admin/inventory/movements').catch(() => []),
    ])
      .then(([lowStockRes, movesRes]) => {
        setData(lowStockRes);
        setMovements(movesRes || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjust = async (productId: string) => {
    setSaving(true);
    try {
      await apiFetch('/admin/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          mode: 'set',
          quantity: Number(adjustQty),
          reason: adjustReason || 'স্টক আপডেট',
        }),
      });
      setAdjustingId(null);
      fetchInventory();
    } catch (err: any) {
      alert(err.message || 'স্টক পরিবর্তন ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ইনভেন্টরি ও স্টক ব্যবস্থাপনা</h1>
        <p className="text-sm text-gray-500">
          কম স্টকের পণ্য পর্যবেক্ষণ এবং বর্তমান স্টক বৃদ্ধি/হ্রাস করুন
        </p>
      </div>

      {/* Low Stock Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            কম স্টকের পণ্যসমূহ (সীমা: {toBn(data.threshold)} টি বা তার কম)
          </h2>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-700">
                <tr>
                  <th className="px-6 py-4">পণ্যের নাম ও SKU</th>
                  <th className="px-6 py-4">বর্তমান মজুদ</th>
                  <th className="px-6 py-4">অবস্থা</th>
                  <th className="px-6 py-4 text-right">স্টক আপডেট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                      লোড হচ্ছে...
                    </td>
                  </tr>
                ) : data.products?.length > 0 ? (
                  data.products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        <div>{p.nameBn}</div>
                        <div className="text-xs font-mono text-gray-400">SKU: {p.sku}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                            p.stockQuantity === 0
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {toBn(p.stockQuantity)} টি
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {p.stockQuantity === 0 ? (
                          <span className="font-semibold text-red-600">স্টক শেষ</span>
                        ) : (
                          <span className="font-semibold text-amber-600">সীমার নিচে</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {adjustingId === p.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="number"
                              min="0"
                              value={adjustQty}
                              onChange={(e) => setAdjustQty(Number(e.target.value))}
                              className="input !w-24 !py-1 text-xs"
                              placeholder="নতুন স্টক"
                            />
                            <button
                              disabled={saving}
                              onClick={() => handleAdjust(p.id)}
                              className="btn-primary !py-1 !px-2.5 text-xs"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setAdjustingId(null)}
                              className="rounded border px-2 py-1 text-xs text-gray-500 hover:bg-gray-50"
                            >
                              বাতিল
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setAdjustingId(p.id);
                              setAdjustQty(p.stockQuantity);
                            }}
                            className="rounded border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            স্টক পরিবর্তন
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                      কোনো কম স্টকের পণ্য নেই
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Movements Log */}
      <div className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <ArrowUpDown className="h-5 w-5 text-krishi-primary" />
          সাম্প্রতিক স্টক পরিবর্তনের ইতিহাস
        </h2>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-700">
                <tr>
                  <th className="px-6 py-4">তারিখ ও সময়</th>
                  <th className="px-6 py-4">পণ্য</th>
                  <th className="px-6 py-4">পরিমাণ</th>
                  <th className="px-6 py-4">ধরন ও কারণ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {movements.length > 0 ? (
                  movements.slice(0, 15).map((m) => (
                    <tr key={m.id}>
                      <td className="px-6 py-3 text-xs text-gray-500 font-mono">
                        {new Date(m.createdAt).toLocaleString('bn-BD')}
                      </td>
                      <td className="px-6 py-3 font-semibold text-gray-900">
                        {m.product?.nameBn || m.productId}
                      </td>
                      <td className="px-6 py-3 font-bold">
                        <span className={m.quantity >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {m.quantity >= 0 ? `+${toBn(m.quantity)}` : toBn(m.quantity)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs text-gray-600">
                        <span className="font-semibold">{m.type}</span> — {m.reason || 'স্টক সমন্বয়'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-6 text-center text-gray-400 text-xs">
                      এখনও কোনো স্টক পরিবর্তনের রেকর্ড নেই
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
