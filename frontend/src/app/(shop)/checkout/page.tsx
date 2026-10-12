'use client';

import { useState } from 'react';
import { useCart } from '@/features/cart/CartContext';
import { useAuth } from '@/features/auth/AuthContext';
import { apiFetch, formatTaka, toBn } from '@/lib/api';
import { DISTRICTS } from '@/lib/site';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Truck,
} from 'lucide-react';

export default function CheckoutPage() {
  const { lines, setQty, remove, clear, ready } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    customerName: user?.name || '',
    customerPhone: user?.phone || '',
    fullAddress: '',
    district: 'ঢাকা',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Delivery charge: 50 Taka fixed for fast checkout (or customize by district)
  const deliveryFee = 50;
  const itemsSubtotal = lines.reduce((acc, l) => acc + l.price * l.quantity, 0);
  const totalAmount = itemsSubtotal + (lines.length > 0 ? deliveryFee : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0) {
      setError('আপনার কার্ট খালি। অনুগ্রহ করে পণ্য যোগ করুন।');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        district: form.district,
        fullAddress: form.fullAddress,
        paymentMethod: 'CASH_ON_DELIVERY',
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      };

      const res = await apiFetch<any>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      clear();
      router.push(`/orders/${res.orderNumber}`);
    } catch (err: any) {
      setError(err.message || 'অর্ডার সম্পন্ন করা যায়নি। পুনরায় চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] pb-24 md:pb-12 pt-4 sm:pt-6">
      <div className="max-w-2xl mx-auto px-4">
        {/* Top Back & Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-100 text-gray-700 transition"
            aria-label="ফিরে যান"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">চেকআউট</h1>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card 1: হোম ডেলিভারি তথ্য */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>হোম ডেলিভারি তথ্য</span>
            </h2>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">আপনার নাম *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    placeholder="আপনার নাম লিখুন"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-krishi-primary focus:ring-1 focus:ring-krishi-primary text-sm text-gray-900 placeholder:text-gray-400 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">ফোন নম্বর * (১১ ডিজিট)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{11}"
                    value={form.customerPhone}
                    onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-krishi-primary focus:ring-1 focus:ring-krishi-primary text-sm text-gray-900 placeholder:text-gray-400 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">ডেলিভারি ঠিকানা *</label>
                <div className="relative">
                  <span className="absolute top-3 left-3 pointer-events-none text-gray-400">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <textarea
                    rows={2}
                    required
                    value={form.fullAddress}
                    onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
                    placeholder="হোম ডেলিভারির ঠিকানা দিন"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-krishi-primary focus:ring-1 focus:ring-krishi-primary text-sm text-gray-900 placeholder:text-gray-400 bg-white resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: আপনার অর্ডার */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-[#116e2d]" />
              <span>আপনার অর্ডার</span>
            </h2>

            {lines.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                <p>কার্টে কোনো পণ্য নেই।</p>
                <Link href="/products" className="text-krishi-primary font-bold underline mt-2 inline-block">
                  পণ্য ব্রাউজ করুন
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {lines.map((item) => (
                  <div key={item.productId} className="py-3 flex items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                      <Image
                        src={item.image || '/logo.png'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{item.name}</h3>
                      <p className="text-xs font-bold text-[#116e2d] mt-0.5">৳{toBn(item.price)}</p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50">
                        <button
                          type="button"
                          onClick={() => setQty(item.productId, item.quantity - 1)}
                          className="p-1 text-gray-500 hover:text-gray-900"
                          aria-label="কমান"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-gray-800">
                          {toBn(item.quantity)}
                        </span>
                        <button
                          type="button"
                          disabled={item.quantity >= item.stock}
                          onClick={() => setQty(item.productId, item.quantity + 1)}
                          className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-30"
                          aria-label="বাড়ান"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(item.productId)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition"
                        aria-label="মুছে ফেলুন"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Price breakdown */}
            <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between items-center">
                <span>পণ্যের মূল্য</span>
                <span className="font-semibold text-gray-800">৳{toBn(itemsSubtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>ডেলিভারি</span>
                <span className="font-semibold text-gray-800">৳{toBn(deliveryFee)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-sm font-extrabold text-gray-900">
                <span>সর্বমোট</span>
                <span className="text-[#116e2d] text-base">৳{toBn(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Desktop Submit Button */}
          <div className="hidden md:block pt-2">
            <button
              type="submit"
              disabled={loading || lines.length === 0}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#116e2d] hover:bg-[#0d5623] text-white font-extrabold text-base shadow-lg transition-transform active:scale-98 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                <span>{loading ? 'অর্ডার প্রক্রিয়াধীন...' : 'অর্ডার কনফার্ম করুন'}</span>
              </div>
              <span className="text-lg">৳{toBn(totalAmount)}</span>
            </button>
          </div>

          {/* Mobile Bottom Fixed Bar (Exact match to screenshot) */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-3 shadow-2xl">
            <button
              type="submit"
              disabled={loading || lines.length === 0}
              className="w-full py-3 px-5 rounded-full bg-[#116e2d] hover:bg-[#0d5623] text-white font-extrabold text-sm shadow-md flex items-center justify-between active:scale-98 transition"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span>{loading ? 'প্রসেসিং...' : 'অর্ডার কনফার্ম করুন'}</span>
              </div>
              <span className="text-base font-black">৳{toBn(totalAmount)}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
