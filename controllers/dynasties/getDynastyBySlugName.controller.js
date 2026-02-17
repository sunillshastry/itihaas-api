// Global imports
const dotenv = require('dotenv');

dotenv.config();

// Models
const Dynasties = require('@/models/Dynasties');

// Services
const FailureLogs = require('@/services/FailureLogs');
const AppException = require('@/services/AppException');
// const redisClient = require('@/cache/ioRedisConfig');

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
    // WARNING: Removing/Commenting out the entire Redis cache check due to arising problems at the moment
    // TODO: Implement a better caching strategy with Redis and refactor or update this code segment in time.
    // Check for cached 'slug' key data
    // const cacheKeyId = `dynasty:slug:${slug}`;

    // If cached slug key exists
    // WARNING: Removing/Commenting out the entire Redis cache check due to arising problems at the moment
    // if (cacheKeyId) {
    //   // Get cached dynasty data via the 'id' property
    //   const idKey = `dynasty:${cacheKeyId}`;
    //   const cacheData = await redisClient.get(idKey);

    //   // If any cached dynasty data exists from the 'id' property
    //   if (cacheData) {
    //     return response.status(200).json({
    //       success: true,
    //       data: {
    //         dynasty: JSON.parse(cacheData),
    //       },
    //     });
    //   }
    // }

    // No cache hits:
    // Get dynasty from database via its slug
    const dynasty = await Dynasties.findOne({ slug });

    // Check if dynasty does not exist - return 404
    if (!dynasty) {
      // Delete cache key
      // WARNING: Removing/Commenting out the entire Redis cache check due to arising problems at the moment
      // await redisClient.del(cacheKeyId);

      // Build AppException
      const appException = new AppException(
        'Failed to locate specified resource in database',
        404,
        'error',
        false,
        `${request.host}:${request.originalUrl}`,
        request.method,
        'controllers.dynasties.getDynastyBySlugName',
      );

      // Return 404 responses
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

    // Set retrieved data from database to cache system
    // First: Set actual dynasty content via dynasty._id value key
    // eslint-disable-next-line no-underscore-dangle
    // WARNING: Removing/Commenting out the entire Redis cache check due to arising problems at the moment
    // const idKey = `dynasty:${dynasty._id}`;
    // await redisClient.set(
    //   idKey,
    //   JSON.stringify(dynasty),
    //   'EX',
    //   process.env.UPSTASH_REDIS_TTL_DURATION,
    // );

    // // Second: Set dynasty._id value via dynasty:slug key
    // await redisClient.set(
    //   cacheKeyId,
    //   // eslint-disable-next-line no-underscore-dangle
    //   dynasty._id.toString(),
    //   'EX',
    //   process.env.UPSTASH_REDIS_TTL_DURATION,
    // );

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

module.exports = getDynastyBySlugName;
