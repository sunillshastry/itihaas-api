import prisma from '@/database/prisma';
import { NextFunction, Request, Response } from 'express';

export default async function authenticated(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const apiKey = request.headers['x-api-key'];

    // Check if the API key header itself exists
    if (!apiKey) {
      return response.status(401).json({
        success: false,
        message: 'Missing API key (x-api-key) in request headers',
        register:
          'You can register for an API key at https://itihaas.dev/register',
      });
    }

    // Check if the API key is valid (exists in database)
    const user = await prisma.user.findUnique({
      where: {
        api_key: apiKey as string,
      },
    });

    if (!user) {
      return response.status(401).json({
        success: false,
        message: 'Invalid api key',
      });
    }

    // Check if the user is verified to use the API key (user.verified must be true)
    if (!user.verified) {
      return response.status(403).json({
        success: false,
        message: 'Account is not verified. Please verify your account first',
      });
    }

    // If all checks are complete and successful, pass onto the next middleware
    next();
  } catch (e) {
    return response.status(500).json({
      success: false,
      message: 'Internal server error',
      error: e,
    });
  }
}
