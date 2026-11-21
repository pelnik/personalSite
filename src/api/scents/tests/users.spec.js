const { api, auth, login, adminToken, registerUser } = require('./helpers');

describe('/api/scents/users', () => {
  describe('POST /register', () => {
    it('creates a user and returns a token', async () => {
      const res = await api().post('/api/scents/users/register').send({
        username: `new-${Date.now()}`,
        password: 'password123',
        name: 'New',
        email: `new-${Date.now()}@example.com`,
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'thank you for signing up',
        token: expect.any(String),
      });
    });

    it('rejects a username that already exists', async () => {
      const res = await api().post('/api/scents/users/register').send({
        username: 'glamgal',
        password: 'whatever1',
        name: 'Dup',
        email: `dup-${Date.now()}@example.com`,
      });

      expect(res.status).toBe(400);
      expect(res.body.name).toBe('UserExistsError');
    });

    it('rejects an email that already exists', async () => {
      const res = await api().post('/api/scents/users/register').send({
        username: `dup-${Date.now()}`,
        password: 'whatever1',
        name: 'Dup',
        email: 'joshua@email.com',
      });

      expect(res.status).toBe(400);
      expect(res.body.name).toBe('EmailExistsError');
    });
  });

  describe('POST /login', () => {
    it('logs in with a bcrypt-hashed password and returns the user', async () => {
      const res = await api()
        .post('/api/scents/users/login')
        .send({ username: 'glamgal', password: 'iloveglam' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        message: "you're logged in!",
        token: expect.any(String),
        user: {
          id: expect.any(Number),
          username: 'glamgal',
          email: 'joshua@email.com',
          is_admin: false,
          is_active: true,
        },
      });
      expect(res.body.user).not.toHaveProperty('password');
    });

    // #33: these used to answer {name: 'Error'} and {name: 'TypeError'}.
    // Both now get the same error, so login doesn't reveal which usernames exist.
    it('rejects a wrong password', async () => {
      const res = await api()
        .post('/api/scents/users/login')
        .send({ username: 'glamgal', password: 'wrong' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        name: 'IncorrectCredentialsError',
        message: 'Username or password is incorrect',
      });
    });

    it('rejects an unknown username the same way', async () => {
      const res = await api()
        .post('/api/scents/users/login')
        .send({ username: 'nobody-at-all', password: 'whatever' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        name: 'IncorrectCredentialsError',
        message: 'Username or password is incorrect',
      });
    });

    it('rejects a deactivated user', async () => {
      const user = await registerUser();
      await api()
        .patch(`/api/scents/users/admin/${user.id}`)
        .set(auth(await adminToken()))
        .send({ is_active: false });

      const res = await api()
        .post('/api/scents/users/login')
        .send({ username: user.username, password: user.password });

      expect(res.status).toBe(400);
      expect(res.body.name).toBe('ProfileInactive');
    });
  });

  describe('GET /me', () => {
    it('returns the logged-in user', async () => {
      const token = await login('glamgal', 'iloveglam');

      const res = await api().get('/api/scents/users/me').set(auth(token));

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        user: { username: 'glamgal', is_admin: false },
      });
    });

    it('requires a logged-in user', async () => {
      const res = await api().get('/api/scents/users/me');

      expect(res.status).toBe(400);
      expect(res.body.name).toBe('MissingUserError');
    });
  });

  describe('GET /', () => {
    it('lists users for an admin', async () => {
      const res = await api().get('/api/scents/users').set(auth(await adminToken()));

      expect(res.status).toBe(200);
      expect(res.body.users.map((user) => user.username)).toEqual(
        expect.arrayContaining(['sandra', 'glamgal'])
      );
      res.body.users.forEach((user) => expect(user).not.toHaveProperty('password'));
    });

    it('refuses a non-admin', async () => {
      const token = await login('glamgal', 'iloveglam');

      const res = await api().get('/api/scents/users').set(auth(token));

      expect(res.status).toBe(400);
      expect(res.body.name).toBe('MissingAdminUserError');
    });
  });

  describe('PATCH /:userId', () => {
    it('updates your own email', async () => {
      const user = await registerUser();
      const email = `changed-${Date.now()}@example.com`;

      const res = await api()
        .patch(`/api/scents/users/${user.id}`)
        .set(auth(user.token))
        .send({ email });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: user.id, email });
      // The response used to include the bcrypt password hash.
      expect(res.body).not.toHaveProperty('password');
    });

    it("refuses to update someone else's account", async () => {
      const user = await registerUser();
      const other = await registerUser();

      const res = await api()
        .patch(`/api/scents/users/${other.id}`)
        .set(auth(user.token))
        .send({ email: `x-${Date.now()}@example.com` });

      expect(res.status).toBe(400);
      expect(res.body.name).toBe('UnauthorizedUserError');
    });

    it('rejects an email that is already taken', async () => {
      const user = await registerUser();

      const res = await api()
        .patch(`/api/scents/users/${user.id}`)
        .set(auth(user.token))
        .send({ email: 'joshua@email.com' });

      expect(res.status).toBe(400);
      expect(res.body.name).toBe('EmailAlreadyExist');
    });
  });

  describe('PATCH /admin/:userId', () => {
    it('lets an admin change admin and active flags', async () => {
      const user = await registerUser();

      const res = await api()
        .patch(`/api/scents/users/admin/${user.id}`)
        .set(auth(await adminToken()))
        .send({ is_admin: true });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: user.id, is_admin: true });
    });

    it('treats the user id as data, not SQL (#28)', async () => {
      const victim = await registerUser();

      const res = await api()
        .patch(`/api/scents/users/admin/${encodeURIComponent('0 OR 1=1')}`)
        .set(auth(await adminToken()))
        .send({ is_active: false });

      // Injected, this deactivated every user.
      expect(res.status).toBe(400);
      const login = await api()
        .post('/api/scents/users/login')
        .send({ username: victim.username, password: victim.password });
      expect(login.body.success).toBe(true);
    });

    it('refuses a non-admin', async () => {
      const user = await registerUser();

      const res = await api()
        .patch(`/api/scents/users/admin/${user.id}`)
        .set(auth(user.token))
        .send({ is_admin: true });

      expect(res.status).toBe(400);
      expect(res.body.name).toBe('MissingAdminUserError');
    });
  });
});
