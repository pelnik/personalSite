const jwt = require('jsonwebtoken');
const { api, auth } = require('./helpers');

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
    const token = jwt.sign({ username: 'nobody' }, process.env.JWT_SECRET);

    const res = await api().get('/api/juicebox/posts').set(auth(token)).timeout(2000);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      name: 'InvalidTokenError',
      message: 'Authorization token has no user id',
    });
  });
});
