const request = require('supertest');
const crypto = require('crypto');
const app = require('../../../../tests/support/apiApp');

const api = () => request(app);
const auth = (token) => ({ Authorization: `Bearer ${token}` });

async function login(username, password) {
  const res = await api()
    .post('/api/juicebox/users/login')
    .send({ username, password });
  return res.body.token;
}

// Registers a brand-new user so tests that mutate data never touch the seed.
async function registerUser() {
  const user = {
    username: `user-${crypto.randomUUID()}`,
    password: 'password123',
    name: 'Test User',
    location: 'Testville',
  };
  const res = await api().post('/api/juicebox/users/register').send(user);
  const { id } = JSON.parse(
    Buffer.from(res.body.token.split('.')[1], 'base64url').toString()
  );
  return { ...user, id, token: res.body.token };
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
