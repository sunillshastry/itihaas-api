const packageVersion = require('@/package.json');

/**
 * Get app version data of the Itihaas API
 * @param {object} request Default Express request object
 * @param {object} response Default Express response object
 * @returns An API Version information response with status code 200
 */
async function getApiVersion(request, response) {
  return response.status(200).json({
    app: 'itihaas-api',
    version: packageVersion.version,
    docs: 'https://itihaas.dev/docs',
    client: 'https://itihaas.dev/',
  });
}

module.exports = getApiVersion;
