import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../config/prisma';
import { AppError } from './error';

export type RoleName = 'CUSTOMER' | 'STAFF' | 'ADMIN' | 'SUPER_ADMIN';

export interface AuthUser {
  userId: string;
  role: RoleName;
  phone: string;
  permissions: string[];
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Permissions a STAFF account may be granted. ADMIN / SUPER_ADMIN hold all of them implicitly.
export const PERMISSIONS = ['products', 'categories', 'orders', 'customers', 'inventory', 'content', 'reports'] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const signToken = (u: { id: string; role: string; phone: string }) =>
  jwt.sign({ sub: u.id, role: u.role, phone: u.phone }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });

export const cookieOptions = () => ({
  httpOnly: true,
  secure: config.isProd,
  sameSite: 'lax' as const,
  domain: config.cookieDomain,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const readToken = (req: Request): string | null => req.cookies?.token || null;

/** Loads the user from the DB on every request so role changes / disabled accounts take effect immediately. */
async function resolveUser(token: string): Promise<AuthUser | null> {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: String(decoded.sub) },
      select: { id: true, role: true, phone: true, isActive: true, permissions: true },
    });
    if (!user || !user.isActive) return null;
    return { userId: user.id, role: user.role as RoleName, phone: user.phone, permissions: user.permissions };
  } catch {
    return null;
  }
}

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  const token = readToken(req);
  if (!token) return next(new AppError('অনুগ্রহ করে প্রথমে লগইন করুন', 401));
  const user = await resolveUser(token);
  if (!user) return next(new AppError('লগইনের মেয়াদ শেষ হয়েছে বা অ্যাকাউন্ট নিষ্ক্রিয়', 401));
  req.user = user;
  next();
};

/** Attaches req.user when a valid session exists, but never rejects (guest checkout etc.). */
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const token = readToken(req);
  if (token) {
    const user = await resolveUser(token);
    if (user) req.user = user;
  }
  next();
};

export const authorize =
  (...roles: RoleName[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('অনুগ্রহ করে লগইন করুন', 401));
    if (!roles.includes(req.user.role)) return next(new AppError('এই কাজটি করার অনুমতি আপনার নেই', 403));
    next();
  };

export const isAdminRole = (role: RoleName) => role === 'ADMIN' || role === 'SUPER_ADMIN';

/** Any staff-level account (staff/admin/super admin). */
export const requireStaff = authorize('STAFF', 'ADMIN', 'SUPER_ADMIN');

/** Staff need the specific permission; admins pass automatically. */
export const requirePermission =
  (permission: Permission) => (req: Request, _res: Response, next: NextFunction) => {
    const u = req.user;
    if (!u) return next(new AppError('অনুগ্রহ করে লগইন করুন', 401));
    if (isAdminRole(u.role)) return next();
    if (u.role === 'STAFF' && u.permissions.includes(permission)) return next();
    return next(new AppError('এই কাজটি করার অনুমতি আপনার নেই', 403));
  };
