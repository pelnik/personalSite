const client = require('./client');
async function createSession(profileId, { lesson, charWpm, effWpm, toneHz, groupLength, sent, typed, accuracy, letterCounts }) {
  const { rows: [session] } = await client.query(`INSERT INTO cw_sessions
    (profile_id, lesson, char_wpm, eff_wpm, tone_hz, group_length, sent, typed, accuracy, letter_counts)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id, created_at AS "createdAt"`,
    [profileId, lesson, charWpm, effWpm, toneHz, groupLength, sent, typed, accuracy, letterCounts]);
  return session;
}
async function getRecentLetterCounts(profileId, limit = 500) {
  const { rows } = await client.query('SELECT letter_counts FROM cw_sessions WHERE profile_id=$1 ORDER BY created_at DESC, id DESC LIMIT $2', [profileId, limit]);
  return rows.map((row) => row.letter_counts);
}
async function getSessionSummaries(profileId, limit = 500) {
  const { rows } = await client.query(
    `SELECT id, created_at AS "createdAt", lesson, accuracy,
            char_wpm AS "charWpm", eff_wpm AS "effWpm"
       FROM cw_sessions
      WHERE profile_id = $1
      ORDER BY created_at DESC, id DESC
      LIMIT $2`,
    [profileId, limit]
  );
  return rows.reverse().map((row) => ({ ...row, accuracy: Number(row.accuracy) }));
}

async function getLetterHistory(profileId, char, limit = 500) {
  const { rows } = await client.query(
    `SELECT created_at AS "createdAt",
            (letter_counts -> $2::text ->> 0)::integer AS sent,
            (letter_counts -> $2::text ->> 1)::integer AS errors
       FROM cw_sessions
      WHERE profile_id = $1 AND letter_counts ? $2
      ORDER BY created_at DESC, id DESC
      LIMIT $3`,
    [profileId, char, limit]
  );
  return rows.reverse();
}

async function getLessonStarts(profileId) {
  const { rows } = await client.query(
    `SELECT DISTINCT ON (lesson) lesson, id AS "sessionId"
       FROM cw_sessions
      WHERE profile_id = $1
      ORDER BY lesson, created_at, id`,
    [profileId]
  );
  return rows;
}

module.exports = {
  createSession, getRecentLetterCounts, getSessionSummaries, getLetterHistory, getLessonStarts,
};
