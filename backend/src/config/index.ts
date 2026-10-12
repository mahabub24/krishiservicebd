import dotenv from 'dotenv';
dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

const jwtSecret = process.env.JWT_SECRET || '';
if (isProd && (jwtSecret.length < 32 || jwtSecret.startsWith('change-me'))) {
  throw new Error('JWT_SECRET must be set to a strong random value (32+ chars) in production');
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv,
  isProd,
  databaseUrl: process.env.DATABASE_URL || '',
  // A dev-only fallback keeps local setup frictionless; production refuses to boot without a real secret.
  jwtSecret: jwtSecret || 'dev-only-insecure-secret-do-not-use-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  // Comma-separated list of allowed browser origins (strict CORS allow-list)
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  trustProxy: process.env.TRUST_PROXY === 'true',
  storage: {
    provider: (process.env.STORAGE_PROVIDER || 'local') as 'local',
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    publicBaseUrl: process.env.PUBLIC_API_URL || `http://localhost:${process.env.PORT || '5000'}`,
    maxFileSizeBytes: parseInt(process.env.MAX_UPLOAD_MB || '5', 10) * 1024 * 1024,
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || '',
  },
  sms: {
    // Generic HTTP gateway: POST { to, message } with Bearer key. Adapt to your provider.
    apiUrl: process.env.SMS_API_URL || '',
    apiKey: process.env.SMS_API_KEY || '',
  },
};
