const app = require('../../../../tests/support/apiApp');
const { api, auth, login } = require('./helpers');

// #26: guards and handlers used to call next(error) and then keep going, so
// the route ran after the error response was sent. The client saw the right
// error either way, so check that nothing tried to respond a second time.
const settle = () => new Promise((resolve) => setTimeout(resolve, 300));

describe('scents stops after the first error', () => {
  beforeEach(() => {
    app.lateErrors.length = 0;
  });

  it('requireUser', async () => {
    const res = await api().get('/api/scents/users/me');
    await settle();

    expect(res.body.name).toBe('MissingUserError');
    expect(app.lateErrors).toEqual([]);
  });

  it('requireAdminUser for a non-admin', async () => {
    const token = await login('glamgal', 'iloveglam');

    const res = await api().get('/api/scents/users').set(auth(token));
    await settle();

    expect(res.body.name).toBe('MissingAdminUserError');
    expect(app.lateErrors).toEqual([]);
  });

  it('login with missing credentials', async () => {
    const res = await api().post('/api/scents/users/login').send({});
    await settle();

    expect(res.body.name).toBe('MissingCredentialsError');
    expect(app.lateErrors).toEqual([]);
  });

  it('register with an existing username', async () => {
    const res = await api().post('/api/scents/users/register').send({
      username: 'glamgal',
      password: 'whatever1',
      name: 'Dup',
      email: `dup-${Date.now()}@example.com`,
    });
    await settle();

    expect(res.body.name).toBe('UserExistsError');
    expect(app.lateErrors).toEqual([]);
  });
});
