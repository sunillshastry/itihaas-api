import packageVersion from '@/package.json';
import { Request, Response } from 'express';

/**
 * Get app version data of the Itihaas API
 * @param {object} request Default Express request object
 * @param {object} response Default Express response object
 * @returns An API Version information response with status code 200
 */
export default async function getApiVersion(
  _request: Request,
  response: Response,
) {
  return response.status(200).json({
    app: 'itihaas-api',
    version: packageVersion.version,
    docs: 'https://itihaas.dev/docs',
    client: 'https://itihaas.dev/',
  });
}
