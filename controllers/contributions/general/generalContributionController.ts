import GeneralContribution from '@/models/contributions/general/GeneralContribution';
import AppException from '@/services/AppException';
import FailureLogs from '@/services/FailureLogs';
import { Request, Response } from 'express';
import z from 'zod';

const ValidationSchema = z.object({
  subject: z.string().min(1),
  description: z.string().min(1).max(2500),
  additionalComments: z.string().optional().default(''),
  userName: z.string().min(1),
  userEmail: z.email(),
  userLocation: z.string().optional().default(''),
  enablePublicCredentials: z.boolean().optional().default(false),
});

/**
 * Controller function to create a record for general contributions
 *
 * @param request Default request object from Express
 * @param response Default response object from Express
 * @returns A success/failure response (with 201/400/500 status codes) based on the incoming request
 */
export default async function generalContributionController(
  request: Request,
  response: Response,
) {
  try {
    // Retrieve all the form fields from the request body and validate them with Zod
    const requestBody: z.infer<typeof ValidationSchema> = request?.body;

    const validated = ValidationSchema.safeParse(requestBody);

    if (!validated?.success) {
      return response.status(400).json({
        success: false,
        message: 'Error: Request validation failed or missing attributes',
        errors: validated.error.issues.map((issue) => ({
          field: issue?.path?.join(''),
          message: issue?.message,
        })),
      });
    }

    // Upon successful validation, create a new record in the contributions database
    const contribution = await GeneralContribution.create({
      ...validated?.data,
    });

    return response.status(201).json({
      success: true,
      message: 'New general contribution request submitted!',
      data: {
        contribution,
      },
    });
  } catch (e) {
    // Custom app error log
    const appException = new AppException(
      'Failed to create a new general contribution request',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.contributions.general.generalContribution',
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
