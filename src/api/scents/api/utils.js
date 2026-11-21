function requireUser(req, res, next) {
  if (!req.user) {
    res.status(401);
    return next({
      name: 'MissingUserError',
      message: 'You must be logged in to perform this action',
    });
  }

  next();
}

function requireAdminUser(req, res, next) {
  if (!req.user) {
    res.status(401);
    return next({
      name: 'MissingUserError',
      message: 'You must be logged in to perform this action',
    });
  }

  if (!req.user.is_admin) {
    res.status(401);
    return next({
      name: 'MissingAdminUserError',
      message: 'You must be an Admin to perform this action',
    });
  }

  next();
}

module.exports = {
  requireUser,
  requireAdminUser,
};
