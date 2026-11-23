const { lessonChars } = require('./koch');
function baselineWeights(lesson) {
  const chars = lessonChars(lesson);
  const raw = chars.map((_, i) => lesson < 10 ? 1 : i + 0.5 + chars.length / 2);
  const total = raw.reduce((sum, n) => sum + n, 0);
  return Object.fromEntries(chars.map((char, i) => [char, raw[i] / total]));
}
module.exports = { baselineWeights };
