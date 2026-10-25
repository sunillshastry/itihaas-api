import { UnrecoverableError } from 'bullmq';
import { Resend } from 'resend';

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
}

const driver =
  process.env['NODE_ENV'] === 'production'
    ? 'resend'
    : (process.env['EMAIL_DRIVER'] ?? 'log');
const from = process.env['EMAIL_FROM'] ?? 'Itihaas <onboarding@resend.dev>';
let resend: Resend | undefined;

export async function deliver(mail: OutgoingEmail): Promise<void> {
  if (driver === 'log') {
    console.log(
      `\n[email:log] to=${mail.to} subject="${mail.subject}"\n${mail.text}`,
    );
    return;
  }

  if (driver === 'mailpit') {
    const { createTransport } = await import('nodemailer');
    await createTransport({
      host: process.env['SMTP_HOST'] ?? 'localhost',
      port: 1025,
    }).sendMail({
      from,
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
    return;
  }

  resend ??= new Resend(process.env['RESEND_EMAIL_API_KEY']);
  // Resend's SDK returns { error } instead of throwing, so we must throw ourselves to trigger retries
  const { error } = await resend.emails.send(
    {
      from,
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    },
    { idempotencyKey: mail.idempotencyKey }, // retries can never double-send
  );

  if (error) {
    const status: number = (error as { statusCode?: number }).statusCode ?? 0;
    const msg = `${error.name}: ${error.message}`;
    // 4xx (except 429 rate limit) will never succeed on retry, so fail permanently
    if (status >= 400 && status < 500 && status !== 429)
      throw new UnrecoverableError(msg);
    throw new Error(msg);
  }
}
