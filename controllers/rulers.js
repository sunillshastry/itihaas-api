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

/**
 * Controller function to get rulers by search
 *
 * @param {Object} request Default Express request object
 * @param {Object} response Default Express response object
 * @returns A response code with status code 200, 404 or 500 signifying success or failure respectively
 */
async function getRulersBySearch(request, response) {
  const { search } = request.params;
  try {
    // Use MongoDB find query to get all matches with 'name' or 'otherNames' properties
    const rulers = await Rulers.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { otherNames: { $elemMatch: { $regex: search, $options: 'i' } } },
      ],
    });

    // Return success response
    return response.status(200).json({
      success: true,
      size: rulers.length,
      entity: 'ruler',
      data: {
        rulers,
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
      'controllers.dynasties.getRulersBySearch',
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

module.exports = {
  getAllRulers,
  getRulerById,
  getRulerBySlugName,
  getRulerTitles,
  getRandomRuler,
  getRulersBySearch,
};
