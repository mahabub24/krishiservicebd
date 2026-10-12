import { randomBytes } from 'crypto';

/** Allowed order status transitions. Anything not listed is rejected. */
export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
] as const;
export type OrderStatusName = (typeof ORDER_STATUSES)[number];

const TRANSITIONS: Record<OrderStatusName, OrderStatusName[]> = {
  PENDING: ['CONFIRMED', 'PROCESSING', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'SHIPPED', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'RETURNED', 'CANCELLED'],
  DELIVERED: ['RETURNED'],
  CANCELLED: [],
  RETURNED: [],
};

export const canTransition = (from: OrderStatusName, to: OrderStatusName): boolean =>
  from === to || TRANSITIONS[from].includes(to);

/** Moving INTO these states returns reserved stock to inventory (exactly once). */
export const RESTOCK_STATUSES: OrderStatusName[] = ['CANCELLED', 'RETURNED'];
export const shouldRestock = (from: OrderStatusName, to: OrderStatusName): boolean =>
  !RESTOCK_STATUSES.includes(from) && RESTOCK_STATUSES.includes(to);

// Unambiguous alphabet (no 0/O/1/I) so numbers are easy to read over the phone.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** e.g. KSB-261012-7K2M9QXP — cryptographically random suffix, so it can't be enumerated. */
export function generateOrderNumber(now = new Date()): string {
  const dhaka = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const yy = String(dhaka.getUTCFullYear()).slice(2);
  const mm = String(dhaka.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dhaka.getUTCDate()).padStart(2, '0');
  const bytes = randomBytes(8);
  let suffix = '';
  for (let i = 0; i < 8; i++) suffix += ALPHABET[bytes[i] % ALPHABET.length];
  return `KSB-${yy}${mm}${dd}-${suffix}`;
}

export const ORDER_NUMBER_REGEX = /^KSB-\d{6}-[A-Z0-9]{8}$/;
