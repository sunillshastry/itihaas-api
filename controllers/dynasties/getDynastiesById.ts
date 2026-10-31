// Global imports
import dotenv from 'dotenv';
import Dynasties from '@/models/Dynasties';
import FailureLogs from '@/services/FailureLogs';
import AppException from '@/services/AppException';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { cacheAside } from '@/cache/redis';

dotenv.config();

/**
 * Controller function to get a dynasty by its ID parameter for dynasties route
 *
 * @param {Object} request Default Express Request object
 * @param {Object} response Default Express Response object
 * @returns A response with status code 200, 404 or 500 signifying success or
 *     failures respectively
 */
async function getDynastiesById(request: Request, response: Response) {
  const { id } = request.params;

  if (!mongoose.isValidObjectId(id)) {
    return response.status(400).json({
      success: false,
      message: 'Invalid dynasty ID',
    });
  }

  try {
    // Try to retrieve the requested entity from the cache, on a cache miss - provide the default fetch from the database
    const dynasty = await cacheAside('dynasties', `id:${id}`, 3600, () =>
      Dynasties.findById(id).lean(),
    );

    // Check if dynasty exists - send 404 response if it doesn't
    if (!dynasty) {
      const appException = new AppException(
        'Failed to locate specified resource in database',
        404,
        'error',
        false,
        `${request.host}:${request.originalUrl}`,
        request.method,
        'controllers.dynasties.getDynastyById',
      );

      if (process.env?.['NODE_ENV'] === 'development') {
        return response.status(404).json({
          success: false,
          message: FailureLogs.entityNotFound(),
          log: appException.log(),
        });
      }

      return response.status(404).json({
        success: false,
        message: FailureLogs.entityNotFound(),
      });
    }
    // Return success response
    return response.status(200).json({
      success: true,
      data: {
        dynasty,
      },
    });
  } catch (e) {
    const appException = new AppException(
      'Failed to fetch specified resource in database',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.dynasties.getDynastyById',
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

export default getDynastiesById;
