const path = require('path');

const authDirectory = path.join(__dirname, '../../src/api/auth') + path.sep;

// Jest runs every project's globalSetup in one process. After closing the
// shared pool, evict auth modules so the next setup gets a fresh pool.
async function endAuthPool() {
  const client = require('../../src/api/auth/db/client');
  await client.end();
  for (const filename of Object.keys(require.cache)) {
    if (filename.startsWith(authDirectory)) delete require.cache[filename];
  }
}

module.exports = endAuthPool;
