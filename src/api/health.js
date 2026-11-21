const crypto = require('crypto');
const express = require('express');
const { pools } = require('./createPool');
const { snapshot } = require('./metrics');

const healthRouter = express.Router();

// Pools have no connection timeout, so a database host that stops answering
// (rather than refusing connections) would leave the check waiting for the
// OS TCP timeout. Give each check its own deadline so the endpoint always
// answers, and says which database is down.
const CHECK_TIMEOUT_MS = 3000;

function timeout(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms).unref();
  });
}

// GET /api/health: one check for the whole site, for uptime monitoring and
// the post-deploy check. 503 if any database is unreachable.
healthRouter.get('/health', async (req, res) => {
  const databases = {};

  await Promise.all(
    [...pools].map(async ([name, pool]) => {
      try {
        await Promise.race([pool.query('SELECT 1'), timeout(CHECK_TIMEOUT_MS)]);
        databases[name] = 'ok';
      } catch (error) {
        console.error(`Health check: ${name} database unreachable:`, error.message);
        databases[name] = 'error';
      }
    })
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
