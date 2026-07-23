const express = require('express');
const app = require('./api/index');
const path = require('path');

// Serve the static HTML/CSS/JS files
app.use(express.static(__dirname));

module.exports = app;

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Local development server running at http://localhost:${PORT}`);
  });
}
