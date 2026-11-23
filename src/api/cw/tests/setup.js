require('../../../../tests/support/testEnv');
const assertLocalDatabase = require('../../../../tests/support/assertLocalDatabase');
const { ensureTestDatabases } = require('../../../../tests/support/testDatabases');
module.exports = async () => {
  await ensureTestDatabases();
  assertLocalDatabase('CW_DATABASE_URL');
  assertLocalDatabase('AUTH_DATABASE_URL');
  const cw = require('../db');
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
