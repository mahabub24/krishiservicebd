import { describe, it, expect } from '@jest/globals';
import { canTransition, shouldRestock, generateOrderNumber, ORDER_NUMBER_REGEX } from '../../src/utils/order';

describe('Order State Machine & Numbers (utils/order)', () => {
  it('generates secure, non-guessable, properly formatted KSB order numbers', () => {
    const num1 = generateOrderNumber();
    const num2 = generateOrderNumber();
    expect(num1).toMatch(ORDER_NUMBER_REGEX);
    expect(num2).toMatch(ORDER_NUMBER_REGEX);
    expect(num1).not.toBe(num2);
  });

  it('validates allowed status transitions', () => {
    expect(canTransition('PENDING', 'CONFIRMED')).toBe(true);
    expect(canTransition('CONFIRMED', 'PROCESSING')).toBe(true);
    expect(canTransition('PROCESSING', 'SHIPPED')).toBe(true);
    expect(canTransition('SHIPPED', 'DELIVERED')).toBe(true);
    expect(canTransition('PENDING', 'CANCELLED')).toBe(true);

    // Illegal transitions
    expect(canTransition('CANCELLED', 'DELIVERED')).toBe(false);
    expect(canTransition('DELIVERED', 'PENDING')).toBe(false);
  });

  it('correctly flags status changes that trigger inventory restock', () => {
    expect(shouldRestock('PENDING', 'CANCELLED')).toBe(true);
    expect(shouldRestock('SHIPPED', 'RETURNED')).toBe(true);
    expect(shouldRestock('CANCELLED', 'RETURNED')).toBe(false); // already cancelled
    expect(shouldRestock('PENDING', 'CONFIRMED')).toBe(false);
  });
});
