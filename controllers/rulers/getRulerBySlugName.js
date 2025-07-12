// Global imports
const dotenv = require('dotenv');

dotenv.config();

// Local imports
const Rulers = require('@/models/Rulers');
const AppException = require('@/services/AppException');
const FailureLogs = require('@/services/FailureLogs');

/**
 * Get a ruler by their slug name
 *
 * @param {Object} request Default request object for express
 * @param {Object} response Default response object for express
 * @returns A response with status code 200, 404 or 500 signifying success or failures respectively
 */
async function getRulerBySlugName(request, response) {
  // Retrieve the 'slug' parameter
  const { slug } = request.params;

  try {
    // Query for the field from database
    const ruler = await Rulers.findOne({ slug });

    // If the ruler does not exist, return 404 response
    if (!ruler) {
      const appException = new AppException(
        'Failed to locate specified resource in database',
        404,
        'error',
        false,
        `${request.host}:${request.originalUrl}`,
        request.method,
        'controllers.rulers.getRulerBySlugName',
      );

      // Response for development mode
      if (process.env.NODE_ENV === 'development') {
        return response.status(404).json({
          success: false,
          message: FailureLogs.entityNotFound(),
          log: appException.log(),
        });
      }

      // Response for production mode
      return response.status(404).json({
        success: false,
        message: FailureLogs.entityNotFound(),
      });
    }

    // Success response
    return response.status(200).json({
      success: true,
      data: {
        ruler,
      },
    });
  } catch (e) {
    const appException = new AppException(
      'Failed to fetch specified resource from the database',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.dynasties.getRulerBySlugName',
    );

    if (process.env.NODE_ENV === 'development') {
      return response.status(500).json({
        success: false,
        message: FailureLogs.databaseAccessFailure(),
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

module.exports = getRulerBySlugName;
