import { describe, expect, it } from 'vitest';
import { renderEmail } from '@/email/templates';
import type { EmailJob } from '@/email/types';

const base = { to: 'asoka@example.com', name: 'Asoka' };

describe('renderEmail templates', () => {
  it('renders the registration email with the verification link', () => {
    const email = renderEmail({
      ...base,
      type: 'registration',
      link: 'https://itihaas.dev/verify/registration-token',
      expiresIn: '15 minutes',
    });

    expect(email.subject).toContain('Verify your email');
    expect(email.html).toContain('https://itihaas.dev/verify/registration-token');
    expect(email.html).toContain('Asoka');
    expect(email.text).toContain('https://itihaas.dev/verify/registration-token');
    expect(email.text).toContain('15 minutes');
  });

  it('renders the verification-resend email with the fresh link', () => {
    const email = renderEmail({
      ...base,
      type: 'verification-resend',
      link: 'https://itihaas.dev/verify/resend-token',
      expiresIn: '15 minutes',
    });

    expect(email.subject).toContain('verification');
    expect(email.html).toContain('https://itihaas.dev/verify/resend-token');
    expect(email.text).toContain('https://itihaas.dev/verify/resend-token');
  });

  it('renders the verification-success email with the API key', () => {
    const email = renderEmail(
      { ...base, type: 'verification-success', userId: 'user-1' },
      'api-key-abc-123',
    );

    expect(email.subject).toContain('verified');
    expect(email.html).toContain('api-key-abc-123');
    expect(email.text).toContain('api-key-abc-123');
    expect(email.text).toContain('Keep this key secret');
  });

  it('renders the API key recovery email with the API key', () => {
    const email = renderEmail(
      { ...base, type: 'api-key-recovery', userId: 'user-1' },
      'recovered-key-xyz',
    );

    expect(email.subject).toContain('recovery');
    expect(email.html).toContain('recovered-key-xyz');
    expect(email.text).toContain('recovered-key-xyz');
  });

  it('escapes HTML-unsafe characters in the recipient name', () => {
    const email = renderEmail({
      ...base,
      name: '<script>alert("x")</script>',
      type: 'registration',
      link: 'https://itihaas.dev/verify/token',
      expiresIn: '15 minutes',
    });

    expect(email.html).not.toContain('<script>');
    expect(email.html).toContain('&lt;script&gt;');
  });

  it('renders an empty API key placeholder when no key is supplied', () => {
    const email = renderEmail({
      ...base,
      type: 'verification-success',
      userId: 'user-1',
    });

    expect(email.html).toBeTruthy();
    expect(email.text).toContain('Your account is verified');
  });

  it('throws for an unsupported email job type', () => {
    expect(() =>
      renderEmail({ ...base, type: 'not-a-real-type' } as unknown as EmailJob),
    ).toThrow('Unhandled email job type');
  });
});
