const client = require('./client');

async function createAuthTables() {
  await client.query(`
    CREATE TABLE IF NOT EXISTS accounts (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      is_admin BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function dropAuthTables() {
  await client.query('DROP TABLE IF EXISTS accounts;');
}

module.exports = { createAuthTables, dropAuthTables };
