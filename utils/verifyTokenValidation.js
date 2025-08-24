const jwt = require('jsonwebtoken');

async function verifyTokenValidation(token) {
  try {
    const JWT_SECRET = process.env.JWT_VERIFICATION_TOKEN_SECRET || '';

    const decoded = await jwt.verify(token, JWT_SECRET);

    return decoded;
  } catch {
    return null;
  }
}

module.exports = verifyTokenValidation;
