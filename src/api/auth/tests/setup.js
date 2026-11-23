require('../../../../tests/support/testEnv');
const { ensureTestDatabases } = require('../../../../tests/support/testDatabases');

module.exports = async () => {
  await ensureTestDatabases();
  const { client, createAuthTables, seedAccounts } = require('../db');
  try {
    await createAuthTables();
    await seedAccounts();
  } finally {
    await client.end();
  }
};
