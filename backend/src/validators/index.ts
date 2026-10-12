import { z } from 'zod';
import { ORDER_STATUSES } from '../utils/order';
import { PERMISSIONS } from '../middleware/auth';

/** Normalises +8801XXXXXXXXX / 8801XXXXXXXXX / 01XXXXXXXXX → 01XXXXXXXXX */
export const normalizePhone = (v: string) => v.replace(/[\s-]/g, '').replace(/^\+?88/, '');

export const phoneSchema = z
  .string({ required_error: 'মোবাইল নম্বর আবশ্যক' })
  .transform(normalizePhone)
  .refine((v) => /^01[3-9]\d{8}$/.test(v), 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)');

const emptyToUndef = (v: unknown) => (v === '' || v === null ? undefined : v);
export const optionalEmail = z.preprocess(emptyToUndef, z.string().trim().toLowerCase().email('সঠিক ইমেইল দিন').optional());
export const passwordSchema = z
  .string({ required_error: 'পাসওয়ার্ড আবশ্যক' })
  .min(8, 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে')
  .max(72, 'পাসওয়ার্ড সর্বোচ্চ ৭২ অক্ষরের হতে পারে')
  .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), 'পাসওয়ার্ডে অক্ষর ও সংখ্যা উভয়ই থাকতে হবে');

const uuid = z.string().uuid('সঠিক আইডি আবশ্যক');
const text = (min = 1, max = 500, msg = 'এই ঘরটি আবশ্যক') => z.string().trim().min(min, msg).max(max);
const optText = (max = 5000) => z.preprocess(emptyToUndef, z.string().trim().max(max).optional());
const intQuery = (def: number, min: number, max: number) =>
  z.preprocess((v) => (v === undefined || v === '' ? def : Number(v)), z.number().int().min(min).max(max));
const boolQuery = z.preprocess((v) => (v === 'true' || v === true ? true : v === 'false' || v === false ? false : undefined), z.boolean().optional());
const numQuery = z.preprocess((v) => (v === undefined || v === '' ? undefined : Number(v)), z.number().nonnegative().optional());

export const idParams = z.object({ params: z.object({ id: uuid }) });
export const slugParams = z.object({ params: z.object({ slug: z.string().regex(/^[a-z0-9-]+$/i).max(120) }) });

