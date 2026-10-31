import { Request, Response } from 'express';
import dotenv from 'dotenv';
import AppException from '@/services/AppException';
import FailureLogs from '@/services/FailureLogs';
import Wars from '@/models/Wars';
import z from 'zod';
import { cacheAside } from '@/cache/redis';
dotenv.config();

const validFieldEntries = ['id', 'slug', 'type'] as const;

const RequestQueryValidation = z.object({
  include: z
    .string()
    .transform((value) => value.split(','))
    .pipe(z.array(z.enum(validFieldEntries)))
    .optional(),
});

/**
 * Controller function to get a list of war names with specified 'id' or
 * 'slug' fields
 *
 * @param {Object} request Default Express request object
 * @param {Object} response Default Express response object
 * @returns A response code with status code 200, 404 or 500 signifying success
 *     or failure respectively
 */
export default async function getWarTitles(
  request: Request,
  response: Response,
) {
  try {
    // Retrieve the 'include' query and ensure it is prompt validated

    const validatedRequestQuery = RequestQueryValidation.safeParse(
      request?.query,
    );

    if (!validatedRequestQuery?.success) {
      return response.status(400).json({
        success: false,
        errors: validatedRequestQuery.error.issues.map((issue) => ({
          field: issue?.path.join(''),
          message: issue?.message,
        })),
      });
    }

    const { include } = validatedRequestQuery.data;

    const databaseProjection: {
      name: number;
      _id: number | string;
      slug?: string | number;
    } = {
      name: 1,
      _id: 0,
    };
    let isReturnTypeObject = false;

    // Check if query is included and validate them
    if (include) {
      const prohibitedFields = include?.filter(
        (field) => !validFieldEntries.includes(field),
      );

      if (prohibitedFields?.length > 0) {
        const appException = new AppException(
          'Failed to locate specified resource in database',
          404,
          'error',
          false,
          `${request.host}:${request.originalUrl}`,
          request.method,
          'controllers.wars.getWarTitles',
        );

        if (process?.env?.['NODE_ENV'] === 'development') {
          return response.status(404).json({
            success: false,
            message: FailureLogs.entityNotFound(),
            log: appException.log(),
          });
        }

        return response.status(404).json({
          success: false,
          message: FailureLogs.entityNotFound(),
        });
      }

      isReturnTypeObject = true;
      // Update _id field in projection
      if (include.includes('id')) {
        // eslint-disable-next-line no-underscore-dangle
        databaseProjection._id = 1;
      }

      // Update slug field in projection
      if (include.includes('slug')) {
        databaseProjection.slug = 1;
      }
    }

    const cacheKey = `titles:${include?.join(':')}`;
    const wars = await cacheAside('wars', cacheKey, 3600, () =>
      Wars.find({}, databaseProjection).lean(),
    );

    let result;
    if (isReturnTypeObject) {
      if (include?.includes('type')) {
        result = wars.map((war) => ({
          ...war,
          type: 'war',
        }));
      } else {
        result = wars.map((war) => ({
          ...war,
        }));
      }
    } else {
      result = wars.map((war) => war.name);
    }

    return response.status(200).json({
      success: true,
      size: result?.length,
      data: {
        wars: result,
      },
    });
  } catch (e) {
    const appException = new AppException(
      'Failed to fetch specified resource from the database',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.wars.getWarTitles',
    );

    if (process?.env?.['NODE_ENV'] === 'development') {
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
