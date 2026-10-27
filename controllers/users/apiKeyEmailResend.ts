import { sendEmail } from '@/email';
import Users from '@/models/Users';
import AppException from '@/services/AppException';
import FailureLogs from '@/services/FailureLogs';
import generateVerificationToken from '@/utils/generateVerificationToken';
import { Request, Response } from 'express';
import z from 'zod';

const ValidationSchema = z.object({
  email: z.email(),
});

/**
 * Controller function for the users route to handle the API key resend service
 *
 * @param request Default request object from Express
 * @param response Default Response object from Express
 * @returns A corresponding success/failure response (200/400/500) based on the incoming request
 */
export default async function apiKeyEmailResend(
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

    // Check if the user exists in the database with the provided email address (user must already be registered)
    const user = await Users.findOne({ email: email?.toLowerCase() });

    if (user === null) {
      return response.status(403).json({
        success: false,
        message:
          'Provided email address is not registered with us. Please register for an API key',
      });
    }

    // Check if the user was previously verified already
    if (user?.verified) {
      return response.status(400).json({
        success: false,
        message:
          "Provided email address is already verified. Use the 'recover' service to recover your API key",
      });
    }

    // Create a new verification token for the user to verify
    const verificationToken = generateVerificationToken({
      id: user?._id?.toString(),
      name: user?.name,
      email: user?.email,
    });

    // Build the verification link
    let verificationLink;
    if (process.env?.['NODE_ENV'] === 'development') {
      verificationLink = `http://localhost:3000/verify/${verificationToken}`;
    } else {
      verificationLink = `https://itihaas.netlify.app/verify/${verificationToken}`;
    }

    // Send email with API key to the user
    // Using the sendEmail service to asynchronously mail using BullMQ and Redis
    await sendEmail({
      type: 'verification-resend',
      to: user?.email,
      name: user?.name,
      link: verificationLink,
      expiresIn: '15 minutes',
    });

    return response.status(200).json({
      success: true,
      token: verificationToken,
      link: verificationLink,
      expiration: '15 minutes',
    });
  } catch (e) {
    // Custom app error log
    const appException = new AppException(
      'Failed to perform API key email resend',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.users.apiKeyResend',
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
