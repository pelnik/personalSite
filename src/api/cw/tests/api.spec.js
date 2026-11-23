const { api, auth, app } = require('./helpers');
const { signToken } = require('../../auth');
const { getAccountByUsername } = require('../../auth/db');
const { client } = require('../db');
let token;
beforeAll(async () => { token = signToken(await getAccountByUsername('albert')); });
afterAll(async () => { expect(app.lateErrors).toEqual([]); await client.end(); });
const path = '/api/cw';
const practice = { lesson: 1, charWpm: 20, effWpm: 15, minutes: 1, groupLength: 5 };
const resultBody = { lesson: 1, charWpm: 20, effWpm: 15, toneHz: 700, groupLength: 5, sent: 'KM', typed: 'KK' };
test('settings defaults, account persistence and validation', async () => {
  const out = await api().get(`${path}/settings`);
  expect(out.body.settings.lesson).toBe(1);
  expect(out.body.options.lessons).toHaveLength(40);
  expect((await api().put(`${path}/settings`).send({ toneHz: 650 })).body.name).toBe('MissingUserError');
  expect((await api().get(`${path}/settings`).set(auth(token))).body.settings.toneHz).toBe(700);
  expect((await api().put(`${path}/settings`).set(auth(token)).send({ toneHz: 650 })).body.settings.toneHz).toBe(650);
  expect((await api().get(`${path}/settings`).set(auth(token))).body.settings.toneHz).toBe(650);
  const bad = await api().put(`${path}/settings`).set(auth(token)).send({ toneHz: 651 });
  expect(bad.status).toBe(400);
  expect(bad.body.name).toBe('InvalidCwSettingsError');
});
test('practice validates input and uses lesson characters', async () => {
  const good = await api().get(`${path}/practice`).query(practice);
  expect(good.body.chars).toEqual(['K', 'M']);
  expect(good.body.text).toMatch(/^[KM ]+$/);
  expect((await api().get(`${path}/practice`).query({ lesson: 1 })).body.name).toBe('InvalidCwSettingsError');
});
test('results save only for account', async () => {
  const anon = await api().post(`${path}/results`).send(resultBody);
  expect(anon.body.saved).toBe(false);
  const account = await api().post(`${path}/results`).set(auth(token)).send(resultBody);
  expect(account.body.saved).toBe(true);
  const { rows: [row] } = await client.query('SELECT accuracy, letter_counts FROM cw_sessions WHERE id=$1', [account.body.session.id]);
  expect(Number(row.accuracy)).toBe(50);
  expect(row.letter_counts.M).toEqual([1, 1]);
  for (const changes of [{ sent: 'A' }, { sent: ' KM' }, { sent: 'K'.repeat(1601) }, { typed: 'K'.repeat(103) }]) {
    const bad = await api().post(`${path}/results`).send({ ...resultBody, ...changes });
    expect(bad.body.name).toBe('InvalidCwInputError');
  }
});
