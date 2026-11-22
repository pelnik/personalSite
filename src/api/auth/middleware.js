const { getAccountById } = require('./db');
const { verifyToken } = require('./tokens');

function authenticate(ensureProfile) {
  return async (req, res, next) => {
    try {
      const header = req.header('Authorization');
      if (!header) return next();
      if (!header.startsWith('Bearer ')) {
        return next({ name: 'AuthorizationHeaderError', message: 'Authorization token must start with Bearer ' });
      }
      const payload = verifyToken(header.slice(7));
      if (!payload.id) {
        return next({ name: 'InvalidTokenError', message: 'Authorization token has no user id' });
      }
      req.account = await getAccountById(payload.id);
      if (req.account && ensureProfile) req.user = await ensureProfile(req.account);
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

function requireAccount(req, res, next) {
  if (!req.account) return next({ name: 'MissingUserError', message: 'You must be logged in to perform this action' });
  return next();
}

function requireAdmin(req, res, next) {
  if (!req.account) return requireAccount(req, res, next);
  if (!req.account.isAdmin) return next({ name: 'MissingAdminUserError', message: 'You must be an admin to perform this action' });
  return next();
}

module.exports = { authenticate, requireAccount, requireAdmin };
