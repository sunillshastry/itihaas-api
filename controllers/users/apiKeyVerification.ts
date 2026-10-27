import { sendEmail } from '@/email';
import Users from '@/models/Users';
import AppException from '@/services/AppException';
import FailureLogs from '@/services/FailureLogs';
import verifyTokenValidation from '@/utils/verifyTokenValidation';
import { Request, Response } from 'express';
import z from 'zod';

const ValidationSchema = z.object({
  token: z.string().min(1),
});

/**
 * Controller function for the users route to handle the API key verification service
 *
 * @param request Default request object from Express
 * @param response Default Response object from Express
 * @returns A corresponding success/failure response (200/400/500) based on the incoming request
 */
export default async function apiKeyVerification(
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
        errors: validated?.error?.issues.map((issue) => ({
          field: issue?.path?.join(''),
          message: issue?.message,
        })),
      });
    }

    // On successful validation and verification, proceed ahead with the validated data
    const { token } = validated.data;

    // Check if the provided token is still valid (not expired)
    const decoded = await verifyTokenValidation(token);
    if (decoded === null || !decoded?.id) {
      return response.status(401).json({
        success: false,
        expired: true,
        message: `Provided token has expired. Please use the API Resend service for new verification link`,
      });
    }

    // If the provided token value is correct and valid (not expired), then update the 'verified' status to true
    const user = await Users.findByIdAndUpdate(decoded?.id, { verified: true });

    // On successful verification, retrieve the user's ID attribute and send it securely via email
    const apiKey = user?.apiKey;

    // Using the sendEmail service to asynchronously mail using BullMQ and Redis
    if (!user?.verified) {
      await sendEmail({
        type: 'verification-success',
        to: user?.email as string,
        name: user?.name as string,
        userId: user?._id.toString() as string,
      });
    }

    return response.status(200).json({
      success: true,
      message: 'Successfully verified user account and API key',
      apiKey,
    });
  } catch (e) {
    // Custom app error log
    const appException = new AppException(
      'Failed to perform API key verification',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.users.apiKeyVerification',
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
