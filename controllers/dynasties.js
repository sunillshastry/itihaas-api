// Models
const Dynasties = require('../models/Dynasties');

// Services
const FailureLogs = require('../services/FailureLogs');

/**
 * Controller function to get all Dynasties for dynasties routes
 *
 * @param {Object} request Default Express Request object
 * @param {Object} response Default Express Response object
 * @returns A response with status code 200 or 500 signifying success or failure respectively
 */
async function getAllDynasties(request, response) {
  try {
    // Required fields from database
    const REQUIRED_DB_FIELDS =
      '_id slug name timeline capitals population locations description.oneline otherNames';

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

module.exports = {
  getAllDynasties,
};
