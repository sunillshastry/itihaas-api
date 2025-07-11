// Global imports
const dotenv = require('dotenv');

dotenv.config();

// Models
const Dynasties = require('../../models/Dynasties');

// Services
const FailureLogs = require('../../services/FailureLogs');
const AppException = require('../../services/AppException');

/**
 * Controller function to get a list of dynasty names with specified 'id' or
 * 'slug' fields
 *
 * @param {Object} request Default Express request object
 * @param {Object} response Default Express response object
 * @returns A response code with status code 200, 404 or 500 signifying success
 *     or failure respectively
 */
async function getDynastyTitles(request, response) {
  // Retrieve the only query
  const { include } = request.query;

  // Format query fields from the user
  const userRequestedFields =
    (include &&
      include.split(',').map((field) => field.trim().toLowerCase())) ||
    [];

  // List of valid query entry fields
  const VALID_FIELD_ENTRIES = ['id', 'slug', 'type'];

  const databaseProjection = { name: 1, _id: 0 };
  let isReturnTypeObject = false;

  // Check if query is included and validate them
  try {
    if (include) {
      const prohibitedFields = userRequestedFields.filter(
        (field) => !VALID_FIELD_ENTRIES.includes(field),
      );

      if (prohibitedFields.length > 0) {
        const appException = new AppException(
          'Failed to locate specified resource in database',
          404,
          'error',
          false,
          `${request.host}:${request.originalUrl}`,
          request.method,
          'controllers.dynasties.getDynastyTitles',
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

      isReturnTypeObject = true;
      // Update _id field in projection
      if (userRequestedFields.includes('id')) {
        // eslint-disable-next-line no-underscore-dangle
        databaseProjection._id = 1;
      }

      // Update slug field in projection
      if (userRequestedFields.includes('slug')) {
        databaseProjection.slug = 1;
      }
    }

    // Fetch data
    const dynasties = await Dynasties.find({}, databaseProjection).lean();
    let result;
    if (isReturnTypeObject) {
      if (userRequestedFields.includes('type')) {
        result = dynasties.map((dynasty) => ({
          ...dynasty,
          type: 'dynasty',
        }));
      } else {
        result = dynasties.map((dynasty) => ({
          ...dynasty,
        }));
      }
    } else {
      result = dynasties.map((dynasty) => dynasty.name);
    }

    // Return success response
    return response.status(200).json({
      success: true,
      size: result.length,
      data: {
        dynasties: result,
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

module.exports = getDynastyTitles;
