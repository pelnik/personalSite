require('../../../../tests/support/testEnv');
const assertLocalDatabase = require('../../../../tests/support/assertLocalDatabase');

// Seeds users albert, sandra and glamgal, each with one post.
const setup = async () => {
  assertLocalDatabase('DATABASE_URL');

  const { rebuildDB } = require('../db/seed');
  const { client } = require('../db');
  await rebuildDB();
  await client.end();
};

module.exports = setup;
