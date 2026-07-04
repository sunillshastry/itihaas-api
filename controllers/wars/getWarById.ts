import AppException from '@/services/AppException';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
import FailureLogs from '@/services/FailureLogs';
import Wars from '@/models/Wars';
dotenv.config();

/**
 * Controller function to get a specific war entity from the database by the ID parameter
 *
 * @param request Default Express request object
 * @param response Default Express response object
 * @returns A response with status code 200 or 500 signifying success or failure respectively
 */
export default async function getWarById(request: Request, response: Response) {
  try {
    // Retrieve the specified and unique ID parameter from the request URL source
    const { id } = request.params;

    // Fetch the desired entity from the database querying with the provided ID value
    const war = await Wars.findById(id);

    // In the event that the requested resource is not found or unavailable
    if (!war) {
      const appException = new AppException(
        'Failed to locate specified resource in database',
        404,
        'error',
        false,
        `${request.host}:${request.originalUrl}`,
        request.method,
        'controllers.wars.getWarById',
      );

      // For development mode purposes
      if (process.env?.['NODE_ENV'] === 'development') {
        return response.status(404).json({
          success: false,
          message: FailureLogs.entityNotFound(),
          log: appException.log(),
        });
      }

      // For production and default purposes
      return response.status(404).json({
        success: false,
        message: FailureLogs.entityNotFound(),
      });
    }

    // Success response if the entity is found within the database
    return response.status(200).json({
      success: true,
      data: {
        war,
      },
    });
  } catch (e) {
    // Setup the AppException helper class for a formatted log
    const appException = new AppException(
      'Failed to fetch specified resource from the database',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.wars.getWarById',
    );

    // Send the customized development mode error/failure response
    if (process?.env?.['NODE_ENV'] === 'development') {
      return response.status(500).json({
        success: false,
        message: FailureLogs.databaseAccessFailure(),
        errorLog: e,
        log: appException.log(),
      });
    }

    // Send the default error/failure response during production
    return response.status(500).json({
      success: false,
      message: FailureLogs.databaseAccessFailure(),
    });
  }
}
