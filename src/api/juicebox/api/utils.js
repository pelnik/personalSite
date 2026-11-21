function requireUser(req, res, next) {
  if (!req.user) {
    return next({
      name: 'MissingUserError',
      message: 'You must be logged in to perform this action',
    });
  }

  next();
}

function requireActiveUser(req, res, next) {
  if (!req.user.active) {
    return next({
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
