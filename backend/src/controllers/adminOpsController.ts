import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/error';
import { asyncHandler, audit, ok } from '../utils/http';
import { changeOrderStatus } from '../services/orders';
import { getAllSettings } from '../services/settings';
import { toCsv } from '../utils/csv';

const pg = (total: number, page: number, limit: number) => ({ page, limit, totalCount: total, totalPages: Math.max(1, Math.ceil(total / limit)) });

// ---------------- Dashboard ----------------
export const dashboard = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await getAllSettings();
  const threshold = Number(settings.low_stock_threshold) || 5;
  const counted = { status: { notIn: ['CANCELLED', 'RETURNED'] as ('CANCELLED' | 'RETURNED')[] } };
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalProducts, totalOrders, pendingOrders, completedOrders, totalCustomers, lowStock, recentOrders, sales, last30] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'DELIVERED' } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.product.findMany({ where: { stockQuantity: { lte: threshold }, isActive: true }, orderBy: { stockQuantity: 'asc' }, take: 10, select: { id: true, nameBn: true, sku: true, stockQuantity: true } }),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 8, select: { id: true, orderNumber: true, customerName: true, totalAmount: true, status: true, paymentStatus: true, createdAt: true } }),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: counted }),
    prisma.$queryRaw<{ day: Date; total: Prisma.Decimal; orders: bigint }[]>`
      SELECT date_trunc('day', "createdAt" AT TIME ZONE 'Asia/Dhaka') AS day, SUM("totalAmount") AS total, COUNT(*) AS orders
      FROM "Order" WHERE "createdAt" >= ${since} AND "status" NOT IN ('CANCELLED','RETURNED')
      GROUP BY 1 ORDER BY 1`,
  ]);
  ok(res, {
    totalSales: sales._sum.totalAmount ?? 0,
    totalProducts,
    totalOrders, pendingOrders, completedOrders, totalCustomers,
    lowStockThreshold: threshold,
    lowStock,
    recentOrders,
    salesSummary: last30.map((r) => ({ day: r.day, total: Number(r.total), orders: Number(r.orders) })),
  });
});

// ---------------- Orders ----------------
export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as unknown as { status?: string; paymentStatus?: string; search?: string; page: number; limit: number };
  const where: Prisma.OrderWhereInput = {
    ...(q.status ? { status: q.status as never } : {}),
    ...(q.paymentStatus ? { paymentStatus: q.paymentStatus as never } : {}),
    ...(q.search ? { OR: [{ orderNumber: { contains: q.search, mode: 'insensitive' } }, { customerPhone: { contains: q.search } }, { customerName: { contains: q.search, mode: 'insensitive' } }] } : {}),
  };
  const [orders, total] = await Promise.all([
    prisma.order.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (q.page - 1) * q.limit, take: q.limit, include: { items: true } }),
    prisma.order.count({ where }),
  ]);
  ok(res, { orders, pagination: pg(total, q.page, q.limit) });
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: true, payments: true, user: { select: { id: true, name: true, phone: true } } } });
  if (!order) throw new AppError('অর্ডার পাওয়া যায়নি', 404);
  ok(res, order);
});

export const updateOrder = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await changeOrderStatus(req.params.id, req.body, req.user!.userId), 'অর্ডার আপডেট হয়েছে');
});

// ---------------- Customers ----------------
const customerSelect = { id: true, name: true, phone: true, email: true, isActive: true, createdAt: true } as const; // never passwordHash

export const listCustomers = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as unknown as { search?: string; page: number; limit: number };
  const where: Prisma.UserWhereInput = {
    role: 'CUSTOMER',
    ...(q.search ? { OR: [{ name: { contains: q.search, mode: 'insensitive' } }, { phone: { contains: q.search } }, { email: { contains: q.search, mode: 'insensitive' } }] } : {}),
  };
  const [customers, total] = await Promise.all([
    prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (q.page - 1) * q.limit, take: q.limit, select: { ...customerSelect, _count: { select: { orders: true } } } }),
    prisma.user.count({ where }),
  ]);
  ok(res, { customers, pagination: pg(total, q.page, q.limit) });
});

