// Global imports
const dotenv = require('dotenv');

dotenv.config();

// Models
const Dynasties = require('../models/Dynasties');

// Services
const FailureLogs = require('../services/FailureLogs');
const AppException = require('../services/AppException');
const checkValidQueryField = require('../utils/checkValidQueryField');
const convertStringToBoolean = require('../utils/convertStringToBoolean');

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

/**
 * Controller function to get a dynasty by its ID parameter for dynasties route
 *
 * @param {Object} request Default Express Request object
 * @param {Object} response Default Express Response object
 * @returns A response with status code 200, 404 or 500 signifying success or
 *     failures respectively
 */
async function getDynastiesById(request, response) {
  const { id } = request.params;
  try {
    // Get dynasty from database
    const dynasty = await Dynasties.findById(id);

    // Check if dynasty exists - send 404 response if it doesn't
    if (!dynasty) {
      const appException = new AppException(
        'Failed to locate specified resource in database',
        404,
        'error',
        false,
        `${request.host}:${request.originalUrl}`,
        request.method,
        'controllers.dynasties.getDynastyById',
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

    // Return success response
    return response.status(200).json({
      success: true,
      data: {
        dynasty,
      },
    });
  } catch (e) {
    const appException = new AppException(
      'Failed to fetch specified resource in database',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.dynasties.getDynastyById',
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
 * Controller function to get a dynasty by its slug name for dynasties route
 *
 * @param {Object} request Default Express Request object
 * @param {Object} response Default Express Response object
 * @returns A response with status code 200, 404 or 500 signifying success or
 *     failure respectively
 */
async function getDynastyBySlugName(request, response) {
  const { slug } = request.params;
  try {
    // Get dynasty from database via its slug
    const dynasty = await Dynasties.findOne({ slug });

    // Check if dynasty does not exist - return 404
    if (!dynasty) {
      const appException = new AppException(
        'Failed to locate specified resource in database',
        404,
        'error',
        false,
        `${request.host}:${request.originalUrl}`,
        request.method,
        'controllers.dynasties.getDynastyBySlugName',
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

    // Return success response
    return response.status(200).json({
      success: true,
      data: {
        dynasty,
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

/**
 * Controller function to get a random dynasty
 *
 * @param {Object} request Default Express request object
 * @param {Object} response Default Express response object
 * @returns A response code with status code 200, 404 or 500 signifying success
 *     or failure respectively
 */
async function getRandomDynasty(request, response) {
  try {
    // Use MongoDB aggregation to get one sized item
    const [random] = await Dynasties.aggregate([{ $sample: { size: 1 } }]);

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
        dynasty: random,
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
 * Controller function to get dynasties by search
 *
 * @param {Object} request Default Express request object
 * @param {Object} response Default Express response object
 * @returns A response code with status code 200, 404 or 500 signifying success
 *     or failure respectively
 */
async function getDynastiesBySearch(request, response) {
  const { search } = request.params;
  try {
    // Use MongoDB find query to get all matches with 'name' or 'otherNames'
    // properties
    const dynasties = await Dynasties.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { otherNames: { $elemMatch: { $regex: search, $options: 'i' } } },
      ],
    });

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

module.exports = {
  getAllDynasties,
  getDynastiesById,
  getDynastyBySlugName,
  getDynastyTitles,
  getRandomDynasty,
  getDynastiesBySearch,
};
