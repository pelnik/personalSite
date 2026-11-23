require('../../../../tests/support/testEnv');
const assertLocalDatabase = require('../../../../tests/support/assertLocalDatabase');

module.exports = async () => {
  assertLocalDatabase('AUTH_DATABASE_URL');
  const { client, createAuthTables, seedAccounts } = require('../db');
  try {
    await createAuthTables();
    await seedAccounts();
  } finally {
    await client.end();
  }
};
