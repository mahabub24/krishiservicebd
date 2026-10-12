import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import apiRoutes from './routes';
import { errorHandler, notFound } from './middleware/error';
import { globalLimiter, originCheck } from './middleware/security';
import { config } from './config';

const app = express();

if (config.trustProxy) app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  helmet({
    // uploaded images are loaded cross-origin by the frontend
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS allow-list with support for custom domain and vercel previews
app.use(
  cors({
    origin: (origin, cb) => {
      if (
        !origin ||
        config.corsOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('krishiservicebd.com')
      ) {
        return cb(null, true);
      }
      cb(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

app.use(globalLimiter);
app.use(express.json({ limit: '2mb' })); // CSV import is the largest JSON body
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(cookieParser());
app.use(originCheck);

app.use('/uploads', express.static(path.resolve(config.storage.uploadDir), { maxAge: '7d', index: false, dotfiles: 'deny' }));

app.get('/', (_req, res) =>
  res.json({
    success: true,
    message: 'কৃষি সার্ভিস বিডি ব্যাকএন্ড এপিআই চালু আছে',
    version: '1.0.0',
    documentation: '/api/v1',
  })
);

app.get('/health', (_req, res) =>
  res.json({ status: 'healthy', service: 'Krishi Service BD API', timestamp: new Date().toISOString() })
);

app.use('/api/v1', apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
