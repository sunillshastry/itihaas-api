import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import authenticate from '@/middlewares/authenticate';
import Users from '@/models/Users';

function mockResponse() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
}

function mockRequest(apiKey?: string) {
  return {
    get: (name: string) => (name === 'x-api-key' ? apiKey : undefined),
  } as unknown as Request;
}

async function seedUser(overrides: Record<string, unknown> = {}) {
  return Users.create({
    name: 'Middleware User',
    email: `middleware-${Date.now()}-${Math.random()}@example.com`,
    privacyAgreement: true,
    captcha: 'cap',
    apiKey: `key-${Date.now()}-${Math.random()}`,
    verified: true,
    ...overrides,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('authenticate middleware', () => {
  it('returns 401 when the x-api-key header is absent', async () => {
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    await authenticate(mockRequest(), res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('API key is required'),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when the x-api-key header is only whitespace', async () => {
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    await authenticate(mockRequest('   '), res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when the provided API key does not belong to any user', async () => {
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    await authenticate(mockRequest('key-that-does-not-exist'), res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Invalid API Key' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when the API key belongs to an unverified user', async () => {
    const user = await seedUser({ verified: false });
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    await authenticate(mockRequest(user.apiKey), res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('must verify the API key'),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() for a verified user with a valid API key', async () => {
    const user = await seedUser({ verified: true });
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    await authenticate(mockRequest(user.apiKey), res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('forwards unexpected database errors to next()', async () => {
    vi.spyOn(Users, 'findOne').mockImplementationOnce((() => {
      throw new Error('database unavailable');
    }) as never);

    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    await authenticate(mockRequest('any-key'), res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).not.toHaveBeenCalled();
  });
});
