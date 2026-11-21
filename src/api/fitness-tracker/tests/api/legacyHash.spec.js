/**
 * Existing production passwords were hashed by the native `bcrypt` package.
 * The code now uses `bcryptjs`, so those users must still be able to log in.
 */
require('dotenv').config();
const request = require('supertest');
const app = require('../testApp');
const client = require('../../db/client');

// Made with require('bcrypt').hash('legacy-password-123', 10)
const NATIVE_BCRYPT_HASH = '$2b$10$kjCo8L405fymJ6Ejf0PI6O.ppFxwBcFIJcRRuTYaf7JGb0uKf58p6';

describe('fitness login with a hash made by native bcrypt', () => {
  beforeAll(async () => {
    await client.query(
      `INSERT INTO users(username, password) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING`,
      ['legacy-hash-user', NATIVE_BCRYPT_HASH]
    );
  });

  it('accepts the right password', async () => {
    const res = await request(app)
      .post('/api/fitness/users/login')
      .send({ username: 'legacy-hash-user', password: 'legacy-password-123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
  });

  it('rejects a wrong password', async () => {
    const res = await request(app)
      .post('/api/fitness/users/login')
      .send({ username: 'legacy-hash-user', password: 'not-the-password' });

    expect(res.body.token).toBeUndefined();
  });
});
