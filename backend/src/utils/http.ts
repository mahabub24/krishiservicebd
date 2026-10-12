import { prisma } from '../config/prisma';
import type { Prisma } from '@prisma/client';

export async function audit(
  userId: string | undefined,
  action: string,
  entity: string,
  entityId?: string,
  details?: Prisma.InputJsonValue
) {
  try {
    await prisma.auditLog.create({ data: { userId: userId ?? null, action, entity, entityId, details } });
  } catch (e) {
    console.error('[audit] failed to write audit log', e);
  }
}

export const asyncHandler =
  <T extends (...args: any[]) => Promise<any>>(fn: T) =>
  (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export const ok = (res: any, data: unknown, message?: string, status = 200) =>
  res.status(status).json({ success: true, message, data });
