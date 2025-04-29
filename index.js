// Package imports
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Local imports
const dynastiesRouter = require('./routes/dynasties');
const createDatabaseConnection = require('./database/config');

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

// Routing
app.use('/api/v1/dynasties', dynastiesRouter);

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
