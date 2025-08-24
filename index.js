// Package imports
require('module-alias/register');
const dotenv = require('dotenv');

dotenv.config();

// Local imports
const createDatabaseConnection = require('@/database/config');
const app = require('@/config/server');

const HOST = process.env.SERVER_HOST;
const PORT = process.env.SERVER_PORT;

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
