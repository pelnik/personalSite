require('../../../../tests/support/testEnv');
const assertLocalDatabase = require('../../../../tests/support/assertLocalDatabase');
const endAuthPool = require('../../../../tests/support/endAuthPool');

// Seeds users albert, sandra and glamgal, each with one post.
const setup = async () => {
  assertLocalDatabase('DATABASE_URL');
  assertLocalDatabase('AUTH_DATABASE_URL');

  const { rebuildDB } = require('../db/seed');
  const { client } = require('../db');
  await rebuildDB();
  await client.end();
  await endAuthPool();
};

module.exports = setup;
