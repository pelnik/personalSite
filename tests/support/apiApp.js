// The /api router mounted the same way server.js mounts it, without the
// static file serving or listening on a port. Used with supertest.
const express = require('express');
const apiRouter = require('../../src/api');

const app = express();
app.use('/api', apiRouter);

// The /api router answers every error itself, so this only runs if a handler
// tried to respond again after a response was already sent (e.g. calling
// next() after next(error)). Tests assert that it never collects anything.
app.lateErrors = [];
app.use((error, req, res, next) => {
  app.lateErrors.push(`${req.method} ${req.originalUrl}: ${error.message}`);
  next(error);
});

module.exports = app;
