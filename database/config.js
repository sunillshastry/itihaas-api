const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const DATABASE_CONNECTION_URI = process.env.MONGO_DB_URI;

/**
 * Create a connection to the database for backend interactions
 */
async function createDatabaseConnection() {
  try {
    // Checking for a successful connection and display message on development mode only
    const connection = await mongoose.connect(DATABASE_CONNECTION_URI);
    if (connection && process.env.NODE_ENV === 'development') {
      console.log('Created connection to database successfully');
    }
  } catch (e) {
    // Display failure message on development mode only
    if (process.env.NODE_ENV === 'development') {
      console.log('Failed to connect to MongoDB database');
      console.log(`Error Log: ${e}`);
    }
  }
}

module.exports = createDatabaseConnection;
