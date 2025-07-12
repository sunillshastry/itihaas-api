// Global imports
const dotenv = require('dotenv');

dotenv.config();

// Models
const Dynasties = require('@/models/Dynasties');

// Services
const FailureLogs = require('@/services/FailureLogs');
const AppException = require('@/services/AppException');

/**
 * Controller function to get a dynasty by its ID parameter for dynasties route
 *
 * @param {Object} request Default Express Request object
 * @param {Object} response Default Express Response object
 * @returns A response with status code 200, 404 or 500 signifying success or
 *     failures respectively
 */
async function getDynastiesById(request, response) {
  const { id } = request.params;
  try {
    // Get dynasty from database
    const dynasty = await Dynasties.findById(id);

    // Check if dynasty exists - send 404 response if it doesn't
    if (!dynasty) {
      const appException = new AppException(
        'Failed to locate specified resource in database',
        404,
        'error',
        false,
        `${request.host}:${request.originalUrl}`,
        request.method,
        'controllers.dynasties.getDynastyById',
      );

      if (process.env.NODE_ENV === 'development') {
        return response.status(404).json({
          success: false,
          message: FailureLogs.entityNotFound(),
          log: appException.log(),
        });
      }

      return response.status(404).json({
        success: false,
        message: FailureLogs.entityNotFound(),
      });
    }

    // Return success response
    return response.status(200).json({
      success: true,
      data: {
        dynasty,
      },
    });
  } catch (e) {
    const appException = new AppException(
      'Failed to fetch specified resource in database',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.dynasties.getDynastyById',
    );

    if (process.env.NODE_ENV === 'development') {
      return response.status(500).json({
        success: false,
        message: FailureLogs.entityNotFound(),
        errorLog: e,
        log: appException.log(),
      });
    }

    return response.status(500).json({
      success: false,
      message: FailureLogs.databaseAccessFailure(),
    });
  }
}

module.exports = getDynastiesById;
