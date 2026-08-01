import Wars from '@/models/Wars';
import AppException from '@/services/AppException';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
import FailureLogs from '@/services/FailureLogs';
dotenv.config();

/**
 * Controller function to get a random war
 *
 * @param {Object} request Default Express request object
 * @param {Object} response Default Express response object
 * @returns A response code with status code 200, 404 or 500 signifying success
 *     or failure respectively
 */
export default async function getRandomWar(
  request: Request,
  response: Response,
) {
  try {
    // Use the MongoDB aggregation function to find a random entry in the database
    const [random] = await Wars.aggregate([{ $sample: { size: 1 } }]);

    // In the event that the database does not consist of any items
    if (!random) {
      const appException = new AppException(
        'Failed to locate specified resource in database',
        404,
        'error',
        false,
        `${request.host}:${request.originalUrl}`,
        request.method,
        'controllers.wars.getRandomDynasty',
      );

      // Within a development environment mode
      if (process?.env?.['NODE_ENV'] === 'development') {
        return response.status(404).json({
          success: false,
          message: FailureLogs.entityNotFound(),
          log: appException.log(),
        });
      }

      // Regular not-found response
      return response.status(404).json({
        success: false,
        message: FailureLogs.entityNotFound(),
      });
    }

    return response.status(200).json({
      success: true,
      data: {
        war: random,
      },
    });
  } catch (e) {
    // Build the app exception using the helper/utility methods from the AppException class
    const appException = new AppException(
      'Failed to fetch specified resource from the database',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.wars.getRandomDynasty',
    );

    // On a development mode environment
    if (process?.env?.['NODE_ENV'] === 'development') {
      return response.status(500).json({
        success: false,
        message: FailureLogs.databaseAccessFailure(),
        errorLog: e,
        log: appException.log(),
      });
    }

    // Regular response for a server error/crash
    return response.status(500).json({
      success: false,
      message: FailureLogs.databaseAccessFailure(),
    });
  }
}
