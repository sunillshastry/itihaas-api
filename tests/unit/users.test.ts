import { describe, expect, it, vi } from 'vitest';
import Users from '@/models/Users';
import apiKeyRegistration from '@/controllers/users/apiKeyRegistration';
import apiKeyVerification from '@/controllers/users/apiKeyVerification';
import apiKeyEmailResend from '@/controllers/users/apiKeyEmailResend';
import apiKeyRecovery from '@/controllers/users/apiKeyRecovery';
import generateVerificationToken from '@/utils/generateVerificationToken';
import { Request, Response } from 'express';

vi.mock('@/services/captchaVerification', () => ({
  default: vi.fn(async (token: string) => {
    if (token === 'throw-captcha') throw new Error('Captcha service error');
    return token === 'valid-captcha';
  }),
}));

vi.mock('@/email', () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));

function mockResponse() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
}

describe('Users unit tests', () => {
  describe('User model', () => {
    it('requires name, email, privacyAgreement, captcha, and apiKey', () => {
      const user = new Users({});
      const errors = user.validateSync()?.errors;

      expect(errors?.['name']).toBeDefined();
      expect(errors?.['email']).toBeDefined();
      expect(errors?.['privacyAgreement']).toBeDefined();
      expect(errors?.['captcha']).toBeDefined();
      expect(errors?.['apiKey']).toBeDefined();
    });

    it('accepts a valid user document', () => {
      const user = new Users({
        name: 'Unit Test User',
        email: 'unit@example.com',
        usageReason: 'Academic research',
        privacyAgreement: true,
        captcha: 'test-captcha',
        apiKey: 'test-api-key-12345',
        verified: false,
      });

      expect(user.validateSync()).toBeUndefined();
    });

    it('lowercases and trims email addresses', () => {
      const user = new Users({
        name: 'Trim User',
        email: '  TEST.USER@Example.COM  ',
        privacyAgreement: true,
        captcha: 'test-captcha',
        apiKey: 'key-trim-123',
      });

      expect(user.email).toBe('test.user@example.com');
    });

    it('declares email and apiKey as unique indexes in schema', () => {
      expect(Users.schema.path('email')?.options?.['unique']).toBe(true);
      expect(Users.schema.path('apiKey')?.options?.['unique']).toBe(true);
    });
  });

  describe('apiKeyRegistration controller', () => {
    it('returns 400 when request body fails Zod validation', async () => {
      const req = { body: { name: 'A' } } as Request;
      const res = mockResponse();

      await apiKeyRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Error: Request validation failed or missing attributes',
        }),
      );
    });

    it('returns 400 when email is already registered', async () => {
      await Users.create({
        name: 'Existing User',
        email: 'existing@example.com',
        privacyAgreement: true,
        captcha: 'cap',
        apiKey: 'key-existing',
      });

      const req = {
        body: {
          name: 'New Name',
          email: 'existing@example.com',
          privacyAgreement: true,
          captcha: 'valid-captcha',
        },
      } as Request;
      const res = mockResponse();

      await apiKeyRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('already registered'),
        }),
      );
    });

    it('returns 403 when captcha verification fails', async () => {
      const req = {
        body: {
          name: 'Valid Name',
          email: 'newuser@example.com',
          privacyAgreement: true,
          captcha: 'invalid-captcha',
        },
      } as Request;
      const res = mockResponse();

      await apiKeyRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Error: Google reCAPTCHA verification failed',
        }),
      );
    });

    it('returns 503 when captcha verification service throws an error', async () => {
      const req = {
        body: {
          name: 'Valid Name',
          email: 'service-fail@example.com',
          privacyAgreement: true,
          captcha: 'throw-captcha',
        },
      } as Request;
      const res = mockResponse();

      await apiKeyRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Google reCAPTCHA verification is temporarily unavailable',
        }),
      );
    });

    it('returns 201 and creates a user with verified=false on success', async () => {
      const req = {
        body: {
          name: 'Fresh User',
          email: 'fresh@example.com',
          usageReason: 'Learning',
          privacyAgreement: true,
          captcha: 'valid-captcha',
        },
      } as Request;
      const res = mockResponse();

      await apiKeyRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { name: 'Fresh User', email: 'fresh@example.com' },
          expiration: '15 minutes',
        }),
      );

      const created = await Users.findOne({ email: 'fresh@example.com' });
      expect(created).not.toBeNull();
      expect(created?.verified).toBe(false);
      expect(created?.apiKey).toBeDefined();
    });
  });

  describe('apiKeyVerification controller', () => {
    it('returns 400 when token is missing from request body', async () => {
      const req = { body: {} } as Request;
      const res = mockResponse();

      await apiKeyVerification(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Error: Request validation failed or missing attributes',
        }),
      );
    });

    it('returns 401 when token is invalid or expired', async () => {
      const req = { body: { token: 'invalid.token.here' } } as Request;
      const res = mockResponse();

      await apiKeyVerification(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          expired: true,
        }),
      );
    });

    it('returns 200 and sets verified to true for a valid token', async () => {
      const user = await Users.create({
        name: 'Unverified User',
        email: 'unverified@example.com',
        privacyAgreement: true,
        captcha: 'cap',
        apiKey: 'key-unverified',
        verified: false,
      });

      const token = generateVerificationToken({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      });

      const req = { body: { token } } as Request;
      const res = mockResponse();

      await apiKeyVerification(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('API key was verified'),
        }),
      );

      const updated = await Users.findById(user._id);
      expect(updated?.verified).toBe(true);
    });
  });

  describe('apiKeyEmailResend controller', () => {
    it('returns 400 when email format is invalid', async () => {
      const req = { body: { email: 'not-an-email' } } as Request;
      const res = mockResponse();

      await apiKeyEmailResend(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 403 when email is not registered', async () => {
      const req = { body: { email: 'unregistered@example.com' } } as Request;
      const res = mockResponse();

      await apiKeyEmailResend(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('not registered'),
        }),
      );
    });

    it('returns 400 when user is already verified', async () => {
      await Users.create({
        name: 'Already Verified',
        email: 'already@example.com',
        privacyAgreement: true,
        captcha: 'cap',
        apiKey: 'key-already',
        verified: true,
      });

      const req = { body: { email: 'already@example.com' } } as Request;
      const res = mockResponse();

      await apiKeyEmailResend(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('already verified'),
        }),
      );
    });

    it('returns 200 when unverified user requests resend', async () => {
      await Users.create({
        name: 'Resend User',
        email: 'resend@example.com',
        privacyAgreement: true,
        captcha: 'cap',
        apiKey: 'key-resend',
        verified: false,
      });

      const req = { body: { email: 'resend@example.com' } } as Request;
      const res = mockResponse();

      await apiKeyEmailResend(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          expiration: '15 minutes',
        }),
      );
    });
  });

  describe('apiKeyRecovery controller', () => {
    it('returns 400 when email format is invalid', async () => {
      const req = { body: { email: 'invalid-email' } } as Request;
      const res = mockResponse();

      await apiKeyRecovery(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 403 when email does not exist in database', async () => {
      const req = { body: { email: 'nobody@example.com' } } as Request;
      const res = mockResponse();

      await apiKeyRecovery(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('forbidden'),
        }),
      );
    });

    it('returns 401 when account is registered but not verified yet', async () => {
      await Users.create({
        name: 'Unverified Recovery',
        email: 'unverified-recover@example.com',
        privacyAgreement: true,
        captcha: 'cap',
        apiKey: 'key-unverified-rec',
        verified: false,
      });

      const req = { body: { email: 'unverified-recover@example.com' } } as Request;
      const res = mockResponse();

      await apiKeyRecovery(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Please verify your account'),
        }),
      );
    });

    it('returns 200 when verified user requests recovery', async () => {
      await Users.create({
        name: 'Verified Recovery',
        email: 'verified-recover@example.com',
        privacyAgreement: true,
        captcha: 'cap',
        apiKey: 'key-verified-rec',
        verified: true,
      });

      const req = { body: { email: 'verified-recover@example.com' } } as Request;
      const res = mockResponse();

      await apiKeyRecovery(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Success: Please check your email',
        }),
      );
    });
  });
});
