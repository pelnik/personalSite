/**
 * 404 error handling tests using supertest
 */
require('dotenv').config();
const request = require('supertest');
const app = require('../testApp');

describe('/api/fitness/unknown', () => {
  it('should return a 404 for unknown paths', async () => {
    const res = await request(app).get('/api/fitness/unknown');

    expect(res.status).toEqual(404);
    expect(typeof res.body.name).toEqual('string');
    expect(typeof res.body.message).toEqual('string');
  });
});
