const request = require('supertest');
const app = require('../../../tests/support/apiApp');
const { pools } = require('../createPool');

describe('GET /api/diagnostics', () => {
  const originalPmId = process.env.pm_id;
  const number = expect.any(Number);
  const string = expect.any(String);

  afterEach(() => {
    if (originalPmId === undefined) delete process.env.pm_id;
    else process.env.pm_id = originalPmId;
    jest.restoreAllMocks();
  });

  it('returns the public snapshot and forbids caching', async () => {
    delete process.env.pm_id;
    const res = await request(app)
      .get('/api/diagnostics')
      .set('User-Agent', 'Diagnostics test browser');

    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('no-store');
    const database = { status: 'ok', latencyMs: number };
    expect(res.body).toEqual({
      generatedAt: string,
      status: 'ok',
      server: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cpuCount: number,
        loadAverage: [number, number, number],
        systemUptimeSeconds: number,
        processUptimeSeconds: number,
      },
      memoryMB: {
        systemTotal: number,
        systemAvailable: number,
        processRss: number,
        heapUsed: number,
        heapTotal: number,
        heapLimit: number,
        restartLimit: null,
      },
      diskGB: { total: number, available: number },
      eventLoopDelayMs: { p50: number, p99: number, max: number },
      databases: { auth: database, cw: database, juicebox: database, fitness: database, scents: database },
      versions: { serverCommit: expect.stringMatching(/^[0-9a-f]{7,}$/), serverCommittedAt: string },
      tls: null,
      visitor: {
        ip: expect.stringMatching(/^(127\.0\.0\.1|::1)$/),
        userAgent: 'Diagnostics test browser',
        httpVersion: '1.1',
        secure: false,
      },
    });
  });

  it('uses the socket IP even when a forwarding header is present', async () => {
    const res = await request(app)
      .get('/api/diagnostics')
      .set('X-Forwarded-For', '203.0.113.9');

    expect(res.body.visitor.ip).toMatch(/^(127\.0\.0\.1|::1)$/);
  });

  it('still answers 200 when a database is unreachable', async () => {
    jest.spyOn(pools.get('fitness'), 'query').mockRejectedValueOnce(new Error('connection refused'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app).get('/api/diagnostics');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('error');
    expect(res.body.databases.fitness).toEqual({ status: 'error', latencyMs: null });
  });

  it('reports the restart limit under PM2', async () => {
    process.env.pm_id = '0';

    const res = await request(app).get('/api/diagnostics');

    expect(res.body.memoryMB.restartLimit).toBe(300);
  });
});
