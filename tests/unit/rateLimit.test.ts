import express, { type Express } from 'express';
import request from 'supertest';
import type { Store } from 'express-rate-limit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  apiKeyFingerprint,
  createTier,
  hasWellFormedApiKey,
  resetRateLimits,
  type TierDefinition,
} from '@/middlewares/rateLimit';

let sequence = 0;

function nextName(prefix: string): string {
  sequence += 1;
  return `${prefix}-${sequence}`;
}

function buildApp(tier: Omit<TierDefinition, 'name'>): Express {
  const app = express();

  app.use(
    ...createTier({
      ...tier,
      name: nextName('unit'),
    }),
  );

  app.get('/', (_request, response) => {
    response.status(200).json({ ok: true });
  });

  return app;
}

afterEach(async () => {
  await resetRateLimits();
});

describe('rate limit tiers', () => {
  it('allows requests under the budget and blocks the request over it', async () => {
    const app = buildApp({
      perMinute: 2,
      perDay: 100,
      storeFactory: () => undefined,
    });

    await expect(request(app).get('/')).resolves.toMatchObject({ status: 200 });
    await expect(request(app).get('/')).resolves.toMatchObject({ status: 200 });

    const blocked = await request(app).get('/');

    expect(blocked.status).toBe(429);
    expect(blocked.body).toMatchObject({
      success: false,
      message: expect.any(String),
      retryAfter: expect.any(Number),
    });
    expect(Number(blocked.headers['retry-after'])).toBeGreaterThan(0);
    expect(blocked.headers['ratelimit']).toBeDefined();
    expect(blocked.headers['ratelimit-policy']).toBeDefined();
  });

  it('enforces the daily budget even when the minute budget allows', async () => {
    const app = buildApp({
      perMinute: 100,
      perDay: 2,
      storeFactory: () => undefined,
    });

    await expect(request(app).get('/')).resolves.toMatchObject({ status: 200 });
    await expect(request(app).get('/')).resolves.toMatchObject({ status: 200 });

    const blocked = await request(app).get('/');

    expect(blocked.status).toBe(429);
    expect(blocked.body.success).toBe(false);
  });

  it('starts a fresh window once the previous one elapses', async () => {
    const app = buildApp({
      perMinute: 1,
      perDay: 100,
      minuteWindowMs: 100,
      storeFactory: () => undefined,
    });

    await expect(request(app).get('/')).resolves.toMatchObject({ status: 200 });
    await expect(request(app).get('/')).resolves.toMatchObject({ status: 429 });

    await new Promise((resolve) => {
      setTimeout(resolve, 150);
    });

    await expect(request(app).get('/')).resolves.toMatchObject({ status: 200 });
  });

  it('does not count CORS preflight requests', async () => {
    const app = buildApp({
      perMinute: 1,
      perDay: 100,
      storeFactory: () => undefined,
    });

    const first = await request(app).options('/');
    const second = await request(app).options('/');

    expect(first.status).not.toBe(429);
    expect(second.status).not.toBe(429);
    await expect(request(app).get('/')).resolves.toMatchObject({ status: 200 });
  });

  it('isolates clients through the configured key generator', async () => {
    const app = buildApp({
      perMinute: 1,
      perDay: 100,
      keyGenerator: (incoming) => incoming.get('x-client') ?? 'unknown',
      storeFactory: () => undefined,
    });

    await expect(
      request(app).get('/').set('x-client', 'alpha'),
    ).resolves.toMatchObject({ status: 200 });
    await expect(
      request(app).get('/').set('x-client', 'alpha'),
    ).resolves.toMatchObject({ status: 429 });
    await expect(
      request(app).get('/').set('x-client', 'beta'),
    ).resolves.toMatchObject({ status: 200 });
  });

  it('skips the tier when the skip predicate matches', async () => {
    const app = buildApp({
      perMinute: 1,
      perDay: 100,
      skip: (incoming) => incoming.get('x-skip') === '1',
      storeFactory: () => undefined,
    });

    await expect(
      request(app).get('/').set('x-skip', '1'),
    ).resolves.toMatchObject({ status: 200 });
    await expect(
      request(app).get('/').set('x-skip', '1'),
    ).resolves.toMatchObject({ status: 200 });
  });

  it('fails open when the store throws', async () => {
    const failingStore = {
      init: () => undefined,
      increment: async () => {
        throw new Error('redis unavailable');
      },
      decrement: async () => undefined,
      resetKey: async () => undefined,
      resetAll: async () => undefined,
    } as unknown as Store;
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const app = buildApp({
      perMinute: 1,
      perDay: 1,
      storeFactory: () => failingStore,
    });

    await expect(request(app).get('/')).resolves.toMatchObject({ status: 200 });
    await expect(request(app).get('/')).resolves.toMatchObject({ status: 200 });

    errorSpy.mockRestore();
  });
});

describe('API key classification', () => {
  const probe = express();

  probe.get('/probe', (incoming, response) => {
    response.status(200).json({
      wellFormed: hasWellFormedApiKey(incoming),
      fingerprint: apiKeyFingerprint(incoming),
    });
  });

  it('accepts a 100 character hex key', async () => {
    const response = await request(probe)
      .get('/probe')
      .set('x-api-key', 'a'.repeat(100));

    expect(response.body).toMatchObject({ wellFormed: true });
    expect(response.body.fingerprint).toMatch(/^key:[a-f0-9]{64}$/);
  });

  it('rejects missing, short and non-hex keys', async () => {
    const missing = await request(probe).get('/probe');
    const short = await request(probe).get('/probe').set('x-api-key', 'abc');
    const nonHex = await request(probe)
      .get('/probe')
      .set('x-api-key', 'z'.repeat(100));

    expect(missing.body.wellFormed).toBe(false);
    expect(short.body.wellFormed).toBe(false);
    expect(nonHex.body.wellFormed).toBe(false);
  });

  it('hashes keys deterministically without exposing them', async () => {
    const first = await request(probe)
      .get('/probe')
      .set('x-api-key', 'b'.repeat(100));
    const same = await request(probe)
      .get('/probe')
      .set('x-api-key', 'b'.repeat(100));
    const other = await request(probe)
      .get('/probe')
      .set('x-api-key', 'c'.repeat(100));

    expect(first.body.fingerprint).toBe(same.body.fingerprint);
    expect(first.body.fingerprint).not.toBe(other.body.fingerprint);
    expect(first.body.fingerprint).not.toContain('b'.repeat(100));
  });
});
