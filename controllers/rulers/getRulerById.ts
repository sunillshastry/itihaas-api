// Global imports
import dotenv from 'dotenv';
import AppException from '@/services/AppException';
import FailureLogs from '@/services/FailureLogs';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { cacheAside } from '@/cache/redis';
import Rulers from '@/models/Rulers';

dotenv.config();

/**
 * Get a ruler by their ID parameter
 *
 * @param {Object} request Default request object for Express
 * @param {Object} response Default response object for Express
 * @returns A response with 200, 404 or 500 status code signifying success or failures respectively
 */
async function getRulerById(request: Request, response: Response) {
  // Get the ID from the params
  const { id } = request.params;

  if (!mongoose.isValidObjectId(id)) {
    return response.status(400).json({
      success: false,
      message: 'Invalid dynasty ID',
    });
  }

  try {
    // Try to retrieve the requested entity from the cache, on a cache miss - provide the default fetch from the database
    const ruler = await cacheAside('rulers', `id:${id}`, 3600, () =>
      Rulers.findById(id).lean(),
    );

    // If no ruler is found
    if (!ruler) {
      const appException = new AppException(
        'Failed to locate specified resource in database',
        404,
        'error',
        false,
        `${request.host}:${request.originalUrl}`,
        request.method,
        'controllers.rulers.getRulerById',
      );

      // Response for development mode
      if (process.env?.['NODE_ENV'] === 'development') {
        return response.status(404).json({
          success: false,
          message: FailureLogs.entityNotFound(),
          log: appException.log(),
        });
      }

      // Response for production mode
      return response.status(404).json({
        success: false,
        message: FailureLogs.entityNotFound(),
      });
    }

    // Success response
    return response.status(200).json({
      success: true,
      data: {
        ruler,
      },
    });
  } catch (e) {
    // Server errors
    const appException = new AppException(
      'Failed to retrieve specified ruler under the provided ID parameter',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.rulers.getRulerById',
    );

    if (process.env?.['NODE_ENV'] === 'development') {
      return response.status(500).json({
        success: false,
        message: FailureLogs.entityNotFound(),
        errorLog: e,
        log: appException.log(),
      });
    }

    return response.status(500).json({
      success: false,
      message: FailureLogs.databaseAccessFailure(),
    });
  }
}

export default getRulerById;
