const crypto = require('crypto');
const request = require('supertest');
const app = require('../../../../tests/support/apiApp');

const sign = (body, secret = process.env.GITHUB_WEBHOOK) =>
  `sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`;

describe('POST /api/admin/github', () => {
  const body = JSON.stringify({ ref: 'refs/heads/main' });

  it('accepts a correctly signed webhook', async () => {
    const res = await request(app)
      .post('/api/admin/github')
      .set('Content-Type', 'application/json')
      .set('X-Hub-Signature-256', sign(body))
      .send(body);

    expect(res.status).toBe(200);
    expect(res.text).toBe('OK');
  });

  it('rejects a webhook signed with the wrong secret', async () => {
    const res = await request(app)
      .post('/api/admin/github')
      .set('Content-Type', 'application/json')
      .set('X-Hub-Signature-256', sign(body, 'wrong-secret'))
      .send(body);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ name: 'SecretMismatch', message: 'Secret did not match' });
  });

  it('rejects a webhook with no signature', async () => {
    const res = await request(app)
      .post('/api/admin/github')
      .set('Content-Type', 'application/json')
      .send(body);

    expect(res.status).toBe(400);
    expect(res.body.name).toBe('TypeError');
  });
});

describe('/api/admin unknown paths', () => {
  it('returns a 404', async () => {
    const res = await request(app).get('/api/admin/nothing-here');

    expect(res.status).toBe(404);
    expect(res.body.name).toBe('FitnessPathDoesNotExist');
  });
});
