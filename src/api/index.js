const express = require('express');
const jbRouter = require('./juicebox/api');
const fitnessRouter = require('./fitness-tracker/api');
const scentsRouter = require('./scents/api');
const adminRouter = require('./admin/api');

const apiRouter = express.Router();

apiRouter.use((req, res, next) => {
  if (req.originalUrl === '/api/admin/github') {
    express.text({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});
apiRouter.use('/juicebox', jbRouter);
apiRouter.use('/fitness', fitnessRouter);
apiRouter.use('/scents', scentsRouter);
apiRouter.use('/admin', adminRouter);

apiRouter.use('*', (req, res, next) => {
  res.send({
    name: 'InvalidAPIPath',
    message: 'API path sent is invalid',
  });
});

apiRouter.use((error, req, res, next) => {
  res.status(400);
  res.send({
    name: error.name,
    message: error.message,
  });
});

module.exports = apiRouter;
