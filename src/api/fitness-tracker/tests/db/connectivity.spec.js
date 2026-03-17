/**
 * DB Connectivity Test
 *
 * Runs BEFORE rebuildDB() in globalSetup, so it tests the real DB state.
 * If the pool is misconfigured or the DB is unreachable, this fails with
 * a clear message instead of a cryptic "error getting all public routines".
 *
 * NOTE: globalSetup (rebuildDB) runs before all specs, so by the time this
 * spec file executes the schema already exists. The value is catching
 * connection-level failures (bad URL, DB not running) which would surface
 * here as a clear pool/connect error rather than a route-level 400.
 */
require('dotenv').config();
const client = require('../../db/client');

describe('Database connectivity', () => {
  it('can connect to the fitness database', async () => {
    const result = await client.query('SELECT 1 AS ok');
    expect(result.rows[0].ok).toBe(1);
  });

  it('fitness database has the required tables', async () => {
    const { rows } = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('users', 'activities', 'routines', 'routine_activities')
      ORDER BY table_name;
    `);

    const tableNames = rows.map((r) => r.table_name);
    expect(tableNames).toContain('users');
    expect(tableNames).toContain('activities');
    expect(tableNames).toContain('routines');
    expect(tableNames).toContain('routine_activities');
  });
});
