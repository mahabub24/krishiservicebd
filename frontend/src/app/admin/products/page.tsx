'use client';

import { useEffect, useState } from 'react';
import { apiFetch, formatTaka, toBn } from '@/lib/api';
import { Plus, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = () => {
    setLoading(true);
    apiFetch<{ products: any[] }>('/admin/products')
      .then((res) => setProducts(res.products))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে পণ্যটি মুছে ফেলতে বা নিষ্ক্রিয় করতে চান?')) return;
    try {
      await apiFetch(`/admin/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">পণ্য ব্যবস্থাপনা</h1>
          <p className="text-sm text-gray-500">স্টোরের পণ্য ক্যাটালগ নিয়ন্ত্রণ ও স্টক তথ্য</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">পণ্যের নাম</th>
                <th className="px-6 py-4">ক্যাটাগরি</th>
                <th className="px-6 py-4">মূল্য</th>
                <th className="px-6 py-4">মজুদ (স্টক)</th>
                <th className="px-6 py-4">অবস্থা</th>
                <th className="px-6 py-4 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      <div>{p.nameBn}</div>
                      <div className="text-xs font-mono text-gray-400">SKU: {p.sku}</div>
                    </td>
                    <td className="px-6 py-4">{p.category?.nameBn || '-'}</td>
                    <td className="px-6 py-4 font-bold text-krishi-dark">
                      {formatTaka(p.discountPrice || p.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-semibold ${
                          p.stockQuantity <= 5 ? 'text-red-600' : 'text-gray-900'
                        }`}
                      >
                        {toBn(p.stockQuantity)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {p.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-700">
                          <CheckCircle className="h-3 w-3" /> সক্রিয়
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-600">
                          <XCircle className="h-3 w-3" /> নিষ্ক্রিয়
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="rounded p-1.5 text-gray-400 hover:text-red-600"
                        title="মুছুন / নিষ্ক্রিয় করুন"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    কোনো পণ্য পাওয়া যায়নি
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
