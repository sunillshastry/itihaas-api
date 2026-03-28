// Package imports
// require('module-alias/register');
import dotenv from 'dotenv';
import createDatabaseConnection from './database/config';
import app from './config/server';
dotenv.config();

const HOST = process?.env?.['SERVER_HOST']! as string;
const PORT = parseInt(process?.env?.['SERVER_PORT']!) as number;

if (HOST && PORT) {
  app.listen(PORT, HOST, function () {
    console.log(`Server currently running on http://${HOST}:${PORT}/`);
    createDatabaseConnection();
  });
} else {
  console.log(
    'Failed to start server as server host and/or server port are not defined',
  );
  process.exit(1);
}
