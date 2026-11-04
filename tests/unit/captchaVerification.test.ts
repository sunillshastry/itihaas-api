import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import verifyCaptcha from '@/services/captchaVerification';

const fetchMock = vi.fn();

beforeEach(() => {
  process.env['RECAPTCHA_V2_SECRET_KEY'] = 'unit-test-recaptcha-secret';
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe('verifyCaptcha service', () => {
  it('throws when the reCAPTCHA secret key is not configured', async () => {
    delete process.env['RECAPTCHA_V2_SECRET_KEY'];

    await expect(verifyCaptcha('any-token')).rejects.toThrow(
      'ReCaptcha secret key not found in env',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts the secret and token to Google and returns true on success', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, hostname: 'localhost' }),
    });

    await expect(verifyCaptcha('valid-token')).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [
      string,
      RequestInit & { body: URLSearchParams },
    ];

    expect(url).toBe('https://www.google.com/recaptcha/api/siteverify');
    expect(options.method).toBe('POST');
    expect(options.body.get('secret')).toBe('unit-test-recaptcha-secret');
    expect(options.body.get('response')).toBe('valid-token');
  });

  it('returns false when Google reports the token as invalid', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, 'error-codes': ['invalid-input-response'] }),
    });

    await expect(verifyCaptcha('bad-token')).resolves.toBe(false);
  });

  it('returns false when Google omits the success flag', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    await expect(verifyCaptcha('ambiguous-token')).resolves.toBe(false);
  });

  it('throws when the Google verification request fails', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(verifyCaptcha('any-token')).rejects.toThrow(
      'Google reCAPTCHA verification request failed',
    );
  });

  it('propagates network failures from fetch', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    await expect(verifyCaptcha('any-token')).rejects.toThrow('network down');
  });
});
