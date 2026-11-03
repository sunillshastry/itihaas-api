import 'dotenv/config';
import IORedis from 'ioredis';

const cacheUrl = process?.env?.['REDIS_CACHE_URL'] ?? 'redis://localhost:6380';

export const cacheRedis = new IORedis(cacheUrl, {
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,
  connectTimeout: 1000,

  retryStrategy(times) {
    if (process.env?.['NODE_ENV'] === 'test') {
      return null;
    }
    return Math.min(times * 200, 2000);
  },
});

cacheRedis.on('error', function (error) {
  if (process.env?.['NODE_ENV'] !== 'test') {
    console.error(`[cache] redis error: ${error?.message}`);
  }
});
