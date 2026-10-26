import NewEntity from '@/models/contributions/new/NewEntity';
import AppException from '@/services/AppException';
import FailureLogs from '@/services/FailureLogs';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
import z from 'zod';
dotenv.config();

const ValidationSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional().default(''),
  userName: z.string().min(1).max(100),
  userEmail: z.email(),
  userLocation: z.string().optional().default(''),
  enablePublicCredentials: z.boolean().optional().default(false),
});

/**
 * Controller function to create a contribution record for new entity
 *
 * @param request Default request object from Express
 * @param response Default response object from Express
 * @returns A success/failure response (with 201/400/500 status codes) based on the incoming request
 */
export default async function newEntityContribution(
  request: Request,
  response: Response,
) {
  try {
    // Validate the request body with Zod
    const requestBody: z.infer<typeof ValidationSchema> = request.body;

    const validated = ValidationSchema.safeParse(requestBody);

    if (!validated.success) {
      return response.status(400).json({
        success: false,
        message: 'Error: Request validation failed or missing attributes',
        errors: validated.error.issues.map((issue) => ({
          field: issue?.path.join(''),
          message: issue?.message,
        })),
      });
    }

    // If all fields are correctly validated
    const {
      name,
      description,
      userName,
      userEmail,
      enablePublicCredentials,
      userLocation,
    } = validated.data;

    const entity = await NewEntity.create({
      name: name.trim(),
      description: description?.trim() ?? '',
      userName,
      userEmail,
      enablePublicCredentials,
      userLocation,
    });

    return response.status(201).json({
      success: true,
      data: {
        entity,
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
      'controllers.contributions.new.newEntityContributions',
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
