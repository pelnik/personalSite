require('dotenv').config();
const { Client } = require('pg');
const assertLocalDatabase = require('../tests/support/assertLocalDatabase');

// Drops databases from every checkout and can interrupt another checkout's tests.
async function main() {
  assertLocalDatabase('DATABASE_URL');
  const maintenanceUrl = new URL(process.env.DATABASE_URL);
  maintenanceUrl.pathname = '/postgres';
  const client = new Client({ connectionString: maintenanceUrl.toString() });

  try {
    await client.connect();
    const { rows } = await client.query('SELECT datname FROM pg_database');
    const names = rows.map(({ datname }) => datname)
      .filter((name) => /^[A-Za-z0-9_]+_(test|e2e)_[0-9a-f]{8}$/.test(name));
    for (const name of names) {
      await client.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
      console.log(`Dropped ${name}`);
    }
    if (names.length === 0) console.log('No test databases to drop.');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
