import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { cacheRedis } from '@/cache/config';
import { cacheAside, invalidateCacheGroup } from '@/cache/redis';

vi.mock('@/cache/config', () => ({
  cacheRedis: {
    get: vi.fn(),
    set: vi.fn(),
    incr: vi.fn(),
  },
}));

type RedisMock = { get: Mock; set: Mock; incr: Mock };

const redis = cacheRedis as unknown as RedisMock;

beforeEach(() => {
  redis.get.mockReset();
  redis.set.mockReset();
  redis.incr.mockReset();
});

describe('cacheAside', () => {
  it('returns the cached value without calling the loader on a cache hit', async () => {
    redis.get
      .mockResolvedValueOnce('3') // group version
      .mockResolvedValueOnce(JSON.stringify({ value: 'cached' }));

    const loader = vi.fn(async () => ({ value: 'fresh' }));
    const result = await cacheAside('rulers', 'slug:asoka', 60, loader);

    expect(result).toEqual({ value: 'cached' });
    expect(loader).not.toHaveBeenCalled();
    expect(redis.get).toHaveBeenNthCalledWith(1, 'itihaas:test:version:rulers');
    expect(redis.get).toHaveBeenNthCalledWith(
      2,
      'itihaas:test:rulers:v3:slug:asoka',
    );
  });

  it('loads from the source and caches the result on a cache miss', async () => {
    redis.get.mockResolvedValue(null);
    redis.set.mockResolvedValue('OK');

    const value = { rulers: ['a', 'b'] };
    const loader = vi.fn(async () => value);

    const result = await cacheAside('rulers', 'list', 30, loader);

    expect(result).toEqual(value);
    expect(loader).toHaveBeenCalledTimes(1);
    expect(redis.set).toHaveBeenCalledWith(
      'itihaas:test:rulers:v0:list',
      JSON.stringify(value),
      'EX',
      30,
    );
  });

  it('does not cache null or undefined results', async () => {
    redis.get.mockResolvedValue(null);

    await expect(cacheAside('wars', 'missing', 30, async () => null)).resolves.toBeNull();
    await expect(
      cacheAside('wars', 'missing', 30, async () => undefined),
    ).resolves.toBeUndefined();

    expect(redis.set).not.toHaveBeenCalled();
  });

  it('falls back to the loader when Redis reads fail', async () => {
    redis.get.mockRejectedValue(new Error('redis down'));

    const loader = vi.fn(async () => ({ fallback: true }));
    await expect(cacheAside('wars', 'key', 30, loader)).resolves.toEqual({
      fallback: true,
    });
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('does not write a stale result if the group was invalidated mid-flight', async () => {
    redis.get
      .mockResolvedValueOnce('0') // initial version read
      .mockResolvedValueOnce(null) // cache miss
      .mockResolvedValueOnce('1'); // version changed while loading

    const loader = vi.fn(async () => ({ fresh: true }));
    const result = await cacheAside('dynasties', 'key', 30, loader);

    expect(result).toEqual({ fresh: true });
    expect(redis.set).not.toHaveBeenCalled();
  });

  it('still returns the loaded value when the cache write fails', async () => {
    redis.get.mockResolvedValue(null);
    redis.set.mockRejectedValue(new Error('write failed'));

    await expect(
      cacheAside('dynasties', 'key', 30, async () => ({ ok: true })),
    ).resolves.toEqual({ ok: true });
  });

  it('propagates loader failures instead of swallowing them', async () => {
    redis.get.mockResolvedValue(null);

    await expect(
      cacheAside('dynasties', 'key', 30, async () => {
        throw new Error('source unavailable');
      }),
    ).rejects.toThrow('source unavailable');
  });
});

describe('invalidateCacheGroup', () => {
  it('increments the group version key', async () => {
    redis.incr.mockResolvedValue(1);

    await invalidateCacheGroup('rulers');

    expect(redis.incr).toHaveBeenCalledWith('itihaas:test:version:rulers');
  });

  it('swallows Redis failures so requests keep working', async () => {
    redis.incr.mockRejectedValue(new Error('redis down'));

    await expect(invalidateCacheGroup('rulers')).resolves.toBeUndefined();
  });
});
