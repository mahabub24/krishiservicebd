'use client';

import { useState } from 'react';
import { useCart } from '@/features/cart/CartContext';
import { useAuth } from '@/features/auth/AuthContext';
import { apiFetch, formatTaka, toBn } from '@/lib/api';
import { DISTRICTS } from '@/lib/site';
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CheckCircle2, ShieldCheck, Truck } from 'lucide-react';

export default function CheckoutPage() {
  const { lines, clear } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    customerName: user?.name || '',
    customerPhone: user?.phone || '',
    district: 'ঢাকা',
    upazila: '',
    unionArea: '',
    fullAddress: '',
    orderNotes: '',
    paymentMethod: 'CASH_ON_DELIVERY' as 'CASH_ON_DELIVERY' | 'BKASH_MANUAL' | 'NAGAD_MANUAL',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Delivery charge rule preview (Dhaka 60, Outside Dhaka 120)
  const isDhaka = form.district.trim() === 'ঢাকা';
  const deliveryFee = isDhaka ? 60 : 120;
  const itemsSubtotal = lines.reduce((acc, l) => acc + l.price * l.quantity, 0);
  const estimatedTotal = itemsSubtotal + deliveryFee;

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
        upazila: form.upazila,
        unionArea: form.unionArea,
        fullAddress: form.fullAddress,
        orderNotes: form.orderNotes || undefined,
        paymentMethod: form.paymentMethod,
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
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: 'হোম', href: '/' }, { label: 'কার্ট', href: '/cart' }, { label: 'চেকআউট' }]} />

      <h1 className="mt-4 text-3xl font-bold text-gray-900">অর্ডার চেকআউট</h1>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Customer Address Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
              ডেলিভারি ঠিকানা
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700">আপনার পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  placeholder="যেমন: মোহাম্মদ রফিকুল ইসলাম"
                  className="input mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">মোবাইল নম্বর *</label>
                <input
                  type="tel"
                  required
                  value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                  className="input mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">জেলা *</label>
                <select
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  className="input mt-1 bg-white"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">উপজেলা / থানা *</label>
                <input
                  type="text"
                  required
                  value={form.upazila}
                  onChange={(e) => setForm({ ...form, upazila: e.target.value })}
                  placeholder="যেমন: ধামরাই"
                  className="input mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">ইউনিয়ন / এলাকা *</label>
                <input
                  type="text"
                  required
                  value={form.unionArea}
                  onChange={(e) => setForm({ ...form, unionArea: e.target.value })}
                  placeholder="যেমন: কুশুরা ইউনিয়ন"
                  className="input mt-1"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700">গ্রাম ও বিস্তারিত ঠিকানা *</label>
                <textarea
                  required
                  rows={2}
                  value={form.fullAddress}
                  onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
                  placeholder="গ্রাম, পাড়া/মহল্লা, বাড়ি নম্বর বা নিকটস্থ পরিচিত স্থান"
                  className="input mt-1"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700">বিশেষ কোনো নির্দেশনা (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={form.orderNotes}
                  onChange={(e) => setForm({ ...form, orderNotes: e.target.value })}
                  placeholder="ডেলিভারির সময় বা পণ্য সম্পর্কিত কোনো অনুরোধ"
                  className="input mt-1"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
              পেমেন্ট পদ্ধতি নির্বাচন করুন
            </h2>

            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-3 rounded-xl border p-4 cursor-pointer hover:bg-gray-50 border-krishi-primary bg-krishi-light/30">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CASH_ON_DELIVERY"
                  checked={form.paymentMethod === 'CASH_ON_DELIVERY'}
                  onChange={() => setForm({ ...form, paymentMethod: 'CASH_ON_DELIVERY' })}
                  className="text-krishi-primary"
                />
                <div className="flex-1">
                  <span className="font-bold text-gray-900 block">ক্যাশ অন ডেলিভারি (Cash on Delivery)</span>
                  <span className="text-xs text-gray-500">পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন</span>
                </div>
              </label>

              <label className="flex items-center gap-3 rounded-xl border p-4 cursor-pointer hover:bg-gray-50 border-gray-200">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="BKASH_MANUAL"
                  checked={form.paymentMethod === 'BKASH_MANUAL'}
                  onChange={() => setForm({ ...form, paymentMethod: 'BKASH_MANUAL' })}
                  className="text-krishi-primary"
                />
                <div className="flex-1">
                  <span className="font-bold text-gray-900 block">বিকাশ পেমেন্ট (bKash)</span>
                  <span className="text-xs text-gray-500">অর্ডার করার পর বিকাশ নম্বরে পেমেন্ট করতে হবে</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Items & Calculation */}
        <div className="card p-6 h-fit space-y-4">
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
            অর্ডার পর্যালোচনা
          </h2>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {lines.map((item) => (
              <div key={item.productId} className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium text-gray-900 block">{item.name}</span>
                  <span className="text-xs text-gray-400">
                    {formatTaka(item.price)} × {toBn(item.quantity)}
                  </span>
                </div>
                <span className="font-bold text-gray-900">
                  {formatTaka(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>পণ্য উপমোট:</span>
              <span className="font-semibold text-gray-900">{formatTaka(itemsSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>ডেলিভারি চার্জ ({form.district}):</span>
              <span className="font-semibold text-gray-900">{formatTaka(deliveryFee)}</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline font-bold text-lg text-gray-900">
            <span>সর্বমোট প্রদেয়:</span>
            <span className="text-krishi-dark text-2xl">{formatTaka(estimatedTotal)}</span>
          </div>

          <button
            type="submit"
            disabled={loading || lines.length === 0}
            className="btn-primary w-full !py-3 text-base flex justify-center items-center gap-2"
          >
            <ShieldCheck className="h-5 w-5" />
            {loading ? 'অর্ডার প্রক্রিয়াধীন...' : 'অর্ডার নিশ্চিত করুন'}
          </button>
        </div>
      </form>
    </div>
  );
}
