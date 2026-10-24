import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import verifyTokenValidation from '@/utils/verifyTokenValidation';
import generateVerificationToken from '@/utils/generateVerificationToken';

describe('verifyTokenValidation utility', () => {
  const originalEnv = { ...process.env };
  const mockSecret = 'unit-test-verification-secret-32-chars-long';
  const samplePayload = {
    id: 'user-valid-001',
    name: 'Chandragupta',
    email: 'chandragupta@itihaas.org',
  };

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env['JWT_VERIFICATION_TOKEN_SECRET'] = mockSecret;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('successful token verification', () => {
    it('verifies and decodes a valid token signed with the matching secret', async () => {
      const token = jwt.sign(samplePayload, mockSecret, { expiresIn: '15m' });
      const decoded = await verifyTokenValidation(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.id).toBe(samplePayload.id);
      expect(decoded?.name).toBe(samplePayload.name);
      expect(decoded?.email).toBe(samplePayload.email);
    });

    it('works seamlessly in round-trip with generateVerificationToken', async () => {
      const token = generateVerificationToken(samplePayload);
      expect(token).not.toBeNull();

      const decoded = await verifyTokenValidation(token!);
      expect(decoded).not.toBeNull();
      expect(decoded?.id).toBe(samplePayload.id);
      expect(decoded?.name).toBe(samplePayload.name);
      expect(decoded?.email).toBe(samplePayload.email);
    });

    it('preserves payload with unicode characters', async () => {
      const unicodePayload = {
        id: 'usr-unicode-002',
        name: 'छत्रपति शिवाजी',
        email: 'shivaji@itihaas.dev',
      };
      const token = jwt.sign(unicodePayload, mockSecret, { expiresIn: '15m' });
      const decoded = await verifyTokenValidation(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.name).toBe(unicodePayload.name);
      expect(decoded?.email).toBe(unicodePayload.email);
    });
  });

  describe('failure scenarios', () => {
    it('returns null when token has expired', async () => {
      const expiredToken = jwt.sign(samplePayload, mockSecret, {
        expiresIn: -10, // Expired in the past
      });

      const decoded = await verifyTokenValidation(expiredToken);
      expect(decoded).toBeNull();
    });

    it('returns null when token was signed with a different secret', async () => {
      const tokenWithOtherSecret = jwt.sign(
        samplePayload,
        'completely-different-secret-key',
        {
          expiresIn: '15m',
        },
      );

      const decoded = await verifyTokenValidation(tokenWithOtherSecret);
      expect(decoded).toBeNull();
    });

    it('returns null for an arbitrary malformed string', async () => {
      expect(await verifyTokenValidation('invalid.token.string')).toBeNull();
      expect(await verifyTokenValidation('not-a-token')).toBeNull();
      expect(
        await verifyTokenValidation('ey1234.invalid.signature'),
      ).toBeNull();
    });

    it('returns null for an empty string or whitespace', async () => {
      expect(await verifyTokenValidation('')).toBeNull();
      expect(await verifyTokenValidation('   ')).toBeNull();
      expect(await verifyTokenValidation('\t\n')).toBeNull();
    });

    it('returns null when token signature has been tampered with', async () => {
      const validToken = jwt.sign(samplePayload, mockSecret, {
        expiresIn: '15m',
      });
      const parts = validToken.split('.');
      // Tamper with the signature portion
      const tamperedToken = `${parts[0]}.${parts[1]}.tamperedSignatureHere`;

      const decoded = await verifyTokenValidation(tamperedToken);
      expect(decoded).toBeNull();
    });

    it('returns null when token payload has been tampered with', async () => {
      const validToken = jwt.sign(samplePayload, mockSecret, {
        expiresIn: '15m',
      });
      const parts = validToken.split('.');
      const alteredPayload = Buffer.from(
        JSON.stringify({ ...samplePayload, id: 'hacked-id' }),
      ).toString('base64url');
      const tamperedToken = `${parts[0]}.${alteredPayload}.${parts[2]}`;

      const decoded = await verifyTokenValidation(tamperedToken);
      expect(decoded).toBeNull();
    });

    it('returns null when JWT_VERIFICATION_TOKEN_SECRET is missing or empty', async () => {
      const validToken = jwt.sign(samplePayload, mockSecret, {
        expiresIn: '15m',
      });
      delete process.env['JWT_VERIFICATION_TOKEN_SECRET'];

      const decoded = await verifyTokenValidation(validToken);
      expect(decoded).toBeNull();
    });
  });
});
