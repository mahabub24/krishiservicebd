'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(phone, password);
      if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'STAFF') {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    } catch (err: any) {
      setError(err.message || 'মোবাইল নম্বর অথবা পাসওয়ার্ড সঠিক নয়');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-x py-12">
      <Breadcrumbs items={[{ label: 'হোম', href: '/' }, { label: 'লগইন' }]} />

      <div className="mx-auto mt-6 max-w-md card p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center">একাউন্টে লগইন করুন</h1>
        <p className="mt-1 text-sm text-gray-500 text-center">আপনার সংরক্ষিত অর্ডার ও তথ্য দেখুন</p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            <label className="block text-sm font-semibold text-gray-700">পাসওয়ার্ড</label>
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
            {loading ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন'}
          </button>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-4 text-center text-sm text-gray-600">
          একাউন্ট নেই?{' '}
          <Link href="/register" className="font-semibold text-krishi-primary hover:underline">
            নতুন একাউন্ট খুলুন
          </Link>
        </div>
      </div>
    </div>
  );
}
