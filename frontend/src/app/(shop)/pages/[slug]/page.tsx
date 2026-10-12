import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

interface Props {
  params: Promise<{ slug: string }>;
}

const policyData: Record<string, { title: string; desc: string }> = {
  'privacy-policy': {
    title: 'প্রাইভেসি পলিসি (গোপনীয়তা নীতি)',
    desc: 'কৃষি সার্ভিস বিডি আপনার ব্যক্তিগত তথ্যের সুরক্ষায় অঙ্গীকারবদ্ধ। অর্ডার প্রক্রিয়া ও পণ্য সরবরাহের প্রয়োজনেই শুধুমাত্র নাম, মোবাইল নম্বর এবং ঠিকানা সংরক্ষণ করা হয়। কোনো প্রকার বাণিজ্যিক উদ্দেশ্যে তৃতীয় পক্ষের কাছে আপনার তথ্য স্থানান্তর করা হয় না।',
  },
  'terms-and-conditions': {
    title: 'শর্তাবলী ও নীতিমালা',
    desc: 'কৃষি সার্ভিস বিডি থেকে কেনাকাটার জন্য প্রযোজ্য নিয়ম ও শর্তাবলী। পণ্যের স্টক ও মূল্য পরিবর্তনযোগ্য। কীটনাশক ও বিশেষ কৃষি উপকরণের ক্ষেত্রে প্রস্তুতকারকের লেবেল ও নির্দেশনা অনুযায়ী ব্যবহার বাধ্যতামূলক।',
  },
  'return-refund-policy': {
    title: 'রিটার্ন ও রিফান্ড পলিসি',
    desc: 'ভুল পণ্য সরবরাহ বা ক্ষতিগ্রস্ত অবস্থায় পণ্য পেলে পণ্য হস্তান্তরের ৪৮ ঘণ্টার মধ্যে আমাদের হেল্পলাইনে অবহিত করুন। যাচাই সাপেক্ষে পণ্য পরিবর্তন বা সমমূল্যের রিফান্ড নিশ্চিত করা হবে।',
  },
};

export default async function PolicyPage({ params }: Props) {
  const { slug } = await params;
  const policy = policyData[slug] || {
    title: 'পলিসি তথ্য',
    desc: 'তথ্য শীঘ্রই হালনাগাদ করা হবে।',
  };

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: 'হোম', href: '/' }, { label: policy.title }]} />
      <div className="mx-auto mt-6 max-w-3xl card p-6 sm:p-10">
        <h1 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-4">
          {policy.title}
        </h1>
        <p className="mt-6 text-gray-700 leading-relaxed leading-8">
          {policy.desc}
        </p>
      </div>
    </div>
  );
}
