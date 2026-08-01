import AppException from '@/services/AppException';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
import FailureLogs from '@/services/FailureLogs';
import Wars from '@/models/Wars';
dotenv.config();

/**
 * Controller function to get a specific war entity by the slug name parameter value
 *
 * @param request Default Express request object
 * @param response Default Express response object
 * @returns A response with status code 200 or 500 signifying a success or failure/error respectively
 */
export default async function getWarBySlugName(
  request: Request,
  response: Response,
) {
  try {
    // Retrieve the slug name parameter from the request
    const { slug } = request.params;

    // Fetch the actual entity from the database using the provided parameter
    const war = await Wars.findOne({ slug });

    // In the event that the requested resource is not found or unavailable
    if (!war) {
      const appException = new AppException(
        'Failed to locate specified resource in database',
        404,
        'error',
        false,
        `${request.host}:${request.originalUrl}`,
        request.method,
        'controllers.wars.getWarBySlugName',
      );

      // Return 404 responses for development mode (during development phase)
      if (process.env?.['NODE_ENV'] === 'development') {
        return response.status(404).json({
          success: false,
          message: FailureLogs.entityNotFound(),
          log: appException.log(),
        });
      }

      // Default response for not found exception
      return response.status(404).json({
        success: false,
        message: FailureLogs.entityNotFound(),
      });
    }

    // Success response
    return response.status(200).json({
      success: true,
      data: {
        war,
      },
    });
  } catch (e) {
    // Failure response with a structured log

    // Build the customized exception
    const appException = new AppException(
      'Failed to fetch specified resource from the database',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.wars.getWarBySlugName',
    );

    // For development mode
    if (process?.env?.['NODE_ENV'] === 'development') {
      return response.status(500).json({
        success: false,
        message: FailureLogs.databaseAccessFailure(),
        errorLog: e,
        log: appException.log(),
      });
    }

    // Default failure case response
    return response.status(500).json({
      success: false,
      message: FailureLogs.databaseAccessFailure(),
    });
  }
}
