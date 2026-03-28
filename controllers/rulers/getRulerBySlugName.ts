// Global imports
import dotenv from 'dotenv';
import Rulers from '@/models/Rulers';
import AppException from '@/services/AppException';
import FailureLogs from '@/services/FailureLogs';
import { Request, Response } from 'express';
dotenv.config();

/**
 * Get a ruler by their slug name
 *
 * @param {Object} request Default request object for express
 * @param {Object} response Default response object for express
 * @returns A response with status code 200, 404 or 500 signifying success or failures respectively
 */
async function getRulerBySlugName(request: Request, response: Response) {
  // Retrieve the 'slug' parameter
  const { slug } = request.params;

  try {
    // Query for the field from database
    const ruler = await Rulers.findOne({ slug });

    // If the ruler does not exist, return 404 response
    if (!ruler) {
      const appException = new AppException(
        'Failed to locate specified resource in database',
        404,
        'error',
        false,
        `${request.host}:${request.originalUrl}`,
        request.method,
        'controllers.rulers.getRulerBySlugName',
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
    const appException = new AppException(
      'Failed to fetch specified resource from the database',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.dynasties.getRulerBySlugName',
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

export default getRulerBySlugName;
