import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import generateVerificationToken from '@/utils/generateVerificationToken';

describe('generateVerificationToken utility', () => {
  const originalEnv = { ...process.env };
  const mockSecret = 'unit-test-verification-secret-32-chars-long';
  const validPayload = {
    id: 'user-12345',
    name: 'Test Historian',
    email: 'historian@example.com',
  };

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env['JWT_VERIFICATION_TOKEN_SECRET'] = mockSecret;
    delete process.env['JWT_VERIFICATION_TOKEN_DURATION'];
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('successful token generation', () => {
    it('returns a non-null valid JWT string with valid payload and secret', () => {
      const token = generateVerificationToken(validPayload);
      expect(token).not.toBeNull();
      expect(typeof token).toBe('string');
      expect(token?.split('.')).toHaveLength(3);
    });

    it('embeds the provided payload fields into the generated token', () => {
      const token = generateVerificationToken(validPayload);
      expect(token).not.toBeNull();

      const decoded = jwt.decode(token!) as Record<string, unknown>;
      expect(decoded['id']).toBe(validPayload.id);
      expect(decoded['name']).toBe(validPayload.name);
      expect(decoded['email']).toBe(validPayload.email);
    });

    it('verifies successfully with the corresponding secret key', () => {
      const token = generateVerificationToken(validPayload);
      expect(token).not.toBeNull();

      const verified = jwt.verify(token!, mockSecret) as Record<
        string,
        unknown
      >;
      expect(verified['id']).toBe(validPayload.id);
      expect(verified['name']).toBe(validPayload.name);
      expect(verified['email']).toBe(validPayload.email);
    });
  });

  describe('token expiration duration', () => {
    it('applies default expiration of 15 minutes when duration env var is not set', () => {
      delete process.env['JWT_VERIFICATION_TOKEN_DURATION'];
      const token = generateVerificationToken(validPayload);
      expect(token).not.toBeNull();

      const decoded = jwt.decode(token!) as { iat: number; exp: number };
      expect(decoded.exp - decoded.iat).toBe(15 * 60);
    });

    it('respects a custom duration when set in environment variable', () => {
      process.env['JWT_VERIFICATION_TOKEN_DURATION'] = '1h';
      const token = generateVerificationToken(validPayload);
      expect(token).not.toBeNull();

      const decoded = jwt.decode(token!) as { iat: number; exp: number };
      expect(decoded.exp - decoded.iat).toBe(60 * 60);
    });

    it('respects a longer custom duration such as 7 days', () => {
      process.env['JWT_VERIFICATION_TOKEN_DURATION'] = '7d';
      const token = generateVerificationToken(validPayload);
      expect(token).not.toBeNull();

      const decoded = jwt.decode(token!) as { iat: number; exp: number };
      expect(decoded.exp - decoded.iat).toBe(7 * 24 * 60 * 60);
    });
  });

  describe('error handling and boundary conditions', () => {
    it('returns null when JWT_VERIFICATION_TOKEN_SECRET is missing', () => {
      delete process.env['JWT_VERIFICATION_TOKEN_SECRET'];
      const token = generateVerificationToken(validPayload);
      expect(token).toBeNull();
    });

    it('returns null when an invalid duration format is provided', () => {
      process.env['JWT_VERIFICATION_TOKEN_DURATION'] =
        'invalid_format_duration';
      const token = generateVerificationToken(validPayload);
      expect(token).toBeNull();
    });

    it('handles empty string fields in payload without error', () => {
      const emptyPayload = { id: '', name: '', email: '' };
      const token = generateVerificationToken(emptyPayload);
      expect(token).not.toBeNull();

      const decoded = jwt.decode(token!) as Record<string, unknown>;
      expect(decoded['id']).toBe('');
      expect(decoded['name']).toBe('');
      expect(decoded['email']).toBe('');
    });

    it('handles Unicode characters in payload name and email', () => {
      const unicodePayload = {
        id: 'usr-999',
        name: 'अशोक मौर्य (Ashoka the Great)',
        email: 'ashoka+ancient@itihaas.org',
      };
      const token = generateVerificationToken(unicodePayload);
      expect(token).not.toBeNull();

      const decoded = jwt.decode(token!) as Record<string, unknown>;
      expect(decoded['name']).toBe(unicodePayload.name);
      expect(decoded['email']).toBe(unicodePayload.email);
    });
  });
});
