// Global imports
const dotenv = require('dotenv');

dotenv.config();

// Local imports
const Rulers = require('@/models/Rulers');
const AppException = require('@/services/AppException');
const FailureLogs = require('@/services/FailureLogs');

/**
 * Controller function to get a random ruler
 *
 * @param {Object} request Default Express request object
 * @param {Object} response Default Express response object
 * @returns A response code with status code 200, 404 or 500 signifying success or failure respectively
 */
async function getRandomRuler(request, response) {
  try {
    // Use MongoDB aggregation to get one sized item
    const [random] = await Rulers.aggregate([{ $sample: { size: 1 } }]);

    // Check if exists
    if (!random) {
      // Build app exception
      const appException = new AppException(
        'Failed to locate specified resource in database',
        404,
        'error',
        false,
        `${request.host}:${request.originalUrl}`,
        request.method,
        'controllers.dynasties.getRandomDynasty',
      );

      // Development mode response
      if (process.env.NODE_ENV === 'development') {
        return response.status(404).json({
          success: false,
          message: FailureLogs.entityNotFound(),
          log: appException.log(),
        });
      }

      // Default response
      return response.status(404).json({
        success: false,
        message: FailureLogs.entityNotFound(),
      });
    }

    // Return success response
    return response.status(200).json({
      success: true,
      data: {
        ruler: random,
      },
    });
  } catch (e) {
    // Build app exception on server error
    const appException = new AppException(
      'Failed to fetch specified resource from the database',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.dynasties.getRandomDynasty',
    );

    // Development mode response
    if (process.env.NODE_ENV === 'development') {
      return response.status(500).json({
        success: false,
        message: FailureLogs.databaseAccessFailure(),
        errorLog: e,
        log: appException.log(),
      });
    }

    // Default response
    return response.status(500).json({
      success: false,
      message: FailureLogs.databaseAccessFailure(),
    });
  }
}

module.exports = getRandomRuler;
