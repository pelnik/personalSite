require('../../../../tests/support/testEnv');
const { ensureTestDatabases } = require('../../../../tests/support/testDatabases');

module.exports = async () => {
  await ensureTestDatabases();
  // Other project setups can close the shared module cache's auth pool.
  for (const file of Object.keys(require.cache)) {
    if (file.includes('/src/api/auth/db/')) delete require.cache[file];
  }
  const { client, createAuthTables, seedAccounts } = require('../db');
  try {
    await createAuthTables();
    await seedAccounts();
  } finally {
    await client.end();
  }
};
