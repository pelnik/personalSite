const { getUserById } = require('../db');

function requireUser(req, res, next) {
  if (!req.user) {
    next({
      name: 'MissingUserError',
      message: 'You must be logged in to perform this action',
    });
  }

  next();
}

function requireActiveUser(req, res, next) {
  if (!req.user.active) {
    next({
      name: 'NonactiveUserError',
      message: 'User must be active to perform this action',
    });
  }

  next();
}

module.exports = {
  requireUser,
  requireActiveUser,
};
