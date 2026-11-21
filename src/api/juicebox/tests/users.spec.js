const jwt = require('jsonwebtoken');
const { api, auth, login, registerUser } = require('./helpers');

describe('/api/juicebox/users', () => {
  describe('GET /', () => {
    it('lists users without exposing passwords', async () => {
      const res = await api().get('/api/juicebox/users');

      expect(res.status).toBe(200);
      expect(res.body.users).toEqual(
        expect.arrayContaining([
          {
            id: expect.any(Number),
            username: 'albert',
            name: 'Albert',
            location: 'New Orleans',
            active: true,
          },
          expect.objectContaining({ username: 'sandra' }),
          expect.objectContaining({ username: 'glamgal' }),
        ])
      );
      res.body.users.forEach((user) => expect(user).not.toHaveProperty('password'));
    });
  });

  describe('POST /login', () => {
    it('returns a token for the seeded user', async () => {
      const res = await api()
        .post('/api/juicebox/users/login')
        .send({ username: 'albert', password: 'bertie99' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("you're logged in!");
      const payload = jwt.verify(res.body.token, process.env.JWT_SECRET);
      expect(payload).toMatchObject({ id: expect.any(Number), username: 'albert' });
    });

    it('rejects a wrong password', async () => {
      const res = await api()
        .post('/api/juicebox/users/login')
        .send({ username: 'albert', password: 'wrong' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        name: 'IncorrectCredentialsError',
        message: 'Username or password is incorrect',
      });
    });

    it('rejects missing credentials', async () => {
      const res = await api().post('/api/juicebox/users/login').send({});

      expect(res.status).toBe(400);
      expect(res.body.name).toBe('MissingCredentialsError');
    });
  });

  describe('POST /register', () => {
    it('creates a user and returns a token', async () => {
      const res = await api().post('/api/juicebox/users/register').send({
        username: `new-${Date.now()}`,
        password: 'password123',
        name: 'New',
        location: 'Here',
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: 'thank you for signing up',
        token: expect.any(String),
      });
    });

    it('lets the new user log in', async () => {
      const user = await registerUser();
      expect(await login(user.username, user.password)).toEqual(expect.any(String));
    });

    it('rejects a username that already exists', async () => {
      const res = await api().post('/api/juicebox/users/register').send({
        username: 'albert',
        password: 'whatever',
        name: 'Albert',
        location: 'Anywhere',
      });

      expect(res.status).toBe(400);
      expect(res.body.name).toBe('UserExistsError');
    });

    it('rejects a registration missing required fields', async () => {
      const res = await api()
        .post('/api/juicebox/users/register')
        .send({ username: `incomplete-${Date.now()}`, password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual(expect.any(String));
    });
  });

  describe('DELETE /:userId', () => {
    it('deactivates your own account', async () => {
      const user = await registerUser();

      const res = await api()
        .delete(`/api/juicebox/users/${user.id}`)
        .set(auth(user.token));

      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({ id: user.id, active: false });
    });

    it("refuses to deactivate someone else's account", async () => {
      const user = await registerUser();
      const other = await registerUser();

      const res = await api()
        .delete(`/api/juicebox/users/${other.id}`)
        .set(auth(user.token));

      expect(res.status).toBe(400);
      expect(res.body.name).toBe('InvalidUserDelete');
    });

    it('treats the user id as data, not SQL (#28)', async () => {
      const user = await registerUser();

      const res = await api()
        .delete(`/api/juicebox/users/${encodeURIComponent('0 OR 1=1')}`)
        .set(auth(user.token));

      // Injected, this matched a real user ("Cannot delete another user.").
      expect(res.status).toBe(400);
      expect(res.body.name).toBe('UserNotFound');
    });

    it('requires a logged-in user', async () => {
      const user = await registerUser();

      const res = await api().delete(`/api/juicebox/users/${user.id}`);

      expect(res.status).toBe(400);
      expect(res.body.name).toBe('MissingUserError');
    });
  });
});
