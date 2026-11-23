const client = require('./client');

async function createCwTables() {
  await client.query(`CREATE TABLE IF NOT EXISTS cw_profiles (
    id INTEGER PRIMARY KEY,
    lesson SMALLINT NOT NULL DEFAULT 1,
    char_wpm SMALLINT NOT NULL DEFAULT 20,
    eff_wpm SMALLINT NOT NULL DEFAULT 15,
    tone_hz SMALLINT NOT NULL DEFAULT 700,
    minutes SMALLINT NOT NULL DEFAULT 1,
    group_length SMALLINT NOT NULL DEFAULT 5,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);
  await client.query(`CREATE TABLE IF NOT EXISTS cw_sessions (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER NOT NULL REFERENCES cw_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    lesson SMALLINT NOT NULL,
    char_wpm SMALLINT NOT NULL,
    eff_wpm SMALLINT NOT NULL,
    tone_hz SMALLINT NOT NULL,
    group_length SMALLINT NOT NULL,
    sent TEXT NOT NULL,
    typed TEXT NOT NULL,
    accuracy NUMERIC(4,1) NOT NULL,
    letter_counts JSONB NOT NULL
  )`);
  await client.query('CREATE INDEX IF NOT EXISTS cw_sessions_profile_created ON cw_sessions (profile_id, created_at DESC)');
}
async function dropCwTables() {
  await client.query('DROP TABLE IF EXISTS cw_sessions');
  await client.query('DROP TABLE IF EXISTS cw_profiles');
}
module.exports = { createCwTables, dropCwTables };
