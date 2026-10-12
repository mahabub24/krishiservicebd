import { Metadata } from 'next';
import { apiFetch, Product, effectivePrice, formatTaka, hasDiscount, primaryImage, toBn } from '@/lib/api';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ProductCard } from '@/components/product/ProductCard';
import { notFound } from 'next/navigation';
import { ProductBuySection } from '@/components/product/ProductBuySection';
import Image from 'next/image';
import { ShieldAlert, Truck, CheckCircle2 } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data = await apiFetch<{ product: Product }>(`/products/${slug}`);
    const p = data.product;
    return {
      title: `${p.nameBn} | কৃষি সার্ভিস বিডি`,
      description: p.shortDescBn,
      openGraph: {
        title: p.nameBn,
        description: p.shortDescBn,
        images: p.images.map((img) => img.imageUrl),
      },
    };
  } catch {
    return { title: 'পণ্য বিবরণ | কৃষি সার্ভিস বিডি' };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  let product: Product | null = null;
  let relatedProducts: Product[] = [];

  try {
    const res = await apiFetch<{ product: Product; relatedProducts: Product[] }>(`/products/${slug}`);
    product = res.product;
    relatedProducts = res.relatedProducts;
  } catch {
    notFound();
  }

  const outOfStock = product.stockQuantity <= 0;
  const isDiscounted = hasDiscount(product);

  return (
    <div className="container-x py-8">
      <Breadcrumbs
        items={[
          { label: 'হোম', href: '/' },
          { label: 'পণ্যসমূহ', href: '/products' },
          ...(product.category ? [{ label: product.category.nameBn, href: `/category/${product.category.slug}` }] : []),
          { label: product.nameBn },
        ]}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-krishi-light border border-gray-100">
            <Image
              src={primaryImage(product)}
              alt={product.nameBn}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <div key={img.id} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-200">
                  <Image src={img.imageUrl} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="flex flex-col">
          {product.category && (
            <span className="text-sm font-semibold text-krishi-primary">{product.category.nameBn}</span>
          )}
          <h1 className="mt-2 text-3xl font-bold text-gray-900">{product.nameBn}</h1>
          <p className="mt-1 text-sm text-gray-400">SKU: {product.sku}</p>

          <div className="mt-4 flex items-baseline gap-4">
            <span className="text-3xl font-extrabold text-krishi-dark">
              {formatTaka(effectivePrice(product))}
            </span>
            {isDiscounted && (
              <span className="text-xl text-gray-400 line-through">
                {formatTaka(product.price)}
              </span>
            )}
            <span className="rounded-full bg-krishi-light px-3 py-1 text-xs font-semibold text-krishi-primary">
              প্যাকেট/পরিমাপ: {product.unitSize}
            </span>
          </div>

          <p className="mt-4 text-gray-600 leading-relaxed">{product.shortDescBn}</p>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">স্টক অবস্থা:</span>
            {outOfStock ? (
              <span className="rounded-md bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">স্টক শেষ</span>
            ) : (
              <span className="rounded-md bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                স্টকে আছে ({toBn(product.stockQuantity)}টি অবশিষ্ট)
              </span>
            )}
          </div>

          {/* Interactive Client Buy Button & Quantity */}
          <ProductBuySection product={product} />

          {/* Trust points */}
          <div className="mt-8 space-y-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-krishi-primary" />
              <span>সারাদেশে দ্রুত হোম ডেলিভারি ও কুরিয়ার সুবিধা</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-krishi-primary" />
              <span>১০০% আসল ও কোয়ালিটি নিশ্চয়তা</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Detailed specifications */}
      <div className="mt-14 border-t border-gray-100 pt-10">
        <h2 className="text-2xl font-bold text-gray-900">বিস্তারিত বিবরণ</h2>
        <div className="mt-4 prose max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
          {product.fullDescBn}
        </div>

        {/* Safety and Usage Guide */}
        {product.safetyNoticeBn && (
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-lg">
              <ShieldAlert className="h-6 w-6 text-amber-600" />
              <span>সতর্কতা ও নিরাপত্তা নির্দেশিকা</span>
            </div>
            <p className="mt-2 text-amber-800 text-sm leading-relaxed">{product.safetyNoticeBn}</p>
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">সম্পর্কিত অন্যান্য পণ্য</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
