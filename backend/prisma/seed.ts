/**
 * Seed script — creates the category tree, a super-admin and CLEARLY-MARKED DEMO content.
 *
 * Demo products/articles are flagged `isDemo = true` and prefixed "[ডেমো]". They contain NO real
 * manufacturer, registration, certification, dosage or safety claims. Prices/stock are placeholders
 * and must never be treated as real stock or sales. Delete them from the admin panel before launch.
 *
 * Run:  npm run prisma:seed
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

const DEMO_NOTICE = 'এটি শুধুমাত্র ডেমো তথ্য। বাস্তব পণ্য যুক্ত করার আগে এটি মুছে ফেলুন।';

const tree = [
  {
    nameBn: 'উন্নত বীজ', nameEn: 'Improved Seeds', slug: 'improved-seeds', image: '/demo/cat-seeds.png',
    description: 'ধান, সবজি, ভুট্টাসহ বিভিন্ন ফসলের বীজ',
    children: [
      ['ধান বীজ', 'Paddy Seeds', 'paddy-seeds'], ['সবজি বীজ', 'Vegetable Seeds', 'vegetable-seeds'],
      ['ভুট্টা বীজ', 'Maize Seeds', 'maize-seeds'], ['অন্যান্য ফসলের বীজ', 'Other Crop Seeds', 'other-crop-seeds'],
    ],
  },
  {
    nameBn: 'কীটনাশক', nameEn: 'Crop Protection', slug: 'pesticides', image: '/demo/cat-pesticides.png',
    description: 'ফসল সুরক্ষার জন্য অনুমোদিত পণ্য',
    children: [
      ['পোকামাকড় নিয়ন্ত্রণ', 'Insect Control', 'insect-control'], ['ছত্রাকনাশক', 'Fungicides', 'fungicides'],
      ['আগাছা নিয়ন্ত্রণ', 'Weed Control', 'weed-control'], ['অন্যান্য অনুমোদিত কৃষি সুরক্ষা পণ্য', 'Other Crop Protection', 'other-crop-protection'],
    ],
  },
  {
    nameBn: 'সার', nameEn: 'Fertilizers', slug: 'fertilizers', image: '/demo/cat-fertilizers.png',
    description: 'জৈব সার, মাইক্রোনিউট্রিয়েন্টসহ বিভিন্ন সার',
    children: [
      ['জৈব সার', 'Organic Fertilizer', 'organic-fertilizer'], ['মাইক্রোনিউট্রিয়েন্ট', 'Micronutrients', 'micronutrients'],
      ['অন্যান্য অনুমোদিত সার', 'Other Fertilizers', 'other-fertilizers'],
    ],
  },
  {
    nameBn: 'কৃষি যন্ত্রপাতি', nameEn: 'Agricultural Equipment', slug: 'agricultural-machinery', image: '/demo/cat-machinery.png',
    description: 'স্প্রেয়ার, সেচ সরঞ্জাম ও হ্যান্ড টুলস',
    children: [
      ['স্প্রেয়ার', 'Sprayers', 'sprayers'], ['সেচ সরঞ্জাম', 'Irrigation Equipment', 'irrigation-equipment'],
      ['হ্যান্ড টুলস', 'Hand Tools', 'hand-tools'], ['অন্যান্য কৃষি যন্ত্রপাতি', 'Other Equipment', 'other-equipment'],
    ],
  },
];

const demoProducts = [
  { slug: 'demo-paddy-seed', sku: 'DEMO-SEED-001', cat: 'paddy-seeds', img: '/demo/cat-seeds.png', name: 'ধান বীজ', unit: '১ কেজি প্যাকেট', price: 100, discount: 90, stock: 50, featured: true },
  { slug: 'demo-vegetable-seed', sku: 'DEMO-SEED-002', cat: 'vegetable-seeds', img: '/demo/cat-seeds.png', name: 'সবজি বীজ', unit: '১০ গ্রাম প্যাকেট', price: 50, discount: null, stock: 100, featured: true },
  { slug: 'demo-organic-fertilizer', sku: 'DEMO-FERT-001', cat: 'organic-fertilizer', img: '/demo/cat-fertilizers.png', name: 'জৈব সার', unit: '৫ কেজি বস্তা', price: 200, discount: 180, stock: 30, featured: true },
  { slug: 'demo-micronutrient', sku: 'DEMO-FERT-002', cat: 'micronutrients', img: '/demo/cat-fertilizers.png', name: 'মাইক্রোনিউট্রিয়েন্ট', unit: '১০০ গ্রাম', price: 150, discount: null, stock: 0, featured: false },
  { slug: 'demo-crop-protection', sku: 'DEMO-PEST-001', cat: 'other-crop-protection', img: '/demo/cat-pesticides.png', name: 'ফসল সুরক্ষা পণ্য', unit: '১০০ মিলি', price: 250, discount: null, stock: 20, featured: false, regulated: true },
  { slug: 'demo-hand-sprayer', sku: 'DEMO-MACH-001', cat: 'sprayers', img: '/demo/cat-machinery.png', name: 'হ্যান্ড স্প্রেয়ার', unit: '১টি', price: 1000, discount: 900, stock: 10, featured: true },
];

async function main() {
  const phone = process.env.SEED_ADMIN_PHONE || '01700000000';
  const email = process.env.SEED_ADMIN_EMAIL || undefined;
  const password = process.env.SEED_ADMIN_PASSWORD || '';
  if (password.length < 10 || password.startsWith('change-me')) {
    throw new Error('Set SEED_ADMIN_PASSWORD (10+ chars, not the placeholder) in backend/.env before seeding.');
  }

  await prisma.user.upsert({
    where: { phone },
    update: {},
    create: { name: 'সুপার অ্যাডমিন', phone, email, passwordHash: await bcrypt.hash(password, 12), role: 'SUPER_ADMIN' },
  });

  const bySlug = new Map<string, string>();
  for (const [i, c] of tree.entries()) {
    const parent = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { nameBn: c.nameBn, nameEn: c.nameEn, slug: c.slug, description: c.description, imageUrl: c.image, orderIndex: i + 1 },
    });
    bySlug.set(c.slug, parent.id);
    for (const [j, [nameBn, nameEn, slug]] of c.children.entries()) {
      const child = await prisma.category.upsert({
        where: { slug },
        update: {},
        create: { nameBn, nameEn, slug, parentId: parent.id, orderIndex: j + 1 },
      });
      bySlug.set(slug, child.id);
    }
  }

  for (const p of demoProducts) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug, sku: p.sku, nameBn: `[ডেমো] ${p.name}`, nameEn: `[Demo] ${p.slug}`,
        categoryId: bySlug.get(p.cat)!, shortDescBn: `ডেমো পণ্য — ${DEMO_NOTICE}`,
        fullDescBn: `এটি একটি ডেমো পণ্য যা শুধুমাত্র সাইটের নকশা ও কার্যকারিতা দেখানোর জন্য। ${DEMO_NOTICE}`,
        price: p.price, discountPrice: p.discount, stockQuantity: p.stock, unitSize: p.unit,
        safetyNoticeBn: p.regulated ? 'বাস্তব পণ্যের ক্ষেত্রে প্রস্তুতকারকের লেবেল ও আইনানুগ সতর্কতা এখানে যুক্ত করুন।' : null,
        isActive: true, isFeatured: p.featured, isDemo: true,
        images: { create: [{ imageUrl: p.img, altText: `[ডেমো] ${p.name}`, isPrimary: true, order: 0 }] },
      },
    });
  }

  await prisma.article.upsert({
    where: { slug: 'demo-agricultural-advice' },
    update: {},
    create: {
      slug: 'demo-agricultural-advice', titleBn: '[ডেমো] কৃষি পরামর্শ বিভাগের নমুনা নিবন্ধ', categoryBn: 'ডেমো',
      excerptBn: 'এটি কৃষি পরামর্শ বিভাগের নকশা দেখানোর জন্য একটি নমুনা নিবন্ধ।',
      contentBn: `এটি একটি নমুনা নিবন্ধ। এখানে বাস্তব চাষাবাদের পরামর্শ, মৌসুমি নির্দেশনা এবং পণ্য ব্যবহারের নিরাপত্তা তথ্য যুক্ত করা হবে। ${DEMO_NOTICE}`,
      readingTimeMin: 1, isPublished: true, isDemo: true,
    },
  });

  console.log('✔ Seed complete: categories, super-admin, demo products and a demo article.');
  console.log(`  Admin login phone: ${phone}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
