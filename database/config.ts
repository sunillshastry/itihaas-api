import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

/**
 * Create a connection to the database for backend interactions
 */
export default async function createDatabaseConnection(
  uri = process?.env?.['MONGO_DB_CONNECTION_STRING'],
) {
  if (!uri) {
    throw new Error('MONGO_DB_CONNECTION_STRING is not correctly configured');
  }

  const connection = await mongoose.connect(uri);

  if (process?.env?.['NODE_ENV'] === 'development') {
    console.log(
      `Successfully connected to the database: ${connection.connection.host}`,
    );
  }

  return connection;
}
