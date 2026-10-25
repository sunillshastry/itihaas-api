type Base = { to: string; name: string };

export type EmailJob =
  | (Base & { type: 'registration'; link: string; expiresIn: string })
  | (Base & { type: 'verification-resend'; link: string; expiresIn: string })
  | (Base & {
      type: 'api-key';
      userId: string;
      reason: 'recovery' | 'verified';
    });
