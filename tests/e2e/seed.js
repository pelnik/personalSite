// Resets the auth, juicebox and fitness databases to their seed data before the
// e2e server starts, so every run sees the same posts and routines.
require('./e2eEnv');
const { ensureTestDatabases } = require('../support/testDatabases');

async function seed() {
  await ensureTestDatabases();

  const { rebuildDB: rebuildAuth } = require('../../src/api/auth/db/seed');
  const authClient = require('../../src/api/auth/db/client');
  const juicebox = require('../../src/api/juicebox/db/seed');
  const { client: juiceboxClient } = require('../../src/api/juicebox/db');
  const fitness = require('../../src/api/fitness-tracker/db/seedData');
  const fitnessClient = require('../../src/api/fitness-tracker/db/client');
  await rebuildAuth();
  await juicebox.rebuildDB();
  await fitness.rebuildDB();

  await authClient.end();
  await juiceboxClient.end();
  await fitnessClient.end();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
