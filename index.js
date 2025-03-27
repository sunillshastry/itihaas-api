const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Server currently running on http://localhost:${PORT}`);
  }
});
