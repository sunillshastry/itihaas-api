const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Create a connection to the database for backend interactions
 */
async function createDatabaseConnection() {
  try {
    if (process.env.MONGO_DB_CONNECTION_STRING) {
      // Checking for a successful connection and display message on development mode only
      const connection = await mongoose.connect(
        process.env.MONGO_DB_CONNECTION_STRING,
      );
      if (connection && process.env.NODE_ENV === 'development') {
        console.log(
          `Successfully established connection to database: ${connection.connection.host}`,
        );
      }
    } else {
      console.log(
        'Server unable to establish connection to database due to absence of database connection string',
      );
    }
  } catch (e) {
    // Display failure message on development mode only
    console.log(
      'Failed to create connection to database due to an internal server error',
    );
    if (process.env.NODE_ENV === 'development') {
      console.log(`Error Log: ${e}`);
    }
  }
}

module.exports = createDatabaseConnection;
