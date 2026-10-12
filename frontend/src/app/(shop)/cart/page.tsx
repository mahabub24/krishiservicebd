'use client';

import { useCart } from '@/features/cart/CartContext';
import { formatTaka, toBn } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export default function CartPage() {
  const { lines, setQty, remove, subtotal, ready, clear } = useCart();

  if (!ready) {
    return (
      <div className="container-x py-16 text-center">
        <p className="text-gray-500">কার্ট লোড হচ্ছে...</p>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container-x py-16 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-krishi-light text-krishi-primary">
          <ShoppingBag className="h-12 w-12" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">আপনার শপিং কার্ট খালি</h1>
        <p className="mt-2 text-gray-500">প্রয়োজনীয় উন্নত বীজ, সার বা কৃষি উপকরণ বেছে নিন</p>
        <Link href="/products" className="btn-primary mt-6">
          পণ্য ব্রাউজ করুন
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: 'হোম', href: '/' }, { label: 'শপিং কার্ট' }]} />

      <h1 className="mt-4 text-3xl font-bold text-gray-900">শপিং কার্ট ({toBn(lines.length)}টি পণ্য)</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {lines.map((line) => (
            <div key={line.productId} className="card p-4 sm:p-5 flex gap-4 items-center">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
                <Image src={line.image} alt={line.name} fill className="object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">
                  <Link href={`/products/${line.slug}`} className="hover:text-krishi-primary">
                    {line.name}
                  </Link>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">প্যাকেট: {line.unitSize}</p>
                <div className="mt-2 text-base font-bold text-krishi-primary">
                  {formatTaka(line.price)}
                </div>
              </div>

              {/* Quantity Changer */}
              <div className="flex items-center rounded-lg border border-gray-200">
                <button
                  type="button"
                  onClick={() => setQty(line.productId, line.quantity - 1)}
                  className="p-1.5 text-gray-600 hover:bg-gray-100"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-semibold">{line.quantity}</span>
                <button
                  type="button"
                  disabled={line.quantity >= line.stock}
                  onClick={() => setQty(line.productId, line.quantity + 1)}
                  className="p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => remove(line.productId)}
                className="p-2 text-gray-400 hover:text-red-600 transition"
                title="মুছে ফেলুন"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={clear}
              className="text-sm text-red-600 hover:underline"
            >
              কার্ট খালি করুন
            </button>
            <Link href="/products" className="text-sm text-krishi-primary hover:underline">
              আরও পণ্য যোগ করুন
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="card p-6 h-fit space-y-4">
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
            অর্ডার সারাংশ
          </h2>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>উপমোট (Subtotal):</span>
              <span className="font-semibold text-gray-900">{formatTaka(subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>ডেলিভারি চার্জ:</span>
              <span>চেকআউটে নির্ধারিত হবে</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline font-bold text-lg text-gray-900">
            <span>মোট আনুমানিক:</span>
            <span className="text-krishi-dark text-xl">{formatTaka(subtotal)}</span>
          </div>

          <Link href="/checkout" className="btn-primary w-full !py-3 flex items-center justify-center gap-2">
            <span>চেকআউট এগিয়ে যান</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
