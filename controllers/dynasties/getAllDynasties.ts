// Global imports
import dotenv from 'dotenv';
import Dynasties from '@/models/Dynasties';
import { Request, Response } from 'express';
dotenv.config();

// Services
import FailureLogs from '@/services/FailureLogs';
import AppException from '@/services/AppException';
import checkValidQueryField from '@/utils/checkValidQueryField';
import convertStringToBoolean from '@/utils/convertStringToBoolean';

/**
 * Controller function to get all Dynasties for dynasties routes
 *
 * @param {Object} request Default Express Request object
 * @param {Object} response Default Express Response object
 * @returns A response with status code 200 or 500 signifying success or failure
 *     respectively
 */
async function getAllDynasties(request: Request, response: Response) {
  try {
    // Retrieve from request queries
    const { fields, wars, rulers } = request.query;

    // Format all 'fields' values into an array
    const userRequestedFields =
      (fields &&
        (fields as string)
          ?.split(',')
          .map((field) => field.trim().toLowerCase())) ||
      [];

    // List of valid fields that the user can request
    const VALID_FIELD_ENTRIES = [
      'area',
      'description',
      'languages',
      'religions',
      'currencies',
      'articles',
    ];

    // Required fields from database (Default base fields)
    let DEFAULT_REQUIRED_DB_FIELDS =
      '_id slug name timeline capitals population locations description.oneline otherNames createdAt updatedAt';

    // Append any additional user requested fields
    userRequestedFields.forEach(function (field) {
      if (checkValidQueryField(VALID_FIELD_ENTRIES, field)) {
        DEFAULT_REQUIRED_DB_FIELDS += ` ${field === 'description' ? 'description.long' : field}`;
      }
    });

    // Explicitly check for 'wars' in request.query
    if (wars && convertStringToBoolean(wars as string)) {
      DEFAULT_REQUIRED_DB_FIELDS += ' wars';
    }

    // Explicitly check for 'rulers' in request.query
    if (rulers && convertStringToBoolean(rulers as string)) {
      DEFAULT_REQUIRED_DB_FIELDS += ' rulers';
    }

    // Retrieve specific fields from database
    const dynasties = await Dynasties.find({}).select(
      DEFAULT_REQUIRED_DB_FIELDS,
    );

    // Response with successful response
    return response.status(200).json({
      success: true,
      size: dynasties.length,
      data: {
        dynasties,
      },
    });
  } catch (e) {
    // Provide with server error
    const appException = new AppException(
      'Failed to fetch all dynasties from database',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.dynasties.getAllDynasties',
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

export default getAllDynasties;
