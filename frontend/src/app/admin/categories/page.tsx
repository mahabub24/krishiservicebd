'use client';

import { useEffect, useState } from 'react';
import { apiFetch, toBn } from '@/lib/api';
import { Plus, Trash2, Edit, Layers, CheckCircle } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string>('');

  const fetchCategories = () => {
    setLoading(true);
    apiFetch<any[]>('/admin/categories')
      .then((res) => setCategories(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/admin/categories', {
        method: 'POST',
        body: JSON.stringify({
          nameBn,
          nameEn: nameEn || undefined,
          slug: slug || undefined,
          description: description || undefined,
          parentId: parentId || undefined,
        }),
      });
      setShowModal(false);
      setNameBn('');
      setNameEn('');
      setSlug('');
      setDescription('');
      setParentId('');
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'ক্যাটাগরি তৈরি ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে ক্যাটাগরিটি মুছে ফেলতে চান?')) return;
    try {
      await apiFetch(`/admin/categories/${id}`, { method: 'DELETE' });
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'মুছে ফেলা যায়নি');
    }
  };

  const rootCategories = categories.filter((c) => !c.parentId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ক্যাটাগরি ব্যবস্থাপনা</h1>
          <p className="text-sm text-gray-500">পণ্য ক্যাটাগরি ও সাব-ক্যাটাগরি তৈরি এবং পরিচালনা করুন</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 !py-2 text-sm"
        >
          <Plus className="h-4 w-4" /> নতুন ক্যাটাগরি
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">ক্যাটাগরির নাম</th>
                <th className="px-6 py-4">ইংরেজি নাম / স্লাগ</th>
                <th className="px-6 py-4">ধরন</th>
                <th className="px-6 py-4">মোট পণ্য</th>
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
              ) : categories.length > 0 ? (
                categories.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-krishi-primary" />
                        <span>{c.nameBn}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {c.nameEn || '-'}{' '}
                      <span className="text-gray-400">({c.slug})</span>
                    </td>
                    <td className="px-6 py-4">
                      {c.parentId ? (
                        <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                          সাব-ক্যাটাগরি
                        </span>
                      ) : (
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          মূল ক্যাটাগরি
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {toBn(c._count?.products || 0)} টি
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="rounded p-1.5 text-gray-400 hover:text-red-600"
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
                    কোনো ক্যাটাগরি পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">নতুন ক্যাটাগরি যোগ করুন</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700">ক্যাটাগরির নাম (বাংলা)*</label>
                <input
                  type="text"
                  required
                  value={nameBn}
                  onChange={(e) => setNameBn(e.target.value)}
                  placeholder="যেমন: উন্নত বীজ"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700">নাম (ইংরেজি)</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="যেমন: Seeds"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700">ইউআরএল স্লাগ (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="যেমন: improved-seeds"
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700">প্যারেন্ট ক্যাটাগরি (যদি সাব-ক্যাটাগরি হয়)</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="input mt-1"
                >
                  <option value="">মূল ক্যাটাগরি হিসেবে রাখুন</option>
                  {rootCategories.map((rc) => (
                    <option key={rc.id} value={rc.id}>
                      {rc.nameBn}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
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
                  {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
