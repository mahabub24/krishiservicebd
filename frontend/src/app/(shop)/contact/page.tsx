import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SITE } from '@/lib/site';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: 'হোম', href: '/' }, { label: 'যোগাযোগ' }]} />

      <div className="my-6 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900">আমাদের সাথে যোগাযোগ করুন</h1>
        <p className="mt-2 text-gray-600">
          বীজ, সার বা কৃষি যন্ত্রপাতি সম্পর্কিত যেকোনো প্রশ্ন ও সহায়তায় আমাদের টিম প্রস্তুত রয়েছে।
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 mt-8">
        <div className="card p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-krishi-light text-krishi-primary">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">ফোন সহায়তা</h3>
              <p className="text-sm text-gray-500 mt-0.5">সরাসরি কথা বলুন আমাদের প্রতিনিধির সাথে</p>
              <p className="mt-2 font-mono font-semibold text-krishi-dark">{SITE.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-krishi-light text-krishi-primary">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">ইমেইল</h3>
              <p className="text-sm text-gray-500 mt-0.5">যেকোনো প্রশ্ন বা প্রাতিষ্ঠানিক অনুসন্ধান</p>
              <p className="mt-2 font-mono font-semibold text-krishi-dark">{SITE.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-krishi-light text-krishi-primary">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">ঠিকানা</h3>
              <p className="text-sm text-gray-500 mt-0.5">{SITE.address}</p>
            </div>
          </div>
        </div>

        {/* Message Box */}
        <div className="card p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">বার্তা পাঠান</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">আপনার নাম</label>
              <input type="text" placeholder="যেমন: মো: কামরুল হাসান" className="input mt-1" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">মোবাইল নম্বর</label>
              <input type="tel" placeholder="01XXXXXXXXX" className="input mt-1" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">আপনার বার্তা</label>
              <textarea rows={3} placeholder="কী ধরনের পরামর্শ বা সেবা প্রয়োজন..." className="input mt-1" />
            </div>
            <button type="button" className="btn-primary w-full !py-2.5">
              বার্তা প্রেরণ করুন
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
