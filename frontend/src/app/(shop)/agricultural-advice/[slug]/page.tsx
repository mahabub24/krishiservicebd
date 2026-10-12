import { Metadata } from 'next';
import { apiFetch, Article, toBn } from '@/lib/api';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { notFound } from 'next/navigation';
import { Clock, User } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const a = await apiFetch<Article>(`/articles/${slug}`);
    return {
      title: `${a.titleBn} | কৃষি সার্ভিস বিডি`,
      description: a.excerptBn,
    };
  } catch {
    return { title: 'কৃষি নিবন্ধ | কৃষি সার্ভিস বিডি' };
  }
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  let article: Article | null = null;

  try {
    article = await apiFetch<Article>(`/articles/${slug}`);
  } catch {
    notFound();
  }

  return (
    <div className="container-x py-8">
      <Breadcrumbs
        items={[
          { label: 'হোম', href: '/' },
          { label: 'কৃষি পরামর্শ', href: '/agricultural-advice' },
          { label: article.titleBn },
        ]}
      />

      <article className="mx-auto mt-6 max-w-3xl card p-6 sm:p-10">
        <span className="rounded-full bg-krishi-light px-3 py-1 text-xs font-bold text-krishi-primary">
          {article.categoryBn}
        </span>

        <h1 className="mt-3 text-3xl font-extrabold text-gray-900 leading-snug">
          {article.titleBn}
        </h1>

        <div className="mt-4 flex items-center gap-4 border-b border-gray-100 pb-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" /> {article.author || 'কৃষি সার্ভিস বিশেষজ্ঞ'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> আনুমানিক পাঠ্য সময়: {toBn(article.readingTimeMin)} মিনিট
          </span>
        </div>

        <div className="mt-6 text-base text-gray-700 leading-relaxed whitespace-pre-line space-y-4">
          {article.contentBn}
        </div>
      </article>
    </div>
  );
}
