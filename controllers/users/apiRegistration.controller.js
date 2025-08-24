// const prisma = require('@/database/prisma');
const AppException = require('@/services/AppException');
const FailureLogs = require('@/services/FailureLogs');
const generateApiKey = require('@/utils/generateApiKey');

async function apiRegistration(request, response) {
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

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
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
          'THe privacyAgreement field is required and must be true. User must agree to the privacy policy and terms of service to register',
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

    // Create the User field in database
    // const user = await prisma.user.create({
    //   data: {
    //     name,
    //     email,
    //     usage_reason: usageReason,
    //     privacy_agreement: privacyAgreement,
    //     captcha,
    //     api_key: apiKey,
    //   },
    // });
    const user = {
      name,
      email,
      usage_reason: usageReason,
      privacy_agreement: privacyAgreement,
      captcha,
      api_key: apiKey,
    };

    // TODO: Implement feature to send email to user with the API key
    // Send email with API key to the user

    if (user) {
      return response.status(201).json({
        success: true,
        data: {
          user,
        },
        apiKey: user?.api_key,
      });
    }
  } catch (e) {
    // Custom app error log
    const appException = new AppException(
      'Failed to fetch all rulers from database',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.rulers.getAllRulers',
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

module.exports = apiRegistration;
