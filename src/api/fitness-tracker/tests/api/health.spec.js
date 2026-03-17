/**
 * Health endpoint tests using supertest
 */
require('dotenv').config();
const request = require('supertest');
const app = require('../testApp');

describe('/api/fitness/health', () => {
  it('responds to a request at /api/fitness/health with a message specifying it is healthy', async () => {
    const res = await request(app).get('/api/fitness/health');
    expect(res.status).toBe(200);
    expect(typeof res.body.message).toEqual('string');
  });

  it('confirms the database is reachable', async () => {
    const res = await request(app).get('/api/fitness/health');
    expect(res.status).toBe(200);
    expect(res.body.db).toBe('ok');
  });
});
