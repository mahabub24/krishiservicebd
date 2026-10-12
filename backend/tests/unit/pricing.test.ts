import { describe, it, expect } from '@jest/globals';
import {
  toPaisa,
  fromPaisa,
  effectiveUnitPrice,
  isDhakaDistrict,
  computeDelivery,
  evaluateCoupon,
  computeTotals,
} from '../../src/utils/pricing';

describe('Pricing & Money Logic (utils/pricing)', () => {
  it('converts between taka and integer paisa accurately', () => {
    expect(toPaisa(120.5)).toBe(12050);
    expect(toPaisa('99.99')).toBe(9999);
    expect(fromPaisa(12050)).toBe(120.5);
    expect(fromPaisa(9999)).toBe(99.99);
  });

  it('selects effective unit price only when discount is strictly lower than price', () => {
    expect(effectiveUnitPrice(500, 450)).toBe(450);
    expect(effectiveUnitPrice(500, null)).toBe(500);
    expect(effectiveUnitPrice(500, 550)).toBe(500); // Invalid discount higher than regular price
    expect(effectiveUnitPrice(500, 0)).toBe(500);   // Zero discount is invalid
  });

  it('identifies Dhaka districts correctly for delivery tiers', () => {
    expect(isDhakaDistrict('ঢাকা')).toBe(true);
    expect(isDhakaDistrict('Dhaka')).toBe(true);
    expect(isDhakaDistrict('  ঢাকা ')).toBe(true);
    expect(isDhakaDistrict('বগুড়া')).toBe(false);
    expect(isDhakaDistrict('Chittagong')).toBe(false);
  });

  it('calculates delivery fee according to rules and free delivery threshold', () => {
    const rule = { insideDhaka: 60, outsideDhaka: 120, freeAbove: 2000 };
    expect(computeDelivery(500, 'ঢাকা', rule)).toBe(60);
    expect(computeDelivery(500, 'রাজশাহী', rule)).toBe(120);
    expect(computeDelivery(2500, 'রাজশাহী', rule)).toBe(0); // free delivery threshold passed
    expect(computeDelivery(0, 'ঢাকা', rule)).toBe(0);
  });

  it('evaluates percentage and fixed coupons with limits', () => {
    const pctCoupon = {
      discountType: 'PERCENTAGE' as const,
      discountValue: 10,
      minOrderValue: 500,
      maxDiscount: 100,
      isActive: true,
      usageCount: 0,
      usageLimit: 5,
    };

    // Subtotal below minOrderValue
    const failMin = evaluateCoupon(pctCoupon, 400);
    expect(failMin.valid).toBe(false);

    // 10% of 800 is 80 (below maxDiscount 100)
    const pass1 = evaluateCoupon(pctCoupon, 800);
    expect(pass1.valid).toBe(true);
    if (pass1.valid) expect(pass1.discount).toBe(80);

    // 10% of 1500 is 150, capped at maxDiscount 100
    const passCapped = evaluateCoupon(pctCoupon, 1500);
    expect(passCapped.valid).toBe(true);
    if (passCapped.valid) expect(passCapped.discount).toBe(100);

    // Expired or limit reached
    const expiredCoupon = { ...pctCoupon, expiresAt: new Date(Date.now() - 10000) };
    expect(evaluateCoupon(expiredCoupon, 800).valid).toBe(false);

    const limitReached = { ...pctCoupon, usageCount: 5 };
    expect(evaluateCoupon(limitReached, 800).valid).toBe(false);
  });

  it('computes exact order totals without floating point errors', () => {
    const lines = [
      { unitPrice: 420.25, quantity: 2 }, // 840.50
      { unitPrice: 95.5, quantity: 3 },   // 286.50
    ];
    // subtotal = 1127.00, discount = 100, delivery = 60 => total = 1087.00
    const totals = computeTotals(lines, 60, 100);
    expect(totals.subtotal).toBe(1127);
    expect(totals.discountTotal).toBe(100);
    expect(totals.deliveryFee).toBe(60);
    expect(totals.totalAmount).toBe(1087);
  });
});
