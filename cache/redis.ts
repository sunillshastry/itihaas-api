import { cacheRedis } from './config';

const CACHE_PREFIX = 'itihaas';
const CACHE_ENV = process?.env?.['NODE_ENV'] ?? 'development';
const DEFAULT_VERSION = '0';

/**
 * Generates a version key code attribute for Redis
 *
 * @param group Group value string
 * @returns A version key code for in-memory Redis cache
 */
function versionKey(group: string): string {
  return `${CACHE_PREFIX}:${CACHE_ENV}:version:${group}`;
}

/**
 * Generates a data key code attribute for Redis
 *
 * @param group Group value string
 * @param version Version value
 * @param key Key value
 * @returns A full data key code for in-memory Redis cache
 */
function dataKey(group: string, version: string, key: string): string {
  return `${CACHE_PREFIX}:${CACHE_ENV}:${group}:v${version}:${key}`;
}

/**
 * Utility method to access an attribute from cached memory using Redis via provided key or uses the callback function to retrieve value, on a cache miss
 *
 * @param group Group value string
 * @param key Key value
 * @param ttlSeconds Time-to-live value (in seconds)
 * @param loader A fallback (callback) function that runs on a cache miss
 * @returns Either the cached content from memory or whatever the callback function retrieves
 */
export async function cacheAside<T>(
  group: string,
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  let version: string;

  try {
    version = (await cacheRedis.get(versionKey(group))) ?? DEFAULT_VERSION;

    const redisKey = dataKey(group, version, key);
    const cached = await cacheRedis.get(redisKey);

    if (cached !== null) {
      return JSON.parse(cached) as T;
    }
  } catch (err) {
    if (process.env?.['NODE_ENV'] !== 'test') {
      console.error(
        '[cache] read failed; falling back to source:',
        err instanceof Error ? err.message : err,
      );
    }

    // Redis is unavailable or the cached JSON is invalid.
    // Serve the request from the source of truth.
    return loader();
  }

  const result = await loader();

  // Don't cache empty or null/undefined results
  if (result === null || result === undefined) {
    return result;
  }

  // Don't cache if the loader fails: it will throw before this point.
  try {
    const currentVersion =
      (await cacheRedis.get(versionKey(group))) ?? DEFAULT_VERSION;

    // If the group was invalidated while the DB query was running,
    // avoid writing this result into the old version.
    if (currentVersion !== version) {
      return result;
    }

    await cacheRedis.set(
      dataKey(group, version, key),
      JSON.stringify(result),
      'EX',
      ttlSeconds,
    );
  } catch (err) {
    if (process.env?.['NODE_ENV'] !== 'test') {
      console.error(
        '[cache] write failed:',
        err instanceof Error ? err.message : err,
      );
    }
  }

  return result;
}

export async function invalidateCacheGroup(group: string): Promise<void> {
  try {
    await cacheRedis.incr(versionKey(group));
  } catch (err) {
    if (process.env?.['NODE_ENV'] !== 'test') {
      console.error(
        `[cache] invalidation failed for ${group}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }
}
