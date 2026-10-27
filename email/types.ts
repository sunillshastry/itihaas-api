type Base = { to: string; name: string };

export type EmailJob =
  // Sent on registration, with the verification link
  | (Base & { type: 'registration'; link: string; expiresIn: string })

  // Sent when the user asks for a new verification link
  | (Base & { type: 'verification-resend'; link: string; expiresIn: string })

  // Sent after successful verification, with the API key
  // (the API key is NOT put in the payload; the worker looks it up by userId)
  | (Base & { type: 'verification-success'; userId: string })

  // Sent when a verified user recovers their API key
  | (Base & { type: 'api-key-recovery'; userId: string });
