const { Pool } = require('pg');

// Every database pool, by name, so shutdown can close them all and monitoring
// can report on them.
const pools = new Map();

// One pool per database for the life of the process. pg.Pool already drops a
// broken idle client and opens a fresh one on the next query, so an idle
// client error only needs logging, not a new pool.
function createPool(name, connectionString) {
  const pool = new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : undefined,
    idleTimeoutMillis: 30000,
  });

  // Without a listener, an idle client error would crash the process.
  pool.on('error', (error) => {
    console.error(`Idle client error in the ${name} database pool:`, error.message);
  });

  pools.set(name, pool);
  return pool;
}

async function endAllPools() {
  await Promise.all([...pools.values()].map((pool) => pool.end()));
}

module.exports = { createPool, endAllPools, pools };
