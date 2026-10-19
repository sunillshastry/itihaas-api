// Package imports
// require('module-alias/register');
import dotenv from 'dotenv';
import createDatabaseConnection from './database/config';
import app from './config/server';
dotenv.config();

async function startServer() {
  const HOST = process?.env?.['SERVER_HOST']! as string;
  const PORT = parseInt(process?.env?.['SERVER_PORT']!) as number;

  if (!HOST || !Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error('Invalid SERVER_HOST or SERVER_PORT configuration');
  }

  await createDatabaseConnection();

  app.listen(PORT, HOST, function () {
    console.log(`Server currently running on http://${HOST}:${PORT}/`);
  });
}

startServer().catch(function (error: unknown) {
  console.error('Failed to start the server:', error);
  process.exitCode = 1;
});
