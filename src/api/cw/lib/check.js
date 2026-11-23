function checkCopy(sent, input) {
  const typed = input.toUpperCase().replace(/\s+/g, ' ').trim();
  const width = typed.length + 1;
  const height = sent.length + 1;
  const costs = new Uint16Array(width * height);
  const choices = new Uint8Array(width * height); // 0 diagonal, 1 missing, 2 extra
  for (let i = 1; i < height; i++) { costs[i * width] = i; choices[i * width] = 1; }
  for (let j = 1; j < width; j++) { costs[j] = j; choices[j] = 2; }
  for (let i = 1; i < height; i++) {
    for (let j = 1; j < width; j++) {
      const index = i * width + j;
      const a = sent[i - 1];
      const b = typed[j - 1];
      const diagonal = (a === ' ') !== (b === ' ') ? Infinity : costs[index - width - 1] + (a === b ? 0 : 1);
      const missing = costs[index - width] + 1;
      const extra = costs[index - 1] + 1;
      const lowest = Math.min(diagonal, missing, extra);
      costs[index] = lowest;
      choices[index] = diagonal === lowest ? 0 : missing === lowest ? 1 : 2;
    }
  }
  const reverse = [];
  let i = sent.length;
  let j = typed.length;
  while (i || j) {
    const choice = choices[i * width + j];
    if (i && j && choice === 0) {
      reverse.push({ type: sent[i - 1] === typed[j - 1] ? 'match' : 'wrong', sent: sent[--i], typed: typed[--j] });
    } else if (i && (choice === 1 || !j)) {
      reverse.push({ type: 'missing', sent: sent[--i] });
    } else {
      reverse.push({ type: 'extra', typed: typed[--j] });
    }
  }
  const ops = reverse.reverse();
  const letterCounts = {};
  let errors = 0;
  let sentCount = 0;
  for (const op of ops) {
    if (op.sent && op.sent !== ' ') {
      letterCounts[op.sent] ??= [0, 0];
      letterCounts[op.sent][0]++;
      sentCount++;
      if (op.type === 'wrong' || op.type === 'missing') letterCounts[op.sent][1]++;
    }
    if (op.type === 'wrong' || op.type === 'missing' && op.sent !== ' ' || op.type === 'extra' && op.typed !== ' ') errors++;
  }
  const accuracy = sentCount ? Math.max(0, Math.round(1000 * (1 - errors / sentCount)) / 10) : 0;
  return { ops, errors, sentCount, accuracy, passed: accuracy >= 90, letterCounts };
}
module.exports = { checkCopy };
