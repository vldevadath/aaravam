require('dotenv').config();
const express = require('express');
const path = require('path');
const apiApp = require('./api/index');

const app = express();

// Mount the API routes (the serverless function) on /
app.use(apiApp);

// Serve the static files
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Local development server running at http://localhost:${PORT}`);
});
