const crypto = require('crypto');
const { api, auth } = require('./helpers');

describe('shared auth API', () => {
  test('register returns a token and public account', async () => {
    const username = `reg-${crypto.randomUUID()}`;
    const { status, body } = await api().post('/api/auth/register').send({ username, password: 'password123' });
    expect(status).toBe(200);
    expect(body.account).toEqual({ id: expect.any(Number), username, isAdmin: false });
    expect(body.token).toEqual(expect.any(String));
    expect(body.account.password).toBeUndefined();
    const me = await api().get('/api/auth/me').set(auth(body.token));
    expect(me.body.account).toEqual(body.account);
  });

  test('duplicate, short password and missing credentials are rejected', async () => {
    const duplicate = await api().post('/api/auth/register').send({ username: 'albert', password: 'password123' });
    expect(duplicate.status).toBe(400);
    expect(duplicate.body.name).toBe('UserExistsError');
    const short = await api().post('/api/auth/register').send({ username: 'short', password: '1234567' });
    expect(short.status).toBe(400);
    expect(short.body.name).toBe('PasswordLengthError');
    const missing = await api().post('/api/auth/register').send({ username: 'missing' });
    expect(missing.status).toBe(400);
    expect(missing.body.name).toBe('MissingCredentialsError');
  });

  test('login accepts shared seed credentials', async () => {
    const { status, body } = await api().post('/api/auth/login').send({ username: 'albert', password: 'bertie99' });
    expect(status).toBe(200);
    expect(body.account).toMatchObject({ username: 'albert', isAdmin: false });
    expect(body.token).toEqual(expect.any(String));
  });

  test.each(['albert', 'unknown-user'])('wrong credentials for %s have the same error', async (username) => {
    const { status, body } = await api().post('/api/auth/login').send({ username, password: 'wrongpassword' });
    expect(status).toBe(400);
    expect(body).toEqual({ name: 'IncorrectCredentialsError', message: 'Username or password is incorrect' });
  });

  test('login requires both fields', async () => {
    const { status, body } = await api().post('/api/auth/login').send({ username: 'albert' });
    expect(status).toBe(400);
    expect(body.name).toBe('MissingCredentialsError');
  });

  test('me requires an account', async () => {
    const { status, body } = await api().get('/api/auth/me');
    expect(status).toBe(400);
    expect(body.name).toBe('MissingUserError');
  });
});
