import rateLimit from 'express-rate-limit';
import { NextFunction, Request, Response } from 'express';
import { config } from '../config';

const make = (windowMs: number, max: number, message: string) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });

export const globalLimiter = make(15 * 60 * 1000, 600, 'অতিরিক্ত অনুরোধ করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।');
export const authLimiter = make(15 * 60 * 1000, 20, 'অনেকবার চেষ্টা করা হয়েছে। ১৫ মিনিট পর আবার চেষ্টা করুন।');
export const sensitiveLimiter = make(60 * 60 * 1000, 10, 'অনুরোধের সীমা অতিক্রম করেছে। পরে আবার চেষ্টা করুন।');
export const orderLimiter = make(60 * 60 * 1000, 30, 'অর্ডারের অনুরোধ সীমা অতিক্রম করেছে। পরে আবার চেষ্টা করুন।');

export const isAllowedOrigin = (origin?: string): boolean => {
  if (!origin) return true;
  if (config.corsOrigins.includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true;
  if (origin.includes('krishiservicebd.com')) return true;
  if (origin.startsWith('http://localhost:')) return true;
  return false;
};

/**
 * CSRF defence-in-depth for cookie auth: reject state-changing browser requests whose
 * Origin header is present but not in the CORS allow-list. (SameSite=Lax is the primary defence.)
 */
export const originCheck = (req: Request, res: Response, next: NextFunction) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin;
  if (origin && !isAllowedOrigin(origin)) {
    return res.status(403).json({ success: false, message: 'অননুমোদিত উৎস থেকে অনুরোধ' });
  }
  next();
};
