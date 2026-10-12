import { Request, Response } from 'express';
import multer from 'multer';
import { prisma } from '../config/prisma';
import { config } from '../config';
import { AppError } from '../middleware/error';
import { asyncHandler, audit, ok } from '../utils/http';
import { uniqueSlug } from '../utils/slug';
import { getPublicSettings, upsertSettings, getAllSettings } from '../services/settings';
import { saveImage } from '../services/storage';

// ---------------- Uploads ----------------
export const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: config.storage.maxFileSizeBytes, files: 5 } });

export const uploadImages = asyncHandler(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) ?? [];
  if (!files.length) throw new AppError('কোনো ছবি পাওয়া যায়নি', 400);
  const urls = [];
  for (const f of files) urls.push(await saveImage(f.buffer));
  ok(res, { urls }, 'ছবি আপলোড হয়েছে', 201);
});

// ---------------- Public content ----------------
export const publicSettings = asyncHandler(async (_req: Request, res: Response) => ok(res, await getPublicSettings()));

export const publicBanners = asyncHandler(async (_req: Request, res: Response) => {
  ok(res, await prisma.banner.findMany({ where: { isActive: true }, orderBy: { orderIndex: 'asc' } }));
});

export const publicArticles = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  ok(res, await prisma.article.findMany({ where: { isPublished: true }, orderBy: { createdAt: 'desc' }, take: limit }));
});

export const publicArticle = asyncHandler(async (req: Request, res: Response) => {
  const a = await prisma.article.findFirst({ where: { slug: req.params.slug, isPublished: true } });
  if (!a) throw new AppError('নিবন্ধটি পাওয়া যায়নি', 404);
  ok(res, a);
});

export const subscribeNewsletter = asyncHandler(async (req: Request, res: Response) => {
  await prisma.newsletterSubscriber.upsert({ where: { email: req.body.email }, update: { isActive: true }, create: { email: req.body.email } });
  ok(res, null, 'সাবস্ক্রিপশনের জন্য ধন্যবাদ');
});

// ---------------- Admin: banners ----------------
export const adminBanners = asyncHandler(async (_req: Request, res: Response) => ok(res, await prisma.banner.findMany({ orderBy: { orderIndex: 'asc' } })));
export const createBanner = asyncHandler(async (req: Request, res: Response) => ok(res, await prisma.banner.create({ data: req.body }), 'ব্যানার তৈরি হয়েছে', 201));
export const updateBanner = asyncHandler(async (req: Request, res: Response) => ok(res, await prisma.banner.update({ where: { id: req.params.id }, data: req.body }), 'ব্যানার আপডেট হয়েছে'));
export const deleteBanner = asyncHandler(async (req: Request, res: Response) => { await prisma.banner.delete({ where: { id: req.params.id } }); ok(res, null, 'ব্যানার মুছে ফেলা হয়েছে'); });

// ---------------- Admin: articles ----------------
export const adminArticles = asyncHandler(async (_req: Request, res: Response) => ok(res, await prisma.article.findMany({ orderBy: { createdAt: 'desc' } })));
export const createArticle = asyncHandler(async (req: Request, res: Response) => {
  const { slug, ...rest } = req.body;
  const a = await prisma.article.create({ data: { ...rest, slug: await uniqueSlug('article', slug || `article-${Date.now().toString(36)}`) } });
  await audit(req.user!.userId, 'ARTICLE_CREATE', 'Article', a.id);
  ok(res, a, 'নিবন্ধ প্রকাশিত হয়েছে', 201);
});
export const updateArticle = asyncHandler(async (req: Request, res: Response) => {
  const { slug, ...rest } = req.body;
  ok(res, await prisma.article.update({ where: { id: req.params.id }, data: { ...rest, ...(slug ? { slug: await uniqueSlug('article', slug, req.params.id) } : {}) } }), 'নিবন্ধ আপডেট হয়েছে');
});
export const deleteArticle = asyncHandler(async (req: Request, res: Response) => { await prisma.article.delete({ where: { id: req.params.id } }); ok(res, null, 'নিবন্ধ মুছে ফেলা হয়েছে'); });

// ---------------- Admin: settings ----------------
export const adminGetSettings = asyncHandler(async (_req: Request, res: Response) => ok(res, await getAllSettings()));
export const adminUpdateSettings = asyncHandler(async (req: Request, res: Response) => {
  await upsertSettings(req.body);
  await audit(req.user!.userId, 'SETTINGS_UPDATE', 'StoreSetting', undefined, { keys: Object.keys(req.body) });
  ok(res, await getAllSettings(), 'সেটিংস সংরক্ষিত হয়েছে');
});

// ---------------- Admin: coupons ----------------
export const listCoupons = asyncHandler(async (_req: Request, res: Response) => ok(res, await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })));
export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const exists = await prisma.coupon.findUnique({ where: { code: req.body.code } });
  if (exists) throw new AppError('এই কুপন কোড আগে থেকেই আছে', 409);
  ok(res, await prisma.coupon.create({ data: req.body }), 'কুপন তৈরি হয়েছে', 201);
});
export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => { await prisma.coupon.delete({ where: { id: req.params.id } }); ok(res, null, 'কুপন মুছে ফেলা হয়েছে'); });

// ---------------- Landing Pages ----------------
export const publicLandingPage = asyncHandler(async (req: Request, res: Response) => {
  const page = await prisma.landingPage.findFirst({
    where: { slug: req.params.slug, isActive: true },
    include: { product: { include: { images: true } } },
  });
  if (!page) throw new AppError('ল্যান্ডিং পেজ পাওয়া যায়নি', 404);
  ok(res, page);
});

export const adminLandingPages = asyncHandler(async (_req: Request, res: Response) => {
  ok(res, await prisma.landingPage.findMany({
    orderBy: { createdAt: 'desc' },
    include: { product: { select: { id: true, nameBn: true, price: true, discountPrice: true, images: { take: 1 } } } },
  }));
});

export const createLandingPage = asyncHandler(async (req: Request, res: Response) => {
  const { slug, ...rest } = req.body;
  const finalSlug = await uniqueSlug('landingPage', slug || rest.title || `offer-${Date.now().toString(36)}`);
  const page = await prisma.landingPage.create({
    data: { ...rest, slug: finalSlug },
    include: { product: true },
  });
  await audit(req.user!.userId, 'LANDING_PAGE_CREATE', 'LandingPage', page.id);
  ok(res, page, 'ল্যান্ডিং পেজ তৈরি হয়েছে', 201);
});

export const updateLandingPage = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const { slug, ...rest } = req.body;
  const page = await prisma.landingPage.update({
    where: { id },
    data: { ...rest, ...(slug ? { slug } : {}) },
    include: { product: true },
  });
  await audit(req.user!.userId, 'LANDING_PAGE_UPDATE', 'LandingPage', id);
  ok(res, page, 'ল্যান্ডিং পেজ আপডেট হয়েছে');
});

export const deleteLandingPage = asyncHandler(async (req: Request, res: Response) => {
  await prisma.landingPage.delete({ where: { id: req.params.id } });
  await audit(req.user!.userId, 'LANDING_PAGE_DELETE', 'LandingPage', req.params.id);
  ok(res, null, 'ল্যান্ডিং পেজ মুছে ফেলা হয়েছে');
});
