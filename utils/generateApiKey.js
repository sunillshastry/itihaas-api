const crypto = require('crypto');

function generateApiKey(length = 50) {
  return crypto.randomBytes(length).toString('hex');
}

module.exports = generateApiKey;
