// Resets demo data before the e2e server starts. CW history is isolated to
// this checkout's e2e database and is rebuilt only there.
require('./e2eEnv');
const { ensureTestDatabases } = require('../support/testDatabases');

async function seedShowcase(cw, getAccountByUsername) {
  const account = await getAccountByUsername('sandra');
  const profile = await cw.ensureProfile(account);
  await cw.updateProfileSettings(profile.id, { ...profile, lesson: 2 });

  const { checkCopy } = require('../../src/api/cw/lib/check');
  const scores = [70, 85, 92, 78, 88, 94];
  for (const [index, accuracy] of scores.entries()) {
    const lesson = index < 3 ? 1 : 2;
    const date = new Date(Date.UTC(2026, 0, 5 + index, 12));
    const sent = lesson === 1 ? 'KMMKK MKMKM KMKKM KMMKM' : 'KUMKK MKUKM KMUKM UMMKU';
    const typed = sent.replaceAll(' ', '').slice(0, Math.round(20 * accuracy / 100));
    const { letterCounts } = checkCopy(sent, typed);
    await cw.client.query(
      `INSERT INTO cw_sessions
         (profile_id, created_at, lesson, char_wpm, eff_wpm, tone_hz, group_length, sent, typed, accuracy, letter_counts)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [profile.id, date, lesson, 20, 15, 700, 5, sent, typed, accuracy, letterCounts]
    );
  }
}

async function seed() {
  await ensureTestDatabases();
  const { client: authClient, rebuildDB: rebuildAuth, getAccountByUsername } = require('../../src/api/auth/db');
  const juicebox = require('../../src/api/juicebox/db/seed');
  const { client: juiceboxClient } = require('../../src/api/juicebox/db');
  const fitness = require('../../src/api/fitness-tracker/db/seedData');
  const fitnessClient = require('../../src/api/fitness-tracker/db/client');
  const cw = require('../../src/api/cw/db');
  await rebuildAuth();
  await cw.dropCwTables();
  await cw.createCwTables();
  await seedShowcase(cw, getAccountByUsername);
  await juicebox.rebuildDB();
  await fitness.rebuildDB();
  await authClient.end();
  await juiceboxClient.end();
  await fitnessClient.end();
  await cw.client.end();
}
seed().catch((error) => { console.error(error); process.exit(1); });
