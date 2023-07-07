const { Pool } = require('pg');
require('dotenv').config();

const connectionString =
  process.env.SCENTS_DATABASE_URL || 'https://localhost:5432/grace-dev';

console.log('scents connection up', connectionString);

let client = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : undefined,
  idleTimeoutMillis: 30000,
});

client.on('error', (e) => {
  console.error('Database error', e);
  client = new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : undefined,
    idleTimeoutMillis: 30000,
  });
});

module.exports = client;
