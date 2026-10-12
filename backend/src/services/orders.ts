import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/error';
import { computeDelivery, computeTotals, effectiveUnitPrice, evaluateCoupon } from '../utils/pricing';
import { canTransition, generateOrderNumber, OrderStatusName, shouldRestock } from '../utils/order';
import { getAllSettings, getDeliveryRule } from './settings';

export interface RequestedItem {
  productId: string;
  quantity: number;
}

/** Loads products, validates availability and prices everything from the database — never from the client. */
export async function priceCart(items: RequestedItem[], district: string, couponCode?: string | null) {
  // merge duplicate product lines
  const merged = new Map<string, number>();
  for (const it of items) merged.set(it.productId, (merged.get(it.productId) ?? 0) + it.quantity);

  const products = await prisma.product.findMany({
    where: { id: { in: [...merged.keys()] } },
    include: { images: { orderBy: { isPrimary: 'desc' }, take: 1 } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines = [];
  const issues: { productId: string; message: string }[] = [];
  for (const [productId, quantity] of merged) {
    const p = byId.get(productId);
    if (!p || !p.isActive || Number(p.price) <= 0) {
      issues.push({ productId, message: 'পণ্যটি বর্তমানে পাওয়া যাচ্ছে না' });
      continue;
    }
    if (p.stockQuantity < quantity) {
      issues.push({
        productId,
        message:
          p.stockQuantity <= 0
            ? `"${p.nameBn}" স্টকে নেই`
            : `"${p.nameBn}" এর মাত্র ${p.stockQuantity}টি স্টকে আছে`,
      });
    }
    lines.push({
      product: p,
      quantity,
      unitPrice: effectiveUnitPrice(p.price.toString(), p.discountPrice?.toString()),
    });
  }

  const rule = await getDeliveryRule();
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const deliveryFee = computeDelivery(subtotal, district || '', rule);

  let discount = 0;
  let coupon: Awaited<ReturnType<typeof prisma.coupon.findUnique>> = null;
  let couponError: string | undefined;
  if (couponCode) {
    coupon = await prisma.coupon.findUnique({ where: { code: couponCode.trim().toUpperCase() } });
    if (!coupon) couponError = 'কুপন কোডটি সঠিক নয়';
    else {
      const r = evaluateCoupon(
        {
          discountType: coupon.discountType as 'PERCENTAGE' | 'FIXED',
          discountValue: coupon.discountValue.toString(),
          minOrderValue: coupon.minOrderValue?.toString(),
          maxDiscount: coupon.maxDiscount?.toString(),
          expiresAt: coupon.expiresAt,
          isActive: coupon.isActive,
          usageCount: coupon.usageCount,
          usageLimit: coupon.usageLimit,
        },
        subtotal
      );
      if (r.valid) discount = r.discount;
      else {
        couponError = r.reason;
        coupon = null;
      }
    }
  }

  const totals = computeTotals(
    lines.map((l) => ({ unitPrice: l.unitPrice, quantity: l.quantity })),
    deliveryFee,
    discount
  );
  return { lines, totals, issues, coupon, couponError };
}

export interface CheckoutInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  district: string;
  upazila: string;
  unionArea: string;
  fullAddress: string;
  orderNotes?: string | null;
  paymentMethod: 'CASH_ON_DELIVERY' | 'BKASH_MANUAL' | 'NAGAD_MANUAL';
  paymentReference?: string | null;
  couponCode?: string | null;
  items: RequestedItem[];
}

export async function placeOrder(input: CheckoutInput, userId: string | null) {
  const settings = await getAllSettings();
  if (!userId && settings.allow_guest_checkout !== 'true')
    throw new AppError('অর্ডার করতে অনুগ্রহ করে লগইন করুন', 401);
  const methodEnabled = {
    CASH_ON_DELIVERY: settings.cod_enabled === 'true',
    BKASH_MANUAL: settings.bkash_enabled === 'true',
    NAGAD_MANUAL: settings.nagad_enabled === 'true',
  }[input.paymentMethod];
  if (!methodEnabled) throw new AppError('নির্বাচিত পেমেন্ট পদ্ধতি বর্তমানে চালু নেই', 400);

  const priced = await priceCart(input.items, input.district, input.couponCode);
  if (priced.couponError) throw new AppError(priced.couponError, 400);
  if (priced.issues.length) throw new AppError(priced.issues.map((i) => i.message).join('; '), 409, priced.issues);
  if (!priced.lines.length) throw new AppError('কার্টে কোনো বৈধ পণ্য নেই', 400);

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const orderNumber = generateOrderNumber();

          // Atomic, conditional stock decrement: fails (count 0) if stock dropped since pricing.
          // Sorted by id so concurrent orders lock rows in the same order (no deadlocks).
          const sorted = [...priced.lines].sort((a, b) => a.product.id.localeCompare(b.product.id));
          for (const l of sorted) {
            const r = await tx.product.updateMany({
              where: { id: l.product.id, isActive: true, stockQuantity: { gte: l.quantity } },
              data: { stockQuantity: { decrement: l.quantity } },
            });
            if (r.count === 0)
              throw new AppError(`"${l.product.nameBn}" পর্যাপ্ত পরিমাণে স্টকে নেই`, 409);
          }

          if (priced.coupon) {
            const c = await tx.coupon.updateMany({
              where: {
                id: priced.coupon.id,
                isActive: true,
                ...(priced.coupon.usageLimit != null ? { usageCount: { lt: priced.coupon.usageLimit } } : {}),
              },
              data: { usageCount: { increment: 1 } },
            });
            if (c.count === 0) throw new AppError('কুপনটির ব্যবহারের সীমা শেষ', 409);
          }

          const order = await tx.order.create({
            data: {
              orderNumber,
              userId,
              customerName: input.customerName,
              customerPhone: input.customerPhone,
              customerEmail: input.customerEmail || null,
              district: input.district,
              upazila: input.upazila,
              unionArea: input.unionArea,
              fullAddress: input.fullAddress,
              orderNotes: input.orderNotes || null,
              couponCode: priced.coupon?.code ?? null,
              paymentMethod: input.paymentMethod,
              paymentStatus: 'PENDING',
              status: 'PENDING',
              subtotal: priced.totals.subtotal,
              deliveryFee: priced.totals.deliveryFee,
              discountTotal: priced.totals.discountTotal,
              totalAmount: priced.totals.totalAmount,
              items: {
                create: priced.lines.map((l) => ({
                  productId: l.product.id,
                  productName: l.product.nameBn,
                  unitSize: l.product.unitSize,
                  unitPrice: l.unitPrice,
                  quantity: l.quantity,
                  totalPrice: Math.round(l.unitPrice * l.quantity * 100) / 100,
                })),
              },
              payments: {
                create: {
                  method: input.paymentMethod,
                  amount: priced.totals.totalAmount,
                  status: 'PENDING',
                  transactionId: input.paymentReference || null,
                },
              },
            },
            include: { items: true, payments: true },
          });

          await tx.inventoryMovement.createMany({
            data: priced.lines.map((l) => ({
              productId: l.product.id,
              quantity: -l.quantity,
              type: 'SALE',
              reason: 'অর্ডার',
              referenceId: order.orderNumber,
            })),
          });

          // Clear the persistent server cart of a logged-in customer
          if (userId) {
            await tx.cartItem.deleteMany({ where: { cart: { userId } } });
          }
          return order;
        },
        { timeout: 15000 }
      );
    } catch (e) {
      // order-number collision (astronomically unlikely) — retry with a fresh number
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') continue;
      throw e;
    }
  }
  throw new AppError('অর্ডার তৈরি করা যায়নি, আবার চেষ্টা করুন', 500);
}

