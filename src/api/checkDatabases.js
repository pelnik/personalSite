const { performance } = require('node:perf_hooks');
const { pools } = require('./createPool');

// An unresponsive database host could otherwise leave the check waiting for
// the OS TCP timeout. Give each check its own deadline.
const CHECK_TIMEOUT_MS = 3000;

function timeout(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms).unref();
  });
}

async function checkDatabases() {
  const databases = {};

  await Promise.all(
    [...pools].map(async ([name, pool]) => {
      const start = performance.now();
      try {
        await Promise.race([pool.query('SELECT 1'), timeout(CHECK_TIMEOUT_MS)]);
        databases[name] = { status: 'ok', latencyMs: Math.round(performance.now() - start) };
      } catch (error) {
        console.error(`Health check: ${name} database unreachable:`, error.message);
        databases[name] = { status: 'error', latencyMs: null };
      }
    })
  );

  return databases;
}

module.exports = { checkDatabases, CHECK_TIMEOUT_MS };
