const express = require('express');
const { authenticate, requireAccount } = require('../../auth');
const { ensureProfile, updateProfileSettings, createSession } = require('../db');
const { DEFAULT_SETTINGS, OPTIONS, validateSettings } = require('../lib/settings');
const { lessonChars } = require('../lib/koch');
const { baselineWeights } = require('../lib/baseline');
const { generatePractice } = require('../lib/generate');
const { checkCopy } = require('../lib/check');

const cwRouter = express.Router();
cwRouter.use(authenticate(ensureProfile));
const fail = (name, message) => ({ name, message });
const withoutId = (profile) => Object.fromEntries(Object.entries(profile).filter(([key]) => key !== 'id'));

cwRouter.get('/settings', (req, res) => res.send({ settings: req.user ? withoutId(req.user) : DEFAULT_SETTINGS, options: OPTIONS }));
cwRouter.put('/settings', requireAccount, async (req, res, next) => {
  try {
    const settings = { ...withoutId(req.user), ...req.body };
    const error = validateSettings(settings);
    if (error) return next(fail('InvalidCwSettingsError', error));
    const profile = await updateProfileSettings(req.user.id, settings);
    return res.send({ settings: withoutId(profile) });
  } catch (error) { return next(error); }
});
cwRouter.get('/practice', (req, res, next) => {
  try {
    const names = ['lesson', 'charWpm', 'effWpm', 'minutes', 'groupLength'];
    if (Object.keys(req.query).some((key) => !names.includes(key)) || names.some((key) => !/^\d+$/.test(req.query[key] || '')))
      return next(fail('InvalidCwSettingsError', 'Invalid practice settings'));
    const settings = { ...DEFAULT_SETTINGS, ...Object.fromEntries(names.map((key) => [key, Number(req.query[key])])) };
    const error = validateSettings(settings);
    if (error) return next(fail('InvalidCwSettingsError', error));
    const baseline = baselineWeights(settings.lesson);
    return res.send({ text: generatePractice({ ...settings, weights: baseline }), chars: lessonChars(settings.lesson), weights: baseline, baseline });
  } catch (error) { return next(error); }
});
cwRouter.post('/results', async (req, res, next) => {
  try {
    const { sent, typed, ...provided } = req.body;
    const names = ['lesson', 'charWpm', 'effWpm', 'toneHz', 'groupLength'];
    if (Object.keys(provided).some((key) => !names.includes(key))) return next(fail('InvalidCwInputError', 'Invalid settings field'));
    const settings = { ...DEFAULT_SETTINGS, ...provided };
    const error = validateSettings(settings);
    if (error) return next(fail('InvalidCwInputError', error));
    const chars = lessonChars(settings.lesson);
    if (typeof sent !== 'string' || !sent.length || sent.length > 1600 || !sent.split(' ').every((group) => group.length && [...group].every((char) => chars.includes(char))) ||
        typeof typed !== 'string' || typed.length > sent.length + 100)
      return next(fail('InvalidCwInputError', 'Invalid practice text'));
    const result = checkCopy(sent, typed);
    if (!req.user) return res.send({ result, saved: false });
    const session = await createSession(req.user.id, { ...settings, sent, typed, accuracy: result.accuracy, letterCounts: result.letterCounts });
    return res.send({ result, saved: true, session });
  } catch (error) { return next(error); }
});
module.exports = cwRouter;
