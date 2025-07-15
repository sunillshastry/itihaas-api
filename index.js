// Package imports
require('module-alias/register');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

// Local imports
const dynastiesRouter = require('@/routes/dynasties.routes');
const rulersRouter = require('@/routes/rulers.routes');
const createDatabaseConnection = require('@/database/config');
const healthCheckRouter = require('@/routes/healthcheck.routes');
const versionRouter = require('@/routes/version.routes');
const infoRouter = require('@/routes/info.routes');

const app = express();
const HOST = process.env.SERVER_HOST;
const PORT = process.env.SERVER_PORT;

// Third-party middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Routing
app.use('/api/v1/dynasties', dynastiesRouter);
app.use('/api/v1/rulers', rulersRouter);
app.use('/api/health', healthCheckRouter);
app.use('/api/version', versionRouter);
app.use('/api/info', infoRouter);

if (HOST && PORT) {
  app.listen(PORT, HOST, function () {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Server currently running on http://${HOST}:${PORT}/`);
    }
    createDatabaseConnection();
  });
} else {
  console.log(
    'Failed to start server as server host and/or server port are not defined',
  );
  process.exit(1);
}
