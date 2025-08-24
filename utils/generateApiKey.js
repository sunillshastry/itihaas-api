const crypto = require('crypto');

function generateApiKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

module.exports = generateApiKey;
