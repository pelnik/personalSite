/**
 * Test App for Supertest
 *
 * This creates a minimal Express app that mounts the fitness router.
 * Supertest uses this directly without needing a running server.
 */
require('dotenv').config();
const express = require('express');
const fitnessRouter = require('../api');

const app = express();

// Parse JSON request bodies (required for POST/PATCH/DELETE)
app.use(express.json());

// Mount the fitness router at the same path as in production
app.use('/api/fitness', fitnessRouter);

// Error handling middleware for tests
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message,
    name: err.name,
  });
});

module.exports = app;
const express = require('express');
const fitnessRouter = require('../api');

const app = express();

// Parse JSON request bodies (required for POST/PATCH/DELETE)
app.use(express.json());

// Mount the fitness router at the same path as in production
app.use('/api/fitness', fitnessRouter);

module.exports = app;
