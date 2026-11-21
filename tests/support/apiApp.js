// The /api router mounted the same way server.js mounts it, without the
// static file serving or listening on a port. Used with supertest.
const express = require('express');
const apiRouter = require('../../src/api');

const app = express();
app.use('/api', apiRouter);

module.exports = app;
