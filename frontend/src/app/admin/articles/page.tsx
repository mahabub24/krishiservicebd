'use client';

import { useEffect, useState } from 'react';
import { apiFetch, toBn } from '@/lib/api';
import { FileText, Plus, Trash2, Eye, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [titleBn, setTitleBn] = useState('');
  const [categoryBn, setCategoryBn] = useState('চাষাবাদ পদ্ধতি');
  const [excerptBn, setExcerptBn] = useState('');
  const [contentBn, setContentBn] = useState('');
  const [readingTimeMin, setReadingTimeMin] = useState(5);

  const fetchArticles = () => {
    setLoading(true);
    apiFetch<any[]>('/admin/articles')
      .then((res) => setArticles(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/admin/articles', {
        method: 'POST',
        body: JSON.stringify({
          titleBn,
          categoryBn,
          excerptBn,
          contentBn,
          readingTimeMin: Number(readingTimeMin),
          isPublished: true,
        }),
      });
      setShowModal(false);
      setTitleBn('');
      setExcerptBn('');
      setContentBn('');
      fetchArticles();
    } catch (err: any) {
      alert(err.message || 'নিবন্ধ প্রকাশ ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই নিবন্ধটি মুছে ফেলতে চান?')) return;
    try {
      await apiFetch(`/admin/articles/${id}`, { method: 'DELETE' });
      fetchArticles();
    } catch (err: any) {
      alert(err.message || 'মুছে ফেলা যায়নি');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">কৃষি পরামর্শ ও নিবন্ধ</h1>
          <p className="text-sm text-gray-500">চাষীদের জন্য দিকনির্দেশনামূলক তথ্য ও ব্লগের ব্যবস্থাপনা</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 !py-2 text-sm"
        >
          <Plus className="h-4 w-4" /> নতুন নিবন্ধ লিখুন
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">শিরোনাম</th>
                <th className="px-6 py-4">বিভাগ</th>
                <th className="px-6 py-4">পড়ার সময়</th>
                <th className="px-6 py-4">স্ট্যাটাস</th>
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
              ) : articles.length > 0 ? (
                articles.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-krishi-primary" />
                        <span>{a.titleBn}</span>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">/pages/{a.slug}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-700">
                      <span className="rounded bg-gray-100 px-2 py-0.5">{a.categoryBn}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {toBn(a.readingTimeMin)} মিনিট
                    </td>
                    <td className="px-6 py-4">
                      {a.isPublished ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-700">
                          <CheckCircle className="h-3 w-3" /> প্রকাশিত
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-600">
                          খসড়া
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(a.id)}
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
                    কোনো নিবন্ধ পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900">নতুন কৃষি নিবন্ধ যোগ করুন</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700">শিরোনাম (বাংলা)*</label>
                <input
                  type="text"
                  required
                  value={titleBn}
                  onChange={(e) => setTitleBn(e.target.value)}
                  placeholder="যেমন: শীতকালীন টমেটো চাষ ও সার ব্যবস্থাপনা"
                  className="input mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">বিভাগ*</label>
                  <input
                    type="text"
                    required
                    value={categoryBn}
                    onChange={(e) => setCategoryBn(e.target.value)}
                    placeholder="যেমন: সবজি চাষ / রোগবালাই"
                    className="input mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700">পড়ার সময় (মিনিট)</label>
                  <input
                    type="number"
                    min="1"
                    value={readingTimeMin}
                    onChange={(e) => setReadingTimeMin(Number(e.target.value))}
                    className="input mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700">সংক্ষিপ্ত সারাংশ (Excerpt)*</label>
                <textarea
                  required
                  rows={2}
                  value={excerptBn}
                  onChange={(e) => setExcerptBn(e.target.value)}
                  placeholder="নিবন্ধের প্রধান সারসংক্ষেপ..."
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700">সম্পূর্ণ বিষয়বস্তু (Content)*</label>
                <textarea
                  required
                  rows={6}
                  value={contentBn}
                  onChange={(e) => setContentBn(e.target.value)}
                  placeholder="বিস্তারিত চাষাবাদ নির্দেশিকা..."
                  className="input mt-1 font-sans"
                />
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
                  {saving ? 'সংরক্ষণ হচ্ছে...' : 'প্রকাশ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
