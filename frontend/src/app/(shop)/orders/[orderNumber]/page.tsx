import { Metadata } from 'next';
import { apiFetch, formatTaka, toBn } from '@/lib/api';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import Link from 'next/link';
import { CheckCircle, Clock, PackageCheck, AlertCircle } from 'lucide-react';

interface Props {
  params: Promise<{ orderNumber: string }>;
}

export const metadata: Metadata = {
  title: 'অর্ডার নিশ্চিতকরণ | কৃষি সার্ভিস বিডি',
};

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'অপেক্ষমাণ (Pending)', color: 'bg-amber-100 text-amber-800' },
  CONFIRMED: { label: 'নিশ্চিত করা হয়েছে (Confirmed)', color: 'bg-blue-100 text-blue-800' },
  PROCESSING: { label: 'প্রক্রিয়াকরণ চলছে (Processing)', color: 'bg-purple-100 text-purple-800' },
  SHIPPED: { label: 'ডেলিভারিতে রয়েছে (Shipped)', color: 'bg-indigo-100 text-indigo-800' },
  DELIVERED: { label: 'ডেলিভারি সম্পন্ন (Delivered)', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'বাতিল করা হয়েছে (Cancelled)', color: 'bg-red-100 text-red-800' },
};

export default async function OrderConfirmationPage({ params }: Props) {
  const { orderNumber } = await params;
  let order: any = null;

  try {
    order = await apiFetch<any>(`/orders/${orderNumber}`);
  } catch (err) {
    // If guest or unauthorized direct access
  }

  if (!order) {
    return (
      <div className="container-x py-16 text-center">
        <AlertCircle className="mx-auto h-16 w-16 text-amber-500" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">অর্ডার নম্বর: {orderNumber}</h1>
        <p className="mt-2 text-gray-600">
          আপনার অর্ডারটি প্রক্রিয়াধীন রয়েছে। আপনার মোবাইল নম্বরে দ্রুতই কল অথবা এসএমএস করা হবে।
        </p>
        <Link href="/" className="btn-primary mt-6">
          হোম পেজে ফিরে যান
        </Link>
      </div>
    );
  }

  const statusInfo = statusLabels[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: 'হোম', href: '/' }, { label: 'অর্ডার বিবরণী' }]} />

      <div className="mx-auto mt-6 max-w-3xl">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
          <h1 className="mt-3 text-2xl font-bold text-green-900">
            ধন্যবাদ! আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে
          </h1>
          <p className="mt-1 text-green-700">অর্ডার ট্র্যাকিং নম্বর: <strong className="font-mono">{order.orderNumber}</strong></p>
        </div>

        <div className="card mt-6 p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <span className="text-xs text-gray-400">অর্ডারের স্ট্যাটাস</span>
              <div className="mt-1">
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-400">পেমেন্ট মেথড</span>
              <p className="mt-1 font-semibold text-gray-900">
                {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'ক্যাশ অন ডেলিভারি' : order.paymentMethod}
              </p>
            </div>
          </div>

          {/* Delivery Details */}
          <div>
            <h2 className="font-bold text-gray-900">গ্রাহকের ঠিকানা</h2>
            <div className="mt-2 text-sm text-gray-600 space-y-1">
              <p><strong className="text-gray-800">নাম:</strong> {order.customerName}</p>
              <p><strong className="text-gray-800">মোবাইল:</strong> {order.customerPhone}</p>
              <p>
                <strong className="text-gray-800">ঠিকানা:</strong> {order.fullAddress}, {order.unionArea}, {order.upazila}, {order.district}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h2 className="font-bold text-gray-900 mb-3">অর্ডারকৃত পণ্যসমূহ</h2>
            <div className="divide-y divide-gray-100 border rounded-xl overflow-hidden">
              {order.items.map((item: any) => (
                <div key={item.id} className="p-3 sm:p-4 flex justify-between items-center text-sm">
                  <div>
                    <span className="font-semibold text-gray-900 block">{item.productName}</span>
                    <span className="text-xs text-gray-400">{item.unitSize} × {toBn(item.quantity)}</span>
                  </div>
                  <span className="font-bold text-gray-900">{formatTaka(item.totalPrice)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>উপমোট:</span>
              <span className="font-semibold text-gray-900">{formatTaka(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>ডেলিভারি চার্জ:</span>
              <span className="font-semibold text-gray-900">{formatTaka(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold text-gray-900">
              <span>মোট পরিশোধযোগ্য:</span>
              <span className="text-krishi-dark text-xl">{formatTaka(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/products" className="btn-outline">
            আরও কেনাকাটা করুন
          </Link>
        </div>
      </div>
    </div>
  );
}
