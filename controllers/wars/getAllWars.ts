import dotenv from 'dotenv';
import Wars from '@/models/Wars';
import AppException from '@/services/AppException';
import FailureLogs from '@/services/FailureLogs';
import { Request, Response } from 'express';
import z from 'zod';
import { cacheAside } from '@/cache/redis';
dotenv.config();

const validFieldOptions = [
  'locations',
  'causes',
  'description',
  'relatedDynasties',
  'relatedRulers',
  'relatedWars',
  'articles',
] as const;

const RequestQueryValidation = z.object({
  fields: z
    .string()
    .transform((value) => value.split(','))
    .pipe(z.array(z.enum(validFieldOptions)))
    .optional(),
});

/**
 * Controller function to get all Wars for the wars routes
 *
 * @param request Default Express request object
 * @param response Default Express response object
 * @returns A response with status code 200 or 500 signifying success or failure respectively
 */
export default async function getAllWars(request: Request, response: Response) {
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

    const { fields } = validatedRequestQuery.data;

    // Required and default fields from the database for the wars schema
    let DEFAULT_REQUIRED_DB_FIELDS =
      '_id slug name otherNames type timeline belligerents description.oneline outcome casualties createdAt updatedAt';

    // Append any additional user requested fields
    fields?.forEach(function (field) {
      if (field === 'description') {
        DEFAULT_REQUIRED_DB_FIELDS += ` description.long`;
      } else {
        DEFAULT_REQUIRED_DB_FIELDS += ` ${field}`;
      }
    });

    // Set up the cache key based on the requested fields and query parameters
    const cacheKey = `all:${fields?.join(':')}`;

    // Retrieve the wars entities from the database
    const wars = await cacheAside('wars', cacheKey, 3600, () =>
      Wars.find().select(DEFAULT_REQUIRED_DB_FIELDS).lean(),
    );

    // Return the success response with a desired structure
    return response.status(200).json({
      success: true,
      size: wars?.length,
      data: {
        wars,
      },
    });
  } catch (e) {
    // Send response with a customized server error
    const appException = new AppException(
      'Failed to fetch all wars from the database',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.wars.getAllWars',
    );

    // Error response for a 'development' mode (during development)
    if (process?.env?.['NODE_ENV'] === 'development') {
      return response.status(500).json({
        success: false,
        message: FailureLogs.databaseAccessFailure(),
        errorLog: e,
        log: appException.log(),
      });
    }

    // Default error response
    return response.status(500).json({
      success: false,
      message: FailureLogs.databaseAccessFailure(),
    });
  }
}
