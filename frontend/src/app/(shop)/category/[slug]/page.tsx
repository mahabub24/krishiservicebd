import { Metadata } from 'next';
import { apiFetch, Product, Category } from '@/lib/api';
import { ProductCard } from '@/components/product/ProductCard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await apiFetch<Category>(`/categories/${slug}`);
    return {
      title: `${category.nameBn} | কৃষি সার্ভিস বিডি`,
      description: category.description || `${category.nameBn} - মানসম্মত কৃষি পণ্য অনলাইনে অর্ডার করুন।`,
    };
  } catch {
    return { title: 'ক্যাটাগরি | কৃষি সার্ভিস বিডি' };
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  let category: Category | null = null;
  let products: Product[] = [];

  try {
    const [catRes, prodRes] = await Promise.all([
      apiFetch<Category>(`/categories/${slug}`),
      apiFetch<{ products: Product[] }>(`/products?category=${slug}`),
    ]);
    category = catRes;
    products = prodRes.products;
  } catch (err) {
    notFound();
  }

  return (
    <div className="container-x py-8">
      <Breadcrumbs
        items={[
          { label: 'হোম', href: '/' },
          { label: 'সকল পণ্য', href: '/products' },
          { label: category.nameBn },
        ]}
      />

      <div className="my-6 rounded-2xl bg-krishi-light p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-krishi-dark">{category.nameBn}</h1>
        {category.description && (
          <p className="mt-2 text-gray-600 max-w-2xl">{category.description}</p>
        )}
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <p className="text-lg font-medium text-gray-600">এই ক্যাটাগরিতে বর্তমানে কোনো পণ্য নেই</p>
        </div>
      )}
    </div>
  );
}
