import IORedis from 'ioredis';

export const QUEUE_NAME = 'email';

export const createRedis = (role: 'producer' | 'worker') =>
  new IORedis(
    process.env['REDIS_URL'] ?? 'redis://localhost:6379',
    role === 'worker'
      ? { maxRetriesPerRequest: null }
      : { enableOfflineQueue: false },
  );
