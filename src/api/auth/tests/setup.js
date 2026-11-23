require('../../../../tests/support/testEnv');
const assertLocalDatabase = require('../../../../tests/support/assertLocalDatabase');
const endAuthPool = require('../../../../tests/support/endAuthPool');

module.exports = async () => {
  assertLocalDatabase('AUTH_DATABASE_URL');
  const { createAuthTables, seedAccounts } = require('../db');
  try {
    await createAuthTables();
    await seedAccounts();
  } finally {
    await endAuthPool();
  }
};
