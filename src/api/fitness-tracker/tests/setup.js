require('../../../../tests/support/testEnv');
const { ensureTestDatabases } = require('../../../../tests/support/testDatabases');

const setup = async () => {
  console.log('--- JEST SETUP ---');
  await ensureTestDatabases();

  const { rebuildDB } = require('../db/seedData');
  const client = require('../db/client');
  await rebuildDB();
  await client.end();
};

module.exports = setup;
