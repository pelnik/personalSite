const request = require('supertest');
const crypto = require('crypto');
const app = require('../../../../tests/support/apiApp');

const api = () => request(app);
const auth = (token) => ({ Authorization: `Bearer ${token}` });

async function login(username, password) {
  const res = await api()
    .post('/api/scents/users/login')
    .send({ username, password });
  return res.body.token;
}

const adminToken = () => login('sandra', 'sandra123');

// Registers a brand-new user (who gets an empty active cart), so tests that
// mutate data never touch the fixtures.
async function registerUser() {
  const id = crypto.randomUUID();
  const user = {
    username: `user-${id}`,
    password: 'password123',
    name: 'Test User',
    email: `${id}@example.com`,
  };
  const res = await api().post('/api/scents/users/register').send(user);
  const { id: userId } = JSON.parse(
    Buffer.from(res.body.token.split('.')[1], 'base64url').toString()
  );
  return { ...user, id: userId, token: res.body.token };
}

module.exports = { api, auth, login, adminToken, registerUser };
