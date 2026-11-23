const crypto = require('crypto');
const { Client } = require('pg');
const {
  checkoutId,
  testDatabaseUrl,
  useTestDatabases,
  ensureDatabase,
} = require('../../../tests/support/testDatabases');

describe('checkout test databases', () => {
  test('checkout id is stable and eight lowercase hex characters', () => {
    expect(checkoutId()).toMatch(/^[0-9a-f]{8}$/);
    expect(checkoutId()).toBe(checkoutId());
  });

  test('database URL keeps connection details and is idempotent', () => {
    const base = 'postgres://u:p@localhost:5432/fitness?sslmode=disable';
    const result = `postgres://u:p@localhost:5432/fitness_test_${checkoutId()}?sslmode=disable`;
    expect(testDatabaseUrl(base, 'test')).toBe(result);
    expect(testDatabaseUrl(result, 'test')).toBe(result);
    expect(testDatabaseUrl(base, 'e2e'))
      .toBe(`postgres://u:p@localhost:5432/fitness_e2e_${checkoutId()}?sslmode=disable`);
  });

  test('rejects unsafe database names', () => {
    expect(() => testDatabaseUrl('postgres://localhost/fit-ness', 'test'))
      .toThrow('Invalid test database name');
  });

  test('all four environment URLs are rewritten exactly once', () => {
    for (const [envVar, name] of [
      ['AUTH_DATABASE_URL', 'auth'],
      ['DATABASE_URL', 'juicebox'],
      ['FITNESS_DATABASE_URL', 'fitness'],
      ['SCENTS_DATABASE_URL', 'scents'],
    ]) {
      expect(new URL(process.env[envVar]).pathname).toBe(`/${name}_test_${checkoutId()}`);
    }
  });

  test('requires local database defaults to run before rewriting', () => {
    const previous = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      expect(() => useTestDatabases('test'))
        .toThrow('DATABASE_URL is not set; localDatabases must run first');
    } finally {
      process.env.DATABASE_URL = previous;
    }
  });

  test('creates a missing database and accepts an existing one', async () => {
    const name = `tmp_${crypto.randomBytes(4).toString('hex')}_test_${checkoutId()}`;
    const databaseUrl = new URL(process.env.DATABASE_URL);
    databaseUrl.pathname = `/${name}`;
    const maintenanceUrl = new URL(process.env.DATABASE_URL);
    maintenanceUrl.pathname = '/postgres';
    const client = new Client({ connectionString: maintenanceUrl.toString() });

    await client.connect();
    try {
      await ensureDatabase(databaseUrl.toString());
      await ensureDatabase(databaseUrl.toString());
      const { rows: [found] } = await client.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [name]
      );
      expect(found).toBeDefined();
    } finally {
      await client.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
      await client.end();
    }
  });
});
