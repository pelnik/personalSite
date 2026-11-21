/**
 * SQL injection regressions (#28). These routes used to put URL parameters
 * straight into SQL strings.
 */
require('dotenv').config();
const request = require('supertest');
const app = require('../testApp');

const inject = "nobody' OR '1'='1";

describe('fitness routes treat URL parameters as data, not SQL', () => {
  it('GET /users/:username/routines', async () => {
    const res = await request(app).get(
      `/api/fitness/users/${encodeURIComponent(inject)}/routines`
    );

    // No user has that name, so there are no routines to return. Injected,
    // the condition matched every public routine.
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('GET /activities/:activityId/routines', async () => {
    const res = await request(app).get(
      `/api/fitness/activities/${encodeURIComponent("0' OR '1'='1")}/routines`
    );

    expect(Array.isArray(res.body) && res.body.length > 0).toBe(false);
  });
});
