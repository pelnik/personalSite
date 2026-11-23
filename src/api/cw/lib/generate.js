const { duration } = require('./morse');
const { lessonChars } = require('./koch');
const RANDOM_LENGTH_WEIGHTS = [2, 3, 4, 4, 3, 2];
function draw(entries, random) {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let point = random() * total;
  for (const [value, weight] of entries) { point -= weight; if (point < 0) return value; }
  return entries.at(-1)[0];
}
function generatePractice({ lesson, weights, groupLength, minutes, charWpm, effWpm, random = Math.random }) {
  const chars = lessonChars(lesson);
  const entries = chars.map((char) => [char, weights[char]]);
  const groups = [];
  let previousDuration = 0;
  while (true) {
    const length = groupLength || draw(RANDOM_LENGTH_WEIGHTS.map((weight, i) => [i + 2, weight]), random);
    const group = Array.from({ length }, () => draw(entries, random)).join('');
    const candidate = [...groups, group].join(' ');
    if (candidate.length > 1600) break;
    const nextDuration = duration(candidate, charWpm, effWpm);
    groups.push(group);
    if (nextDuration >= minutes * 60) {
      if (groups.length > 1 && Math.abs(previousDuration - minutes * 60) < Math.abs(nextDuration - minutes * 60)) groups.pop();
      break;
    }
    previousDuration = nextDuration;
  }
  return groups.join(' ');
}
module.exports = { generatePractice };
