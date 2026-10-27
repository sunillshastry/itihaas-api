import { sendEmail } from '@/email';
import Users from '@/models/Users';
import AppException from '@/services/AppException';
import FailureLogs from '@/services/FailureLogs';
import { Request, Response } from 'express';
import z from 'zod';

const ValidationSchema = z.object({
  email: z.email(),
});

/**
 * Controller function for the users route to handle the API key recovery service
 *
 * @param request Default request object from Express
 * @param response Default response object from Express
 * @returns A corresponding success/failure response (200/400/500) based on the incoming request
 */
export default async function apiKeyRecovery(
  request: Request,
  response: Response,
) {
  try {
    const requestBody: z.infer<typeof ValidationSchema> = request.body;

    // Perform the required validation for the request body - ensuring proper verification
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

    // On successful validation and verification, proceed ahead with the validated data
    const { email } = validated.data;

    // Ensure the provided email exists (registered previously)
    const user = await Users.findOne({ email: email?.toLowerCase() });

    if (user === null) {
      return response.status(403).json({
        success: false,
        message:
          'Incorrect credentials. You are forbidden to make this request',
      });
    }

    // Check if the corresponding email's account/registration is 'verified' already
    if (!user?.verified) {
      return response.status(401).json({
        success: false,
        message:
          'Please verify your account and email address using the email verification sent. If you require a new verification link, please use the API key resend service',
      });
    }

    // On passing all validations, retrieve the API key from the email's document and send a new email to the user
    // Using the sendEmail service to asynchronously mail using BullMQ and Redis
    await sendEmail({
      type: 'api-key-recovery',
      to: user?.email,
      name: user?.name,
      userId: user?._id.toString(),
    });

    return response.status(200).json({
      success: true,
      message: 'Success: Please check your email',
    });
  } catch (e) {
    // Custom app error log
    const appException = new AppException(
      'Failed to perform API Key Recovery',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.users.apiKeyRecovery',
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
