import Wars from '@/models/Wars';
import AppException from '@/services/AppException';
import FailureLogs from '@/services/FailureLogs';
import checkValidQueryField from '@/utils/checkValidQueryField';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Controller function to get wars by search
 *
 * @param {Object} request Default Express request object
 * @param {Object} response Default Express response object
 * @returns A response code with status code 200, 404 or 500 signifying success
 *     or failure respectively
 */
export default async function getWarsBySearch(
  request: Request,
  response: Response,
) {
  try {
    // Retrieve the 'search' parameter value from the request
    const { search } = request.params;

    // Retrieve the optional 'fields' query parameter from the request route
    const { fields } = request.query;

    // Formatting the provided fields into a more structured version
    const userRequestedFields =
      (fields &&
        (fields as string)
          .split(',')
          .map((field) => field.trim().toLowerCase())) ||
      [];

    // Valid entries for the 'fields' query - all other entries are ignored
    const VALID_FIELD_ENTRIES = [
      'description',
      'causes',
      'relatedDynasties',
      'relatedRulers',
      'relatedWars',
      'sources',
      'readings',
      'articles',
    ];

    let DEFAULT_REQUIRED_DB_FIELDS =
      '_id timeline outcome casualties description.oneline slug otherNames type belligerents locations updatedAt createdAt';

    // Validate each 'fields' entry to check if it exists on the schema
    userRequestedFields.forEach(function (field) {
      if (field === 'readings') {
        DEFAULT_REQUIRED_DB_FIELDS += 'furtherReading';
      }

      if (checkValidQueryField(VALID_FIELD_ENTRIES, field)) {
        DEFAULT_REQUIRED_DB_FIELDS += ` ${field === 'description' ? 'description.long' : field}`;
      }
    });

    // Using the updated fields entry, select all required fields from the specific entity
    const wars = await Wars.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { otherNames: { $elemMatch: { $regex: search, $options: 'i' } } },
        { locations: { $elemMatch: { $regex: search, $options: 'i' } } },
      ],
    }).select(DEFAULT_REQUIRED_DB_FIELDS);

    // Return the formatted and updated response
    return response.status(200).json({
      success: true,
      size: wars.length,
      entity: 'war',
      data: {
        wars,
      },
    });
  } catch (e) {
    // Set up the AppException case to render a nicely structured error response during development
    const appException = new AppException(
      'Failed to fetch specified resource from the database',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.wars.getWarsBySearch',
    );

    // In a development mode environment
    if (process?.env?.['NODE_ENV'] === 'development') {
      return response.status(500).json({
        success: false,
        message: FailureLogs.databaseAccessFailure(),
        errorLog: e,
        log: appException.log(),
      });
    }

    // Regular error/failure response
    return response.status(500).json({
      success: false,
      message: FailureLogs.databaseAccessFailure(),
    });
  }
}
