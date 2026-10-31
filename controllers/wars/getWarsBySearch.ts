import Wars from '@/models/Wars';
import AppException from '@/services/AppException';
import FailureLogs from '@/services/FailureLogs';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
import z from 'zod';
import { cacheAside } from '@/cache/redis';
dotenv.config();

// Configure and implement the schema setup for request.params and request.query

const ParamsValidationSchema = z.object({
  search: z.string().min(3),
});

const validFieldOptions = [
  'locations',
  'causes',
  'description',
  'relatedDynasties',
  'relatedRulers',
  'relatedWars',
  'articles',
  'readings',
  'sources',
] as const;

const RequestQueryValidation = z.object({
  fields: z
    .string()
    .transform((value) => value.split(','))
    .pipe(z.array(z.enum(validFieldOptions)))
    .optional(),
});

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
    // Check and validate the 'search' parameter from the request params
    const validatedRequestParams = ParamsValidationSchema.safeParse(
      request?.params,
    );

    if (!validatedRequestParams.success) {
      return response.status(400).json({
        success: false,
        errors: validatedRequestParams?.error.issues.map((issue) => ({
          field: issue?.path.join(''),
          message: issue?.message,
        })),
      });
    }

    const { search } = validatedRequestParams.data;

    // Retrieve and validate the fields options from the request query
    const validatedRequestQuery = RequestQueryValidation.safeParse(
      request?.query,
    );

    if (!validatedRequestQuery.success) {
      return response.status(400).json({
        success: false,
        errors: validatedRequestQuery.error.issues.map((issue) => ({
          field: issue?.path?.join(''),
          message: issue?.message,
        })),
      });
    }

    const { fields } = validatedRequestQuery.data;

    let DEFAULT_REQUIRED_DB_FIELDS =
      '_id name timeline outcome casualties description.oneline slug otherNames type belligerents locations updatedAt createdAt';

    // Validate each 'fields' entry to check if it exists on the schema
    fields?.forEach(function (field) {
      if (field === 'readings') {
        DEFAULT_REQUIRED_DB_FIELDS += ' furtherReading';
      } else if (field === 'description') {
        DEFAULT_REQUIRED_DB_FIELDS += ` description.long`;
      } else {
        DEFAULT_REQUIRED_DB_FIELDS += ` ${field}`;
      }
    });

    // Setup the unique cache key and try to retrieve from cache memory - with a fallback to the regular database query
    const cacheKey = `search:${search}:${fields?.join(':')}`;

    // Using the updated fields entry, select all required fields from the specific entity
    const wars = await cacheAside('wars', cacheKey, 3600, () =>
      Wars.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { otherNames: { $elemMatch: { $regex: search, $options: 'i' } } },
          { locations: { $elemMatch: { $regex: search, $options: 'i' } } },
        ],
      })
        .select(DEFAULT_REQUIRED_DB_FIELDS)
        .lean(),
    );

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
