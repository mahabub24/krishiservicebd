import { Metadata } from 'next';
import { apiFetch, Article, toBn } from '@/lib/api';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import Link from 'next/link';
import { Clock, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'কৃষি পরামর্শ ও চাষাবাদ সহায়িকা | কৃষি সার্ভিস বিডি',
  description: 'আধুনিক চাষাবাদ পদ্ধতি, রোগবালাই দমন ও সার ব্যবহারের সঠিক পরামর্শ।',
};

export default async function AgriculturalAdvicePage() {
  let articles: Article[] = [];
  try {
    articles = await apiFetch<Article[]>('/articles');
  } catch (err) {
    console.error('Failed to load articles:', err);
  }

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: 'হোম', href: '/' }, { label: 'কৃষি পরামর্শ' }]} />

      <div className="my-6 rounded-2xl bg-krishi-light p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-krishi-dark flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-krishi-primary" />
          <span>কৃষি পরামর্শ ও নির্দেশিকা</span>
        </h1>
        <p className="mt-2 text-gray-600 max-w-2xl">
          ফসলের রোগবালাই দমন, সার প্রয়োগ ও উচ্চ ফলন পাওয়ার জন্য প্রমাণিত কৌশলসমূহ জেনে নিন।
        </p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <Link
            key={a.id}
            href={`/agricultural-advice/${a.slug}`}
            className="card group flex flex-col p-6 transition hover:shadow-md"
          >
            <span className="w-fit rounded-full bg-krishi-light px-3 py-1 text-xs font-semibold text-krishi-primary">
              {a.categoryBn}
            </span>
            <h2 className="mt-3 text-lg font-bold text-gray-900 group-hover:text-krishi-primary">
              {a.titleBn}
            </h2>
            <p className="mt-2 text-sm text-gray-600 line-clamp-3 leading-relaxed flex-1">
              {a.excerptBn}
            </p>
            <div className="mt-4 border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-gray-400">
              <span>{a.author || 'কৃষি সার্ভিস টিম'}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {toBn(a.readingTimeMin)} মিনিট
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
