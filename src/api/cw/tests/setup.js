require('../../../../tests/support/testEnv');
const assertLocalDatabase = require('../../../../tests/support/assertLocalDatabase');
module.exports = async () => {
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
