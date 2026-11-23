const CODES = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.',
  '.': '.-.-.-', ',': '--..--', '=': '-...-', '/': '-..-.', '?': '..--..',
};
function duration(text, charWpm, effWpm) {
  const t = 1.2 / charWpm;
  const ts = effWpm < charWpm ? (60 / effWpm - 31 * t) / 19 : t;
  let seconds = 0;
  for (let i = 0; i < text.length; i++) {
    const code = CODES[text[i]];
    if (code) seconds += [...code].reduce((sum, element) => sum + (element === '.' ? 1 : 3), code.length - 1) * t;
    if (i === text.length - 1 || text[i] === ' ') continue;
    if (text[i + 1] === ' ') {
      // A space separates groups.
      seconds += 7 * ts;
    } else {
      // Adjacent characters in the same group.
      seconds += 3 * ts;
    }
  }
  return seconds;
}
module.exports = { CODES, duration };