export const getCustomer = asyncHandler(async (req: Request, res: Response) => {
  const c = await prisma.user.findFirst({
    where: { id: req.params.id, role: 'CUSTOMER' },
    select: { ...customerSelect, addresses: true, orders: { orderBy: { createdAt: 'desc' }, take: 50, select: { id: true, orderNumber: true, totalAmount: true, status: true, paymentStatus: true, createdAt: true } } },
  });
  if (!c) throw new AppError('গ্রাহক পাওয়া যায়নি', 404);
  ok(res, c);
});

export const setCustomerStatus = asyncHandler(async (req: Request, res: Response) => {
  const target = await prisma.user.findFirst({ where: { id: req.params.id, role: 'CUSTOMER' } });
  if (!target) throw new AppError('গ্রাহক পাওয়া যায়নি', 404);
  const u = await prisma.user.update({ where: { id: target.id }, data: { isActive: req.body.isActive }, select: customerSelect });
  await audit(req.user!.userId, req.body.isActive ? 'CUSTOMER_ENABLE' : 'CUSTOMER_DISABLE', 'User', target.id);
  ok(res, u, req.body.isActive ? 'অ্যাকাউন্ট সক্রিয় করা হয়েছে' : 'অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে');
});

// ---------------- Staff (super admin only) ----------------
export const listStaff = asyncHandler(async (_req: Request, res: Response) => {
  ok(res, await prisma.user.findMany({ where: { role: { not: 'CUSTOMER' } }, select: { ...customerSelect, role: true, permissions: true }, orderBy: { createdAt: 'asc' } }));
});

export const createStaff = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone, email, password, permissions } = req.body;
  const exists = await prisma.user.findFirst({ where: { OR: [{ phone }, ...(email ? [{ email }] : [])] }, select: { id: true } });
  if (exists) throw new AppError('এই মোবাইল/ইমেইল দিয়ে অ্যাকাউন্ট আছে', 409);
  const u = await prisma.user.create({
    data: { name, phone, email: email ?? null, passwordHash: await bcrypt.hash(password, 12), role: 'STAFF', permissions },
    select: { ...customerSelect, role: true, permissions: true },
  });
  await audit(req.user!.userId, 'STAFF_CREATE', 'User', u.id, { permissions });
  ok(res, u, 'স্টাফ অ্যাকাউন্ট তৈরি হয়েছে', 201);
});

export const updateStaff = asyncHandler(async (req: Request, res: Response) => {
  const target = await prisma.user.findFirst({ where: { id: req.params.id, role: 'STAFF' } });
  if (!target) throw new AppError('স্টাফ পাওয়া যায়নি', 404);
  const u = await prisma.user.update({ where: { id: target.id }, data: req.body, select: { ...customerSelect, role: true, permissions: true } });
  await audit(req.user!.userId, 'STAFF_UPDATE', 'User', target.id, req.body);
  ok(res, u, 'স্টাফ আপডেট হয়েছে');
});

// ---------------- Inventory ----------------
export const lowStock = asyncHandler(async (_req: Request, res: Response) => {
  const threshold = Number((await getAllSettings()).low_stock_threshold) || 5;
  ok(res, { threshold, products: await prisma.product.findMany({ where: { stockQuantity: { lte: threshold } }, orderBy: { stockQuantity: 'asc' }, select: { id: true, nameBn: true, sku: true, stockQuantity: true, isActive: true } }) });
});

export const adjustStock = asyncHandler(async (req: Request, res: Response) => {
  const { productId, mode, quantity, reason } = req.body as { productId: string; mode: 'delta' | 'set'; quantity: number; reason: string };
  const result = await prisma.$transaction(async (tx) => {
    const p = await tx.product.findUnique({ where: { id: productId }, select: { stockQuantity: true } });
    if (!p) throw new AppError('পণ্য পাওয়া যায়নি', 404);
    const delta = mode === 'set' ? quantity - p.stockQuantity : quantity;
    if (p.stockQuantity + delta < 0) throw new AppError('স্টক ঋণাত্মক হতে পারে না', 400);
    if (delta === 0) return { stockQuantity: p.stockQuantity, delta };
    // conditional update guards against concurrent sales between read and write
    const r = await tx.product.updateMany({ where: { id: productId, stockQuantity: { gte: delta < 0 ? -delta : 0 } }, data: { stockQuantity: { increment: delta } } });
    if (!r.count) throw new AppError('স্টক পরিবর্তন হয়েছে, আবার চেষ্টা করুন', 409);
    await tx.inventoryMovement.create({ data: { productId, quantity: delta, type: 'ADJUSTMENT', reason, referenceId: req.user!.userId } });
    const after = await tx.product.findUnique({ where: { id: productId }, select: { stockQuantity: true } });
    return { stockQuantity: after!.stockQuantity, delta };
  });
  await audit(req.user!.userId, 'STOCK_ADJUST', 'Product', productId, { mode, quantity, reason });
  ok(res, result, 'স্টক আপডেট হয়েছে');
});

