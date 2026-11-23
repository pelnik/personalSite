const request = require('supertest');
const crypto = require('crypto');
const app = require('../../../../tests/support/apiApp');
const { createAccount, getAccountByUsername, signToken } = require('../../auth');

const api = () => request(app);
const auth = (token) => ({ Authorization: `Bearer ${token}` });

async function login(username) {
  const account = await getAccountByUsername(username);
  return signToken(account);
}

// Registers a brand-new user so tests that mutate data never touch the seed.
async function registerUser() {
  const user = {
    username: `user-${crypto.randomUUID()}`,
    password: 'password123',
    name: 'Test User',
    location: 'Testville',
  };
  const account = await createAccount(user);
  const token = signToken(account);
  await api().get('/api/juicebox/posts').set(auth(token));
  return { ...user, id: account.id, token };
}

async function createPost(token, fields = {}) {
  const res = await api()
    .post('/api/juicebox/posts')
    .set(auth(token))
    .send({
      title: 'A test post',
      content: 'Some test content',
      tags: '#testing',
      ...fields,
    });
  return res.body.post;
}

module.exports = { api, auth, login, registerUser, createPost };
