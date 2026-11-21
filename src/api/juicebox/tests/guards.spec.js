const app = require('../../../../tests/support/apiApp');
const { api } = require('./helpers');

// #26: guards and handlers used to call next(error) and then keep going, so
// the route ran after the error response was sent. The client saw the right
// error either way, so check that nothing tried to respond a second time.
const settle = () => new Promise((resolve) => setTimeout(resolve, 300));

describe('juicebox stops after the first error', () => {
  beforeEach(() => {
    app.lateErrors.length = 0;
  });

  it('requireUser', async () => {
    const res = await api().delete('/api/juicebox/users/1');
    await settle();

    expect(res.body.name).toBe('MissingUserError');
    expect(app.lateErrors).toEqual([]);
  });

  it('login with missing credentials', async () => {
    const res = await api().post('/api/juicebox/users/login').send({});
    await settle();

    expect(res.body.name).toBe('MissingCredentialsError');
    expect(app.lateErrors).toEqual([]);
  });

  it('register with an existing username', async () => {
    const res = await api()
      .post('/api/juicebox/users/register')
      .send({ username: 'albert', password: 'whatever', name: 'A', location: 'B' });
    await settle();

    expect(res.body.name).toBe('UserExistsError');
    expect(app.lateErrors).toEqual([]);
  });
});
