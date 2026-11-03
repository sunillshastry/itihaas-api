import NewWar from '@/models/contributions/new/NewWar';
import AppException from '@/services/AppException';
import FailureLogs from '@/services/FailureLogs';
import { Request, Response } from 'express';
import z from 'zod';

const ValidationSchema = z.object({
  name: z.string().min(1),
  otherNames: z.string().optional().default(''),
  timelineBegin: z.string().optional().default(''),
  timelineEnd: z.string().optional().default(''),
  winners: z.string().optional().default(''),
  losers: z.string().optional().default(''),
  casualties: z.string().optional().default(''),
  locations: z.string().optional().default(''),
  leadersWinners: z.string().optional().default(''),
  leadersLosers: z.string().optional().default(''),
  causes: z.string().optional().default(''),
  descriptionShort: z.string().min(1).max(255),
  descriptionLong: z.string().max(2500).optional().default(''),
  sources: z.string().min(1),
  furtherReading: z.string().optional().default(''),
  articles: z.string().optional().default(''),
  additionalComments: z.string().optional().default(''),

  userName: z.string().min(1).max(100),
  userEmail: z.email(),
  userLocation: z.string().optional().default(''),
  enablePublicCredentials: z.boolean().optional().default(false),
});

/**
 * Controller function to create a contribution record for new war
 *
 * @param request Default request object from Express
 * @param response Default response object from Express
 * @returns A success/failure response (with 201/400/500 status codes) based on the incoming request
 */
export default async function newWarContribution(
  request: Request,
  response: Response,
) {
  try {
    // Retrieve all the form fields from the request body and validate them with Zod
    const requestBody: z.infer<typeof ValidationSchema> = request?.body;

    const validated = ValidationSchema.safeParse(requestBody);

    if (!validated.success) {
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
    const war = await NewWar.create({
      ...validated?.data,
    });

    return response.status(201).json({
      success: true,
      message: 'New war contribution request submitted!',
      data: {
        war,
      },
    });
  } catch (e) {
    // Custom app error log
    const appException = new AppException(
      'Failed to create a new war contribution request',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.contributions.new.newWarContribution',
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
