const prisma = require('@/database/prisma');
const AppException = require('@/services/AppException');
const FailureLogs = require('@/services/FailureLogs');
const generateVerificationToken = require('@/utils/generateVerificationToken');
const validator = require('validator');

async function apiResend(request, response) {
  try {
    const { email } = request.body;

    // Check if the email is absent or of incorrect format
    if (!email || !validator.isEmail(email)) {
      return response.status(400).json({
        success: false,
        message: 'Please ensure a valid email is provided',
      });
    }

    // See if a user exists in the database under the provided email address
    const user = await prisma.user.findUnique({
      where: {
        email: email?.toLowerCase(),
      },
    });

    // If no user is present
    if (!user) {
      return response.status(403).json({
        success: false,
        message: 'Provided email is not registered. Please register first',
      });
    }

    // If the user is already verified ('verified' = true)
    if (user?.verified) {
      return response.status(400).json({
        success: false,
        message: `Provided email is already verified. Use the 'recovery' service to recover back your API key`,
      });
    }

    // If all validations are checked:
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

    return response.status(200).json({
      success: true,
      token: verificationToken,
      link: verificationLink,
      expiration: '15 minutes',
    });
  } catch (e) {
    // Custom app error log
    const appException = new AppException(
      'Failed to perform API resend',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.users.apiResend',
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

module.exports = apiResend;
