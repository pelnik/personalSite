const { KOCH_ORDER, lessonChars } = require('../lib/koch');
const { baselineWeights } = require('../lib/baseline');
const { duration } = require('../lib/morse');
const { generatePractice } = require('../lib/generate');
const { DEFAULT_SETTINGS, validateSettings } = require('../lib/settings');
const seeded = (seed) => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
test('Koch order and baseline', () => {
  expect(new Set(KOCH_ORDER).size).toBe(41);
  expect(lessonChars(1)).toEqual(['K', 'M']);
  expect(lessonChars(40).at(-1)).toBe('X');
  expect(new Set(Object.values(baselineWeights(5))).size).toBe(1);
  expect(baselineWeights(10)[KOCH_ORDER[10]] / baselineWeights(10).K).toBeCloseTo(16 / 6);
  for (let lesson = 1; lesson <= 40; lesson++) expect(Object.values(baselineWeights(lesson)).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9);
});
test('PARIS timing', () => {
  expect(duration('PARIS PARIS', 20, 20)).toBeCloseTo(5.58, 6);
  const ts = (6 - 1.86) / 19;
  expect(duration('PARIS PARIS', 20, 10)).toBeCloseTo(62 * 0.06 + 31 * ts, 6);
});
test('practice generation respects lengths, lesson and bounds', () => {
  for (const groupLength of [0, 5]) {
    const settings = { lesson: 5, weights: baselineWeights(5), groupLength, minutes: 1, charWpm: 20, effWpm: 15, random: seeded(42) };
    const text = generatePractice(settings);
    expect([...text.replaceAll(' ', '')].every((c) => lessonChars(5).includes(c))).toBe(true);
    for (const group of text.split(' ')) expect(group.length).toBeGreaterThanOrEqual(groupLength || 2);
    for (const group of text.split(' ')) expect(group.length).toBeLessThanOrEqual(groupLength || 7);
    expect(Math.abs(duration(text, 20, 15) - 60)).toBeLessThan(duration(text.split(' ').at(-1), 20, 15) + 2);
  }
  expect(generatePractice({ lesson: 40, weights: baselineWeights(40), groupLength: 7, minutes: 5, charWpm: 50, effWpm: 50, random: seeded(1) }).length).toBeLessThanOrEqual(1600);
});
test('settings validation', () => {
  expect(validateSettings(DEFAULT_SETTINGS)).toBeNull();
  expect(validateSettings({ ...DEFAULT_SETTINGS, effWpm: 21 })).toBeTruthy();
  expect(validateSettings({ ...DEFAULT_SETTINGS, toneHz: 701 })).toBeTruthy();
  expect(validateSettings({ ...DEFAULT_SETTINGS, surprise: true })).toBeTruthy();
});
