import jwt, { SignOptions } from 'jsonwebtoken';

// The default jsonwebtoken expiration duration
const DEFAULT_JWT_TOKEN_DURATION = '15m';

/**
 * Creates and generates a verification based web token with a payload and expiration
 *
 * @param {object} payload The payload content/data to be part of the web token
 * @returns A web token with the provided payload object, set with an assigned expiration duration
 */
export default function generateVerificationToken(payload: {
  id: string;
  name: string;
  email: string;
}) {
  try {
    const JWT_SECRET = process.env?.[
      'JWT_VERIFICATION_TOKEN_SECRET'
    ] as jwt.Secret;

    const secretDuration =
      process.env?.['JWT_VERIFICATION_TOKEN_DURATION'] ||
      DEFAULT_JWT_TOKEN_DURATION;

    const tokenOptions: SignOptions = {
      expiresIn: secretDuration as NonNullable<SignOptions['expiresIn']>,
    };

    const token = jwt.sign(payload, JWT_SECRET, tokenOptions);

    return token;
  } catch {
    return null;
  }
}
