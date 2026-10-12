import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { prisma } from '../config/prisma';
import { config } from '../config';
import { AppError } from '../middleware/error';
import { cookieOptions, signToken } from '../middleware/auth';
import { asyncHandler, audit, ok } from '../utils/http';
import { notify } from '../services/notify';
import { normalizePhone } from '../validators';

const BCRYPT_ROUNDS = 12;
const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

const publicUser = {
  id: true, name: true, phone: true, email: true, role: true, permissions: true, createdAt: true,
} as const;

// Constant-time-ish decoy so unknown phones take as long as wrong passwords.
const DECOY_HASH = bcrypt.hashSync('decoy-password-for-timing', BCRYPT_ROUNDS);

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone, email, password } = req.body;
  const exists = await prisma.user.findFirst({ where: { OR: [{ phone }, ...(email ? [{ email }] : [])] }, select: { id: true } });
  if (exists) throw new AppError('এই মোবাইল নম্বর বা ইমেইল দিয়ে ইতোমধ্যে অ্যাকাউন্ট আছে', 409);

  const user = await prisma.user.create({
    data: { name, phone, email: email ?? null, passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS), role: 'CUSTOMER' },
    select: publicUser,
  });
  res.cookie('token', signToken(user), cookieOptions());
  ok(res, { user }, 'রেজিস্ট্রেশন সফল হয়েছে', 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { phone, password } = req.body;
  const user = await prisma.user.findUnique({ where: { phone } });
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DECOY_HASH);
  if (!user || !valid) throw new AppError('মোবাইল নম্বর অথবা পাসওয়ার্ড সঠিক নয়', 401);
  if (!user.isActive) throw new AppError('আপনার অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে। সহায়তার জন্য যোগাযোগ করুন।', 403);

  const token = signToken(user);
  res.cookie('token', token, cookieOptions(false)); // Session cookie (no persistent maxAge)
  ok(res, {
    token,
    user: { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role, permissions: user.permissions },
  }, 'লগইন সফল হয়েছে');
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  const { maxAge: _m, ...opts } = cookieOptions();
  res.clearCookie('token', opts);
  ok(res, null, 'লগআউট সফল হয়েছে');
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: publicUser });
  if (!user) throw new AppError('ব্যবহারকারী খুঁজে পাওয়া যায়নি', 404);
  ok(res, user);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const raw = String(req.body.identifier).trim();
  const isEmail = raw.includes('@');
  const user = await prisma.user.findFirst({
    where: isEmail ? { email: raw.toLowerCase() } : { phone: normalizePhone(raw) },
  });

  if (user && user.isActive) {
    const token = randomBytes(32).toString('hex'); // 64 hex chars, only the hash is stored
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token: sha256(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    const link = `${config.frontendUrl}/reset-password?token=${token}`;
    notify({
      email: user.email,
      phone: user.phone,
      subject: 'পাসওয়ার্ড রিসেট — কৃষি সার্ভিস বিডি',
      text: `পাসওয়ার্ড রিসেট করতে এই লিংকে যান (১ ঘণ্টা বৈধ): ${link}`,
    });
    if (!config.isProd && !config.smtp.host && !config.sms.apiUrl) console.log(`[dev] password reset link: ${link}`);
  }
  // Same response whether or not the account exists (prevents account enumeration)
  ok(res, null, 'অ্যাকাউন্ট থাকলে পাসওয়ার্ড রিসেটের নির্দেশনা পাঠানো হয়েছে');
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  const record = await prisma.passwordResetToken.findUnique({ where: { token: sha256(token) } });
  if (!record || record.expiresAt < new Date()) throw new AppError('রিসেট লিংকটি সঠিক নয় বা মেয়াদ শেষ', 400);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS) } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
  ]);
  await audit(record.userId, 'PASSWORD_RESET', 'User', record.userId);
  ok(res, null, 'পাসওয়ার্ড পরিবর্তন হয়েছে। এখন লগইন করুন।');
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) throw new AppError('বর্তমান পাসওয়ার্ড সঠিক নয়', 400);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(newPassword, BCRYPT_ROUNDS) } });
  ok(res, null, 'পাসওয়ার্ড পরিবর্তন হয়েছে');
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, email } = req.body;
  if (email) {
    const taken = await prisma.user.findFirst({ where: { email, id: { not: req.user!.userId } }, select: { id: true } });
    if (taken) throw new AppError('এই ইমেইল অন্য অ্যাকাউন্টে ব্যবহৃত', 409);
  }
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { ...(name ? { name } : {}), ...(email !== undefined ? { email } : {}) },
    select: publicUser,
  });
  ok(res, user, 'প্রোফাইল আপডেট হয়েছে');
});
