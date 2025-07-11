// Global imports
const dotenv = require('dotenv');

dotenv.config();

// Models
const Dynasties = require('@/models/Dynasties');

// Services
const FailureLogs = require('@/services/FailureLogs');
const AppException = require('@/services/AppException');
const checkValidQueryField = require('@/utils/checkValidQueryField');

/**
 * Controller function to get dynasties by search
 *
 * @param {Object} request Default Express request object
 * @param {Object} response Default Express response object
 * @returns A response code with status code 200, 404 or 500 signifying success
 *     or failure respectively
 */
async function getDynastiesBySearch(request, response) {
  const { search } = request.params;
  // Retrieve from request queries
  const { fields } = request.query;

  // Format all 'fields' values into an array
  const userRequestedFields =
    (fields && fields.split(',').map((field) => field.trim().toLowerCase())) ||
    [];

  // List of valid fields that the user can request
  const VALID_FIELD_ENTRIES = [
    'area',
    'description',
    'languages',
    'religions',
    'currencies',
    'articles',
    'readings',
    'sources',
  ];

  let DEFAULT_REQUIRED_DB_FIELDS =
    '_id slug name timeline capitals population locations description.oneline otherNames';

  userRequestedFields.forEach(function (field) {
    if (field === 'readings') {
      DEFAULT_REQUIRED_DB_FIELDS += ' furtherReading';
    }

    if (checkValidQueryField(VALID_FIELD_ENTRIES, field)) {
      DEFAULT_REQUIRED_DB_FIELDS += ` ${field === 'description' ? 'description.long' : field}`;
    }
  });

  try {
    // Use MongoDB find query to get all matches with 'name' or 'otherNames'
    // properties
    const dynasties = await Dynasties.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { otherNames: { $elemMatch: { $regex: search, $options: 'i' } } },
      ],
    }).select(DEFAULT_REQUIRED_DB_FIELDS);

    // Return success response
    return response.status(200).json({
      success: true,
      size: dynasties.length,
      entity: 'dynasty',
      data: {
        dynasties,
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
      'controllers.dynasties.getDynastiesBySearch',
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

module.exports = getDynastiesBySearch;
