// Global imports
const dotenv = require('dotenv');

dotenv.config();

// Local imports
const Rulers = require('@/models/Rulers');
const AppException = require('@/services/AppException');
const FailureLogs = require('@/services/FailureLogs');

/**
 * Controller function to get a list of ruler names with specified 'id' or 'slug' fields
 *
 * @param {Object} request Default Express request object
 * @param {Object} response Default Express response object
 * @returns A response code with status code 200, 404 or 500 signifying success or failure respectively
 */
async function getRulerTitles(request, response) {
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
          'controllers.rulers.getRulerTitles',
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
    const rulers = await Rulers.find({}, databaseProjection).lean();
    let result;
    if (isReturnTypeObject) {
      if (userRequestedFields.includes('type')) {
        result = rulers.map((ruler) => ({
          ...ruler,
          type: 'ruler',
        }));
      } else {
        result = rulers.map((ruler) => ({
          ...ruler,
        }));
      }
    } else {
      result = rulers.map((ruler) => ruler.name);
    }

    // Return success response
    return response.status(200).json({
      success: true,
      size: result.length,
      data: {
        rulers: result,
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
      'controllers.rulers.getRulerBySlugName',
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

module.exports = getRulerTitles;
