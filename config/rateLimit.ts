import 'dotenv/config';
import IORedis from 'ioredis';
import type { Store } from 'express-rate-limit';
import { z } from 'zod';
import RedisStore from 'rate-limit-redis';

const RateLimitEnvSchema = z.object({
  NODE_ENV: z.string().min(1).optional(),
  RATE_LIMIT_ENABLED: z.enum(['true', 'false']).optional(),
  RATE_LIMIT_STORE: z.enum(['redis', 'memory']).optional(),
  RATE_LIMIT_TRUST_PROXY: z.coerce.number().int().min(0).max(10).optional(),
  RATE_LIMIT_ANON_PER_MINUTE: z.coerce.number().int().positive().optional(),
  RATE_LIMIT_ANON_PER_DAY: z.coerce.number().int().positive().optional(),
  RATE_LIMIT_USERS_PER_MINUTE: z.coerce.number().int().positive().optional(),
  RATE_LIMIT_USERS_PER_DAY: z.coerce.number().int().positive().optional(),
  RATE_LIMIT_APIKEY_PER_MINUTE: z.coerce.number().int().positive().optional(),
  RATE_LIMIT_APIKEY_PER_DAY: z.coerce.number().int().positive().optional(),
  RATE_LIMIT_REDIS_URL: z.string().min(1).optional(),
});

const parsedEnv = RateLimitEnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');

  throw new Error(`Invalid rate limit configuration - ${issues}`);
}

const env = parsedEnv.data;
const environment = env.NODE_ENV ?? 'development';
const isTest = environment === 'test';

/**
 * Resolved rate limit configuration.
 *
 * Tests default to an in-memory store with limiting switched off so that the
 * existing suites are unaffected; a test opts in by setting
 * `RATE_LIMIT_ENABLED=true` before the application module is imported.
 */
export const rateLimitConfig = {
  environment,
  isTest,
  enabled: isTest
    ? env.RATE_LIMIT_ENABLED === 'true'
    : env.RATE_LIMIT_ENABLED !== 'false',
  store: env.RATE_LIMIT_STORE ?? (isTest ? 'memory' : 'redis'),
  trustProxy: env.RATE_LIMIT_TRUST_PROXY ?? 1,
  redisUrl:
    env.RATE_LIMIT_REDIS_URL ??
    process.env['REDIS_CACHE_URL'] ??
    'redis://localhost:6381',
  anonymous: {
    perMinute: env.RATE_LIMIT_ANON_PER_MINUTE ?? 120,
    perDay: env.RATE_LIMIT_ANON_PER_DAY ?? 10_000,
  },
  users: {
    perMinute: env.RATE_LIMIT_USERS_PER_MINUTE ?? 20,
    perDay: env.RATE_LIMIT_USERS_PER_DAY ?? 500,
  },
  apiKey: {
    perMinute: env.RATE_LIMIT_APIKEY_PER_MINUTE ?? 250,
    perDay: env.RATE_LIMIT_APIKEY_PER_DAY ?? 20_000,
  },
} as const;

let rateLimitRedis: IORedis | null = null;

/**
 * Lazily creates the dedicated Redis connection used for rate limit counters.
 *
 * A separate connection keeps counter traffic away from the cache client and
 * allows the counters to move to their own instance via RATE_LIMIT_REDIS_URL.
 *
 * @returns The shared ioredis client for rate limiting
 */
export function getRateLimitRedis(): IORedis {
  if (rateLimitRedis) {
    return rateLimitRedis;
  }

  rateLimitRedis = new IORedis(rateLimitConfig.redisUrl, {
    // Scripts are uploaded when the store initialises, so commands must wait
    // for the socket instead of failing immediately.
    enableOfflineQueue: true,
    maxRetriesPerRequest: 1,
    connectTimeout: 1000,
    commandTimeout: 500,

    retryStrategy(times) {
      if (process.env['NODE_ENV'] === 'test') {
        return null;
      }

      return Math.min(times * 200, 2000);
    },
  });

  rateLimitRedis.on('error', function (error) {
    if (!rateLimitConfig.isTest) {
      console.error(`[rate-limit] redis error: ${error?.message}`);
    }
  });

  return rateLimitRedis;
}

/**
 * Builds a Redis backed store for a single limiter, or returns undefined so
 * express-rate-limit falls back to its in-memory store.
 *
 * @param prefix Key prefix that separates limiters inside Redis
 * @returns A Redis store, or undefined when the memory driver is configured
 */
export function createRedisStore(prefix: string): Store | undefined {
  if (rateLimitConfig.store === 'memory') {
    return undefined;
  }

  const redis = getRateLimitRedis();

  return new RedisStore({
    prefix,
    sendCommand: (...args: string[]) =>
      redis.call(args[0]!, ...args.slice(1)) as Promise<never>,
  });
}
