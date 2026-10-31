// Global imports
import dotenv from 'dotenv';
import Dynasties from '@/models/Dynasties';
import { Request, Response } from 'express';
dotenv.config();

// Services
import FailureLogs from '@/services/FailureLogs';
import AppException from '@/services/AppException';
import convertStringToBoolean from '@/utils/convertStringToBoolean';
import z from 'zod';
import { cacheAside } from '@/cache/redis';

const validFieldOptions = [
  'area',
  'description',
  'languages',
  'religions',
  'currencies',
  'articles',
] as const;

const RequestQueryValidation = z.object({
  fields: z
    .string()
    .transform((value) => value.split(','))
    .pipe(z.array(z.enum(validFieldOptions)))
    .optional(),
  wars: z.enum(['true', 'false']).optional(),
  rulers: z.enum(['true', 'false']).optional(),
});

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
    // Retrieve attributes from request queries and validate them
    const validatedRequestQuery = RequestQueryValidation.safeParse(
      request.query,
    );

    if (!validatedRequestQuery.success) {
      return response.status(400).json({
        success: true,
        errors: validatedRequestQuery?.error?.issues.map((issue) => ({
          field: issue?.path?.join(''),
          message: issue?.message,
        })),
      });
    }

    const { fields, rulers, wars } = validatedRequestQuery.data;

    // Required fields from database (Default base fields)
    let DEFAULT_REQUIRED_DB_FIELDS =
      '_id slug name timeline capitals population locations description.oneline otherNames createdAt updatedAt';

    // Append any additional user requested fields
    fields?.forEach(function (field) {
      if (field === 'description') {
        DEFAULT_REQUIRED_DB_FIELDS += ` description.long`;
      } else {
        DEFAULT_REQUIRED_DB_FIELDS += ` ${field}`;
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

    // Set up the cache key based on the requested fields and query parameters
    const cacheKey = `all:${fields?.join(':')}${rulers === 'true' && ':rulers'}${wars === 'true' && ':wars'}`;

    const dynasties = await cacheAside('dynasties', cacheKey, 3600, () =>
      Dynasties.find().select(DEFAULT_REQUIRED_DB_FIELDS).lean(),
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
