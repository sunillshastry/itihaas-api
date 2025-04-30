// Models
const Dynasties = require('../models/Dynasties');

// Services
const FailureLogs = require('../services/FailureLogs');
const checkValidQueryField = require('../utils/checkValidQueryField');

/**
 * Controller function to get all Dynasties for dynasties routes
 *
 * @param {Object} request Default Express Request object
 * @param {Object} response Default Express Response object
 * @returns A response with status code 200 or 500 signifying success or failure respectively
 */
async function getAllDynasties(request, response) {
  try {
    // Retrieve from request queries
    const { fields } = request.query;

    // Format all 'fields' values into an array
    const userRequestedFields =
      (fields &&
        fields.split(',').map((field) => field.trim().toLowerCase())) ||
      [];

    // List of valid fields that the user can request
    const VALID_FIELD_ENTRIES = [
      'area',
      'description',
      'languages',
      'religions',
      'currencies',
      'articles',
    ];

    // Required fields from database (Default base fields)
    let REQUIRED_DB_FIELDS =
      '_id slug name timeline capitals population locations description.oneline otherNames';

    // Append any additional user requested fields
    userRequestedFields.forEach(function (field) {
      if (checkValidQueryField(VALID_FIELD_ENTRIES, field)) {
        REQUIRED_DB_FIELDS += ` ${field === 'description' ? 'description.long' : field}`;
      }
    });

    // Retrieve specific fields from database
    const dynasties = await Dynasties.find({}).select(REQUIRED_DB_FIELDS);

    // Response with successful response
    return response.status(200).json({
      success: true,
      size: dynasties.length,
      data: {
        dynasties,
      },
    });
  } catch (e) {
    // Provide with server error
    return response.status(500).json({
      success: false,
      message: FailureLogs.databaseAccessFailure(),
      errorLog: e,
    });
  }
}

/**
 * Controller function to get a dynasty by its ID parameter for dynasties route
 *
 * @param {Object} request Default Express Request object
 * @param {Object} response Default Express Response object
 * @returns A response with status code 200, 404 or 500 signifying success or failures respectively
 */
async function getDynastiesById(request, response) {
  const { id } = request.params;
  try {
    // Get dynasty from database
    const dynasty = await Dynasties.findById(id);

    // Check if dynasty exists - send 404 response if it doesn't
    if (!dynasty) {
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
    return response.status(500).json({
      success: false,
      message: FailureLogs.databaseAccessFailure(),
      errorLog: e,
    });
  }
}

/**
 * Controller function to get a dynasty by its slug name for dynasties route
 *
 * @param {Object} request Default Express Request object
 * @param {Object} response Default Express Response object
 * @returns A response with status code 200, 404 or 500 signifying success or failure respectively
 */
async function getDynastyBySlugName(request, response) {
  const { slug } = request.params;
  try {
    // Get dynasty from database via its slug
    const dynasty = await Dynasties.findOne({ slug });

    // Check if dynasty does not exist - return 404
    if (!dynasty) {
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
    return response.status(500).json({
      success: false,
      message: FailureLogs.databaseAccessFailure(),
      errorLog: e,
    });
  }
}

module.exports = {
  getAllDynasties,
  getDynastiesById,
  getDynastyBySlugName,
};
