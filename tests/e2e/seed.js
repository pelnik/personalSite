// Resets the juicebox and fitness databases to their seed data before the
// e2e server starts, so every run sees the same posts and routines.
require('dotenv').config();
const assertLocalDatabase = require('../support/assertLocalDatabase');

async function seed() {
  assertLocalDatabase('DATABASE_URL');
  assertLocalDatabase('FITNESS_DATABASE_URL', 'postgres://localhost:5432/fitness');
  assertLocalDatabase('AUTH_DATABASE_URL');

  const juicebox = require('../../src/api/juicebox/db/seed');
  const { client: juiceboxClient } = require('../../src/api/juicebox/db');
  const fitness = require('../../src/api/fitness-tracker/db/seedData');
  const fitnessClient = require('../../src/api/fitness-tracker/db/client');
  const { client: authClient, createAuthTables, seedAccounts } = require('../../src/api/auth/db');

  await createAuthTables();
  await seedAccounts();
  await juicebox.rebuildDB();
  await fitness.rebuildDB();

  await juiceboxClient.end();
  await fitnessClient.end();
  await authClient.end();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
