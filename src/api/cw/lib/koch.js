const KOCH_ORDER = 'K M U R E S N A P T L W I . J Z = F O Y , V G 5 / Q 9 2 H 3 8 B ? 4 7 C 1 D 6 0 X'.split(' ');
const LESSON_COUNT = 40;
const lessonChars = (lesson) => KOCH_ORDER.slice(0, lesson + 1);
const newChars = (lesson) => lesson === 1 ? ['K', 'M'] : [KOCH_ORDER[lesson]];
module.exports = { KOCH_ORDER, LESSON_COUNT, lessonChars, newChars };
