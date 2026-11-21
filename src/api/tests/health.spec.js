const request = require('supertest');
const app = require('../../../tests/support/apiApp');
const { pools } = require('../createPool');
const { snapshot, startMetricsLog } = require('../metrics');

describe('GET /api/health', () => {
  it('reports every database', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'ok',
      databases: { juicebox: 'ok', fitness: 'ok', scents: 'ok' },
    });
  });

  it('answers 503 when a database is unreachable', async () => {
    const fitness = pools.get('fitness');
    const query = jest.spyOn(fitness, 'query').mockRejectedValueOnce(new Error('connection refused'));
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(503);
    expect(res.body).toEqual({
      status: 'error',
      databases: { juicebox: 'ok', fitness: 'error', scents: 'ok' },
    });
    query.mockRestore();
    consoleError.mockRestore();
  });
});

describe('GET /api/metrics', () => {
  const original = process.env.ADMIN_TOKEN;
  afterEach(() => {
    process.env.ADMIN_TOKEN = original;
  });

  it('is disabled unless ADMIN_TOKEN is set', async () => {
    delete process.env.ADMIN_TOKEN;

    const res = await request(app).get('/api/metrics');

    expect(res.status).toBe(404);
  });

  it('requires the admin token', async () => {
    process.env.ADMIN_TOKEN = 'test-admin-token';

    const missing = await request(app).get('/api/metrics');
    const wrong = await request(app).get('/api/metrics').set('Authorization', 'Bearer nope');

    expect(missing.status).toBe(401);
    expect(wrong.status).toBe(401);
  });

  it('returns a snapshot with the admin token', async () => {
    process.env.ADMIN_TOKEN = 'test-admin-token';

    const res = await request(app)
      .get('/api/metrics')
      .set('Authorization', 'Bearer test-admin-token');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      uptimeSeconds: expect.any(Number),
      memoryMB: { rss: expect.any(Number), heapUsed: expect.any(Number) },
      eventLoopDelayMs: { p99: expect.any(Number) },
      databasePools: {
        juicebox: { total: expect.any(Number), idle: expect.any(Number), waiting: 0 },
        fitness: expect.any(Object),
        scents: expect.any(Object),
      },
    });
  });
});

describe('metrics log', () => {
  it('logs one JSON line per interval', () => {
    jest.useFakeTimers();
    const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

    const timer = startMetricsLog(1000);
    jest.advanceTimersByTime(2500);

    expect(consoleLog).toHaveBeenCalledTimes(2);
    const line = JSON.parse(consoleLog.mock.calls[0][0]);
    expect(line).toMatchObject({ type: 'metrics', time: expect.any(String), memoryMB: expect.any(Object) });
    expect(Object.keys(line)).toEqual(['type', 'time', ...Object.keys(snapshot())]);

    clearInterval(timer);
    consoleLog.mockRestore();
    jest.useRealTimers();
  });
});
