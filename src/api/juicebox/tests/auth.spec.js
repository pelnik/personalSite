const jwt = require('jsonwebtoken');
const { api, auth } = require('./helpers');
const { createAccount, signToken } = require('../../auth');
const { ISSUER } = require('../../auth/tokens');
const crypto = require('crypto');

describe('juicebox Authorization header handling', () => {
  it('rejects a header without the Bearer prefix', async () => {
    const res = await api().get('/api/juicebox/posts').set('Authorization', 'Token abc');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      name: 'AuthorizationHeaderError',
      message: 'Authorization token must start with Bearer ',
    });
  });

  it('rejects an invalid token', async () => {
    const res = await api().get('/api/juicebox/posts').set(auth('not-a-jwt'));

    expect(res.status).toBe(400);
    expect(res.body.name).toBe('JsonWebTokenError');
  });

  // #25: this used to hang, because next() was never called.
  it('rejects a valid token that has no user id', async () => {
    const token = jwt.sign({ username: 'nobody' }, process.env.JWT_SECRET, { issuer: ISSUER });

    const res = await api().get('/api/juicebox/posts').set(auth(token)).timeout(2000);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      name: 'InvalidTokenError',
      message: 'Authorization token has no user id',
    });
  });

  it('rejects an old token without the shared issuer', async () => {
    const token = jwt.sign({ id: 1, username: 'albert' }, process.env.JWT_SECRET);
    const res = await api().get('/api/juicebox/posts').set(auth(token));
    expect(res.status).toBe(400);
    expect(res.body.name).toBe('JsonWebTokenError');
  });

  it('creates a profile on the first authenticated request', async () => {
    const account = await createAccount({ username: `reg-${crypto.randomUUID()}`, password: 'password123' });
    const res = await api().get('/api/juicebox/posts').set(auth(signToken(account)));
    expect(res.status).toBe(200);
    const profile = await api().get('/api/juicebox/users');
    expect(profile.body.users).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: account.id, username: account.username, name: account.username }),
    ]));
  });

  it('does not expose removed login endpoint', async () => {
    const res = await api().post('/api/juicebox/users/login').send({ username: 'albert', password: 'bertie99' });
    expect(res.body.name).toBe('InvalidAPIPath');
  });
});
