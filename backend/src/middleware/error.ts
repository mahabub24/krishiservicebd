import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { MulterError } from 'multer';
import { config } from '../config';

export class AppError extends Error {
  constructor(message: string, public statusCode = 400, public details?: unknown) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const notFound = (_req: Request, res: Response) =>
  res.status(404).json({ success: false, message: 'অনুরোধকৃত রিসোর্স পাওয়া যায়নি' });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: err.errors[0]?.message || 'ইনপুট ভ্যালিডেশন ব্যর্থ হয়েছে',
      errors: err.errors.map((e) => ({ path: e.path.filter((p) => p !== 'body' && p !== 'query' && p !== 'params').join('.'), message: e.message })),
    });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message, ...(err.details ? { details: err.details } : {}) });
  }
  if (err instanceof MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'ছবির আকার অনেক বড়' : 'ফাইল আপলোডে সমস্যা হয়েছে';
    return res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ success: false, message });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return res.status(409).json({ success: false, message: 'এই তথ্য আগে থেকেই বিদ্যমান (ডুপ্লিকেট)' });
    if (err.code === 'P2025') return res.status(404).json({ success: false, message: 'রেকর্ড খুঁজে পাওয়া যায়নি' });
    if (err.code === 'P2003') return res.status(409).json({ success: false, message: 'সম্পর্কিত তথ্যের কারণে এই কাজটি করা যাচ্ছে না' });
  }
  if (err instanceof SyntaxError && 'body' in (err as object)) {
    return res.status(400).json({ success: false, message: 'অনুরোধের ফরম্যাট সঠিক নয়' });
  }
  if (err instanceof Error && err.message.startsWith('CORS:')) {
    return res.status(403).json({ success: false, message: 'অননুমোদিত উৎস' });
  }

  // Unknown error: log details server-side, never leak internals to the client
  console.error('[unhandled error]', err);
  return res.status(500).json({
    success: false,
    message: 'সার্ভারে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।',
    ...(config.isProd ? {} : { debug: err instanceof Error ? err.message : String(err) }),
  });
};
