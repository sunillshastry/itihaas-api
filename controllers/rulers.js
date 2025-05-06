// Global imports
const dotenv = require('dotenv');

dotenv.config();

// Local imports
const Rulers = require('../models/Rulers');
const AppException = require('../services/AppException');
const FailureLogs = require('../services/FailureLogs');

/**
 * Get a list of all rulers
 *
 * @param {Object} request Default request object for Express
 * @param {Object} response Default response object for Express
 * @returns A response with status code 200 or 500, signifying success or failure respectively
 */
async function getAllRulers(request, response) {
  try {
    const DEFAULT_REQUIRED_DB_FIELDS =
      '_id slug name timeline description.oneline otherNames born died dynasty';

    // Query to find all rulers from the database
    const rulers = await Rulers.find().select(DEFAULT_REQUIRED_DB_FIELDS);

    // Send the success response back
    return response.status(200).json({
      success: true,
      size: rulers.length,
      data: {
        rulers,
      },
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

module.exports = {
  getAllRulers,
};
