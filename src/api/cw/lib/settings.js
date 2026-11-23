const { LESSON_COUNT, lessonChars, newChars } = require('./koch');
const DEFAULT_SETTINGS = { lesson: 1, charWpm: 20, effWpm: 15, toneHz: 700, minutes: 1, groupLength: 5 };
const range = (first, last, step = 1) => Array.from({ length: Math.floor((last - first) / step) + 1 }, (_, i) => first + i * step);
const OPTIONS = {
  lessons: range(1, LESSON_COUNT).map((lesson) => ({ lesson, newChars: newChars(lesson), chars: lessonChars(lesson) })),
  charWpm: range(5, 50), effWpm: range(5, 50), toneHz: range(400, 1000, 50),
  minutes: range(1, 5), groupLength: [0, 2, 3, 4, 5, 6, 7],
};
function validateSettings(settings) {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return 'Settings must be an object';
  if (Object.keys(settings).some((key) => !(key in DEFAULT_SETTINGS))) return 'Unknown setting';
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    const choices = key === 'lesson' ? OPTIONS.lessons.map(({ lesson }) => lesson) : OPTIONS[key];
    if (!choices.includes(settings[key])) return `Invalid ${key}`;
  }
  if (settings.effWpm > settings.charWpm) return 'Effective speed must not exceed character speed';
  return null;
}
module.exports = { DEFAULT_SETTINGS, OPTIONS, validateSettings };
