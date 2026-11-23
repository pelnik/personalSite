const client = require('./client');
const columns = 'id, lesson, char_wpm AS "charWpm", eff_wpm AS "effWpm", tone_hz AS "toneHz", minutes, group_length AS "groupLength"';
async function ensureProfile(account) {
  await client.query('INSERT INTO cw_profiles (id) VALUES ($1) ON CONFLICT (id) DO NOTHING', [account.id]);
  const { rows: [profile] } = await client.query(`SELECT ${columns} FROM cw_profiles WHERE id = $1`, [account.id]);
  return profile;
}
async function updateProfileSettings(id, settings) {
  const { rows: [profile] } = await client.query(`UPDATE cw_profiles SET lesson=$2, char_wpm=$3, eff_wpm=$4, tone_hz=$5, minutes=$6, group_length=$7 WHERE id=$1 RETURNING ${columns}`,
    [id, settings.lesson, settings.charWpm, settings.effWpm, settings.toneHz, settings.minutes, settings.groupLength]);
  return profile;
}
module.exports = { ensureProfile, updateProfileSettings };
