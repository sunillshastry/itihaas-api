import Users from '@/models/Users';
import { NextFunction, Request, Response } from 'express';

/**
 * Middleware function that authenticates an incoming request ensuring the API key and verified status check
 *
 * @param request Default request object from Express
 * @param response Default response object from Express
 * @param next The next function provided by Express to bypass from the middleware function
 * @returns The next function and subsequent callback functions
 */
export default async function authenticate(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    // Check if the x-api-key property is present in the request headers
    const apiKey = request.get('x-api-key');

    if (!apiKey || !apiKey.trim()) {
      return response.status(401).json({
        success: false,
        message: 'API key is required. Provide it using the x-api-key header',
      });
    }

    // Validate if the provided apiKey is actually correct (must be generated and stored under a registered user)
    const isApiKeyValid = await Users.findOne({ apiKey });

    if (!isApiKeyValid) {
      return response.status(401).json({
        success: false,
        message: 'Invalid API Key',
      });
    }

    // Ensure that the registered user and apiKey are verified already
    if (!isApiKeyValid?.verified) {
      return response.status(403).json({
        success: false,
        message: 'You must verify the API key to access the Itihaas API',
      });
    }

    return next();
  } catch (e) {
    return next(e);
  }
}
