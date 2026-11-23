const express = require('express');
const { authenticate, requireAccount } = require('../../auth');
const { ensureProfile, updateProfileSettings, createSession, getRecentLetterCounts } = require('../db');
const { DEFAULT_SETTINGS, OPTIONS, validateSettings } = require('../lib/settings');
const { lessonChars } = require('../lib/koch');
const { baselineWeights } = require('../lib/baseline');
const { practiceWeights } = require('../lib/weights');
const { generatePractice } = require('../lib/generate');
const { checkCopy, normalizeCopy } = require('../lib/check');

const cwRouter = express.Router();
cwRouter.use(authenticate(ensureProfile));
const fail = (name, message) => ({ name, message });
const withoutId = (profile) => Object.fromEntries(Object.entries(profile).filter(([key]) => key !== 'id'));

cwRouter.get('/settings', (req, res) => {
  const settings = req.user ? withoutId(req.user) : DEFAULT_SETTINGS;
  return res.send({ settings, options: OPTIONS });
});
cwRouter.put('/settings', requireAccount, async (req, res, next) => {
  try {
    const settings = { ...withoutId(req.user), ...req.body };
    const error = validateSettings(settings);
    if (error) return next(fail('InvalidCwSettingsError', error));
    const profile = await updateProfileSettings(req.user.id, settings);
    return res.send({ settings: withoutId(profile) });
  } catch (error) { return next(error); }
});
cwRouter.get('/practice', async (req, res, next) => {
  try {
    const names = ['lesson', 'charWpm', 'effWpm', 'minutes', 'groupLength'];
    const unexpected = Object.keys(req.query).some((key) => !names.includes(key));
    const invalid = names.some((key) => {
      const value = req.query[key];
      return typeof value !== 'string' || !/^\d+$/.test(value);
    });
    if (unexpected || invalid) {
      return next(fail('InvalidCwSettingsError', 'Invalid practice settings'));
    }
    const settings = { ...DEFAULT_SETTINGS, ...Object.fromEntries(names.map((key) => [key, Number(req.query[key])])) };
    const error = validateSettings(settings);
    if (error) return next(fail('InvalidCwSettingsError', error));
    const baseline = baselineWeights(settings.lesson);
    const weights = req.user
      ? practiceWeights(settings.lesson, await getRecentLetterCounts(req.user.id)).weights
      : baseline;
    return res.send({
      text: generatePractice({ ...settings, weights }),
      chars: lessonChars(settings.lesson),
      weights,
      baseline,
    });
  } catch (error) { return next(error); }
});
function validPracticeText(sent, typed, chars) {
  if (typeof sent !== 'string' || !sent.length || sent.length > 1600) return false;
  if (typeof typed !== 'string') return false;

  const limit = sent.length + 100;
  if (typed.length > limit || normalizeCopy(typed).length > limit) return false;

  return sent.split(' ').every(
    (group) => group.length > 0 && [...group].every((char) => chars.includes(char))
  );
}

cwRouter.post('/results', async (req, res, next) => {
  try {
    const { sent, typed, complete, ...provided } = req.body;
    if (typeof complete !== 'boolean') {
      return next(fail('InvalidCwInputError', 'Complete must be a boolean'));
    }
    const names = ['lesson', 'charWpm', 'effWpm', 'toneHz', 'groupLength'];
    if (Object.keys(provided).some((key) => !names.includes(key))) return next(fail('InvalidCwInputError', 'Invalid settings field'));
    const settings = { ...provided, minutes: DEFAULT_SETTINGS.minutes };
    const error = validateSettings(settings);
    if (error) return next(fail('InvalidCwInputError', error));
    if (!validPracticeText(sent, typed, lessonChars(settings.lesson))) {
      return next(fail('InvalidCwInputError', 'Invalid practice text'));
    }
    const result = checkCopy(sent, typed);
    if (!req.user || !complete) return res.send({ result, saved: false });
    const session = await createSession(req.user.id, { ...settings, sent, typed, accuracy: result.accuracy, letterCounts: result.letterCounts });
    return res.send({ result, saved: true, session });
  } catch (error) { return next(error); }
});
module.exports = cwRouter;
