require('../../../../tests/support/testEnv');
const assertLocalDatabase = require('../../../../tests/support/assertLocalDatabase');

const setup = async () => {
  console.log('--- JEST SETUP ---');
  assertLocalDatabase('FITNESS_DATABASE_URL', 'postgres://localhost:5432/fitness');

  const { rebuildDB } = require('../db/seedData');
  await rebuildDB();
};

module.exports = setup;
