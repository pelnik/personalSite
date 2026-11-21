require('dotenv').config();
const { createPool } = require('../../createPool');

module.exports = createPool(
  'scents',
  process.env.SCENTS_DATABASE_URL || 'postgres://localhost:5432/scents'
);
