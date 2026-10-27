import dotenv from 'dotenv';
import mongoose, { Connection } from 'mongoose';

dotenv.config();

let contributionsConnection: Connection;

/**
 * Create a connection to the database for backend interactions
 */
export default async function createDatabaseConnection(
  uri = process?.env?.['MONGO_DB_CONNECTION_STRING'],
) {
  if (!uri) {
    throw new Error('MONGO_DB_CONNECTION_STRING is not correctly configured');
  }

  const baseDb = process?.env?.['MONGO_DB_BASE_DATABASE'] || 'itihaas';
  const connection = await mongoose.connect(uri, {
    dbName: baseDb,
  });

  const contributionsDb =
    process?.env?.['MONGO_DB_CONTRIBUTIONS_DATABASE'] || 'contributions';
  contributionsConnection = mongoose.connection.useDb(contributionsDb, {
    useCache: true,
  });

  if (process?.env?.['NODE_ENV'] === 'development') {
    console.log(
      `Successfully connected to the base database: ${baseDb} (${connection.connection.host})`,
    );
    console.log(`Contributions database configured: ${contributionsDb}`);
  }

  return connection;
}

/**
 * Getter for the contributions database connection
 */
export function getContributionsConnection(): Connection {
  if (!contributionsConnection) {
    const contributionsDb =
      process?.env?.['MONGO_DB_CONTRIBUTIONS_DATABASE'] || 'contributions';

    contributionsConnection = mongoose.connection.useDb(contributionsDb, {
      useCache: true,
    });
  }

  return contributionsConnection;
}
