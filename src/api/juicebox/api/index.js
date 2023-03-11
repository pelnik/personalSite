const express = require('express');
const path = require('path');

const jwt = require('jsonwebtoken');
const { getUserById } = require('../db');

const jbRouter = express.Router();
const { JWT_SECRET } = process.env;

// Send docs for base path
jbRouter.get('/', (req, res, next) => {
  res.sendFile(path.resolve('build', 'index.html'));
});

jbRouter.use(async (req, res, next) => {
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
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: 'AuthorizationHeaderError',
      message: `Authorization token must start with ${prefix}`,
    });
  }
});

jbRouter.use((req, res, next) => {
  if (req.user) {
    console.log('User is set:', req.user);
  }
  next();
});

const usersRouter = require('./users');
const postRouter = require('./posts');
const tagsRouter = require('./tags');

jbRouter.use('/users', usersRouter);
jbRouter.use('/posts', postRouter);
jbRouter.use('/tags', tagsRouter);

module.exports = jbRouter;
