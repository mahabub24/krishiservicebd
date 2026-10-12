'use client';

import { useEffect, useState } from 'react';
import { apiFetch, toBn } from '@/lib/api';
import { Users, Phone, Mail, CheckCircle, XCircle } from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = () => {
    setLoading(true);
    apiFetch<{ customers: any[] }>('/admin/customers')
      .then((res) => setCustomers(res.customers || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await apiFetch(`/admin/customers/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">গ্রাহক তালিকা</h1>
        <p className="text-sm text-gray-500">নিবন্ধিত ক্রেতা ও ব্যবহারকারীদের বিবরণ এবং একাউন্ট নিয়ন্ত্রণ</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">গ্রাহকের নাম</th>
                <th className="px-6 py-4">মোবাইল নম্বর</th>
                <th className="px-6 py-4">ইমেইল</th>
                <th className="px-6 py-4">নিবন্ধনের তারিখ</th>
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
              ) : customers.length > 0 ? (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-krishi-primary" />
                        <span>{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        <span>{c.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {c.email ? (
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          <span>{c.email}</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="px-6 py-4">
                      {c.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-700">
                          <CheckCircle className="h-3 w-3" /> সক্রিয়
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700">
                          <XCircle className="h-3 w-3" /> নিষ্ক্রিয়
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleStatus(c.id, c.isActive)}
                        className={`rounded px-2.5 py-1 text-xs font-semibold ${
                          c.isActive
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {c.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    কোনো গ্রাহক পাওয়া যায়নি
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
