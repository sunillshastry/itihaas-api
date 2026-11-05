import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

// Must be set before the application modules (and their config) are loaded.
vi.hoisted(() => {
  process.env['RATE_LIMIT_ENABLED'] = 'true';
  process.env['RATE_LIMIT_STORE'] = 'memory';
  process.env['RATE_LIMIT_TRUST_PROXY'] = '0';
  process.env['RATE_LIMIT_ANON_PER_MINUTE'] = '5';
  process.env['RATE_LIMIT_USERS_PER_MINUTE'] = '3';
  process.env['RATE_LIMIT_APIKEY_PER_MINUTE'] = '4';
});

import app from '@/config/server';
import { resetRateLimits } from '@/middlewares/rateLimit';

const validKey = 'a'.repeat(100);
const malformedKey = 'not-a-real-api-key';

beforeEach(async () => {
  await resetRateLimits();
});

async function hit(path: string, times: number, apiKey?: string) {
  const responses = [];

  for (let index = 0; index < times; index += 1) {
    const call = request(app).get(path);

    if (apiKey) {
      call.set('x-api-key', apiKey);
    }

    responses.push(await call);
  }

  return responses;
}

describe('anonymous tier', () => {
  it('blocks the request over the per-IP minute budget', async () => {
    const allowed = await hit('/', 5);
    const blocked = await request(app).get('/');

    expect(allowed.every((response) => response.status === 200)).toBe(true);
    expect(blocked.status).toBe(429);
    expect(blocked.body).toMatchObject({
      success: false,
      retryAfter: expect.any(Number),
    });
    expect(blocked.headers['ratelimit-policy']).toBeDefined();
    expect(blocked.headers['retry-after']).toBeDefined();
  });
});

describe('users tier', () => {
  it('blocks account endpoints sooner than the anonymous tier', async () => {
    const allowed = [];

    for (let index = 0; index < 3; index += 1) {
      allowed.push(await request(app).post('/api/v1/users/verify').send({}));
    }

    const blocked = await request(app).post('/api/v1/users/verify').send({});

    expect(allowed.every((response) => response.status === 400)).toBe(true);
    expect(blocked.status).toBe(429);
    expect(blocked.body.success).toBe(false);
  });
});

describe('exempt endpoints', () => {
  it('never rate limits health, version or info', async () => {
    const responses = await hit('/api/version', 10);

    expect(responses.every((response) => response.status === 200)).toBe(true);
  });
});

describe('api key tier', () => {
  it('uses a per-key budget on entity routes', async () => {
    const allowed = await hit('/api/v1/rulers', 4, validKey);
    const blocked = await request(app)
      .get('/api/v1/rulers')
      .set('x-api-key', validKey);

    expect(allowed.every((response) => response.status === 200)).toBe(true);
    expect(blocked.status).toBe(429);
  });

  it('counts malformed keys against the anonymous budget, not the key budget', async () => {
    const allowed = await hit('/api/v1/rulers', 5, malformedKey);
    const blocked = await request(app)
      .get('/api/v1/rulers')
      .set('x-api-key', malformedKey);

    expect(allowed.every((response) => response.status === 200)).toBe(true);
    expect(blocked.status).toBe(429);

    // The key tier was never touched, so a valid key still has its full budget.
    const withValidKey = await request(app)
      .get('/api/v1/rulers')
      .set('x-api-key', validKey);

    expect(withValidKey.status).toBe(200);
  });
});
