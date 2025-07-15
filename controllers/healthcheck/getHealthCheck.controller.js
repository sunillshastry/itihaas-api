const mongoose = require('mongoose');

/**
 * Get health status of the Itihaas API
 * @param {object} request Default Express request object
 * @param {object} response Default Express response object
 * @returns A health-check response with status code 200 or 500 signifying success or failure
 */
async function getHealthCheck(request, response) {
  try {
    // Get database status
    const databaseStatus = await mongoose.connection.db.admin().ping();

    return response.status(200).json({
      status: 'ok',
      db: databaseStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Failed response
    return response.status(500).json({
      status: 'fail',
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = getHealthCheck;
