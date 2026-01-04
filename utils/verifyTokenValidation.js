const jwt = require('jsonwebtoken');

/**
 * Validates if a provided web token is unexpired and returns its decoded payload data
 *
 * @param {string} token A valid and unexpired jsonwebtoken string
 * @returns The decoded payload content initially setup within the web token
 */
async function verifyTokenValidation(token) {
  try {
    // Retrieve the jsonwebtoken secret from ENV variables
    // If absent, use an invalid placeholder string
    const JWT_SECRET = process.env.JWT_VERIFICATION_TOKEN_SECRET || '';

    const decoded = await jwt.verify(token, JWT_SECRET);

    return decoded;
  } catch {
    return null;
  }
}

module.exports = verifyTokenValidation;
