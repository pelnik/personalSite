const { baselineWeights } = require('./baseline');
const { lessonChars } = require('./koch');

const WINDOW = 1000;
const PRIOR = 10;
const MIN_MULTIPLIER = 0.5;
const MAX_MULTIPLIER = 4;

function practiceWeights(lesson, recentLetterCounts) {
  const baseline = baselineWeights(lesson);
  const counts = lessonChars(lesson).map((char) => {
    let attempts = 0;
    let errors = 0;

    for (const session of recentLetterCounts) {
      const [sent, missed] = session[char] ?? [0, 0];
      attempts += sent;
      errors += missed;
      if (attempts >= WINDOW) break;
    }

    return { char, attempts, errors };
  });

  const totalAttempts = counts.reduce((total, letter) => total + letter.attempts, 0);
  const totalErrors = counts.reduce((total, letter) => total + letter.errors, 0);
  let weights = baseline;

  if (totalAttempts && totalErrors) {
    const overallRate = totalErrors / totalAttempts;
    const adjusted = counts.map(({ char, attempts, errors }) => {
      const smoothedRate = (errors + PRIOR * overallRate) / (attempts + PRIOR);
      const multiplier = Math.max(MIN_MULTIPLIER, Math.min(MAX_MULTIPLIER, smoothedRate / overallRate));
      return [char, baseline[char] * multiplier];
    });
    const total = adjusted.reduce((sum, [, weight]) => sum + weight, 0);
    weights = Object.fromEntries(adjusted.map(([char, weight]) => [char, weight / total]));
  }

  const letters = counts.map(({ char, attempts, errors }) => ({
    char,
    attempts,
    errors,
    errorRate: attempts ? errors / attempts : null,
    multiplier: weights[char] / baseline[char],
    share: weights[char],
    baselineShare: baseline[char],
  }));

  return { weights, letters };
}

module.exports = { practiceWeights };
