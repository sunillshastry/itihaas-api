import { beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import app from '@/config/server';
import Users from '@/models/Users';
import { sendEmail } from '@/email';
import generateVerificationToken from '@/utils/generateVerificationToken';

vi.mock('@/services/captchaVerification', () => ({
  default: vi.fn(async (token: string) => {
    if (token === 'captcha-error') throw new Error('captcha service down');
    return token === 'valid-captcha';
  }),
}));

vi.mock('@/email', () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));

const prefix = '/api/v1/users';
const sendEmailMock = vi.mocked(sendEmail);

async function createUser(overrides: Record<string, unknown> = {}) {
  return Users.create({
    name: 'Integration User',
    email: `integration-${Date.now()}-${Math.random()}@example.com`,
    privacyAgreement: true,
    captcha: 'cap',
    apiKey: `key-${Date.now()}-${Math.random()}`,
    verified: false,
    ...overrides,
  });
}

beforeAll(() => {
  process.env['JWT_VERIFICATION_TOKEN_SECRET'] =
    'integration-verification-secret-32-chars';
});

describe('POST /api/v1/users/register', () => {
  it('returns 400 with field errors for an invalid body', async () => {
    const response = await request(app)
      .post(`${prefix}/register`)
      .send({ name: 'A', email: 'not-an-email' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      message: 'Error: Request validation failed or missing attributes',
    });
    expect(Array.isArray(response.body.errors)).toBe(true);
  });

  it('returns 403 when the captcha is rejected', async () => {
    const response = await request(app).post(`${prefix}/register`).send({
      name: 'Rejected Captcha',
      email: 'rejected-captcha@example.com',
      privacyAgreement: true,
      captcha: 'invalid-captcha',
    });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('returns 503 when the captcha service is unavailable', async () => {
    const response = await request(app).post(`${prefix}/register`).send({
      name: 'Captcha Down',
      email: 'captcha-down@example.com',
      privacyAgreement: true,
      captcha: 'captcha-error',
    });

    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      success: false,
      message: 'Google reCAPTCHA verification is temporarily unavailable',
    });
  });

  it('creates an unverified user and queues the verification email', async () => {
    sendEmailMock.mockClear();

    const response = await request(app).post(`${prefix}/register`).send({
      name: 'Registered User',
      email: 'registered@example.com',
      usageReason: 'Research',
      privacyAgreement: true,
      captcha: 'valid-captcha',
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      data: { name: 'Registered User', email: 'registered@example.com' },
      expiration: '15 minutes',
    });

    const user = await Users.findOne({ email: 'registered@example.com' });
    expect(user).not.toBeNull();
    expect(user?.verified).toBe(false);
    expect(user?.apiKey).toBeTruthy();
    expect(user?.apiKey).toHaveLength(100);

    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'registration',
        to: 'registered@example.com',
      }),
    );
  });

  it('returns 400 when the email is already registered', async () => {
    await createUser({ email: 'duplicate@example.com' });

    const response = await request(app).post(`${prefix}/register`).send({
      name: 'Duplicate User',
      email: 'duplicate@example.com',
      privacyAgreement: true,
      captcha: 'valid-captcha',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('already registered');
  });
});

describe('POST /api/v1/users/verify', () => {
  it('returns 400 when the token is missing', async () => {
    const response = await request(app).post(`${prefix}/verify`).send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('returns 401 for an expired or invalid token', async () => {
    const response = await request(app)
      .post(`${prefix}/verify`)
      .send({ token: 'invalid.token.value' });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ success: false, expired: true });
  });

  it('verifies the user and queues the API key email', async () => {
    const user = await createUser({ email: 'to-verify@example.com' });
    const token = generateVerificationToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    });
    sendEmailMock.mockClear();

    const response = await request(app)
      .post(`${prefix}/verify`)
      .send({ token });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const updated = await Users.findById(user._id);
    expect(updated?.verified).toBe(true);
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'verification-success',
        userId: user._id.toString(),
      }),
    );
  });

  it('does not queue a second API key email for an already verified user', async () => {
    const user = await createUser({
      email: 'already-verified@example.com',
      verified: true,
    });
    const token = generateVerificationToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    });
    sendEmailMock.mockClear();

    const response = await request(app)
      .post(`${prefix}/verify`)
      .send({ token });

    expect(response.status).toBe(200);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });
});

describe('POST /api/v1/users/resend', () => {
  it('returns 400 for an invalid email format', async () => {
    const response = await request(app)
      .post(`${prefix}/resend`)
      .send({ email: 'nope' });

    expect(response.status).toBe(400);
  });

  it('returns 403 when the email is not registered', async () => {
    const response = await request(app)
      .post(`${prefix}/resend`)
      .send({ email: 'unknown-resend@example.com' });

    expect(response.status).toBe(403);
  });

  it('returns 400 when the account is already verified', async () => {
    await createUser({
      email: 'verified-resend@example.com',
      verified: true,
    });

    const response = await request(app)
      .post(`${prefix}/resend`)
      .send({ email: 'verified-resend@example.com' });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('already verified');
  });

  it('queues a new verification email for an unverified account', async () => {
    await createUser({ email: 'resend-me@example.com', verified: false });
    sendEmailMock.mockClear();

    const response = await request(app)
      .post(`${prefix}/resend`)
      .send({ email: 'resend-me@example.com' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      expiration: '15 minutes',
    });
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'verification-resend' }),
    );
  });
});

describe('POST /api/v1/users/recover', () => {
  it('returns 400 for an invalid email format', async () => {
    const response = await request(app)
      .post(`${prefix}/recover`)
      .send({ email: 'invalid' });

    expect(response.status).toBe(400);
  });

  it('returns 403 when the email is unknown', async () => {
    const response = await request(app)
      .post(`${prefix}/recover`)
      .send({ email: 'unknown-recover@example.com' });

    expect(response.status).toBe(403);
  });

  it('returns 401 when the account is not verified yet', async () => {
    await createUser({
      email: 'unverified-recover@example.com',
      verified: false,
    });

    const response = await request(app)
      .post(`${prefix}/recover`)
      .send({ email: 'unverified-recover@example.com' });

    expect(response.status).toBe(401);
    expect(response.body.message).toContain('Please verify your account');
  });

  it('queues the API key recovery email for a verified account', async () => {
    const user = await createUser({
      email: 'verified-recover@example.com',
      verified: true,
    });
    sendEmailMock.mockClear();

    const response = await request(app)
      .post(`${prefix}/recover`)
      .send({ email: 'verified-recover@example.com' });

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('check your email');
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'api-key-recovery',
        userId: user._id.toString(),
      }),
    );
  });
});
