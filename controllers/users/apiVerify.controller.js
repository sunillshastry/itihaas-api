const prisma = require('@/database/prisma');
const AppException = require('@/services/AppException');
const FailureLogs = require('@/services/FailureLogs');
const generateApiKey = require('@/utils/generateApiKey');
const generateVerificationToken = require('@/utils/generateVerificationToken');
const validator = require('validator');

async function apiVerify(request, response) {
  try {
    let { name, email } = request.body;
    const { usageReason, privacyAgreement, captcha } = request.body;

    // Validations
    if (!name || name.trim().length < 5) {
      return response.status(400).json({
        success: false,
        message:
          'Name is a required field and its value must be at least five characters long',
      });
    }
    name = name.trim();

    if (!email || !validator.isEmail(email)) {
      return response.status(400).json({
        success: false,
        message:
          'Email is a required field and its value must be a valid email',
      });
    }
    email = email.toLowerCase();

    if (!privacyAgreement || privacyAgreement !== true) {
      return response.status(400).json({
        success: false,
        message:
          'The privacyAgreement field is required and must be true. User must agree to the privacy policy and terms of service to register',
      });
    }

    if (!captcha) {
      return response.status(400).json({
        success: false,
        message: 'Captcha field is required',
      });
    }
    // TODO: Test for correct captcha verification from recaptcha

    // Get API key for the user
    const apiKey = generateApiKey();

    // WARNING: By default 'verified' status is set to false, this is by design and will be updated when user verifies their details. DO NOT CHANGE
    const verified = false;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        usage_reason: usageReason,
        privacy_agreement: privacyAgreement,
        captcha,
        api_key: apiKey,
        verified,
      },
    });

    // Create a verification token for the user to verify themselves
    const verificationToken = generateVerificationToken({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    // Build a verification link for the user to verify their account status
    let verificationLink;
    if (process.env.NODE_ENV === 'development') {
      verificationLink = `http://localhost:3000/verify/${verificationToken}`;
    } else {
      verificationLink = `https://itihaas.netlify.app/verify/${verificationToken}`;
    }

    // TODO: Implement feature to send email to user with the API key
    // Send email with API key to the user

    return response.status(201).json({
      success: true,
      data: {
        name: user?.name,
        email: user?.email,
        id: user?.id,
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
    if (process.env.NODE_ENV === 'development') {
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

module.exports = apiVerify;
