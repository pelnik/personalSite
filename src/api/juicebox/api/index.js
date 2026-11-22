const express = require('express');
const path = require('path');

const { authenticate } = require('../../auth');
const { ensureProfile } = require('../db');

const jbRouter = express.Router();

// Send docs for base path
jbRouter.get('/docs', (req, res, next) => {
  res.sendFile(path.resolve('build', 'index.html'));
});

jbRouter.use(authenticate(ensureProfile));

const usersRouter = require('./users');
const postRouter = require('./posts');
const tagsRouter = require('./tags');

jbRouter.use('/users', usersRouter);
jbRouter.use('/posts', postRouter);
jbRouter.use('/tags', tagsRouter);

module.exports = jbRouter;
