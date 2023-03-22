function requireUser(req, res, next) {
  if (!req.user) {
    next({
      name: 'MissingUser',
      message: 'You must be logged in to perform that action',
    });
  } else {
    next();
  }
}

module.exports = {
  requireUser,
};
