const request = require('supertest');
const app = require('../../../tests/support/apiApp');

describe('/api router', () => {
  it('answers an unknown API path with InvalidAPIPath (status 200)', async () => {
    const res = await request(app).get('/api/not-a-real-module');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      name: 'InvalidAPIPath',
      message: 'API path sent is invalid',
    });
  });

  it('parses JSON request bodies for API modules', async () => {
    const res = await request(app)
      .post('/api/juicebox/users/login')
      .set('Content-Type', 'application/json')
      .send('{"username": "nobody"}');

    // Got past body parsing: the handler saw username but no password.
    expect(res.status).toBe(400);
    expect(res.body.name).toBe('MissingCredentialsError');
  });

  it('rejects malformed JSON with a 400', async () => {
    const res = await request(app)
      .post('/api/juicebox/users/login')
      .set('Content-Type', 'application/json')
      .send('{not json');

    expect(res.status).toBe(400);
    expect(res.body.name).toBe('SyntaxError');
  });
});
