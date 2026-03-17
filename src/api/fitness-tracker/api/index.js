const express = require('express');
const fitnessRouter = express.Router();
const jwt = require('jsonwebtoken');
const path = require('path');
const { getUserById } = require('../db');
const client = require('../db/client');
const { JWT_SECRET } = process.env;

// Send docs for base path
fitnessRouter.get('/docs', (req, res, next) => {
  res.sendFile(path.resolve('build', 'index.html'));
});

fitnessRouter.use(async (req, res, next) => {
  const prefix = 'Bearer ';
  const auth = req.header('Authorization');

  if (!auth) {
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);
    try {
      const { id } = jwt.verify(token, JWT_SECRET);

      if (id) {
        req.user = await getUserById(id);
        next();
      }
    } catch ({ message, name }) {
      next({ message, name });
    }
  } else {
    next({
      name: 'InvalidPrefix',
      message: 'Authorization must start with prefix',
    });
  }
});

// GET /api/health
fitnessRouter.get('/health', async (req, res, next) => {
  try {
    await client.query('SELECT 1');
    res.send({ message: 'All is well', db: 'ok' });
  } catch (error) {
    console.error('Health check DB error', error);
    res.status(503).send({ message: 'Database unavailable', db: 'error', error: error.message });
  }
});

// ROUTER: /api/users
const usersRouter = require('./users');
fitnessRouter.use('/users', usersRouter);

// ROUTER: /api/activities
const activitiesRouter = require('./activities');
fitnessRouter.use('/activities', activitiesRouter);

// ROUTER: /api/routines
const routinesRouter = require('./routines');
fitnessRouter.use('/routines', routinesRouter);

// ROUTER: /api/routine_activities
const routineActivitiesRouter = require('./routineActivities');
fitnessRouter.use('/routine_activities', routineActivitiesRouter);

fitnessRouter.use('*', (req, res, next) => {
  res.status(404);
  res.send({
    name: 'FitnessPathDoesNotExist',
    message: 'Path does not exist',
  });
});

fitnessRouter.use((error, req, res, next) => {
  const status = error.status || 400;
  res.status(status);
  res.send({
    name: error.name,
    message: error.message,
  });
});

module.exports = fitnessRouter;
