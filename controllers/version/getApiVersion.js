const packageVersion = require('@/package.json');

async function getApiVersion(request, response) {
  return response.status(200).json({
    app: 'itihaas-api',
    version: packageVersion.version,
    docs: 'https://itihaas.dev/docs',
    client: 'https://itihaas.dev/',
  });
}

module.exports = getApiVersion;
