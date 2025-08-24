// const prisma = require('@/database/prisma');
const prisma = require('@/database/prisma');
const AppException = require('@/services/AppException');
const FailureLogs = require('@/services/FailureLogs');
const verifyTokenValidation = require('@/utils/verifyTokenValidation');

async function apiRegistration(request, response) {
  try {
    // Get the verification token and validate its presence
    const { token } = request.body;
    if (!token) {
      return response.status(400).json({
        success: false,
        message: 'Required fields: token',
      });
    }

    // Check if the token is still valid
    const decoded = await verifyTokenValidation(token);
    if (decoded === null || !decoded.id) {
      return response.status(403).json({
        success: false,
        message: 'Your token has expired. Please try again!',
      });
    }

    // Update the user's 'verified' status to true
    const user = await prisma.user.update({
      where: {
        id: decoded?.id,
      },
      data: {
        verified: true,
      },
    });

    // Retrieve the apiKey field from the user's entity
    const apiKey = user.api_key;

    // TODO: Implement functionality/logic to send emails to user
    // Send email to the user with the apiKey present in it

    return response.status(200).json({
      success: true,
      message: 'Successfully verified user registration',
      apiKey,
    });
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
