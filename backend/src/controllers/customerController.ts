import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/error';
import { asyncHandler, ok } from '../utils/http';
import { isAdminRole } from '../middleware/auth';
import { changeOrderStatus, CheckoutInput, placeOrder } from '../services/orders';
import { notifyOrderPlaced } from '../services/notify';
import { audit } from '../utils/http';

// ---- Addresses ----
export const listAddresses = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await prisma.address.findMany({ where: { userId: req.user!.userId }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] }));
});

export const createAddress = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const count = await prisma.address.count({ where: { userId } });
  if (count >= 10) throw new AppError('সর্বোচ্চ ১০টি ঠিকানা সংরক্ষণ করা যাবে', 400);
  const isDefault = req.body.isDefault || count === 0;
  const address = await prisma.$transaction(async (tx) => {
    if (isDefault) await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return tx.address.create({ data: { ...req.body, userId, isDefault } });
  });
  ok(res, address, 'ঠিকানা সংরক্ষিত হয়েছে', 201);
});

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const existing = await prisma.address.findFirst({ where: { id: req.params.id, userId } });
  if (!existing) throw new AppError('ঠিকানা পাওয়া যায়নি', 404);
  const address = await prisma.$transaction(async (tx) => {
    if (req.body.isDefault) await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return tx.address.update({ where: { id: existing.id }, data: req.body });
  });
  ok(res, address, 'ঠিকানা আপডেট হয়েছে');
});

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  const r = await prisma.address.deleteMany({ where: { id: req.params.id, userId: req.user!.userId } });
  if (!r.count) throw new AppError('ঠিকানা পাওয়া যায়নি', 404);
  ok(res, null, 'ঠিকানা মুছে ফেলা হয়েছে');
});

// ---- Server-side persistent cart (logged-in customers) ----
export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await prisma.cart.findUnique({ where: { userId: req.user!.userId }, include: { items: true } });
  ok(res, (cart?.items ?? []).map((i) => ({ productId: i.productId, quantity: i.quantity })));
});

export const syncCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const items = req.body.items as { productId: string; quantity: number }[];
  const valid = await prisma.product.findMany({ where: { id: { in: items.map((i) => i.productId) }, isActive: true }, select: { id: true } });
  const ids = new Set(valid.map((v) => v.id));
  await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.upsert({ where: { userId }, update: {}, create: { userId } });
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    const merged = new Map<string, number>();
    for (const i of items) if (ids.has(i.productId)) merged.set(i.productId, (merged.get(i.productId) ?? 0) + i.quantity);
    if (merged.size) await tx.cartItem.createMany({ data: [...merged].map(([productId, quantity]) => ({ cartId: cart.id, productId, quantity })) });
  });
  ok(res, null, 'কার্ট সংরক্ষিত হয়েছে');
});

// ---- Orders ----
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await placeOrder(req.body as CheckoutInput, req.user?.userId ?? null);
  notifyOrderPlaced(order);
  ok(res, customerView(order), 'আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে', 201);
});

/** Hides internal fields from customers. */
function customerView<T extends { adminNotes?: string | null }>(order: T) {
  const { adminNotes: _hidden, ...rest } = order;
  return rest;
}

export const getOrderByNumber = asyncHandler(async (req: Request, res: Response) => {
  const { orderNumber } = req.params;
  const phone = (req.query as { phone?: string }).phone;
  const order = await prisma.order.findUnique({ where: { orderNumber }, include: { items: true, payments: true } });

  // Same 404 for "missing" and "not yours" so order numbers can't be probed.
  const notFound = new AppError('অর্ডারটি খুঁজে পাওয়া যায়নি', 404);
  if (!order) throw notFound;

  const u = req.user;
  const isStaff = !!u && u.role !== 'CUSTOMER';
  const isOwner = !!u && order.userId === u.userId;
  const guestMatch = !order.userId && !!phone && phone === order.customerPhone;
  const phoneMatch = !!phone && phone === order.customerPhone; // guests tracking by number+phone
  if (!isStaff && !isOwner && !guestMatch && !phoneMatch) throw notFound;
  ok(res, isStaff ? order : customerView(order));
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
    take: 100,
  });
  ok(res, orders.map(customerView));
});

export const cancelMyOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await prisma.order.findFirst({ where: { orderNumber: req.params.orderNumber, userId: req.user!.userId } });
  if (!order) throw new AppError('অর্ডারটি খুঁজে পাওয়া যায়নি', 404);
  if (order.status !== 'PENDING') throw new AppError('শুধু পেন্ডিং অর্ডার বাতিল করা যায়', 400);
  const updated = await changeOrderStatus(order.id, { status: 'CANCELLED' }, req.user!.userId);
  await audit(req.user!.userId, 'ORDER_CANCEL_BY_CUSTOMER', 'Order', order.id);
  ok(res, customerView(updated), 'অর্ডার বাতিল করা হয়েছে');
});

export { isAdminRole };
