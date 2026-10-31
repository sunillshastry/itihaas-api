// Global imports
import dotenv from 'dotenv';
import Dynasties from '@/models/Dynasties';
import FailureLogs from '@/services/FailureLogs';
import AppException from '@/services/AppException';
import { Request, Response } from 'express';
import { cacheAside } from '@/cache/redis';
dotenv.config();

/**
 * Controller function to get a dynasty by its slug name for dynasties route
 *
 * @param {Object} request Default Express Request object
 * @param {Object} response Default Express Response object
 * @returns A response with status code 200, 404 or 500 signifying success or
 *     failure respectively
 */
async function getDynastyBySlugName(request: Request, response: Response) {
  const { slug } = request.params;
  try {
    // Try to retrieve the requested entity from the cache, on a cache miss - provide the default fetch from the database
    const dynasty = await cacheAside('dynasties', `slug:${slug}`, 3600, () =>
      Dynasties.findOne({ slug }).lean(),
    );

    // Check if dynasty does not exist - return 404
    if (!dynasty) {
      // Build AppException
      const appException = new AppException(
        'Failed to locate specified resource in database',
        404,
        'error',
        false,
        `${request.hostname}:${request.originalUrl}`,
        request.method,
        'controllers.dynasties.getDynastyBySlugName',
      );

      // Return 404 responses
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
      'Failed to fetch specified resource from the database',
      500,
      'fail',
      false,
      `${request.hostname}:${request.originalUrl}`,
      request.method,
      'controllers.dynasties.getDynastyBySlugName',
    );

    if (process.env?.['NODE_ENV'] === 'development') {
      return response.status(500).json({
        success: false,
        message: FailureLogs.databaseAccessFailure(),
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

export default getDynastyBySlugName;
