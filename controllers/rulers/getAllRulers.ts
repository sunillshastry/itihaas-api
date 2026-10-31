// Global imports
import dotenv from 'dotenv';
import Rulers from '@/models/Rulers';
import AppException from '@/services/AppException';
import FailureLogs from '@/services/FailureLogs';
import { Request, Response } from 'express';
import z from 'zod';
import convertStringToBoolean from '@/utils/convertStringToBoolean';
import { cacheAside } from '@/cache/redis';

dotenv.config();

const validFieldOptions = [
  'religion',
  'predecessor',
  'successor',
  'family',
  'wars',
  'description',
  'articles',
] as const;

const RequestQueryValidation = z.object({
  fields: z
    .string()
    .transform((value) => value.split(','))
    .pipe(z.array(z.enum(validFieldOptions)))
    .optional(),
  wars: z.enum(['true', 'false']).optional(),
});

/**
 * Get a list of all rulers
 *
 * @param {Object} request Default request object for Express
 * @param {Object} response Default response object for Express
 * @returns A response with status code 200 or 500, signifying success or failure respectively
 */
async function getAllRulers(request: Request, response: Response) {
  try {
    // Retrieve attributes from request queries and validate them
    const validatedRequestQuery = RequestQueryValidation.safeParse(
      request?.query,
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

    const { fields, wars } = validatedRequestQuery?.data;

    let DEFAULT_REQUIRED_DB_FIELDS =
      '_id slug name timeline description.oneline otherNames born died dynasty createdAt updatedAt';

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

    // Set up the cache key based on the requested fields and query parameters
    const cacheKey = `all:${fields?.join(':')}${wars === 'true' && ':wars'}`;

    // Query from the cache first then provide a callback to retrieve from the main database
    const rulers = await cacheAside('rulers', cacheKey, 3600, () =>
      Rulers.find().select(DEFAULT_REQUIRED_DB_FIELDS).lean(),
    );

    // Send the success response back
    return response.status(200).json({
      success: true,
      size: rulers.length,
      data: {
        rulers,
      },
    });
  } catch (e) {
    // Custom app error log
    const appException = new AppException(
      'Failed to fetch all rulers from database',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.rulers.getAllRulers',
    );

    // Failure response for 'development' mode
    if (process.env?.['NODE_ENV'] === 'development') {
      return response.status(500).json({
        success: false,
        errorLog: e,
        log: appException.log(),
      });
    }

    // Default failure response
    return response.status(500).json({
      success: false,
      message: FailureLogs.databaseAccessFailure(),
    });
  }
}

export default getAllRulers;