// ---------- Auth ----------
export const registerSchema = z.object({
  body: z.object({ name: text(2, 100, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে'), phone: phoneSchema, email: optionalEmail, password: passwordSchema }),
});
export const loginSchema = z.object({
  body: z.object({ phone: phoneSchema, password: z.string().min(1, 'পাসওয়ার্ড দিন').max(72) }),
});
export const forgotPasswordSchema = z.object({
  body: z.object({ identifier: text(3, 120, 'মোবাইল নম্বর বা ইমেইল দিন') }),
});
export const resetPasswordSchema = z.object({
  body: z.object({ token: z.string().length(64, 'টোকেন সঠিক নয়'), password: passwordSchema }),
});
export const changePasswordSchema = z.object({
  body: z.object({ currentPassword: z.string().min(1).max(72), newPassword: passwordSchema }),
});
export const profileUpdateSchema = z.object({
  body: z.object({ name: text(2, 100).optional(), email: optionalEmail }),
});

export const addressSchema = z.object({
  body: z.object({
    recipient: text(2, 100),
    phone: phoneSchema,
    district: text(2, 60),
    upazila: text(2, 60),
    unionArea: text(2, 100),
    fullAddress: text(5, 300),
    isDefault: z.boolean().optional(),
  }),
});
export const addressUpdateSchema = z.object({ params: z.object({ id: uuid }), body: addressSchema.shape.body.partial() });

// ---------- Catalog ----------
export const productListSchema = z.object({
  query: z.object({
    category: z.string().max(120).optional(),
    search: z.string().trim().max(100).optional(),
    brand: z.string().max(120).optional(),
    minPrice: numQuery,
    maxPrice: numQuery,
    inStock: boolQuery,
    sortBy: z.enum(['newest', 'price_asc', 'price_desc', 'popular']).default('newest'),
    page: intQuery(1, 1, 10000),
    limit: intQuery(12, 1, 48),
  }),
});

export const cartQuoteSchema = z.object({
  body: z.object({
    items: z.array(z.object({ productId: uuid, quantity: z.number().int().min(1).max(999) })).min(1, 'কার্ট খালি').max(100),
    district: z.string().trim().max(60).optional().default(''),
    couponCode: optText(40),
  }),
});
export const cartSyncSchema = z.object({
  body: z.object({
    items: z.array(z.object({ productId: uuid, quantity: z.number().int().min(1).max(999) })).max(100),
  }),
});

// ---------- Checkout ----------
export const checkoutSchema = z.object({
  body: z.object({
    customerName: text(2, 100, 'গ্রাহকের নাম আবশ্যক'),
    customerPhone: phoneSchema,
    customerEmail: optionalEmail,
    district: text(2, 60, 'জেলা আবশ্যক'),
    upazila: text(2, 60, 'উপজেলা আবশ্যক'),
    unionArea: text(2, 100, 'ইউনিয়ন বা এলাকা আবশ্যক'),
    fullAddress: text(5, 300, 'বিস্তারিত ঠিকানা আবশ্যক'),
    orderNotes: optText(500),
    paymentMethod: z.enum(['CASH_ON_DELIVERY', 'BKASH_MANUAL', 'NAGAD_MANUAL']),
    paymentReference: optText(60),
    couponCode: optText(40),
    // Prices/totals sent by a client are intentionally NOT accepted — only ids and quantities.
    items: z.array(z.object({ productId: uuid, quantity: z.number().int().min(1).max(999) })).min(1, 'কার্টে অন্তত একটি পণ্য থাকতে হবে').max(100),
  }).strict(),
});
export const orderLookupSchema = z.object({
  params: z.object({ orderNumber: z.string().regex(/^KSB-\d{6}-[A-Z0-9]{8}$/, 'অর্ডার নম্বর সঠিক নয়') }),
  query: z.object({ phone: phoneSchema.optional() }),
});

// ---------- Admin: products ----------
const specs = z.record(z.string().max(300)).optional();
const productBody = z.object({
  nameBn: text(2, 200, 'পণ্যের বাংলা নাম আবশ্যক'),
  nameEn: optText(200),
  slug: z.preprocess(emptyToUndef, z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'স্লাগে শুধু ইংরেজি ছোট হাতের অক্ষর, সংখ্যা ও হাইফেন').max(120).optional()),
  sku: z.preprocess(emptyToUndef, z.string().trim().min(2).max(60).optional()),
  categoryId: uuid,
  brandId: z.preprocess(emptyToUndef, uuid.optional()),
  shortDescBn: text(5, 400, 'সংক্ষিপ্ত বিবরণ আবশ্যক'),
  fullDescBn: text(10, 10000, 'পূর্ণ বিবরণ আবশ্যক'),
  price: z.number().positive('মূল্য শূন্যের বেশি হতে হবে').max(10_000_000),
  discountPrice: z.number().positive().max(10_000_000).nullable().optional(),
  stockQuantity: z.number().int().min(0).max(10_000_000),
  unitSize: text(1, 60, 'ইউনিট/প্যাকেটের আকার আবশ্যক'),
  specifications: specs,
  usageGuideBn: optText(5000),
  safetyNoticeBn: optText(5000),
  manufacturer: optText(200),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isDemo: z.boolean().default(false),
  seoTitle: optText(120),
  seoDescription: optText(320),
  images: z.array(z.object({ imageUrl: z.string().min(1).max(500), altText: optText(200) })).max(10).optional(),
});
const checkDiscount = (d: { price?: number; discountPrice?: number | null }) =>
  d.discountPrice == null || d.price == null || d.discountPrice < d.price;
export const productCreateSchema = z.object({
  body: productBody.refine(checkDiscount, { message: 'ছাড়মূল্য মূল মূল্যের কম হতে হবে', path: ['discountPrice'] }),
});
export const productUpdateSchema = z.object({
  params: z.object({ id: uuid }),
  body: productBody.partial().refine(checkDiscount, { message: 'ছাড়মূল্য মূল মূল্যের কম হতে হবে', path: ['discountPrice'] }),
});
export const adminProductListSchema = z.object({
  query: z.object({
    search: z.string().trim().max(100).optional(),
    status: z.enum(['active', 'inactive']).optional(),
    page: intQuery(1, 1, 10000),
    limit: intQuery(20, 1, 100),
  }),
});
export const csvImportSchema = z.object({ body: z.object({ csv: z.string().min(10).max(2_000_000) }) });

// ---------- Admin: categories / brands ----------
export const categorySchema = z.object({
  body: z.object({
    nameBn: text(2, 100),
    nameEn: optText(100),
    slug: z.preprocess(emptyToUndef, z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120).optional()),
    description: optText(500),
    imageUrl: optText(500),
    parentId: z.preprocess(emptyToUndef, uuid.optional()),
    orderIndex: z.number().int().min(0).max(10000).optional(),
    isActive: z.boolean().optional(),
  }),
});
export const categoryUpdateSchema = z.object({ params: z.object({ id: uuid }), body: categorySchema.shape.body.partial() });
export const categoryReorderSchema = z.object({
  body: z.object({ items: z.array(z.object({ id: uuid, orderIndex: z.number().int().min(0).max(10000) })).min(1).max(200) }),
});
export const brandSchema = z.object({
  body: z.object({ nameBn: text(2, 100), nameEn: optText(100), slug: z.preprocess(emptyToUndef, z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional()), logoUrl: optText(500) }),
});

// ---------- Admin: orders / customers / inventory ----------
export const adminOrderListSchema = z.object({
  query: z.object({
    status: z.enum(ORDER_STATUSES).optional(),
    paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
    search: z.string().trim().max(100).optional(),
    page: intQuery(1, 1, 10000),
    limit: intQuery(20, 1, 100),
  }),
});
export const orderUpdateSchema = z.object({
  params: z.object({ id: uuid }),
  body: z.object({
    status: z.enum(ORDER_STATUSES).optional(),
    paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
    adminNotes: z.string().trim().max(2000).optional(),
  }).refine((b) => Object.keys(b).length > 0, 'কোনো পরিবর্তন দেওয়া হয়নি'),
});
export const customerStatusSchema = z.object({ params: z.object({ id: uuid }), body: z.object({ isActive: z.boolean() }) });
export const customerListSchema = z.object({
  query: z.object({ search: z.string().trim().max(100).optional(), page: intQuery(1, 1, 10000), limit: intQuery(20, 1, 100) }),
});
export const stockAdjustSchema = z.object({
  body: z.object({
    productId: uuid,
    mode: z.enum(['delta', 'set']),
    quantity: z.number().int().min(-1_000_000).max(10_000_000),
    reason: text(3, 200, 'কারণ উল্লেখ করুন'),
  }),
});
export const staffSchema = z.object({
  body: z.object({
    name: text(2, 100), phone: phoneSchema, email: optionalEmail, password: passwordSchema,
    permissions: z.array(z.enum(PERMISSIONS)).default([]),
  }),
});
export const staffUpdateSchema = z.object({
  params: z.object({ id: uuid }),
  body: z.object({ permissions: z.array(z.enum(PERMISSIONS)).optional(), isActive: z.boolean().optional() }),
});

// ---------- Content ----------
export const bannerSchema = z.object({
  body: z.object({
    titleBn: text(2, 150), subTitleBn: optText(300), imageUrl: text(1, 500), linkUrl: optText(300), badgeBn: optText(60),
    orderIndex: z.number().int().min(0).max(1000).optional(), isActive: z.boolean().optional(),
  }),
});
export const articleSchema = z.object({
  body: z.object({
    titleBn: text(3, 200), slug: z.preprocess(emptyToUndef, z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional()),
    categoryBn: text(2, 80), excerptBn: text(5, 400), contentBn: text(20, 50000),
    imageUrl: optText(500), author: optText(100), readingTimeMin: z.number().int().min(1).max(120).default(5),
    isPublished: z.boolean().default(true), isDemo: z.boolean().default(false),
  }),
});
export const settingsSchema = z.object({
  body: z.record(z.string().max(20000)).refine((b) => Object.keys(b).length > 0, 'কোনো সেটিং দেওয়া হয়নি'),
});
export const couponSchema = z.object({
  body: z.object({
    code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,30}$/, 'কোডে ৩-৩০টি ইংরেজি অক্ষর/সংখ্যা থাকতে হবে'),
    discountType: z.enum(['PERCENTAGE', 'FIXED']),
    discountValue: z.number().positive(),
    minOrderValue: z.number().nonnegative().nullable().optional(),
    maxDiscount: z.number().positive().nullable().optional(),
    usageLimit: z.number().int().positive().nullable().optional(),
    expiresAt: z.coerce.date().nullable().optional(),
    isActive: z.boolean().default(true),
  }).refine((c) => c.discountType !== 'PERCENTAGE' || c.discountValue <= 100, { message: 'শতকরা ছাড় ১০০ এর বেশি হতে পারে না', path: ['discountValue'] }),
});
export const newsletterSchema = z.object({ body: z.object({ email: z.string().trim().toLowerCase().email('সঠিক ইমেইল দিন') }) });

// ---------- Reports ----------
export const salesReportSchema = z.object({
  query: z.object({
    period: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    format: z.enum(['json', 'csv']).default('json'),
  }),
});
export const reportFormatSchema = z.object({
  query: z.object({ format: z.enum(['json', 'csv']).default('json'), limit: intQuery(10, 1, 100) }),
});