export const stockMovements = asyncHandler(async (req: Request, res: Response) => {
  const productId = typeof req.query.productId === 'string' ? req.query.productId : undefined;
  ok(res, await prisma.inventoryMovement.findMany({ where: productId ? { productId } : {}, orderBy: { createdAt: 'desc' }, take: 100, include: { product: { select: { nameBn: true, sku: true } } } }));
});

// ---------------- Reports ----------------
const sendCsv = (res: Response, name: string, headers: string[], rows: unknown[][]) => {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${name}.csv"`);
  res.send(toCsv(headers, rows));
};

export const salesReport = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as unknown as { period: 'daily' | 'weekly' | 'monthly'; from?: Date; to?: Date; format: 'json' | 'csv' };
  const unit = { daily: 'day', weekly: 'week', monthly: 'month' }[q.period]; // whitelisted literal
  const from = q.from ?? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const to = q.to ?? new Date();
  const rows = await prisma.$queryRaw<{ bucket: Date; orders: bigint; sales: Prisma.Decimal; delivery: Prisma.Decimal; discounts: Prisma.Decimal }[]>`
    SELECT date_trunc(${unit}, "createdAt" AT TIME ZONE 'Asia/Dhaka') AS bucket,
           COUNT(*) AS orders, SUM("totalAmount") AS sales, SUM("deliveryFee") AS delivery, SUM("discountTotal") AS discounts
    FROM "Order"
    WHERE "createdAt" >= ${from} AND "createdAt" <= ${to} AND "status" NOT IN ('CANCELLED','RETURNED')
    GROUP BY 1 ORDER BY 1 DESC`;
  const data = rows.map((r) => ({ period: r.bucket.toISOString().slice(0, 10), orders: Number(r.orders), sales: Number(r.sales), delivery: Number(r.delivery), discounts: Number(r.discounts) }));
  if (q.format === 'csv') return sendCsv(res, `sales-${q.period}`, ['period', 'orders', 'sales', 'delivery', 'discounts'], data.map((d) => [d.period, d.orders, d.sales, d.delivery, d.discounts]));
  ok(res, data);
});

export const orderStatusReport = asyncHandler(async (req: Request, res: Response) => {
  const groups = await prisma.order.groupBy({ by: ['status'], _count: { _all: true }, _sum: { totalAmount: true } });
  const data = groups.map((g) => ({ status: g.status, orders: g._count._all, amount: Number(g._sum.totalAmount ?? 0) }));
  if (req.query.format === 'csv') return sendCsv(res, 'order-status', ['status', 'orders', 'amount'], data.map((d) => [d.status, d.orders, d.amount]));
  ok(res, data);
});

export const bestSellersReport = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number((req.query as { limit?: number }).limit) || 10;
  const rows = await prisma.$queryRaw<{ productId: string; name: string; qty: bigint; revenue: Prisma.Decimal }[]>`
    SELECT oi."productId", MAX(oi."productName") AS name, SUM(oi."quantity") AS qty, SUM(oi."totalPrice") AS revenue
    FROM "OrderItem" oi JOIN "Order" o ON o."id" = oi."orderId"
    WHERE o."status" NOT IN ('CANCELLED','RETURNED')
    GROUP BY oi."productId" ORDER BY qty DESC LIMIT ${limit}`;
  const data = rows.map((r) => ({ productId: r.productId, name: r.name, quantity: Number(r.qty), revenue: Number(r.revenue) }));
  if (req.query.format === 'csv') return sendCsv(res, 'best-sellers', ['productId', 'name', 'quantity', 'revenue'], data.map((d) => [d.productId, d.name, d.quantity, d.revenue]));
  ok(res, data);
});
