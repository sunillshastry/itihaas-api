import { Request, Response } from 'express';
import z from 'zod';
import dotenv from 'dotenv';
import NewDynasty from '@/models/contributions/new/NewDynasty';
import AppException from '@/services/AppException';
import FailureLogs from '@/services/FailureLogs';
dotenv.config();

const ValidationSchema = z.object({
  name: z.string().min(1),
  otherNames: z.string().optional().default(''),
  timelineBegin: z.string().min(1).max(150),
  timelineEnd: z.string().min(1).max(150),
  capitals: z.string().optional().default(''),
  currencies: z.string().optional().default(''),
  locations: z.string().optional().default(''),
  languages: z.string().optional().default(''),
  population: z.string().optional().default(''),
  area: z.string().optional().default(''),
  religions: z.string().optional().default(''),
  descriptionShort: z.string().min(10).max(255),
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
 * Controller function to create a contribution record for new dynasty
 *
 * @param request Default request object from Express
 * @param response Default response object from Express
 * @returns A success/failure response (with 201/400/500 status codes) based on the incoming request
 */
export default async function newDynastyContribution(
  request: Request,
  response: Response,
) {
  try {
    // Ensure the incoming request's body is validated using the designed schema
    const requestBody: z.infer<typeof ValidationSchema> = request.body;

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

    // Create a new dynasty contribution record upon successful validation
    const dynasty = await NewDynasty.create({
      ...validated.data,
      timeline: {
        begin: validated?.data?.timelineBegin,
        end: validated?.data?.timelineEnd,
      },
    });

    return response.status(201).json({
      success: true,
      message: 'New dynasty contribution request submitted!',
      data: {
        dynasty,
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
      'controllers.contributions.new.newDynastyContribution',
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
