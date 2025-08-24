// Global imports
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
const healthCheckRouter = require('@/routes/healthcheck.routes');
const versionRouter = require('@/routes/version.routes');
const infoRouter = require('@/routes/info.routes');
const baseRouter = require('@/routes/base.routes');
const usersRouter = require('@/routes/users.routes');

const app = express();

// Third-party middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Routing
app.use('/', baseRouter);
app.use('/api/v1/dynasties', dynastiesRouter);
app.use('/api/v1/rulers', rulersRouter);
app.use('/api/v1/users', usersRouter);

app.use('/api/health', healthCheckRouter);
app.use('/api/version', versionRouter);
app.use('/api/info', infoRouter);

module.exports = app;
