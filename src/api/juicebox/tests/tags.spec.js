const { api } = require('./helpers');

describe('/api/juicebox/tags', () => {
  it('lists all tags', async () => {
    const res = await api().get('/api/juicebox/tags');

    expect(res.status).toBe(200);
    expect(res.body.tags.map((tag) => tag.name)).toEqual(
      expect.arrayContaining([
        '#happy',
        '#youcandoanything',
        '#worst-day-ever',
        '#canmandoeverything',
      ])
    );
  });

  it('lists the posts for a tag', async () => {
    const res = await api().get(
      `/api/juicebox/tags/${encodeURIComponent('#happy')}/posts`
    );

    expect(res.status).toBe(200);
    expect(res.body.posts.map((post) => post.title)).toEqual(
      expect.arrayContaining(['First Post', 'Second Post', 'Third Post'])
    );
  });

  it('returns no posts for an unknown tag', async () => {
    const res = await api().get('/api/juicebox/tags/no-such-tag/posts');

    expect(res.status).toBe(200);
    expect(res.body.posts).toEqual([]);
  });
});
