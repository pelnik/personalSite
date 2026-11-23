const { checkCopy } = require('../lib/check');
test('perfect copy and normalization', () => {
  expect(checkCopy('KM KM', '  km  km  ').accuracy).toBe(100);
  expect(checkCopy('KM KM', 'KM KM').errors).toBe(0);
});
test('wrong and missing characters charge the sent letter', () => {
  expect(checkCopy('KM', 'KK').letterCounts.M).toEqual([1, 1]);
  expect(checkCopy('KM', '').letterCounts).toEqual({ K: [1, 1], M: [1, 1] });
});
test('missing group does not cascade', () => {
  const result = checkCopy('KMKMK MMKKM KKKMM', 'KMKMK KKKMM');
  expect(result.errors).toBe(5);
  expect(result.ops.filter((op) => op.type === 'wrong')).toHaveLength(0);
});
test('space mistakes do not count', () => expect(checkCopy('KM KM', 'KMKM').errors).toBe(0));
test('extra typed character has no letter charge', () => {
  const result = checkCopy('KM', 'KMM');
  expect(result.errors).toBe(1);
  expect(result.letterCounts.M).toEqual([1, 0]);
});
test('accuracy floor and deterministic alignment', () => {
  expect(checkCopy('KM', 'M'.repeat(100)).accuracy).toBe(0);
  expect(checkCopy('KMKM', 'KMM').ops).toEqual(checkCopy('KMKM', 'KMM').ops);
});
