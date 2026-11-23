const crypto = require('crypto');
const express = require('express');
const { checkDatabases } = require('./checkDatabases');
const { snapshot } = require('./metrics');

const healthRouter = express.Router();

// GET /api/health: one check for the whole site, for uptime monitoring and
// the post-deploy check. 503 if any database is unreachable.
healthRouter.get('/health', async (req, res) => {
  const checks = await checkDatabases();
  const databases = Object.fromEntries(
    Object.entries(checks).map(([name, { status }]) => [name, status])
  );

  const healthy = Object.values(databases).every((status) => status === 'ok');
  res.status(healthy ? 200 : 503).send({ status: healthy ? 'ok' : 'error', databases });
});

// GET /api/metrics: the same snapshot the server logs every few minutes.
// Disabled (404) unless ADMIN_TOKEN is set, and requires that token.
healthRouter.get('/metrics', (req, res) => {
  const { ADMIN_TOKEN } = process.env;
  if (!ADMIN_TOKEN) {
    return res.status(404).send({ name: 'InvalidAPIPath', message: 'API path sent is invalid' });
  }

  const expected = Buffer.from(`Bearer ${ADMIN_TOKEN}`);
  const given = Buffer.from(req.header('Authorization') || '');
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
    return res.status(401).send({ name: 'Unauthorized', message: 'Admin token required' });
  }

  res.send(snapshot());
});

module.exports = healthRouter;
