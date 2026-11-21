const { createPool } = require('../../createPool');

module.exports = createPool(
  'fitness',
  process.env.FITNESS_DATABASE_URL || 'postgres://localhost:5432/fitness'
);
