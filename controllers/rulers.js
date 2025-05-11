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

/**
 * Get a ruler by their ID parameter
 *
 * @param {Object} request Default request object for Express
 * @param {Object} response Default response object for Express
 * @returns A response with 200, 404 or 500 status code signifying success or failures respectively
 */
async function getRulerById(request, response) {
  // Get the ID from the params
  const { id } = request.params;

  try {
    // Fetch the ruler from database
    const ruler = await Rulers.findById(id);

    // If no ruler is found
    if (!ruler) {
      const appException = new AppException(
        'Failed to locate specified resource in database',
        404,
        'error',
        false,
        `${request.host}:${request.originalUrl}`,
        request.method,
        'controllers.rulers.getRulerById',
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
    // Server errors
    const appException = new AppException(
      'Failed to retrieve specified ruler under the provided ID parameter',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.rulers.getRulerById',
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
      'controllers.dynasties.getDynastyBySlugName',
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

module.exports = {
  getAllRulers,
  getRulerById,
  getRulerBySlugName,
};
