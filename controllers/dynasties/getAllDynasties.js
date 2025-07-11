// Global imports
const dotenv = require('dotenv');

dotenv.config();

// Models
const Dynasties = require('@/models/Dynasties');

// Services
const FailureLogs = require('../../services/FailureLogs');
const AppException = require('../../services/AppException');
const checkValidQueryField = require('../../utils/checkValidQueryField');
const convertStringToBoolean = require('../../utils/convertStringToBoolean');

/**
 * Controller function to get all Dynasties for dynasties routes
 *
 * @param {Object} request Default Express Request object
 * @param {Object} response Default Express Response object
 * @returns A response with status code 200 or 500 signifying success or failure
 *     respectively
 */
async function getAllDynasties(request, response) {
  try {
    // Retrieve from request queries
    const { fields, wars, rulers } = request.query;

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
    let DEFAULT_REQUIRED_DB_FIELDS =
      '_id slug name timeline capitals population locations description.oneline otherNames';

    // Append any additional user requested fields
    userRequestedFields.forEach(function (field) {
      if (checkValidQueryField(VALID_FIELD_ENTRIES, field)) {
        DEFAULT_REQUIRED_DB_FIELDS += ` ${field === 'description' ? 'description.long' : field}`;
      }
    });

    // Explicitly check for 'wars' in request.query
    if (wars && convertStringToBoolean(wars)) {
      DEFAULT_REQUIRED_DB_FIELDS += ' wars';
    }

    // Explicitly check for 'rulers' in request.query
    if (rulers && convertStringToBoolean(rulers)) {
      DEFAULT_REQUIRED_DB_FIELDS += ' rulers';
    }

    // Retrieve specific fields from database
    const dynasties = await Dynasties.find({}).select(
      DEFAULT_REQUIRED_DB_FIELDS,
    );

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
    const appException = new AppException(
      'Failed to fetch all dynasties from database',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.dynasties.getAllDynasties',
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

module.exports = getAllDynasties;
