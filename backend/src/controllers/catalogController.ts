import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/error';
import { asyncHandler, ok } from '../utils/http';
import { priceCart } from '../services/orders';

const cardInclude = {
  category: { select: { id: true, nameBn: true, slug: true } },
  brand: { select: { id: true, nameBn: true, slug: true } },
  images: { orderBy: [{ isPrimary: 'desc' as const }, { order: 'asc' as const }], take: 2 },
};

/** A product is publicly visible only when it is active and has a valid price. */
const visible: Prisma.ProductWhereInput = { isActive: true, price: { gt: 0 } };

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as unknown as {
    category?: string; search?: string; brand?: string; minPrice?: number; maxPrice?: number;
    inStock?: boolean; sortBy: 'newest' | 'price_asc' | 'price_desc' | 'popular'; page: number; limit: number;
  };

  const and: Prisma.ProductWhereInput[] = [visible];
  if (q.category) and.push({ category: { OR: [{ slug: q.category }, { parent: { slug: q.category } }] } });
  if (q.brand) and.push({ brand: { slug: q.brand } });
  if (q.search) {
    and.push({
      OR: [
        { nameBn: { contains: q.search, mode: 'insensitive' } },
        { nameEn: { contains: q.search, mode: 'insensitive' } },
        { sku: { contains: q.search, mode: 'insensitive' } },
        { shortDescBn: { contains: q.search, mode: 'insensitive' } },
      ],
    });
  }
  if (q.minPrice !== undefined || q.maxPrice !== undefined) {
    and.push({ price: { ...(q.minPrice !== undefined ? { gte: q.minPrice } : {}), ...(q.maxPrice !== undefined ? { lte: q.maxPrice } : {}) } });
  }
  if (q.inStock) and.push({ stockQuantity: { gt: 0 } });
  const where: Prisma.ProductWhereInput = { AND: and };

  const orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] =
    q.sortBy === 'price_asc' ? { price: 'asc' }
    : q.sortBy === 'price_desc' ? { price: 'desc' }
    : q.sortBy === 'popular' ? [{ orderItems: { _count: 'desc' } }, { createdAt: 'desc' }]
    : { createdAt: 'desc' };

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip: (q.page - 1) * q.limit, take: q.limit, include: cardInclude }),
    prisma.product.count({ where }),
  ]);
  ok(res, {
    products,
    pagination: { page: q.page, limit: q.limit, totalCount, totalPages: Math.max(1, Math.ceil(totalCount / q.limit)) },
  });
});

export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await prisma.product.findFirst({
    where: { slug: req.params.slug, ...visible },
    include: { category: { include: { parent: true } }, brand: true, images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] } },
  });
  if (!product) throw new AppError('পণ্যটি খুঁজে পাওয়া যায়নি বা বর্তমানে অনুপলব্ধ', 404);
  const relatedProducts = await prisma.product.findMany({
    where: { ...visible, categoryId: product.categoryId, id: { not: product.id } },
    take: 4,
    include: cardInclude,
  });
  ok(res, { product, relatedProducts });
});

export const getProductsByIds = asyncHandler(async (req: Request, res: Response) => {
  const ids = String(req.query.ids || '').split(',').filter((s) => /^[0-9a-f-]{36}$/i.test(s)).slice(0, 12);
  const products = await prisma.product.findMany({ where: { ...visible, id: { in: ids } }, include: cardInclude });
  ok(res, products);
});

export const getFeaturedProducts = asyncHandler(async (_req: Request, res: Response) => {
  const [featured, newArrivals, offerCandidates, bestSellers] = await Promise.all([
    prisma.product.findMany({ where: { ...visible, isFeatured: true }, take: 8, orderBy: { updatedAt: 'desc' }, include: cardInclude }),
    prisma.product.findMany({ where: visible, orderBy: { createdAt: 'desc' }, take: 8, include: cardInclude }),
    prisma.product.findMany({ where: { ...visible, discountPrice: { not: null } }, take: 24, include: cardInclude }),
    // ranked by real order volume; empty until genuine orders exist
    prisma.product.findMany({
      where: { ...visible, orderItems: { some: {} } },
      orderBy: { orderItems: { _count: 'desc' } },
      take: 8,
      include: cardInclude,
    }),
  ]);
  const offers = offerCandidates.filter((p) => p.discountPrice !== null && p.discountPrice.lt(p.price)).slice(0, 8);
  ok(res, { featured, newArrivals, offers, bestSellers });
});

export const getBrands = asyncHandler(async (_req: Request, res: Response) => {
  ok(res, await prisma.brand.findMany({ orderBy: { nameBn: 'asc' } }));
});

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { orderIndex: 'asc' },
    include: {
      children: { where: { isActive: true }, orderBy: { orderIndex: 'asc' } },
      _count: { select: { products: { where: visible } } },
    },
  });
  ok(res, categories);
});

export const getCategoryBySlug = asyncHandler(async (req: Request, res: Response) => {
  const category = await prisma.category.findFirst({
    where: { slug: req.params.slug, isActive: true },
    include: { children: { where: { isActive: true }, orderBy: { orderIndex: 'asc' } }, parent: true },
  });
  if (!category) throw new AppError('ক্যাটাগরি খুঁজে পাওয়া যায়নি', 404);
  ok(res, category);
});

/** Server-side quote: authoritative prices, stock issues, delivery, coupon discount and payable total. */
export const quoteCart = asyncHandler(async (req: Request, res: Response) => {
  const { items, district, couponCode } = req.body;
  const priced = await priceCart(items, district, couponCode);
  ok(res, {
    lines: priced.lines.map((l) => ({
      productId: l.product.id,
      slug: l.product.slug,
      name: l.product.nameBn,
      unitSize: l.product.unitSize,
      image: l.product.images[0]?.imageUrl ?? null,
      unitPrice: l.unitPrice,
      quantity: l.quantity,
      stock: l.product.stockQuantity,
      lineTotal: Math.round(l.unitPrice * l.quantity * 100) / 100,
    })),
    totals: priced.totals,
    issues: priced.issues,
    couponError: priced.couponError ?? null,
    couponApplied: priced.coupon?.code ?? null,
  });
});