export async function changeOrderStatus(
  orderId: string,
  patch: { status?: OrderStatusName; paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'; adminNotes?: string },
  actorId: string
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw new AppError('অর্ডারটি খুঁজে পাওয়া যায়নি', 404);

    if (patch.status && !canTransition(order.status as OrderStatusName, patch.status))
      throw new AppError(`স্ট্যাটাস ${order.status} থেকে ${patch.status} এ পরিবর্তন করা যাবে না`, 400);

    if (patch.status && shouldRestock(order.status as OrderStatusName, patch.status)) {
      for (const it of order.items) {
        await tx.product.update({ where: { id: it.productId }, data: { stockQuantity: { increment: it.quantity } } });
      }
      await tx.inventoryMovement.createMany({
        data: order.items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          type: 'RETURN',
          reason: `অর্ডার ${patch.status === 'CANCELLED' ? 'বাতিল' : 'ফেরত'}`,
          referenceId: order.orderNumber,
        })),
      });
    }

    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        ...(patch.status ? { status: patch.status } : {}),
        ...(patch.paymentStatus ? { paymentStatus: patch.paymentStatus } : {}),
        ...(patch.adminNotes !== undefined ? { adminNotes: patch.adminNotes } : {}),
      },
      include: { items: true, payments: true },
    });

    if (patch.paymentStatus) {
      await tx.payment.updateMany({ where: { orderId }, data: { status: patch.paymentStatus } });
    }
    await tx.auditLog.create({
      data: { userId: actorId, action: 'ORDER_UPDATE', entity: 'Order', entityId: orderId, details: patch as Prisma.InputJsonValue },
    });
    return updated;
  });
}
