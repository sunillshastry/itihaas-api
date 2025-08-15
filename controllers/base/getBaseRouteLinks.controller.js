const dotenv = require('dotenv');

dotenv.config();

async function getBaseRouteLinks(request, response) {
  return response.status(200).json({
    web: 'https://itihaas.netlify.app/',
    docs: 'https://itihaas.netlify.app/docs',
    contributions: 'https://itihaas.netlify.app/issues',
    api_registration: 'https://itihaas.netlify.app/register',
    api_recovery: 'https://itihaas.netlify.app/api-recovery',
    github: 'https://github.com/sunillshastry/itihaas-api',
  });
}

module.exports = getBaseRouteLinks;
