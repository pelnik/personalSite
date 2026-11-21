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

  // KNOWN BUG (fixed in Phase 2): a valid token without an `id` never calls
  // next(), so the request hangs until the client gives up.
  it('KNOWN BUG: hangs on a valid token with no id', async () => {
    const token = jwt.sign({ username: 'nobody' }, process.env.JWT_SECRET);

    await expect(
      api().get('/api/juicebox/posts').set(auth(token)).timeout(1000)
    ).rejects.toMatchObject({ timeout: 1000 });
  });
});
