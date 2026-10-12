'use client';

import { useEffect, useState } from 'react';
import { apiFetch, formatTaka, toBn } from '@/lib/api';
import {
  Globe,
  Plus,
  Trash2,
  ExternalLink,
  Edit,
  Download,
  Share2,
  CheckCircle,
  Copy,
  Package,
} from 'lucide-react';
import Link from 'next/link';

interface LandingPageItem {
  id: string;
  title: string;
  slug: string;
  headline: string;
  subHeadline?: string;
  badgeText?: string;
  deliveryNote?: string;
  features: string[];
  galleryImages: string[];
  reviewImages: string[];
  guaranteeText?: string;
  hotlinePhone?: string;
  whatsappNumber?: string;
  customPrice?: number;
  customDiscount?: number;
  isActive: boolean;
  createdAt: string;
  product?: {
    id: string;
    nameBn: string;
    price: number;
    discountPrice?: number;
    images?: { imageUrl: string }[];
  };
}

export default function AdminLandingPagesPage() {
  const [pages, setPages] = useState<LandingPageItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [headline, setHeadline] = useState('');
  const [subHeadline, setSubHeadline] = useState('');
  const [badgeText, setBadgeText] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('ডেলিভারি চার্জ ফ্রি');
  const [featuresText, setFeaturesText] = useState(
    'উচ্চ ফলনশীল জাত\nযে কোনো মাটিতে ভালো ফলন দেবে\nরোগবালাই প্রতিরোধ ক্ষমতা বেশি\nসহজে রোপণ ও পরিচর্যাযোগ্য'
  );
  const [galleryImagesText, setGalleryImagesText] = useState('');
  const [reviewImagesText, setReviewImagesText] = useState('');
  const [guaranteeText, setGuaranteeText] = useState(
    '১০০% অরিজিনাল ও পরীক্ষিত বীজের নিশ্চয়তা। পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন।'
  );
  const [hotlinePhone, setHotlinePhone] = useState('01700000000');
  const [whatsappNumber, setWhatsappNumber] = useState('01700000000');
  const [customPrice, setCustomPrice] = useState('');
  const [customDiscount, setCustomDiscount] = useState('');

  const fetchPages = () => {
    setLoading(true);
    apiFetch<LandingPageItem[]>('/admin/landing-pages')
      .then((res) => setPages(res || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchProducts = () => {
    apiFetch<{ products: any[] }>('/admin/products?limit=100')
      .then((res) => setProducts(res.products || []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchPages();
    fetchProducts();
  }, []);

  // When a product is imported / selected, automatically populate the template!
  const handleImportProduct = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;

    setTitle(`${prod.nameBn} - স্পেশাল অফার ল্যান্ডিং পেজ`);
    setSlug(`offer-${prod.slug}`);
    setHeadline(`উচ্চ ফলনশীল ${prod.nameBn}\nএবার ফলন হবে দ্বিগুণ`);
    setSubHeadline(`কৃষিতে লাভবান হতে সেরা মানের ${prod.nameBn} সংগ্রহ করুন`);
    
    const effPrice = prod.discountPrice || prod.price;
    setBadgeText(`১০০+ প্রিমিয়াম ${prod.nameBn} মাত্র ${toBn(effPrice)} টাকায়`);
    setCustomPrice(prod.price ? prod.price.toString() : '');
    setCustomDiscount(prod.discountPrice ? prod.discountPrice.toString() : '');

    if (prod.images && prod.images.length > 0) {
      setGalleryImagesText(prod.images.map((im: any) => im.imageUrl).join('\n'));
    }

    if (prod.usageGuideBn || prod.safetyNoticeBn) {
      const f = [];
      if (prod.shortDescBn) f.push(prod.shortDescBn);
      if (prod.usageGuideBn) f.push(`প্রয়োগবিধি: ${prod.usageGuideBn}`);
      if (prod.safetyNoticeBn) f.push(`নিরাপত্তা: ${prod.safetyNoticeBn}`);
      if (f.length > 0) setFeaturesText(f.join('\n'));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const features = featuresText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const galleryImages = galleryImagesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const reviewImages = reviewImagesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      await apiFetch('/admin/landing-pages', {
        method: 'POST',
        body: JSON.stringify({
          title,
          slug: slug || undefined,
          productId: selectedProductId || undefined,
          headline,
          subHeadline: subHeadline || undefined,
          badgeText: badgeText || undefined,
          deliveryNote: deliveryNote || undefined,
          features,
          galleryImages,
          reviewImages,
          guaranteeText: guaranteeText || undefined,
          hotlinePhone: hotlinePhone || undefined,
          whatsappNumber: whatsappNumber || undefined,
          customPrice: customPrice ? Number(customPrice) : undefined,
          customDiscount: customDiscount ? Number(customDiscount) : undefined,
          isActive: true,
        }),
      });

      setShowModal(false);
      fetchPages();
    } catch (err: any) {
      alert(err.message || 'ল্যান্ডিং পেজ তৈরি ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই ল্যান্ডিং পেজটি মুছে ফেলতে চান?')) return;
    try {
      await apiFetch(`/admin/landing-pages/${id}`, { method: 'DELETE' });
      fetchPages();
    } catch (err: any) {
      alert(err.message || 'মুছে ফেলা যায়নি');
    }
  };

  const copyUrl = (pageSlug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const fullUrl = `${origin}/landing/${pageSlug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(pageSlug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ল্যান্ডিং পেজ ব্যবস্থাপনা</h1>
          <p className="text-sm text-gray-500">
            হাই-কনভার্টিং সিঙ্গেল প্রোডাক্ট ল্যান্ডিং পেজ তৈরি ও ফেসবুক ক্যাম্পেইন পরিচালনা করুন
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedProductId('');
            setTitle('');
            setSlug('');
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2 !py-2 text-sm"
        >
          <Plus className="h-4 w-4" /> নতুন ল্যান্ডিং পেজ যোগ করুন
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">ল্যান্ডিং পেজ শিরোনাম</th>
                <th className="px-6 py-4">সংযুক্ত পণ্য</th>
                <th className="px-6 py-4">স্লাগ ও লাইভ লিংক</th>
                <th className="px-6 py-4">তৈরির তারিখ</th>
                <th className="px-6 py-4 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : pages.length > 0 ? (
                pages.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-krishi-primary" />
                        <span>{p.title}</span>
                      </div>
                      <div className="text-xs text-gray-400 font-sans mt-0.5 line-clamp-1">
                        {p.headline}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {p.product ? (
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-800">{p.product.nameBn}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">কাস্টম পণ্য</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700">
                          /landing/{p.slug}
                        </span>
                        <button
                          onClick={() => copyUrl(p.slug)}
                          className="text-gray-400 hover:text-krishi-primary"
                          title="লিংক কপি করুন"
                        >
                          {copiedSlug === p.slug ? (
                            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <Link
                          href={`/landing/${p.slug}`}
                          target="_blank"
                          className="text-gray-400 hover:text-blue-600"
                          title="নতুন ট্যাবে দেখুন"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="rounded p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    এখনও কোনো ল্যান্ডিং পেজ তৈরি করা হয়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Creating Landing Page with Auto Template */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  নতুন ল্যান্ডিং পেজ যোগ করুন (High-Converting Template)
                </h2>
                <p className="text-xs text-gray-500">
                  পণ্য নির্বাচন (Import) করলেই অটোমেটিক পূর্ণাঙ্গ টেমপ্লেট ও টেক্সট রেডি হয়ে যাবে
                </p>
              </div>
            </div>

            {/* Product Import Box */}
            <div className="rounded-xl bg-krishi-light p-4 border border-krishi-primary/30 space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-krishi-dark">
                <Download className="h-4 w-4 text-krishi-primary" />
                আপনার প্রোডাক্ট থেকে ইমপোর্ট করুন (Import Product):
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleImportProduct(e.target.value)}
                className="input bg-white font-medium"
              >
                <option value="">-- স্টোরের পণ্য নির্বাচন করুন (অটো সেট হবে) --</option>
                {products.map((pr) => (
                  <option key={pr.id} value={pr.id}>
                    {pr.nameBn} — {formatTaka(pr.discountPrice || pr.price)}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">পেজের অভ্যন্তরীণ শিরোনাম*</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="যেমন: স্ট্রবেরি বীজ অফার পেজ"
                    className="input mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700">ইউআরএল স্লাগ (URL Slug)*</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="যেমন: strawberry-seed-offer"
                    className="input mt-1 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">মূল আকর্ষণীয় শিরোনাম (Headline)*</label>
                <textarea
                  rows={2}
                  required
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="যেমন: উচ্চ ফলনশীল হাইব্রিড বীজ এবার ফলন হবে দ্বিগুণ"
                  className="input mt-1 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">উপ-শিরোনাম (Sub-headline)</label>
                <input
                  type="text"
                  value={subHeadline}
                  onChange={(e) => setSubHeadline(e.target.value)}
                  placeholder="যেমন: সঠিক সময়ে বীজ বপন করুন এবং সর্বোচ্চ ফলন নিশ্চিত করুন"
                  className="input mt-1"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">অফার ব্যাজ টেক্সট</label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="যেমন: ১০০+ প্রিমিয়াম স্ট্রবেরি বীজ মাত্র ৩৫০ টাকায়"
                    className="input mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700">ডেলিভারি অফার নোট</label>
                  <input
                    type="text"
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="যেমন: ডেলিভারি চার্জ ফ্রি"
                    className="input mt-1"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">নিয়মিত মূল্য (৳)</label>
                  <input
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="যেমন: 500"
                    className="input mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700">অফার মূল্য (৳)</label>
                  <input
                    type="number"
                    value={customDiscount}
                    onChange={(e) => setCustomDiscount(e.target.value)}
                    placeholder="যেমন: 350"
                    className="input mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  বীজ/পণ্যের প্রধান বৈশিষ্ট্যসমূহ (প্রতি লাইনে একটি করে লিখুন)
                </label>
                <textarea
                  rows={4}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  className="input mt-1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  পণ্যের গ্যালারি ছবি (প্রতি লাইনে ১টি ইমেজ URL)
                </label>
                <textarea
                  rows={2}
                  value={galleryImagesText}
                  onChange={(e) => setGalleryImagesText(e.target.value)}
                  placeholder="https://... অথবা /demo/cat-seeds.png"
                  className="input mt-1 text-xs font-mono"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">হটলাইন কল নম্বর</label>
                  <input
                    type="text"
                    value={hotlinePhone}
                    onChange={(e) => setHotlinePhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="input mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700">হোয়াটসঅ্যাপ নম্বর</label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="input mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary !py-2 text-sm"
                >
                  {saving ? 'তৈরি হচ্ছে...' : 'ল্যান্ডিং পেজ প্রকাশ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
