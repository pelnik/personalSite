const { GITHUB_WEBHOOK } = process.env;

const express = require('express');
const adminRouter = express.Router();

adminRouter.post('/github', async (req, res, next) => {
  try {
    const { hook } = req.body;
    req_secret = hook.config.secret;

    if (req_secret === GITHUB_WEBHOOK) {
      res.send(200);
    } else {
      next({
        name: 'SecretMismatch',
        message: 'Secret did not match',
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

adminRouter.use('*', (req, res, next) => {
  res.status(404);
  res.send({
    name: 'FitnessPathDoesNotExist',
    message: 'Path does not exist',
  });
});

adminRouter.use((error, req, res, next) => {
  res.status(400);
  res.send({
    name: error.name,
    message: error.message,
  });
});

module.exports = adminRouter;
