const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const assertLocalDatabase = require('./assertLocalDatabase');
const { LOCAL_DATABASES } = require('./localDatabases');

const DATABASE_ENV_VARS = Object.keys(LOCAL_DATABASES);

const databaseNamePattern = /^[A-Za-z0-9_]+$/;
let loggedDatabases = false;

function checkoutId() {
  const repoRoot = fs.realpathSync(path.resolve(__dirname, '../..'));
  return crypto.createHash('sha1').update(repoRoot).digest('hex').slice(0, 8);
}

function databaseName(connectionString) {
  const name = new URL(connectionString).pathname.slice(1);
  if (!databaseNamePattern.test(name)) {
    throw new Error(`Invalid test database name: ${name}`);
  }
  return name;
}

function testDatabaseUrl(connectionString, kind) {
  if (kind !== 'test' && kind !== 'e2e') {
    throw new Error(`Invalid test database kind: ${kind}`);
  }

  const url = new URL(connectionString);
  const name = databaseName(connectionString);
  const suffix = `_${kind}_${checkoutId()}`;
  if (name.endsWith(suffix)) return connectionString;
  url.pathname = `/${name}${suffix}`;
  databaseName(url.toString());
  return url.toString();
}

function useTestDatabases(kind) {
  for (const name of DATABASE_ENV_VARS) {
    if (!process.env[name]) {
      throw new Error(`${name} is not set; localDatabases must run first`);
    }
    process.env[name] = testDatabaseUrl(process.env[name], kind);
  }
}

async function ensureDatabase(connectionString) {
  const name = databaseName(connectionString);
  const maintenanceUrl = new URL(connectionString);
  maintenanceUrl.pathname = '/postgres';
  const client = new Client({ connectionString: maintenanceUrl.toString() });

  try {
    await client.connect();
    const { rows: [existing] } = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [name]
    );
    if (!existing) {
      try {
        await client.query(`CREATE DATABASE "${name}"`);
      } catch (error) {
        if (error.code !== '42P04') throw error;
      }
    }
  } finally {
    await client.end();
  }
}

async function ensureTestDatabases() {
  const databases = DATABASE_ENV_VARS.map((name) => {
    assertLocalDatabase(name);
    return process.env[name];
  });

  for (const connectionString of databases) {
    await ensureDatabase(connectionString);
  }

  if (!loggedDatabases) {
    console.log(`Test databases: ${databases.map(databaseName).join(', ')}`);
    loggedDatabases = true;
  }
}

module.exports = {
  DATABASE_ENV_VARS,
  checkoutId,
  testDatabaseUrl,
  useTestDatabases,
  ensureDatabase,
  ensureTestDatabases,
};
