'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register({ name, phone, password });
      router.push('/account');
    } catch (err: any) {
      setError(err.message || 'রেজিস্ট্রেশন সম্পন্ন করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-x py-12">
      <Breadcrumbs items={[{ label: 'হোম', href: '/' }, { label: 'রেজিস্ট্রেশন' }]} />

      <div className="mx-auto mt-6 max-w-md card p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center">নতুন একাউন্ট তৈরি করুন</h1>
        <p className="mt-1 text-sm text-gray-500 text-center">সহজে অর্ডার করুন ও অর্ডার ট্র্যাক করুন</p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">আপনার নাম</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: কৃষক মোহাম্মদ আলী"
              className="input mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">মোবাইল নম্বর</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="input mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">পাসওয়ার্ড (ন্যূনতম ৮ অক্ষর)</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input mt-1"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-2.5 mt-2"
          >
            {loading ? 'প্রক্রিয়াকরণ হচ্ছে...' : 'একাউন্ট খুলুন'}
          </button>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-4 text-center text-sm text-gray-600">
          ইতিমধ্যে একাউন্ট আছে?{' '}
          <Link href="/login" className="font-semibold text-krishi-primary hover:underline">
            লগইন করুন
          </Link>
        </div>
      </div>
    </div>
  );
}
