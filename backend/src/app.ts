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

// Strict CORS allow-list (no wildcard) — credentials are required for cookie auth
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || config.corsOrigins.includes(origin)) return cb(null, true);
      cb(new Error('CORS: origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
);

app.use(globalLimiter);
app.use(express.json({ limit: '2mb' })); // CSV import is the largest JSON body
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(cookieParser());
app.use(originCheck);

app.use('/uploads', express.static(path.resolve(config.storage.uploadDir), { maxAge: '7d', index: false, dotfiles: 'deny' }));

app.get('/health', (_req, res) => res.json({ status: 'healthy', service: 'Krishi Service BD API', timestamp: new Date().toISOString() }));

app.use('/api/v1', apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
