const client = require('./client');
const { createCwTables } = require('./schema');
async function createDB() { await createCwTables(); }
if (require.main === module) {
  createDB().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => client.end());
}
module.exports = { createDB };
