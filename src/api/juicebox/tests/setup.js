require('../../../../tests/support/testEnv');
const { ensureTestDatabases } = require('../../../../tests/support/testDatabases');

// Seeds users albert, sandra and glamgal, each with one post.
const setup = async () => {
  await ensureTestDatabases();

  const { rebuildDB } = require('../db/seed');
  const { client } = require('../db');
  await rebuildDB();
  await client.end();
};

module.exports = setup;
