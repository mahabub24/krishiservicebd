'use client';

import { useEffect, useState } from 'react';
import { apiFetch, formatTaka, toBn } from '@/lib/api';
import { Plus, Trash2, Edit, CheckCircle, XCircle, Package, X, Image as ImageIcon } from 'lucide-react';

interface ProductFormData {
  nameBn: string;
  nameEn: string;
  categoryId: string;
  price: string;
  discountPrice: string;
  stockQuantity: string;
  unitSize: string;
  shortDescBn: string;
  fullDescBn: string;
  usageGuideBn: string;
  safetyNoticeBn: string;
  manufacturer: string;
  isActive: boolean;
  isFeatured: boolean;
  imageUrl: string;
}

const initialForm: ProductFormData = {
  nameBn: '',
  nameEn: '',
  categoryId: '',
  price: '',
  discountPrice: '',
  stockQuantity: '0',
  unitSize: '১ কেজি',
  shortDescBn: '',
  fullDescBn: '',
  usageGuideBn: '',
  safetyNoticeBn: '',
  manufacturer: '',
  isActive: true,
  isFeatured: false,
  imageUrl: '',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialForm);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchProducts = () => {
    setLoading(true);
    apiFetch<{ products: any[] }>('/admin/products?limit=100')
      .then((res) => setProducts(res.products || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchCategories = () => {
    apiFetch<any[]>('/admin/categories')
      .then((res) => setCategories(res || []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      ...initialForm,
      categoryId: categories.length > 0 ? categories[0].id : '',
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = async (p: any) => {
    setEditingId(p.id);
    setErrorMsg('');
    try {
      // Get full product detail including descriptions
      const detail: any = await apiFetch(`/admin/products/${p.id}`);
      setFormData({
        nameBn: detail.nameBn || '',
        nameEn: detail.nameEn || '',
        categoryId: detail.categoryId || '',
        price: detail.price ? detail.price.toString() : '',
        discountPrice: detail.discountPrice ? detail.discountPrice.toString() : '',
        stockQuantity: detail.stockQuantity !== undefined ? detail.stockQuantity.toString() : '0',
        unitSize: detail.unitSize || '১ কেজি',
        shortDescBn: detail.shortDescBn || '',
        fullDescBn: detail.fullDescBn || '',
        usageGuideBn: detail.usageGuideBn || '',
        safetyNoticeBn: detail.safetyNoticeBn || '',
        manufacturer: detail.manufacturer || '',
        isActive: detail.isActive ?? true,
        isFeatured: detail.isFeatured ?? false,
        imageUrl: detail.images?.[0]?.imageUrl || '',
      });
      setShowModal(true);
    } catch (err: any) {
      alert(err.message || 'পণ্যের বিস্তারিত তথ্য লোড করা যায়নি');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    const priceNum = Number(formData.price);
    const discountNum = formData.discountPrice ? Number(formData.discountPrice) : null;
    const stockNum = Number(formData.stockQuantity);

    if (discountNum !== null && discountNum >= priceNum) {
      setErrorMsg('ছাড়মূল্য অবশ্যই মূল মূল্যের চেয়ে কম হতে হবে');
      setSaving(false);
      return;
    }

    const payload: any = {
      nameBn: formData.nameBn,
      nameEn: formData.nameEn || undefined,
      categoryId: formData.categoryId,
      price: priceNum,
      discountPrice: discountNum,
      stockQuantity: stockNum,
      unitSize: formData.unitSize,
      shortDescBn: formData.shortDescBn,
      fullDescBn: formData.fullDescBn,
      usageGuideBn: formData.usageGuideBn || undefined,
      safetyNoticeBn: formData.safetyNoticeBn || undefined,
      manufacturer: formData.manufacturer || undefined,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      ...(formData.imageUrl
        ? { images: [{ imageUrl: formData.imageUrl, altText: formData.nameBn }] }
        : {}),
    };

    try {
      if (editingId) {
        await apiFetch(`/admin/products/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/admin/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      setErrorMsg(err.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

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
          <p className="text-sm text-gray-500">স্টোরের পণ্য ক্যাটালগ নিয়ন্ত্রণ, নতুন পণ্য যোগ ও এডিট করুন</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="btn-primary flex items-center gap-2 !py-2 text-sm"
        >
          <Plus className="h-4 w-4" /> নতুন পণ্য যোগ করুন
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">পণ্যের নাম ও SKU</th>
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
                      <div className="flex items-center gap-3">
                        {p.images?.[0]?.imageUrl ? (
                          <img
                            src={p.images[0].imageUrl}
                            alt={p.nameBn}
                            className="h-10 w-10 rounded-lg object-cover bg-gray-100 border"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-400 border">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <div>{p.nameBn}</div>
                          <div className="text-xs font-mono text-gray-400">SKU: {p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{p.category?.nameBn || '-'}</td>
                    <td className="px-6 py-4 font-bold text-krishi-dark">
                      {p.discountPrice ? (
                        <div>
                          <span>{formatTaka(p.discountPrice)}</span>
                          <span className="ml-1.5 text-xs text-gray-400 line-through">
                            {formatTaka(p.price)}
                          </span>
                        </div>
                      ) : (
                        formatTaka(p.price)
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-semibold ${
                          p.stockQuantity <= 5 ? 'text-red-600' : 'text-gray-900'
                        }`}
                      >
                        {toBn(p.stockQuantity)} ({p.unitSize || 'একক'})
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
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="rounded p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                          title="সম্পাদনা (Edit) করুন"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="rounded p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50"
                          title="মুছুন / নিষ্ক্রিয় করুন"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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

      {/* Modal for Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'পণ্য সম্পাদনা (Edit Product)' : 'নতুন পণ্য যুক্ত করুন (Add Product)'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">পণ্যের নাম (বাংলা)*</label>
                  <input
                    type="text"
                    required
                    value={formData.nameBn}
                    onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                    placeholder="যেমন: হাইব্রিড ধান বীজ"
                    className="input mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700">ইংরেজি নাম (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="যেমন: Hybrid Paddy Seed"
                    className="input mt-1"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">ক্যাটাগরি*</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="input mt-1"
                  >
                    <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameBn} {c.parentId ? '(সাব-ক্যাটাগরি)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700">প্যাকেটের মাপ / একক*</label>
                  <input
                    type="text"
                    required
                    value={formData.unitSize}
                    onChange={(e) => setFormData({ ...formData, unitSize: e.target.value })}
                    placeholder="যেমন: ১ কেজি প্যাকেট / ১০০ মিলি"
                    className="input mt-1"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">নিয়মিত মূল্য (৳)*</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="যেমন: 500"
                    className="input mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700">ছাড়মূল্য (৳)</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    placeholder="যেমন: 450 (ঐচ্ছিক)"
                    className="input mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700">মজুদ সংখ্যা (স্টক)*</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    placeholder="যেমন: 50"
                    className="input mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">পণ্যের ছবি (Image URL)</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/... অথবা /demo/cat-seeds.png"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">সংক্ষিপ্ত বিবরণ (Short Description)*</label>
                <textarea
                  required
                  rows={2}
                  value={formData.shortDescBn}
                  onChange={(e) => setFormData({ ...formData, shortDescBn: e.target.value })}
                  placeholder="পণ্যের প্রধান বৈশিষ্ট্য সংক্ষেপে লিখুন..."
                  className="input mt-1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">পূর্ণ বিবরণ (Full Description)*</label>
                <textarea
                  required
                  rows={4}
                  value={formData.fullDescBn}
                  onChange={(e) => setFormData({ ...formData, fullDescBn: e.target.value })}
                  placeholder="বিস্তারিত বর্ণনা..."
                  className="input mt-1"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">প্রয়োগবিধি / ব্যবহারের নিয়ম</label>
                  <textarea
                    rows={2}
                    value={formData.usageGuideBn}
                    onChange={(e) => setFormData({ ...formData, usageGuideBn: e.target.value })}
                    placeholder="প্রতি শতাংশে কতটুকু ব্যবহার করবেন..."
                    className="input mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700">সতর্কতা / নিরাপত্তা নির্দেশনা</label>
                  <textarea
                    rows={2}
                    value={formData.safetyNoticeBn}
                    onChange={(e) => setFormData({ ...formData, safetyNoticeBn: e.target.value })}
                    placeholder="শিশুদের নাগালের বাইরে রাখুন..."
                    className="input mt-1"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">প্রস্তুতকারক / কোম্পানি</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="যেমন: ব্র্যাক সীড / এসিআই"
                    className="input mt-1"
                  />
                </div>
                <div className="flex items-center gap-6 pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 rounded text-krishi-primary"
                    />
                    পণ্য সক্রিয় (Active)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="h-4 w-4 rounded text-krishi-primary"
                    />
                    হোমপেজে ফিচার্ড
                  </label>
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
                  {saving ? 'সংরক্ষণ হচ্ছে...' : editingId ? 'আপডেট করুন' : 'পণ্য যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
