const jwt = require('jsonwebtoken');
const express = require('express');
const request = require('supertest');
const { api, auth } = require('./helpers');
const { getAccountByUsername, setAdmin } = require('../db');
const { signToken, ISSUER } = require('../tokens');
const { authenticate, requireAdmin } = require('../middleware');

test('Authorization requires Bearer', async () => {
  const { status, body } = await api().get('/api/auth/me').set('Authorization', 'token');
  expect(status).toBe(400);
  expect(body.name).toBe('AuthorizationHeaderError');
});

test.each([
  ['garbage', 'JsonWebTokenError'],
  [jwt.sign({ id: 1 }, process.env.JWT_SECRET), 'JsonWebTokenError'],
  [jwt.sign({ id: 1 }, process.env.JWT_SECRET, { issuer: ISSUER, expiresIn: -1 }), 'TokenExpiredError'],
  [jwt.sign({ username: 'albert' }, process.env.JWT_SECRET, { issuer: ISSUER }), 'InvalidTokenError'],
])('invalid token gives %s error', async (token, name) => {
  const { status, body } = await api().get('/api/auth/me').set(auth(token));
  expect(status).toBe(400);
  expect(body.name).toBe(name);
});

test('deleted account leaves req.account unset', async () => {
  const token = jwt.sign({ id: 2147483647, username: 'gone' }, process.env.JWT_SECRET, { issuer: ISSUER });
  const { status, body } = await api().get('/api/auth/me').set(auth(token));
  expect(status).toBe(400);
  expect(body.name).toBe('MissingUserError');
});

test('requireAdmin checks site admin status', async () => {
  const account = await getAccountByUsername('albert');
  const app = express();
  app.use(authenticate());
  app.get('/admin', requireAdmin, (req, res) => res.send({ username: req.account.username }));
  app.use((error, req, res, next) => res.status(400).send({ name: error.name, message: error.message }));
  const token = signToken(account);
  try {
    await setAdmin('albert', false);
    expect((await request(app).get('/admin').set(auth(token))).body.name).toBe('MissingAdminUserError');
    await setAdmin('albert', true);
    expect((await request(app).get('/admin').set(auth(token))).body).toEqual({ username: 'albert' });
  } finally {
    await setAdmin('albert', false);
  }
});
