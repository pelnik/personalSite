require('../../../../tests/support/testEnv');
const assertLocalDatabase = require('../../../../tests/support/assertLocalDatabase');
const { ensureTestDatabases } = require('../../../../tests/support/testDatabases');
module.exports = async () => {
  await ensureTestDatabases();
  assertLocalDatabase('CW_DATABASE_URL');
  assertLocalDatabase('AUTH_DATABASE_URL');
  const cw = require('../db');
  // Jest runs project global setups in one process. The auth setup may have
  // closed its cached pool already, so load fresh DB modules for this setup.
  for (const file of Object.keys(require.cache)) {
    if (file.includes('/src/api/auth/db/')) delete require.cache[file];
  }
  const auth = require('../../auth/db');
  try {
    await auth.createAuthTables();
    await auth.seedAccounts();
    await cw.dropCwTables();
    await cw.createCwTables();
  } finally {
    await cw.client.end();
    await auth.client.end();
  }
};
