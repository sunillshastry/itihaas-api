// Global imports
import dotenv from 'dotenv';
import Rulers from '@/models/Rulers';
import AppException from '@/services/AppException';
import FailureLogs from '@/services/FailureLogs';
import { Request, Response } from 'express';
import z from 'zod';
import { cacheAside } from '@/cache/redis';

dotenv.config();

// Configure and implement the schema setup for request.params and request.query
const ParamsValidationSchema = z.object({
  search: z.string().min(3),
});

const validFieldOptions = [
  'religion',
  'predecessor',
  'successor',
  'family',
  'wars',
  'description',
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
 * Controller function to get rulers by search
 *
 * @param {Object} request Default Express request object
 * @param {Object} response Default Express response object
 * @returns A response code with status code 200, 404 or 500 signifying success or failure respectively
 */
async function getRulersBySearch(request: Request, response: Response) {
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

  // On successful validation, ensure all the provided fields are appended to the select option
  let DEFAULT_REQUIRED_DB_FIELDS =
    '_id slug name timeline description.oneline otherNames born died dynasty createdAt updatedAt';

  fields?.forEach(function (field) {
    if (field === 'readings') {
      DEFAULT_REQUIRED_DB_FIELDS += ' furtherReading';
    } else if (field === 'description') {
      DEFAULT_REQUIRED_DB_FIELDS += ` description.long`;
    } else {
      DEFAULT_REQUIRED_DB_FIELDS += ` ${field}`;
    }
  });

  try {
    // Setup the unique cache key and try to retrieve from cache memory - with a fallback to the regular database query
    const cacheKey = `search:${search}:${fields?.join(':')}`;

    const rulers = await cacheAside('rulers', cacheKey, 3600, () =>
      Rulers.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { otherNames: { $elemMatch: { $regex: search, $options: 'i' } } },
          { dynasty: { $regex: search, $options: 'i' } },
        ],
      })
        .select(DEFAULT_REQUIRED_DB_FIELDS)
        .lean(),
    );

    // Return success response
    return response.status(200).json({
      success: true,
      size: rulers.length,
      entity: 'ruler',
      data: {
        rulers,
      },
    });
  } catch (e) {
    // Build app exception on server error
    const appException = new AppException(
      'Failed to fetch specified resource from the database',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.dynasties.getRulersBySearch',
    );

    // Development mode response
    if (process.env?.['NODE_ENV'] === 'development') {
      return response.status(500).json({
        success: false,
        message: FailureLogs.databaseAccessFailure(),
        errorLog: e,
        log: appException.log(),
      });
    }

    // Default response
    return response.status(500).json({
      success: false,
      message: FailureLogs.databaseAccessFailure(),
    });
  }
}

export default getRulersBySearch;
