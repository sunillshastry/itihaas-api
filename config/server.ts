// Global imports
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';

dotenv.config();

// Router imports
import dynastiesRouter from '@/routes/dynasties';
import rulersRouter from '@/routes/rulers';
import healthCheckRouter from '@/routes/healthcheck';
import versionRouter from '@/routes/version';
import apiInfoRouter from '@/routes/info';
import baseRouter from '@/routes/base';
import usersRouter from '@/routes/users';
import warsRouter from '@/routes/wars';
import contributionsRouter from '@/routes/contributions';
import {
  anonymousTier,
  apiKeyTier,
  entityAnonymousTier,
  rateLimitPaths,
  usersTier,
} from '@/middlewares/rateLimit';
import { rateLimitConfig } from '@/config/rateLimit';

const app = express();

// The API sits behind a single reverse proxy, so trust exactly one hop when
// resolving the client IP used for rate limiting.
app.set('trust proxy', rateLimitConfig.trustProxy);

// Third-party middlewares
if (process.env?.['NODE_ENV'] === 'development') {
  app.use(morgan('dev'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    exposedHeaders: ['RateLimit', 'RateLimit-Policy', 'Retry-After'],
  }),
);
app.use(helmet());

// Rate limiting
if (rateLimitConfig.enabled) {
  app.use(...anonymousTier);
  app.use(rateLimitPaths.users, ...usersTier);
  app.use(rateLimitPaths.entities, ...entityAnonymousTier);
  app.use(rateLimitPaths.entities, ...apiKeyTier);
}

// Routing
app.use('/', baseRouter);
app.use('/api/v1/dynasties', dynastiesRouter);
app.use('/api/v1/rulers', rulersRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/wars', warsRouter);
app.use('/api/v1/contributions', contributionsRouter);

app.use('/api/health', healthCheckRouter);
app.use('/api/version', versionRouter);
app.use('/api/info', apiInfoRouter);

export default app;
