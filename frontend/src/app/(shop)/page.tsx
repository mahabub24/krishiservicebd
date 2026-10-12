import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Headphones, ShieldCheck, Truck, ChevronRight, Clock } from "lucide-react";
import { apiFetch, type Article, type Category, type Product } from "@/lib/api";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NewsletterForm } from "@/components/home/NewsletterForm";

export const dynamic = 'force-dynamic';

interface FeaturedData {
  featured: Product[];
  newArrivals: Product[];
  offers: Product[];
  bestSellers: Product[];
}

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

const HERO_IMG =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=80";

const trust = [
  { icon: BadgeCheck, title: "মানসম্মত পণ্য", text: "যাচাইকৃত উৎস থেকে সংগৃহীত কৃষি উপকরণ" },
  { icon: ShieldCheck, title: "সহজ অর্ডার", text: "কয়েক ধাপেই অর্ডার সম্পন্ন করুন" },
  { icon: Truck, title: "নির্ভরযোগ্য ডেলিভারি", text: "সারাদেশে ডেলিভারির ব্যবস্থা" },
  { icon: Headphones, title: "গ্রাহক সহায়তা", text: "পণ্য ও অর্ডার বিষয়ে সহযোগিতা" },
];

function ProductSection({ title, subtitle, products, href }: { title: string; subtitle?: string; products: Product[]; href?: string }) {
  if (!products?.length) return null;
  return (
    <section className="container-x py-10" aria-labelledby={title}>
      <SectionHeading title={title} subtitle={subtitle} href={href} />
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {products.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [categories, featured, articles] = await Promise.all([
    safe(apiFetch<Category[]>("/categories"), []),
    safe<FeaturedData>(apiFetch<FeaturedData>("/products/featured"), {
      featured: [], newArrivals: [], offers: [], bestSellers: [],
    }),
    safe(apiFetch<Article[]>("/articles"), []),
  ]);

  const topCategories = categories.filter((c) => c.imageUrl).slice(0, 4);
  const apiDown = !categories.length && !featured.featured.length;

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-krishi-dark">
        <Image src={HERO_IMG} alt="সবুজ কৃষিজমি" fill priority sizes="100vw" className="-z-10 object-cover opacity-50" />
        <div className="container-x py-20 sm:py-28 lg:py-36">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">আধুনিক কৃষির বিশ্বস্ত সঙ্গী</h1>
            <p className="mt-4 text-lg text-green-50 sm:text-xl">
              মানসম্মত বীজ, সার ও কৃষি উপকরণ এখন আপনার হাতেই
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn-accent text-base">এখনই কেনাকাটা করুন</Link>
              <Link href="/products" className="inline-flex items-center justify-center rounded-lg border border-white/70 px-5 py-2.5 font-semibold text-white hover:bg-white/10">
                পণ্য দেখুন
              </Link>
            </div>
          </div>
        </div>
      </section>

      {apiDown && (
        <div role="status" className="container-x mt-6">
          <p className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
            পণ্যের তথ্য এই মুহূর্তে লোড করা যাচ্ছে না। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।
          </p>
        </div>
      )}

      {/* Categories */}
      {topCategories.length > 0 && (
        <section className="container-x py-12" aria-label="ক্যাটাগরি">
          <SectionHeading title="পণ্যের ক্যাটাগরি" subtitle="আপনার প্রয়োজন অনুযায়ী বেছে নিন" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {topCategories.map((c) => (
              <Link key={c.id} href={`/category/${c.slug}`} className="group card relative block aspect-[4/5] overflow-hidden">
                <Image src={c.imageUrl!} alt={c.nameBn} fill sizes="(max-width:1024px) 50vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-krishi-dark/90 via-krishi-dark/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <h3 className="text-xl font-bold">{c.nameBn}</h3>
                  <span className="mt-1 inline-flex items-center text-sm text-krishi-accent">
                    দেখুন <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <ProductSection title="জনপ্রিয় পণ্য" products={featured.featured} href="/products" />
      <ProductSection title="নতুন পণ্য" products={featured.newArrivals} href="/products?sortBy=newest" />
      <ProductSection title="বিশেষ অফার" subtitle="ছাড়মূল্যে নির্বাচিত পণ্য" products={featured.offers} href="/products" />
      <ProductSection title="সর্বাধিক বিক্রিত পণ্য" products={featured.bestSellers} href="/products?sortBy=popular" />

      {/* Trust */}
      <section className="mt-10 bg-krishi-light py-12" aria-label="কেন আমাদের বেছে নেবেন">
        <div className="container-x grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-6 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-krishi-light text-krishi-primary">
                <Icon className="h-7 w-7" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-bold text-krishi-dark">{title}</h3>
              <p className="mt-1 text-sm text-gray-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Agricultural advice */}
      <section className="container-x py-14" aria-label="কৃষি পরামর্শ">
        <SectionHeading
          title="কৃষি পরামর্শ"
          subtitle="চাষাবাদের টিপস, মৌসুমি পরামর্শ এবং নিরাপদ ব্যবহারের নির্দেশিকা"
          href="/agricultural-advice"
        />
        {articles.length ? (
          <div className="grid gap-5 md:grid-cols-3">
            {articles.slice(0, 3).map((a) => (
              <Link key={a.id} href={`/agricultural-advice/${a.slug}`} className="card group block overflow-hidden p-5 transition hover:shadow-md">
                <span className="rounded-full bg-krishi-light px-3 py-1 text-xs font-semibold text-krishi-primary">{a.categoryBn}</span>
                <h3 className="mt-3 text-lg font-bold leading-snug text-gray-900 group-hover:text-krishi-primary">{a.titleBn}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-gray-600">{a.excerptBn}</p>
                <p className="mt-4 flex items-center gap-1 text-xs text-gray-500"><Clock className="h-3.5 w-3.5" /> পড়তে সময় লাগবে প্রায় {a.readingTimeMin} মিনিট</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">শীঘ্রই কৃষি পরামর্শ প্রকাশ করা হবে।</p>
        )}
      </section>

      {/* Newsletter */}
      <section className="container-x pb-4">
        <div className="rounded-3xl bg-krishi-primary px-6 py-10 text-center text-white sm:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">নতুন অফার ও কৃষি পরামর্শ পেতে যুক্ত থাকুন</h2>
          <p className="mx-auto mt-2 max-w-xl text-green-50">আপনার ইমেইল দিয়ে সাবস্ক্রাইব করুন। যেকোনো সময় সাবস্ক্রিপশন বাতিল করা যাবে।</p>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
