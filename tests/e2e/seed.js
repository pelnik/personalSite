// Resets demo data before the e2e server starts. CW history is isolated to
// this checkout's e2e database and is rebuilt only there.
require('./e2eEnv');
const { ensureTestDatabases } = require('../support/testDatabases');

async function seed() {
  await ensureTestDatabases();
  const { client: authClient, rebuildDB: rebuildAuth } = require('../../src/api/auth/db');
  const juicebox = require('../../src/api/juicebox/db/seed');
  const { client: juiceboxClient } = require('../../src/api/juicebox/db');
  const fitness = require('../../src/api/fitness-tracker/db/seedData');
  const fitnessClient = require('../../src/api/fitness-tracker/db/client');
  const { client: cwClient, dropCwTables, createCwTables } = require('../../src/api/cw/db');
  await rebuildAuth();
  await dropCwTables();
  await createCwTables();
  await juicebox.rebuildDB();
  await fitness.rebuildDB();
  await authClient.end();
  await juiceboxClient.end();
  await fitnessClient.end();
  await cwClient.end();
}
seed().catch((error) => { console.error(error); process.exit(1); });
