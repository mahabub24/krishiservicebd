import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/error';
import { asyncHandler, audit, ok } from '../utils/http';
import { uniqueSlug } from '../utils/slug';
import { parseCsv, rowsToObjects, toCsv } from '../utils/csv';

const imgData = (images?: { imageUrl: string; altText?: string }[]) =>
  (images ?? []).map((im, i) => ({ imageUrl: im.imageUrl, altText: im.altText ?? null, isPrimary: i === 0, order: i }));

const autoSku = () => `KSB-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;

// ---------------- Products ----------------
export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as unknown as { search?: string; status?: 'active' | 'inactive'; page: number; limit: number };
  const where: Prisma.ProductWhereInput = {
    ...(q.status ? { isActive: q.status === 'active' } : {}),
    ...(q.search ? { OR: [{ nameBn: { contains: q.search, mode: 'insensitive' } }, { nameEn: { contains: q.search, mode: 'insensitive' } }, { sku: { contains: q.search, mode: 'insensitive' } }] } : {}),
  };
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where, orderBy: { createdAt: 'desc' }, skip: (q.page - 1) * q.limit, take: q.limit,
      include: { category: { select: { nameBn: true } }, images: { where: { isPrimary: true }, take: 1 } },
    }),
    prisma.product.count({ where }),
  ]);
  ok(res, { products, pagination: { page: q.page, limit: q.limit, totalCount: total, totalPages: Math.max(1, Math.ceil(total / q.limit)) } });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const p = await prisma.product.findUnique({ where: { id: req.params.id }, include: { images: { orderBy: { order: 'asc' } }, category: true, brand: true } });
  if (!p) throw new AppError('পণ্য পাওয়া যায়নি', 404);
  ok(res, p);
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const { images, slug, sku, specifications, ...rest } = req.body;
  const finalSlug = await uniqueSlug('product', slug || rest.nameEn || sku || autoSku());
  const product = await prisma.product.create({
    data: {
      ...rest,
      slug: finalSlug,
      sku: sku || autoSku(),
      specifications: specifications ?? undefined,
      images: { create: imgData(images) },
    },
    include: { images: true },
  });
  await audit(req.user!.userId, 'PRODUCT_CREATE', 'Product', product.id);
  ok(res, product, 'পণ্য সংরক্ষিত হয়েছে', 201);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { images, slug, specifications, ...rest } = req.body;
  const id = req.params.id;
  const existing = await prisma.product.findUnique({ where: { id }, select: { price: true, discountPrice: true } });
  if (!existing) throw new AppError('পণ্য পাওয়া যায়নি', 404);

  // Cross-field check using stored values when only one of the two is being updated
  const price = rest.price ?? Number(existing.price);
  const dp = rest.discountPrice === undefined ? (existing.discountPrice ? Number(existing.discountPrice) : null) : rest.discountPrice;
  if (dp !== null && dp >= price) throw new AppError('ছাড়মূল্য মূল মূল্যের কম হতে হবে', 400);

  const product = await prisma.$transaction(async (tx) => {
    if (images) {
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productImage.createMany({ data: imgData(images).map((i) => ({ ...i, productId: id })) });
    }
    return tx.product.update({
      where: { id },
      data: {
        ...rest,
        ...(slug ? { slug: await uniqueSlug('product', slug, id) } : {}),
        ...(specifications !== undefined ? { specifications } : {}),
      },
      include: { images: true },
    });
  });
  await audit(req.user!.userId, 'PRODUCT_UPDATE', 'Product', id, { fields: Object.keys(req.body) });
  ok(res, product, 'পণ্য আপডেট হয়েছে');
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const used = await prisma.orderItem.count({ where: { productId: id } });
  if (used > 0) {
    // keep order history intact: unpublish instead of deleting
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    await audit(req.user!.userId, 'PRODUCT_UNPUBLISH', 'Product', id);
    return ok(res, { archived: true }, 'এই পণ্যের অর্ডার আছে, তাই মুছে না ফেলে নিষ্ক্রিয় করা হয়েছে');
  }
  await prisma.product.delete({ where: { id } });
  await audit(req.user!.userId, 'PRODUCT_DELETE', 'Product', id);
  ok(res, { archived: false }, 'পণ্য মুছে ফেলা হয়েছে');
});

const CSV_HEADERS = ['sku', 'slug', 'nameBn', 'nameEn', 'categorySlug', 'brandSlug', 'shortDescBn', 'fullDescBn', 'price', 'discountPrice', 'stockQuantity', 'unitSize', 'manufacturer', 'isActive', 'isFeatured'];

export const exportProductsCsv = asyncHandler(async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany({ include: { category: true, brand: true }, orderBy: { createdAt: 'desc' } });
  const csv = toCsv(CSV_HEADERS, products.map((p) => [
    p.sku, p.slug, p.nameBn, p.nameEn, p.category.slug, p.brand?.slug, p.shortDescBn, p.fullDescBn,
    p.price.toString(), p.discountPrice?.toString(), p.stockQuantity, p.unitSize, p.manufacturer, p.isActive, p.isFeatured,
  ]));
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
  res.send(csv);
});

export const importProductsCsv = asyncHandler(async (req: Request, res: Response) => {
  const objs = rowsToObjects(parseCsv(req.body.csv));
  if (!objs.length) throw new AppError('CSV ফাইলে কোনো ডেটা পাওয়া যায়নি', 400);
  if (objs.length > 1000) throw new AppError('একবারে সর্বোচ্চ ১০০০টি পণ্য ইম্পোর্ট করা যাবে', 400);

  const cats = new Map((await prisma.category.findMany({ select: { id: true, slug: true } })).map((c) => [c.slug, c.id]));
  const brands = new Map((await prisma.brand.findMany({ select: { id: true, slug: true } })).map((b) => [b.slug, b.id]));
  const results = { created: 0, updated: 0, errors: [] as { row: number; message: string }[] };

  for (const [i, r] of objs.entries()) {
    const rowNo = i + 2;
    try {
      const categoryId = cats.get(r.categorySlug);
      const price = Number(r.price);
      const discount = r.discountPrice ? Number(r.discountPrice) : null;
      const stock = Number(r.stockQuantity);
      if (!r.sku || !r.nameBn || !r.shortDescBn || !r.fullDescBn || !r.unitSize) throw new Error('আবশ্যক কলাম খালি');
      if (!categoryId) throw new Error(`ক্যাটাগরি স্লাগ "${r.categorySlug}" পাওয়া যায়নি`);
      if (!(price > 0)) throw new Error('মূল্য সঠিক নয়');
      if (discount !== null && !(discount > 0 && discount < price)) throw new Error('ছাড়মূল্য সঠিক নয়');
      if (!Number.isInteger(stock) || stock < 0) throw new Error('স্টক সঠিক নয়');
      const data = {
        nameBn: r.nameBn, nameEn: r.nameEn || null, categoryId, brandId: r.brandSlug ? brands.get(r.brandSlug) ?? null : null,
        shortDescBn: r.shortDescBn, fullDescBn: r.fullDescBn, price, discountPrice: discount, stockQuantity: stock,
        unitSize: r.unitSize, manufacturer: r.manufacturer || null,
        isActive: r.isActive ? r.isActive.toLowerCase() === 'true' : true, isFeatured: r.isFeatured?.toLowerCase() === 'true',
      };
      const existing = await prisma.product.findUnique({ where: { sku: r.sku }, select: { id: true } });
      if (existing) { await prisma.product.update({ where: { id: existing.id }, data }); results.updated++; }
      else {
        await prisma.product.create({ data: { ...data, sku: r.sku, slug: await uniqueSlug('product', r.slug || r.nameEn || r.sku) } });
        results.created++;
      }
    } catch (e) {
      results.errors.push({ row: rowNo, message: (e as Error).message });
    }
  }
  await audit(req.user!.userId, 'PRODUCT_IMPORT', 'Product', undefined, { created: results.created, updated: results.updated, errors: results.errors.length });
  ok(res, results, 'ইম্পোর্ট সম্পন্ন হয়েছে');
});

// ---------------- Categories ----------------
export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  ok(res, await prisma.category.findMany({ orderBy: [{ orderIndex: 'asc' }, { nameBn: 'asc' }], include: { _count: { select: { products: true, children: true } } } }));
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { slug, parentId, ...rest } = req.body;
  if (parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parentId } });
    if (!parent) throw new AppError('প্যারেন্ট ক্যাটাগরি পাওয়া যায়নি', 400);
    if (parent.parentId) throw new AppError('শুধু দুই স্তরের (ক্যাটাগরি > সাবক্যাটাগরি) কাঠামো সমর্থিত', 400);
  }
  const category = await prisma.category.create({
    data: { ...rest, parentId: parentId ?? null, slug: await uniqueSlug('category', slug || rest.nameEn || `cat-${Date.now().toString(36)}`) },
  });
  await audit(req.user!.userId, 'CATEGORY_CREATE', 'Category', category.id);
  ok(res, category, 'ক্যাটাগরি তৈরি হয়েছে', 201);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const { slug, parentId, ...rest } = req.body;
  if (parentId === id) throw new AppError('ক্যাটাগরি নিজের সাবক্যাটাগরি হতে পারে না', 400);
  if (parentId) {
    const hasChildren = await prisma.category.count({ where: { parentId: id } });
    if (hasChildren) throw new AppError('সাবক্যাটাগরি আছে এমন ক্যাটাগরিকে অন্য ক্যাটাগরির অধীনে নেওয়া যাবে না', 400);
  }
  const category = await prisma.category.update({
    where: { id },
    data: { ...rest, ...(parentId !== undefined ? { parentId } : {}), ...(slug ? { slug: await uniqueSlug('category', slug, id) } : {}) },
  });
  await audit(req.user!.userId, 'CATEGORY_UPDATE', 'Category', id);
  ok(res, category, 'ক্যাটাগরি আপডেট হয়েছে');
});

export const reorderCategories = asyncHandler(async (req: Request, res: Response) => {
  await prisma.$transaction((req.body.items as { id: string; orderIndex: number }[]).map((i) => prisma.category.update({ where: { id: i.id }, data: { orderIndex: i.orderIndex } })));
  ok(res, null, 'ক্রম আপডেট হয়েছে');
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const [products, children] = await Promise.all([prisma.product.count({ where: { categoryId: id } }), prisma.category.count({ where: { parentId: id } })]);
  if (products) throw new AppError(`এই ক্যাটাগরিতে ${products}টি পণ্য আছে। আগে পণ্যগুলো সরান বা অন্য ক্যাটাগরিতে নিন।`, 409);
  if (children) throw new AppError('আগে সাবক্যাটাগরিগুলো মুছুন', 409);
  await prisma.category.delete({ where: { id } });
  await audit(req.user!.userId, 'CATEGORY_DELETE', 'Category', id);
  ok(res, null, 'ক্যাটাগরি মুছে ফেলা হয়েছে');
});

// ---------------- Brands ----------------
export const createBrand = asyncHandler(async (req: Request, res: Response) => {
  const { slug, ...rest } = req.body;
  ok(res, await prisma.brand.create({ data: { ...rest, slug: await uniqueSlug('brand', slug || rest.nameEn || `brand-${Date.now().toString(36)}`) } }), 'ব্র্যান্ড তৈরি হয়েছে', 201);
});
export const updateBrand = asyncHandler(async (req: Request, res: Response) => {
  const { slug, ...rest } = req.body;
  ok(res, await prisma.brand.update({ where: { id: req.params.id }, data: { ...rest, ...(slug ? { slug: await uniqueSlug('brand', slug, req.params.id) } : {}) } }), 'ব্র্যান্ড আপডেট হয়েছে');
});
export const deleteBrand = asyncHandler(async (req: Request, res: Response) => {
  const used = await prisma.product.count({ where: { brandId: req.params.id } });
  if (used) throw new AppError(`এই ব্র্যান্ডের ${used}টি পণ্য আছে`, 409);
  await prisma.brand.delete({ where: { id: req.params.id } });
  ok(res, null, 'ব্র্যান্ড মুছে ফেলা হয়েছে');
});
