import Users from '@/models/Users';
import AppException from '@/services/AppException';
import FailureLogs from '@/services/FailureLogs';
import generateApiKey from '@/utils/generateApiKey';
import generateVerificationToken from '@/utils/generateVerificationToken';
import { Request, Response } from 'express';
import validator from 'validator';

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
    const { name, email, usageReason, privacyAgreement, captcha } =
      request.body;

    // Basic validation to ensure the attributes are in the right format
    if (!name) {
      return response.status(400).json({
        success: false,
        message: 'Name is a required field',
      });
    }

    if (!privacyAgreement || privacyAgreement !== true || !captcha) {
      return response.status(400).json({
        success: false,
        message: 'Missing or incorrect fields: privacyAgreement, captcha',
      });
    }

    if (!email || !validator.isEmail(email)) {
      return response.status(400).json({
        success: false,
        message: 'Email is a required field and must be a valid address',
      });
    }

    // Check if the provided email is already previously registered
    const doesUserExistByEmail = await Users.find({
      email: email?.toLowerCase(),
    });
    if (doesUserExistByEmail) {
      return response.status(400).json({
        success: false,
        message:
          'The provided email is already registered and in use. Please use the recovery option to access',
      });
    }

    // Validate the captcha specifically
    // TODO: Validate the captcha to ensure it is the correct captcha code

    const apiKey = generateApiKey();

    // Set the 'verified' attribute to false by default for a new user
    const verified = false;

    const user = await Users.create({
      name: name.toLowerCase(),
      email,
      verified,
      usageReason: usageReason ?? '',
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

    // TODO: Implement the feature to send the email to the user with the verification link

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
      'Failed to verify user details',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.users.apiVerify',
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
