const { api, auth, login, registerUser, createPost } = require('./helpers');

describe('/api/juicebox/posts', () => {
  describe('GET /', () => {
    it('lists the seeded posts with tags and author', async () => {
      const res = await api().get('/api/juicebox/posts');

      expect(res.status).toBe(200);
      expect(res.body.posts).toEqual(
        expect.arrayContaining([
          {
            id: expect.any(Number),
            title: 'First Post',
            content: expect.stringContaining('This is my first post'),
            active: true,
            isAuthor: false,
            tag: expect.arrayContaining([
              { id: expect.any(Number), name: '#happy' },
              { id: expect.any(Number), name: '#youcandoanything' },
            ]),
            author: {
              id: expect.any(Number),
              username: 'albert',
              name: 'Albert',
              location: 'New Orleans',
              active: true,
            },
          },
          expect.objectContaining({ title: 'Second Post' }),
          expect.objectContaining({ title: 'Third Post' }),
        ])
      );
    });

    it("marks the logged-in user's own posts with isAuthor", async () => {
      const token = await login('albert', 'bertie99');

      const res = await api().get('/api/juicebox/posts').set(auth(token));

      const first = res.body.posts.find((post) => post.title === 'First Post');
      const second = res.body.posts.find((post) => post.title === 'Second Post');
      expect(first.isAuthor).toBe(true);
      expect(second.isAuthor).toBe(false);
    });
  });

  describe('POST /', () => {
    it('creates a post with space-separated tags', async () => {
      const user = await registerUser();

      const res = await api()
        .post('/api/juicebox/posts')
        .set(auth(user.token))
        .send({ title: 'Hello', content: 'World', tags: '#one #two' });

      expect(res.status).toBe(200);
      expect(res.body.post).toMatchObject({
        title: 'Hello',
        content: 'World',
        active: true,
        isAuthor: true,
        author: { id: user.id, username: user.username },
      });
      expect(res.body.post.tag.map((tag) => tag.name).sort()).toEqual(['#one', '#two']);
    });

    it('requires a logged-in user', async () => {
      const res = await api()
        .post('/api/juicebox/posts')
        .send({ title: 'Nope', content: 'Nope' });

      expect(res.status).toBe(400);
      expect(res.body.name).toBe('MissingUserError');
    });
  });

  describe('PATCH /:postId', () => {
    it('updates your own post and replaces its tags', async () => {
      const user = await registerUser();
      const post = await createPost(user.token, { tags: '#before' });

      const res = await api()
        .patch(`/api/juicebox/posts/${post.id}`)
        .set(auth(user.token))
        .send({ title: 'Updated', tags: '#after' });

      expect(res.status).toBe(200);
      expect(res.body.post).toMatchObject({
        id: post.id,
        title: 'Updated',
        content: post.content,
        isAuthor: true,
      });
      expect(res.body.post.tag.map((tag) => tag.name)).toEqual(['#after']);
    });

    it("refuses to update someone else's post", async () => {
      const author = await registerUser();
      const other = await registerUser();
      const post = await createPost(author.token);

      const res = await api()
        .patch(`/api/juicebox/posts/${post.id}`)
        .set(auth(other.token))
        .send({ title: 'Hijacked' });

      expect(res.status).toBe(400);
      expect(res.body.name).toBe('UnauthorizedUserError');
    });
  });

  describe('DELETE /:postId', () => {
    it('deactivates your own post and hides it from other users', async () => {
      const user = await registerUser();
      const post = await createPost(user.token, { title: 'Soon gone' });

      const res = await api()
        .delete(`/api/juicebox/posts/${post.id}`)
        .set(auth(user.token));

      expect(res.status).toBe(200);
      expect(res.body.post).toMatchObject({ id: post.id, active: false });

      const anonymous = await api().get('/api/juicebox/posts');
      expect(anonymous.body.posts.map((p) => p.id)).not.toContain(post.id);

      const asAuthor = await api().get('/api/juicebox/posts').set(auth(user.token));
      expect(asAuthor.body.posts.map((p) => p.id)).toContain(post.id);
    });

    it("refuses to delete someone else's post", async () => {
      const author = await registerUser();
      const other = await registerUser();
      const post = await createPost(author.token);

      const res = await api()
        .delete(`/api/juicebox/posts/${post.id}`)
        .set(auth(other.token));

      expect(res.status).toBe(400);
      expect(res.body.name).toBe('UnauthorizedUserError');
    });

    it('reports a post that does not exist', async () => {
      const user = await registerUser();

      const res = await api()
        .delete('/api/juicebox/posts/999999')
        .set(auth(user.token));

      expect(res.status).toBe(400);
      expect(res.body.name).toBe('PostNotFoundError');
    });
  });

  it("hides a deactivated user's posts from everyone else", async () => {
    const user = await registerUser();
    const post = await createPost(user.token);
    await api().delete(`/api/juicebox/users/${user.id}`).set(auth(user.token));

    const res = await api().get('/api/juicebox/posts');

    expect(res.body.posts.map((p) => p.id)).not.toContain(post.id);
  });
});
