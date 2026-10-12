'use client';

import { use, useEffect, useState } from 'react';
import { apiFetch, formatTaka, toBn } from '@/lib/api';
import {
  CheckCircle2,
  Phone,
  MessageCircle,
  Truck,
  ShieldCheck,
  Share2,
  ShoppingBag,
  Star,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function PublicLandingTemplatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Quick One-Page Checkout State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [district, setDistrict] = useState('ঢাকা');
  const [quantity, setQuantity] = useState(1);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    apiFetch<any>(`/landing-pages/${slug}`)
      .then((res) => setData(res))
      .catch((err) => {
        console.error(err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const scrollToCheckout = () => {
    const el = document.getElementById('checkout-form-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.productId) {
      alert('এই ল্যান্ডিং পেজে কোনো পণ্য সংযুক্ত নেই');
      return;
    }
    setOrderSubmitting(true);
    try {
      const res: any = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerName,
          customerPhone,
          fullAddress,
          district: district || 'বাংলাদেশ',
          upazila: district || 'সদর',
          unionArea: 'সদর',
          paymentMethod: 'CASH_ON_DELIVERY',
          items: [{ productId: data.productId, quantity: Number(quantity) }],
          orderNotes: `ল্যান্ডিং পেজ (${data.title}) থেকে অর্ডারকৃত`,
        }),
      });
      setOrderCompleted(res);
    } catch (err: any) {
      alert(err.message || 'অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setOrderSubmitting(false);
    }
  };

  const shareToFacebook = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <p className="text-krishi-dark font-semibold">অফার পেজ লোড হচ্ছে...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800">অফার পেজটি পাওয়া যায়নি</h1>
        <p className="mt-2 text-sm text-gray-500">লিংকটি সঠিক নয় অথবা অফারের মেয়াদ শেষ হয়েছে।</p>
        <Link href="/" className="btn-primary mt-4">
          মূল ওয়েবসাইটে যান
        </Link>
      </div>
    );
  }

  const effectivePrice = data.customDiscount || data.product?.discountPrice || data.customPrice || data.product?.price || 350;
  const originalPrice = data.customPrice || data.product?.price || (Number(effectivePrice) + 150);
  const primaryImage = data.galleryImages?.[0] || data.product?.images?.[0]?.imageUrl || '/demo/cat-seeds.png';
  const subImages = data.galleryImages?.slice(1) || [];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-16">
      {/* 1. Header with Logo */}
      <header className="bg-white py-3 border-b border-gray-100 shadow-sm text-center">
        <div className="container max-w-2xl mx-auto px-4 flex items-center justify-center">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="কৃষি সার্ভিস বিডি"
              width={180}
              height={44}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
        </div>
      </header>

      {/* Main Container mirroring the Bangladeshi high-converting landing format */}
      <main className="container max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {/* 2. Top Catchy Headlines */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#116e2d] leading-snug whitespace-pre-line">
            {data.headline}
          </h1>
          {data.subHeadline && (
            <p className="text-sm sm:text-base font-semibold text-gray-700">
              {data.subHeadline}
            </p>
          )}
        </div>

        {/* 3. Badge with Offer Price */}
        <div className="text-center space-y-1">
          <p className="text-lg sm:text-xl font-extrabold text-gray-900">
            {data.badgeText || `১০০+ প্রিমিয়াম বীজ মাত্র `}
            <span className="inline-flex items-center justify-center border-2 border-red-500 rounded-full px-3 py-0.5 text-red-600 font-black mx-1 bg-red-50">
              ৳{toBn(effectivePrice)}
            </span>{' '}
            টাকায়
          </p>
          <p className="text-sm font-bold text-[#116e2d]">{data.deliveryNote || 'ডেলিভারি চার্জ ফ্রি'}</p>
        </div>

        {/* 4. Hero Main Product Image */}
        <div className="overflow-hidden rounded-2xl shadow-md border-2 border-emerald-500 bg-white p-2">
          <img
            src={primaryImage}
            alt={data.title}
            className="w-full h-auto rounded-xl object-cover max-h-[450px]"
          />
        </div>

        {/* 5. Direct Order Button 1 */}
        <div className="text-center pt-2">
          <button
            onClick={scrollToCheckout}
            className="w-full sm:w-4/5 py-3.5 px-6 rounded-xl bg-[#137a34] hover:bg-[#0e5c27] text-white font-extrabold text-lg shadow-lg shadow-green-700/20 transition-transform active:scale-95 flex items-center justify-center gap-2 mx-auto"
          >
            <ShoppingBag className="h-5 w-5" />
            অর্ডার করতে চাই ➔
          </button>
        </div>

        {/* Wave Divider */}
        <div className="py-2 flex justify-center text-emerald-200">
          <svg className="w-full h-6" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>

        {/* 6. Middle Feature Heading Banner */}
        <div className="bg-[#116e2d] text-white py-3 px-4 rounded-xl text-center font-bold text-lg shadow-sm">
          {data.product?.nameBn || data.title} এর বৈশিষ্ট্য
        </div>

        {/* 7. Features with Checkmarks & Gallery */}
        <div className="grid gap-4 sm:grid-cols-2 items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="space-y-3">
            {(data.features || []).map((f: string, i: number) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-sm font-semibold text-gray-800">{f}</span>
              </div>
            ))}
          </div>
          {subImages.length > 0 ? (
            <div className="space-y-2">
              {subImages.map((img: string, idx: number) => (
                <img
                  key={idx}
                  src={img}
                  alt="Gallery"
                  className="rounded-xl object-cover w-full h-40 border"
                />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <img src={primaryImage} alt="Feature" className="w-full h-40 object-cover" />
            </div>
          )}
        </div>

        {/* 8. Direct Order Button 2 */}
        <div className="text-center pt-2">
          <button
            onClick={scrollToCheckout}
            className="w-full sm:w-4/5 py-3.5 px-6 rounded-xl bg-[#137a34] hover:bg-[#0e5c27] text-white font-extrabold text-lg shadow-lg shadow-green-700/20 transition-transform active:scale-95 flex items-center justify-center gap-2 mx-auto"
          >
            <ShoppingBag className="h-5 w-5" />
            অর্ডার করতে চাই ➔
          </button>
        </div>

        {/* 9. Customer Review Banner */}
        <div className="bg-[#116e2d] text-white py-3 px-4 rounded-xl text-center font-bold text-lg shadow-sm">
          সম্মানিত কাস্টমার রিভিউ
        </div>

        {/* 10. Reviews Cards (Real farmer reviews format) */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-2 text-xs">
            <div className="flex text-amber-400">
              {'★★★★★'}
            </div>
            <p className="font-semibold text-gray-800">
              "বীজগুলো আসলেই ভালো, চারা গজানোর হার প্রায় ৯০% এর বেশি ছিল। ধন্যবাদ কৃষি সার্ভিসকে।"
            </p>
            <p className="text-gray-400 font-mono">— মো: রফিকুল ইসলাম, রংপুর</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-2 text-xs">
            <div className="flex text-amber-400">
              {'★★★★★'}
            </div>
            <p className="font-semibold text-gray-800">
              "২ দিনের ভেতর ডেলিভারি পেয়েছি। কোনো অগ্রিম টাকা দেওয়া লাগেনি, ক্যাশ অন ডেলিভারিতে নিলাম।"
            </p>
            <p className="text-gray-400 font-mono">— আনোয়ার হোসেন, যশোর</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-2 text-xs">
            <div className="flex text-amber-400">
              {'★★★★★'}
            </div>
            <p className="font-semibold text-gray-800">
              "ফলন আলহামদুলিল্লাহ খুব সুন্দর হয়েছে। সামনের মৌসুমে আবার এখান থেকেই নেবো।"
            </p>
            <p className="text-gray-400 font-mono">— আব্দুল কাদের, বগুড়া</p>
          </div>
        </div>

        {/* 11. Hotline / Support Banner */}
        <div className="bg-[#116e2d] text-white py-3 px-4 rounded-xl text-center font-bold text-sm sm:text-base shadow-sm">
          যে কোনো প্রয়োজনে নিচে দেওয়া নম্বরে যোগাযোগ করুন অথবা হোয়াট্সঅ্যাপ করুন
        </div>

        {/* Hotline Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`tel:${data.hotlinePhone || '01700000000'}`}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-sm"
          >
            <Phone className="h-4 w-4" />
            কল করুন
          </a>
          <a
            href={`https://wa.me/88${data.whatsappNumber || data.hotlinePhone || '01700000000'}`}
            target="_blank"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-sm shadow-sm"
          >
            <MessageCircle className="h-4 w-4" />
            হোয়াটসঅ্যাপে জানান
          </a>
        </div>

        {/* Guarantee Notes list */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-2 text-xs sm:text-sm font-semibold text-gray-700">
          <p className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            ১০০% অরিজিনাল ও পরীক্ষিত কৃষি পণ্যের নিশ্চয়তা
          </p>
          <p className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-emerald-600 shrink-0" />
            পণ্য হাতে পেয়ে চেক করে মূল্য পরিশোধ করার সুবিধা
          </p>
          <p className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            সারাদেশে দ্রুত হোম ডেলিভারি ব্যবস্থা
          </p>
        </div>

        {/* 12. Checkout Form Section (The exact high converting one-page order form) */}
        <div id="checkout-form-section" className="scroll-mt-6">
          <div className="bg-[#116e2d] text-white py-3.5 px-4 rounded-t-2xl text-center font-extrabold text-xl shadow-sm">
            অর্ডার করতে নিচের ফর্মটি পূরণ করুন
          </div>

          <div className="bg-white p-6 rounded-b-2xl border-x border-b border-gray-200 shadow-md">
            {orderCompleted ? (
              <div className="text-center py-8 space-y-4">
                <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto" />
                <h3 className="text-2xl font-bold text-gray-900">আপনার অর্ডারটি সফল হয়েছে!</h3>
                <p className="text-sm text-gray-600">
                  অর্ডার নম্বর: <span className="font-mono font-bold text-krishi-dark">{orderCompleted.orderNumber}</span>
                </p>
                <p className="text-xs text-gray-500">
                  আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে ফোনে যোগাযোগ করে অর্ডার কনফার্ম করবেন।
                </p>
                <Link href="/" className="btn-primary inline-block text-sm mt-4">
                  হোমপেজে ফিরে যান
                </Link>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} className="space-y-5">
                {/* Product Summary in form */}
                <div className="rounded-xl bg-gray-50 p-4 border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={primaryImage}
                      alt="Product"
                      className="h-14 w-14 rounded-lg object-cover border bg-white"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{data.product?.nameBn || data.title}</h4>
                      <p className="text-xs text-gray-500 font-mono">
                        মূল্য: ৳{toBn(effectivePrice)}
                      </p>
                    </div>
                  </div>
                  {/* Quantity selector */}
                  <div className="flex items-center border rounded-lg bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-sm font-bold text-gray-800">{toBn(quantity)}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700">আপনার নাম*</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="আপনার পূর্ণ নাম লিখুন"
                      className="input mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700">মোবাইল নম্বর*</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="input mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700">জেলা*</label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="যেমন: ঢাকা / বগুড়া / রাজশাহী"
                      className="input mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700">পূর্ণ ঠিকানা (গ্রাম/এলাকা/উপজেলা)*</label>
                    <textarea
                      rows={2}
                      required
                      value={fullAddress}
                      onChange={(e) => setFullAddress(e.target.value)}
                      placeholder="আপনার ডেলিভারির সম্পূর্ণ ঠিকানা লিখুন"
                      className="input mt-1 text-sm"
                    />
                  </div>
                </div>

                {/* Calculation breakdown */}
                <div className="border-t pt-3 space-y-1.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>পণ্যের মূল্য</span>
                    <span>৳{toBn(Number(effectivePrice) * quantity)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ডেলিভারি চার্জ</span>
                    <span className="text-emerald-600 font-bold">ফ্রি (০ ৳)</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-gray-900 border-t pt-2">
                    <span>সর্বমোট টাকা</span>
                    <span className="text-[#116e2d]">৳{toBn(Number(effectivePrice) * quantity)}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={orderSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#137a34] hover:bg-[#0e5c27] text-white font-extrabold text-lg shadow-xl shadow-green-700/25 transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {orderSubmitting ? 'অর্ডার সাবমিট হচ্ছে...' : 'অর্ডার সম্পন্ন করুন (ক্যাশ অন ডেলিভারি)'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 13. Facebook Share Section */}
        <div className="text-center pt-4">
          <button
            onClick={shareToFacebook}
            className="inline-flex items-center gap-2 py-2.5 px-6 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-sm shadow-md transition-transform hover:scale-105"
          >
            <Share2 className="h-4 w-4" />
            ফেসবুকে শেয়ার করুন (Share on Facebook)
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-gray-400 py-4 border-t">
        © {new Date().getFullYear()} কৃষি সার্ভিস বিডি | সর্বস্বত্ব সংরক্ষিত
      </footer>
    </div>
  );
}
