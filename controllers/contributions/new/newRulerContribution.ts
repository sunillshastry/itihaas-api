import { Request, Response } from 'express';
import 'dotenv/config';
import z from 'zod';
import NewRuler from '@/models/contributions/new/NewRuler';
import AppException from '@/services/AppException';
import FailureLogs from '@/services/FailureLogs';

const ValidationSchema = z.object({
  name: z.string().min(1),
  otherNames: z.string().optional().default(''),
  bornYear: z.string().optional().default(''),
  diedYear: z.string().optional().default(''),
  dynasty: z.string().min(1).max(255),
  predecessor: z.string().optional().default(''),
  successor: z.string().optional().default(''),
  familyFather: z.string().optional().default(''),
  familyMother: z.string().optional().default(''),
  familyWives: z.string().optional().default(''),
  familyChildren: z.string().optional().default(''),
  religions: z.string().optional().default(''),
  reignBegin: z.string().optional().default(''),
  reignEnd: z.string().optional().default(''),
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
 * Controller function to create a contribution record for new ruler
 *
 * @param request Default request object from Express
 * @param response Default response object from Express
 * @returns A success/failure response (with 201/400/500 status codes) based on the incoming request
 */
export default async function newRulerContribution(
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
    const ruler = await NewRuler.create({
      ...validated?.data,
    });

    return response.status(201).json({
      success: true,
      message: 'New ruler contribution request submitted!',
      data: {
        ruler,
      },
    });
  } catch (e) {
    // Custom app error log
    const appException = new AppException(
      'Failed to create a new ruler contribution request',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.contributions.new.newRulerContribution',
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
