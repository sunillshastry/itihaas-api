import { sendEmail } from '@/email';
import Users from '@/models/Users';
import AppException from '@/services/AppException';
import verifyCaptcha from '@/services/captchaVerification';
import FailureLogs from '@/services/FailureLogs';
import generateApiKey from '@/utils/generateApiKey';
import generateVerificationToken from '@/utils/generateVerificationToken';
import { Request, Response } from 'express';
import z from 'zod';

const ValidationSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  usageReason: z.string().max(255).optional().default(''),
  privacyAgreement: z.literal(true),
  captcha: z.string().min(1),
});

/**
 * Controller function for implementing the API Registration for a new user
 *
 * @param request Default request object from Express
 * @param response Default response object from Express
 * @returns A handled success or error response (201/500) based on the incoming request
 */
export default async function apiKeyRegistration(
  request: Request,
  response: Response,
) {
  try {
    // Retrieve all the available attributes from the body
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
    const { name, email, usageReason, privacyAgreement, captcha } =
      validated.data;

    // Check if the provided email is already previously registered
    const doesUserExistByEmail = await Users.findOne({
      email: email?.toLowerCase(),
    });

    if (doesUserExistByEmail !== null) {
      return response.status(400).json({
        success: false,
        message:
          'The provided email is already registered and in use. Please use the recovery option to access',
      });
    }

    // Validate the provided reCAPTCHA code with Google using the verifyCaptcha service implemented
    let captchaValid: boolean;

    try {
      captchaValid = await verifyCaptcha(captcha);
    } catch {
      return response.status(503).json({
        success: false,
        message: 'Google reCAPTCHA verification is temporarily unavailable',
      });
    }

    if (!captchaValid) {
      return response.status(403).json({
        success: false,
        message: 'Error: Google reCAPTCHA verification failed',
      });
    }

    // On all successful verifications and checks, proceed further with registration persistence
    const apiKey = generateApiKey();

    // Set the 'verified' attribute to false by default for a new user
    const verified = false;

    const user = await Users.create({
      name,
      email,
      verified,
      usageReason,
      privacyAgreement,
      captcha,
      apiKey,
    });

    const verificationToken = generateVerificationToken({
      id: user?._id.toString(),
      name: user?.name,
      email: user?.email,
    });

    let verificationLink;
    if (process?.env?.['NODE_ENV'] === 'development') {
      verificationLink = `http://localhost:3000/verify/${verificationToken}`;
    } else {
      verificationLink = `https://itihaas.netlify.app/verify/${verificationToken}`;
    }

    // Using the sendEmail service to asynchronously mail using BullMQ and Redis
    await sendEmail({
      type: 'registration',
      to: user?.email,
      name: user?.name,
      link: verificationLink,
      expiresIn: '15 minutes',
    });

    return response.status(201).json({
      success: true,
      data: {
        name: user?.name,
        email: user?.email,
        id: user?._id,
      },
      token: verificationToken,
      link: verificationLink,
      expiration: '15 minutes',
    });
  } catch (e) {
    // Custom app error log
    const appException = new AppException(
      'Failed to perform user and API key registration',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.users.apiKeyRegistration',
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
