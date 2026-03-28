import crypto from 'crypto';

/**
 * Generate a hashed API key based on provided string length
 *
 * @param {number} length The required length of the key string to be. Set to '50' by default
 * @returns A hexadecimal hashed API key string
 */
export default function generateApiKey(length = 50) {
  return crypto.randomBytes(length).toString('hex');
}
