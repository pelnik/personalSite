const { baselineWeights } = require('../lib/baseline');
const { practiceWeights } = require('../lib/weights');

test('keeps the baseline without attempts or mistakes', () => {
  expect(practiceWeights(10, []).weights).toEqual(baselineWeights(10));
  expect(practiceWeights(10, [{ K: [90, 0], M: [115, 0] }]).weights).toEqual(baselineWeights(10));
});

test('favors the letter with the higher smoothed error rate', () => {
  const { weights } = practiceWeights(1, [{ K: [100, 20], M: [100, 10] }]);
  const priorErrors = 10 * (30 / 200);
  expect(weights.K / weights.M).toBeCloseTo((20 + priorErrors) / (10 + priorErrors));
  expect(weights.K + weights.M).toBeCloseTo(1);
});

test('uses a neutral adjustment for an unseen letter and clamps extreme rates', () => {
  const { weights, letters } = practiceWeights(2, [{ K: [100, 100], M: [100, 0] }, { M: [0, 0] }]);
  // Equal baselines let U's neutral adjustment cancel out the normalization.
  expect(weights.M / weights.U).toBeCloseTo(0.5);
  expect(letters.find(({ char }) => char === 'U').errorRate).toBeNull();

  const correctLetters = Object.keys(baselineWeights(10))
    .filter((char) => char !== 'K' && char !== 'M')
    .map((char) => [char, [100, 0]]);
  const extreme = practiceWeights(10, [{ K: [100, 100], ...Object.fromEntries(correctLetters) }]);
  const [frequent, unseen] = extreme.letters;
  expect(frequent.multiplier / unseen.multiplier).toBeCloseTo(4);
  expect(Object.values(extreme.weights).reduce((total, value) => total + value, 0)).toBeCloseTo(1);
});

test('stops at the whole session that crosses the window for each letter', () => {
  const { letters } = practiceWeights(1, [
    { K: [600, 2], M: [300, 3] },
    { K: [500, 5], M: [200, 4] },
    { K: [100, 9], M: [200, 1] },
  ]);

  expect(letters.map(({ char, attempts, errors }) => [char, attempts, errors]))
    .toEqual([['K', 1100, 7], ['M', 700, 8]]);
});

test('stops once a letter reaches exactly 1000 attempts', () => {
  const { letters } = practiceWeights(1, [
    { K: [1000, 10] },
    { K: [20, 5] },
  ]);

  expect(letters[0]).toMatchObject({ char: 'K', attempts: 1000, errors: 10 });
});
