const client = require('./client');
const { createAuthTables, dropAuthTables } = require('./schema');
const { seedAccounts } = require('./seedAccounts');

async function rebuildDB() {
  await dropAuthTables();
  await createAuthTables();
  return seedAccounts();
}

if (require.main === module) {
  rebuildDB().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  }).finally(() => client.end());
}

module.exports = { rebuildDB };
