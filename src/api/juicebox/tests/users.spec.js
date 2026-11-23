const { api, auth, registerUser } = require('./helpers');

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
