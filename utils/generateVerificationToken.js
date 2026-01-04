const jwt = require('jsonwebtoken');

// The default jsonwebtoken expiration duration
const DEFAULT_JWT_TOKEN_DURATION = '15m';

/**
 * Creates and generates a verification based web token with a payload and expiration
 *
 * @param {object} payload The payload content/data to be part of the web token
 * @returns A web token with the provided payload object, set with an assigned expiration duration
 */
function generateVerificationToken(payload) {
  try {
    const JWT_SECRET = process.env.JWT_VERIFICATION_TOKEN_SECRET;
    const secretDuration =
      process.env.JWT_VERIFICATION_TOKEN_DURATION || DEFAULT_JWT_TOKEN_DURATION;

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: secretDuration,
    });

    return token;
  } catch {
    return null;
  }
}

module.exports = generateVerificationToken;
