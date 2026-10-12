import { Metadata } from 'next';
import { apiFetch, Product, Category } from '@/lib/api';
import { ProductCard } from '@/components/product/ProductCard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import Link from 'next/link';
import { Filter, SlidersHorizontal } from 'lucide-react';

export const metadata: Metadata = {
  title: 'সকল কৃষি পণ্য | কৃষি সার্ভিস বিডি',
  description: 'মানসম্মত উন্নত বীজ, অনুমোদিত কীটনাশক, সার ও কৃষি যন্ত্রপাতি সহজে কিনুন।',
};

interface SearchParams {
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  sortBy?: string;
  page?: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const category = params.category || '';
  const search = params.search || '';
  const sortBy = params.sortBy || 'newest';
  const page = params.page || '1';

  let productData = { products: [] as Product[], pagination: { totalCount: 0, totalPages: 1, page: 1 } };
  let categories: Category[] = [];

  try {
    const query = new URLSearchParams();
    if (category) query.set('category', category);
    if (search) query.set('search', search);
    if (sortBy) query.set('sortBy', sortBy);
    if (page) query.set('page', page);

    const [prodRes, catRes] = await Promise.all([
      apiFetch<{ products: Product[]; pagination: any }>(`/products?${query.toString()}`),
      apiFetch<Category[]>('/categories'),
    ]);
    productData = prodRes;
    categories = catRes;
  } catch (err) {
    console.error('Failed to load products:', err);
  }

  return (
    <div className="container-x py-8">
      <Breadcrumbs
        items={[
          { label: 'হোম', href: '/' },
          { label: 'সকল পণ্য', href: '/products' },
          ...(category ? [{ label: category }] : []),
        ]}
      />

      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="card p-5">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Filter className="h-5 w-5 text-krishi-primary" />
              <h3 className="font-bold text-gray-900">ক্যাটাগরি ফিল্টার</h3>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/products"
                  className={`block rounded-lg px-3 py-2 font-medium transition ${
                    !category ? 'bg-krishi-primary text-white' : 'text-gray-700 hover:bg-krishi-light'
                  }`}
                >
                  সকল ক্যাটাগরি
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/products?category=${c.slug}`}
                    className={`block rounded-lg px-3 py-2 font-medium transition ${
                      category === c.slug ? 'bg-krishi-primary text-white' : 'text-gray-700 hover:bg-krishi-light'
                    }`}
                  >
                    {c.nameBn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {search ? `"${search}" এর ফলাফল` : 'আমাদের কৃষি পণ্যসমূহ'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                মোট {productData.pagination.totalCount}টি পণ্য পাওয়া গেছে
              </p>
            </div>

            {/* Sorting links */}
            <div className="flex items-center gap-2 text-sm">
              <SlidersHorizontal className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">সাজান:</span>
              <div className="flex gap-1">
                {[
                  { label: 'নতুন', val: 'newest' },
                  { label: 'কম দাম', val: 'price_asc' },
                  { label: 'বেশি দাম', val: 'price_desc' },
                  { label: 'জনপ্রিয়', val: 'popular' },
                ].map((s) => (
                  <Link
                    key={s.val}
                    href={`/products?${new URLSearchParams({
                      ...(category ? { category } : {}),
                      ...(search ? { search } : {}),
                      sortBy: s.val,
                    }).toString()}`}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                      sortBy === s.val ? 'bg-krishi-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {productData.products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
              {productData.products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <p className="text-lg font-medium text-gray-600">কোনো পণ্য পাওয়া যায়নি</p>
              <p className="mt-1 text-sm text-gray-400">ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
