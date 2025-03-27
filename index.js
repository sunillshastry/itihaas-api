// Package imports
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

// Local imports
const dynastiesRouter = require('./routes/dynasties');
const createDatabaseConnection = require('./database/config');

const app = express();
const PORT = process.env.PORT || 8000;

// Routing
app.use('/api/v1/dynasties', dynastiesRouter);

app.listen(PORT, () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Server currently running on http://localhost:${PORT}`);
  }
});
createDatabaseConnection();
