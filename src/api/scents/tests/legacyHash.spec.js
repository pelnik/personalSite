const client = require('../db/client');
const { api } = require('./helpers');

// Existing production passwords were hashed by the native `bcrypt` package.
// The code now uses `bcryptjs`, so those users must still be able to log in.
// Made with require('bcrypt').hash('legacy-password-123', 10)
const NATIVE_BCRYPT_HASH = '$2b$10$kjCo8L405fymJ6Ejf0PI6O.ppFxwBcFIJcRRuTYaf7JGb0uKf58p6';

describe('scents login with a hash made by native bcrypt', () => {
  beforeAll(async () => {
    await client.query(
      `INSERT INTO users(username, password, name, email) VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      ['legacy-hash-user', NATIVE_BCRYPT_HASH, 'Legacy', 'legacy@example.com']
    );
  });

  it('accepts the right password', async () => {
    const res = await api()
      .post('/api/scents/users/login')
      .send({ username: 'legacy-hash-user', password: 'legacy-password-123' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, user: { username: 'legacy-hash-user' } });
  });

  it('rejects a wrong password', async () => {
    const res = await api()
      .post('/api/scents/users/login')
      .send({ username: 'legacy-hash-user', password: 'not-the-password' });

    expect(res.body.name).toBe('IncorrectCredentialsError');
  });
});
