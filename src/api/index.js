const express = require('express');
const jbRouter = require('./juicebox/api');

const apiRouter = express.Router();

apiRouter.use('/juicebox', jbRouter);

apiRouter.use((error, req, res, next) => {
  res.send({
    name: error.name,
    message: error.message,
  });
});

module.exports = apiRouter;
