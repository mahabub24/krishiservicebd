/**
 * Pure money/order calculation helpers. All math is done in integer paisa to avoid
 * floating-point errors, then converted back to taka with 2 decimals.
 */

export const toPaisa = (taka: number | string | { toString(): string }): number =>
  Math.round(Number(taka.toString()) * 100);
export const fromPaisa = (p: number): number => p / 100;

export interface PricedLine {
  unitPrice: number | string; // price actually charged per unit (discount price if valid, else price)
  quantity: number;
}

export interface CouponRule {
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number | string;
  minOrderValue?: number | string | null;
  maxDiscount?: number | string | null;
  expiresAt?: Date | null;
  isActive: boolean;
  usageCount: number;
  usageLimit?: number | null;
}

export interface DeliveryRule {
  insideDhaka: number;
  outsideDhaka: number;
  freeAbove?: number | null; // free delivery when subtotal >= this (0/null disables)
}

/** The price a customer is charged: discount price only if it is a real discount. */
export function effectiveUnitPrice(price: number | string, discountPrice?: number | string | null): number {
  const p = toPaisa(price);
  if (discountPrice === null || discountPrice === undefined) return fromPaisa(p);
  const d = toPaisa(discountPrice);
  return d > 0 && d < p ? fromPaisa(d) : fromPaisa(p);
}

export function isDhakaDistrict(district: string): boolean {
  const d = district.trim().toLowerCase();
  return d === 'ঢাকা' || d === 'dhaka';
}

export function computeDelivery(subtotal: number, district: string, rule: DeliveryRule): number {
  if (subtotal <= 0) return 0;
  if (rule.freeAbove && rule.freeAbove > 0 && toPaisa(subtotal) >= toPaisa(rule.freeAbove)) return 0;
  return isDhakaDistrict(district) ? rule.insideDhaka : rule.outsideDhaka;
}

export type CouponResult = { valid: true; discount: number } | { valid: false; reason: string };

export function evaluateCoupon(coupon: CouponRule, subtotal: number, now = new Date()): CouponResult {
  if (!coupon.isActive) return { valid: false, reason: 'কুপনটি সক্রিয় নয়' };
  if (coupon.expiresAt && coupon.expiresAt.getTime() < now.getTime()) return { valid: false, reason: 'কুপনের মেয়াদ শেষ হয়েছে' };
  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit)
    return { valid: false, reason: 'কুপনটির ব্যবহারের সীমা শেষ' };
  const sub = toPaisa(subtotal);
  if (coupon.minOrderValue != null && sub < toPaisa(coupon.minOrderValue))
    return { valid: false, reason: `ন্যূনতম অর্ডার মূল্য ৳${coupon.minOrderValue} হতে হবে` };

  let discount =
    coupon.discountType === 'PERCENTAGE'
      ? Math.floor((sub * Number(coupon.discountValue)) / 100)
      : toPaisa(coupon.discountValue);
  if (coupon.maxDiscount != null) discount = Math.min(discount, toPaisa(coupon.maxDiscount));
  discount = Math.min(discount, sub); // never exceed subtotal
  if (discount <= 0) return { valid: false, reason: 'কুপনে কোনো ছাড় প্রযোজ্য নয়' };
  return { valid: true, discount: fromPaisa(discount) };
}

export interface Totals {
  subtotal: number;
  discountTotal: number;
  deliveryFee: number;
  totalAmount: number;
}

export function computeTotals(lines: PricedLine[], deliveryFee: number, discount = 0): Totals {
  const subtotalP = lines.reduce((s, l) => {
    if (!Number.isInteger(l.quantity) || l.quantity <= 0) throw new Error('Invalid quantity');
    return s + toPaisa(l.unitPrice) * l.quantity;
  }, 0);
  const discountP = Math.min(toPaisa(discount), subtotalP);
  const totalP = subtotalP - discountP + toPaisa(deliveryFee);
  return {
    subtotal: fromPaisa(subtotalP),
    discountTotal: fromPaisa(discountP),
    deliveryFee: fromPaisa(toPaisa(deliveryFee)),
    totalAmount: fromPaisa(totalP),
  };
}
