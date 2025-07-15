const packageJson = require('@/package.json');

/**
 * Get meta information of the Itihaas API
 * @param {object} request Default Express request object
 * @param {object} response Default Express response object
 * @returns A info/status response with status code 200 providing app meta data/information
 */
async function getApiInfo(request, response) {
  return response.status(200).json({
    app: 'itihaas-api',
    version: packageJson.version,
    client: 'https://itihaas.dev/',
    docs: 'https://itihaas.dev/docs',
    uptime: process.uptime(),
    pid: process.pid,
    memory: process.memoryUsage(),
    node: process.version,
    platform: process.platform,
    timestamp: new Date().toISOString(),
  });
}

module.exports = getApiInfo;
