const express = require('express');
const { createAccount, authenticateAccount } = require('../db');
const { authenticate, requireAccount } = require('../middleware');
const { signToken } = require('../tokens');

const authRouter = express.Router();
authRouter.use(authenticate());

function missingCredentials(req, next) {
  if (!req.body.username || !req.body.password) {
    next({ name: 'MissingCredentialsError', message: 'Please supply both a username and password' });
    return true;
  }
  return false;
}

authRouter.post('/register', async (req, res, next) => {
  if (missingCredentials(req, next)) return;
  if (req.body.password.length < 8) {
    return next({ name: 'PasswordLengthError', message: 'Password has to be at least 8 characters' });
  }
  try {
    const account = await createAccount(req.body);
    if (!account) return next({ name: 'UserExistsError', message: 'A user by that username already exists' });
    return res.send({ token: signToken(account), account });
  } catch (error) {
    return next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  if (missingCredentials(req, next)) return;
  try {
    const account = await authenticateAccount(req.body);
    if (!account) return next({ name: 'IncorrectCredentialsError', message: 'Username or password is incorrect' });
    return res.send({ token: signToken(account), account });
  } catch (error) {
    return next(error);
  }
});

authRouter.get('/me', requireAccount, (req, res) => res.send({ account: req.account }));

module.exports = authRouter;
