require('../../../tests/support/testEnv');
const { ensureTestDatabases } = require('../../../tests/support/testDatabases');

module.exports = async () => {
  await ensureTestDatabases();
};
