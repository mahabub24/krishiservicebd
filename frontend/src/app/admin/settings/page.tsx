'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Settings, Save, Check } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiFetch<Record<string, string>>('/admin/settings')
      .then((res) => setSettings(res || {}))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await apiFetch('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'সেটিংস আপডেট ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500">সেটিংস লোড হচ্ছে...</p>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">স্টোর সেটিংস</h1>
          <p className="text-sm text-gray-500">দোকানের তথ্য, ডেলিভারি চার্জ, হেল্পলাইন ও সাধারণ কনফিগারেশন</p>
        </div>
      </div>

      {success && (
        <div className="rounded-lg bg-green-50 p-4 border border-green-200 text-green-800 text-sm font-semibold flex items-center gap-2">
          <Check className="h-4 w-4" /> সেটিংস সফলভাবে সংরক্ষিত হয়েছে!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Store Info */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b pb-2">সাধারণ তথ্য</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700">স্টোরের নাম (বাংলা)</label>
              <input
                type="text"
                value={settings.store_name_bn || ''}
                onChange={(e) => handleChange('store_name_bn', e.target.value)}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">স্টোরের নাম (ইংরেজি)</label>
              <input
                type="text"
                value={settings.store_name_en || ''}
                onChange={(e) => handleChange('store_name_en', e.target.value)}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">সহায়তা ফোন নম্বর</label>
              <input
                type="text"
                value={settings.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">ইমেইল ঠিকানা</label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="input mt-1"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700">স্টোর ঠিকানা / অফিস</label>
            <input
              type="text"
              value={settings.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              className="input mt-1"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700">শীর্ষ ব্যানার ঘোষণা (Announcement)</label>
            <input
              type="text"
              value={settings.announcement || ''}
              onChange={(e) => handleChange('announcement', e.target.value)}
              className="input mt-1"
              placeholder="যেমন: সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা চলছে"
            />
          </div>
        </div>

        {/* Delivery & Inventory */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b pb-2">ডেলিভারি ও ইনভেন্টরি চার্জ</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700">ঢাকার ভিতরে ডেলিভারি চার্জ (৳)</label>
              <input
                type="number"
                value={settings.delivery_fee_inside_dhaka || '0'}
                onChange={(e) => handleChange('delivery_fee_inside_dhaka', e.target.value)}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">ঢাকার বাইরে ডেলিভারি চার্জ (৳)</label>
              <input
                type="number"
                value={settings.delivery_fee_outside_dhaka || '0'}
                onChange={(e) => handleChange('delivery_fee_outside_dhaka', e.target.value)}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">কম স্টকের সতর্কবার্তা সীমা</label>
              <input
                type="number"
                value={settings.low_stock_threshold || '5'}
                onChange={(e) => handleChange('low_stock_threshold', e.target.value)}
                className="input mt-1"
              />
            </div>
          </div>
        </div>

        {/* SEO & Meta */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b pb-2">সার্চ ইঞ্জিন (SEO) সেটিংস</h2>
          <div>
            <label className="block text-xs font-semibold text-gray-700">ডিফল্ট মেটা টাইটেল</label>
            <input
              type="text"
              value={settings.seo_title || ''}
              onChange={(e) => handleChange('seo_title', e.target.value)}
              className="input mt-1"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700">ডিফল্ট মেটা ডেসক্রিপশন</label>
            <textarea
              rows={2}
              value={settings.seo_description || ''}
              onChange={(e) => handleChange('seo_description', e.target.value)}
              className="input mt-1"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2 !py-2.5 px-6 text-sm"
          >
            <Save className="h-4 w-4" />
            {saving ? 'সংরক্ষণ করা হচ্ছে...' : 'সেটিংস সংরক্ষণ করুন'}
          </button>
        </div>
      </form>
    </div>
  );
}
