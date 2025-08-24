const jwt = require('jsonwebtoken');

const DEFAULT_JWT_TOKEN_DURATION = '15m';

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
