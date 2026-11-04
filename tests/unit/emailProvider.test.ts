import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UnrecoverableError } from 'bullmq';

const sendMock = vi.hoisted(() => vi.fn());

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

const mail = {
  to: 'asoka@example.com',
  subject: 'Subject',
  html: '<p>Body</p>',
  text: 'Body',
  idempotencyKey: 'email-1',
};

const originalEnv = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  sendMock.mockReset();
  process.env = { ...originalEnv };
  process.env['NODE_ENV'] = 'test';
});

afterEach(() => {
  process.env = { ...originalEnv };
});

type ProviderModule = {
  deliver: (mail: {
    to: string;
    subject: string;
    html: string;
    text: string;
    idempotencyKey: string;
  }) => Promise<void>;
};

// The driver is resolved when the module is first imported, so each test
// re-imports it after setting the environment it needs. The specifier is cast
// so tsc does not demand a file extension under nodenext resolution.
async function loadDeliver() {
  const provider = (await import(
    '../../email/provider' as string
  )) as ProviderModule;
  return provider.deliver;
}

describe('deliver (email provider)', () => {
  it('logs the email instead of sending when the log driver is active', async () => {
    process.env['EMAIL_DRIVER'] = 'log';
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    const deliver = await loadDeliver();
    await deliver(mail);

    expect(sendMock).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[email:log]'));

    logSpy.mockRestore();
  });

  it('sends through Resend when the resend driver is active', async () => {
    process.env['EMAIL_DRIVER'] = 'resend';
    sendMock.mockResolvedValue({ error: null });

    const deliver = await loadDeliver();
    await expect(deliver(mail)).resolves.toBeUndefined();

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: mail.to,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      }),
      { idempotencyKey: mail.idempotencyKey },
    );
  });

  it('uses the resend driver automatically in production', async () => {
    process.env['NODE_ENV'] = 'production';
    process.env['RESEND_EMAIL_API_KEY'] = 're_test_key';
    sendMock.mockResolvedValue({ error: null });

    const deliver = await loadDeliver();
    await deliver(mail);

    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it('throws UnrecoverableError for permanent 4xx failures', async () => {
    process.env['EMAIL_DRIVER'] = 'resend';
    sendMock.mockResolvedValue({
      error: {
        name: 'validation_error',
        message: 'Invalid recipient',
        statusCode: 422,
      },
    });

    const deliver = await loadDeliver();

    await expect(deliver(mail)).rejects.toBeInstanceOf(UnrecoverableError);
  });

  it('throws a retryable error for rate limiting (429)', async () => {
    process.env['EMAIL_DRIVER'] = 'resend';
    sendMock.mockResolvedValue({
      error: { name: 'rate_limit', message: 'Too many', statusCode: 429 },
    });

    const deliver = await loadDeliver();

    await expect(deliver(mail)).rejects.toThrow('rate_limit: Too many');
    await expect(deliver(mail)).rejects.not.toBeInstanceOf(UnrecoverableError);
  });

  it('throws a retryable error for 5xx failures', async () => {
    process.env['EMAIL_DRIVER'] = 'resend';
    sendMock.mockResolvedValue({
      error: { name: 'server_error', message: 'Boom', statusCode: 500 },
    });

    const deliver = await loadDeliver();

    await expect(deliver(mail)).rejects.toThrow('server_error: Boom');
  });

  it('treats an error without a status code as retryable', async () => {
    process.env['EMAIL_DRIVER'] = 'resend';
    sendMock.mockResolvedValue({
      error: { name: 'timeout', message: 'Timed out' },
    });

    const deliver = await loadDeliver();

    await expect(deliver(mail)).rejects.not.toBeInstanceOf(UnrecoverableError);
  });
});
