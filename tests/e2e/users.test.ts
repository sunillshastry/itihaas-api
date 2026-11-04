import { beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import app from '@/config/server';
import Users from '@/models/Users';
import { sendEmail } from '@/email';

vi.mock('@/services/captchaVerification', () => ({
  default: vi.fn(async (token: string) => token === 'valid-captcha'),
}));

vi.mock('@/email', () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));

const prefix = '/api/v1/users';
const sendEmailMock = vi.mocked(sendEmail);

beforeAll(() => {
  process.env['JWT_VERIFICATION_TOKEN_SECRET'] =
    'e2e-verification-secret-32-characters';
});

describe('User API end-to-end lifecycle', () => {
  it('registers, verifies, and recovers an account through the public API', async () => {
    sendEmailMock.mockClear();

    // 1. Register
    const registration = await request(app).post(`${prefix}/register`).send({
      name: 'E2E User',
      email: 'e2e-user@example.com',
      usageReason: 'E2E testing',
      privacyAgreement: true,
      captcha: 'valid-captcha',
    });

    expect(registration.status).toBe(201);
    expect(registration.body.success).toBe(true);

    const created = await Users.findOne({ email: 'e2e-user@example.com' });
    expect(created).not.toBeNull();
    expect(created?.verified).toBe(false);

    // The registration email carries the verification link with the token
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    const registrationJob = sendEmailMock.mock.calls[0]![0];
    expect(registrationJob.type).toBe('registration');

    const link = (registrationJob as { link: string }).link;
    const token = link.split('/').pop() as string;
    expect(token).toBeTruthy();

    // 2. Verify with the token extracted from the emailed link
    const verification = await request(app)
      .post(`${prefix}/verify`)
      .send({ token });

    expect(verification.status).toBe(200);
    expect(verification.body.message).toContain('API key was verified');

    const verified = await Users.findOne({ email: 'e2e-user@example.com' });
    expect(verified?.verified).toBe(true);

    const successJob = sendEmailMock.mock.calls.find(
      ([job]) => job.type === 'verification-success',
    );
    expect(successJob).toBeDefined();
    expect((successJob![0] as { userId: string }).userId).toBe(
      verified!._id.toString(),
    );

    // 3. Recover the API key
    sendEmailMock.mockClear();
    const recovery = await request(app)
      .post(`${prefix}/recover`)
      .send({ email: 'e2e-user@example.com' });

    expect(recovery.status).toBe(200);
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'api-key-recovery' }),
    );

    // 4. Registering the same email again is rejected
    const duplicate = await request(app).post(`${prefix}/register`).send({
      name: 'E2E User Again',
      email: 'e2e-user@example.com',
      privacyAgreement: true,
      captcha: 'valid-captcha',
    });

    expect(duplicate.status).toBe(400);
  });

  it('rejects verification with a token signed for another secret', async () => {
    const response = await request(app)
      .post(`${prefix}/verify`)
      .send({ token: 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6ImZha2UifQ.invalid' });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ success: false, expired: true });
  });

  it('allows resending verification before the account is verified', async () => {
    await Users.create({
      name: 'E2E Resend',
      email: 'e2e-resend@example.com',
      privacyAgreement: true,
      captcha: 'cap',
      apiKey: 'e2e-resend-key',
      verified: false,
    });

    sendEmailMock.mockClear();
    const resend = await request(app)
      .post(`${prefix}/resend`)
      .send({ email: 'e2e-resend@example.com' });

    expect(resend.status).toBe(200);
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'verification-resend' }),
    );

    const recoverUnverified = await request(app)
      .post(`${prefix}/recover`)
      .send({ email: 'e2e-resend@example.com' });

    expect(recoverUnverified.status).toBe(401);
  });
});
