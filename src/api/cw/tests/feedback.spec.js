const { api, auth, app } = require('./helpers');
const { signToken, getAccountByUsername } = require('../../auth');
const { client, getProfile } = require('../db');
const { practiceWeights } = require('../lib/weights');

const path = '/api/cw/feedback/group';
const defaults = { lesson: 1, groupLength: 5, recent: [] };

afterAll(async () => {
  expect(app.lateErrors).toEqual([]);
  await client.end();
});

test('feedback starts at baseline and supports fixed and random group lengths', async () => {
  const response = await api().post(path).send(defaults);
  expect(response.status).toBe(200);
  expect(response.body.weights).toEqual(response.body.baseline);
  expect(response.body.group).toMatch(/^[KM]{5}$/);
  expect(response.body.letters.map(({ char }) => char)).toEqual(['K', 'M']);

  const random = await api().post(path).send({ ...defaults, groupLength: 0 });
  expect(random.status).toBe(200);
  expect(random.body.group).toMatch(/^[KM]{2,7}$/);
});

test('feedback uses the supplied groups to weight missed letters', async () => {
  const recent = Array.from({ length: 10 }, () => ({ K: [3, 3], M: [2, 0] }));
  const response = await api().post(path).send({ ...defaults, recent });
  expect(response.status).toBe(200);
  expect(response.body.weights.K).toBeGreaterThan(response.body.baseline.K);
  expect(response.body).toMatchObject(practiceWeights(1, recent));
});

test('feedback ignores credentials and does not create a profile', async () => {
  const account = await getAccountByUsername('glamgal');
  await client.query('DELETE FROM cw_profiles WHERE id = $1', [account.id]);
  const response = await api().post(path).set(auth(signToken(account))).send(defaults);
  expect(response.status).toBe(200);
  expect(await getProfile(account.id)).toBeUndefined();
});

test.each([
  ['an unknown field', { extra: true }],
  ['an invalid lesson', { lesson: 41 }],
  ['an invalid length', { groupLength: 1 }],
  ['a non-array history', { recent: {} }],
  ['more than 100 groups', { recent: Array.from({ length: 101 }, () => ({ K: [1, 0] })) }],
  ['a null group', { recent: [null] }],
  ['an array group', { recent: [[]] }],
  ['an empty group', { recent: [{}] }],
  ['a letter outside the lesson', { recent: [{ U: [1, 0] }] }],
  ['too many errors', { recent: [{ K: [1, 2] }] }],
  ['negative errors', { recent: [{ K: [1, -1] }] }],
  ['no sent letters', { recent: [{ K: [0, 0] }] }],
  ['a fractional count', { recent: [{ K: [1.5, 0] }] }],
  ['an incomplete pair', { recent: [{ K: [1] }] }],
  ['more than seven letters in a group', { recent: [{ K: [4, 0], M: [4, 0] }] }],
])('rejects %s', async (description, changes) => {
  const response = await api().post(path).send({ ...defaults, ...changes });
  expect(response.status).toBe(400);
  expect(response.body.name).toBe('InvalidCwInputError');
});
