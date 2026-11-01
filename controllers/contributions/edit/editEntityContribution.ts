import EditEntity from '@/models/contributions/edit/EditEntity';
import AppException from '@/services/AppException';
import FailureLogs from '@/services/FailureLogs';
import { Request, Response } from 'express';
import z from 'zod';

const ValidationSchema = z.object({
  entity: z.enum(['war', 'ruler', 'dynasty']),
  name: z.string().min(1).max(255),
  link: z.url(),
  fieldName: z.string().min(1),
  fieldContent: z.string().min(1),
  sources: z.string().min(1),
  additionalComments: z.string().optional().default(''),

  userName: z.string().min(1),
  userEmail: z.email(),
  userLocation: z.string().optional().default(''),
  enablePublicCredentials: z.boolean().optional().default(false),
});

/**
 * Controller function to create a contribution record for editing an entity
 *
 * @param request Default request object from Express
 * @param response Default response object from Express
 * @returns A success/failure response (with 201/400/500 status codes) based on the incoming request
 */
export default async function editEntityContribution(
  request: Request,
  response: Response,
) {
  try {
    // Perform the required validation on the request body
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

    // Upon successful validation, create a new record on the collection with the built model
    const editEntity = await EditEntity.create({
      ...validated?.data,
    });

    return response.status(201).json({
      success: true,
      message: `Edit ${validated?.data?.entity} contribution request submitted!`,
      data: {
        entity: editEntity,
      },
    });
  } catch (e) {
    // Custom app error log
    const appException = new AppException(
      'Failed to create a edit entity contribution request',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.contributions.edit.editEntityController',
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
