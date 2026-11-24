import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';

declare global {
  interface Window {
    __oscillators: number;
  }
}

async function usePracticeText(page: Page, text: string) {
  await page.route('**/api/cw/practice?*', async (route) => {
    const response = await route.fetch();
    const practice = await response.json();
    await route.fulfill({ response, json: { ...practice, text } });
  });
}

test('logged-out CW practice shows results without stats', async ({ page }) => {
  await page.goto('/cw');
  await expect(page).toHaveTitle('CW Trainer - Matthew Pelnik');
  await expect(page.getByRole('combobox', { name: /^Lesson/ })).toHaveValue('1');
  await expect(page.getByLabel('Character speed')).toHaveValue('20');
  await expect(page.getByLabel('Effective speed')).toHaveValue('15');
  await expect(page.getByLabel('Tone')).toHaveValue('700');
  await expect(page.getByLabel('Duration')).toHaveValue('1');
  await expect(page.getByLabel('Group length')).toHaveValue('5');
  await expect(page.getByRole('button', { name: 'Stop' })).toHaveCount(0);
  await usePracticeText(page, 'KM');
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.getByLabel('Type what you hear')).toBeFocused();
  await page.getByLabel('Type what you hear').fill('KM');
  await page.getByRole('combobox', { name: /^Lesson/ }).selectOption('2');
  const [request] = await Promise.all([
    page.waitForRequest((r) => r.url().endsWith('/api/cw/results') && r.method() === 'POST'),
    page.getByRole('button', { name: 'Check' }).click(),
  ]);
  expect(request.postDataJSON()).toMatchObject({ lesson: 1, sent: 'KM', complete: true });
  await expect(page.getByRole('heading', { name: /accuracy/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Stop' })).toHaveCount(0);
  await expect(page.getByText('Log in to save your progress')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your stats' })).toHaveCount(0);
});

test('logged-in CW settings persist and Stop discards the practice', async ({ page }) => {
  await page.goto('/cw');
  await page.locator('.cw-heading').getByRole('link', { name: 'Log in', exact: true }).click();
  await page.getByLabel('Username').fill('albert');
  await page.getByLabel('Password').fill('bertie99');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL('/cw');
  await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();
  await expect(page.getByText('Signed in as albert')).toBeVisible();
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/cw/settings') && r.request().method() === 'PUT' && r.ok()),
    page.getByLabel('Tone').selectOption('650'),
  ]);
  await page.reload();
  await expect(page.getByLabel('Tone')).toHaveValue('650');
  await page.getByRole('combobox', { name: /^Character speed/ }).selectOption('5');
  // Leave a word gap after the first K so Stop has time to land during playback.
  await usePracticeText(page, 'K KK');
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.getByText(/^Elapsed:/)).toHaveText(/^Elapsed: 0:0[1-9] of/);
  await page.getByLabel('Type what you hear').fill('K');
  await discardPractice(page);
  for (const select of await page.getByRole('combobox').all()) {
    await expect(select).toBeEnabled();
  }
  await expect(page.getByText('No sessions yet. Finish a practice to see your stats.')).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page.getByText('Signed in as albert')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Log in', exact: true }).first()).toBeVisible();
  await expect(page.getByLabel('Tone')).toHaveValue('700');
  await expect(page).toHaveURL('/cw');
});

async function discardPractice(page: Page) {
  page.on('request', (request) => {
    expect(request.method() === 'POST' && request.url().endsWith('/api/cw/results'),
      'discarding a practice must not post results').toBe(false);
  });
  await page.getByRole('button', { name: 'Stop' }).click();
  await expect(page.getByLabel('Type what you hear')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Start' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Check', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Stop' })).toHaveCount(0);
  await expect(page.getByText(/^Elapsed:/)).toHaveCount(0);
}

test('Stop discards a finished but unchecked practice', async ({ page }) => {
  await page.goto('/cw');
  await usePracticeText(page, 'K');
  await page.getByRole('button', { name: 'Start' }).click();
  const copy = page.getByLabel('Type what you hear');
  const check = page.getByRole('button', { name: 'Check', exact: true });
  await expect(check).toBeEnabled();
  await copy.fill('K');
  await discardPractice(page);

  await page.getByRole('button', { name: 'Start' }).click();
  await expect(copy).toHaveValue('');
  await expect(check).toBeEnabled();
});

test('keyboard checks a complete passing practice and advances to the next lesson', async ({ page }) => {
  await page.goto('/cw');
  await usePracticeText(page, 'KM');
  await page.getByRole('button', { name: 'Start' }).click();
  const copy = page.getByLabel('Type what you hear');
  await copy.fill('KM');
  await expect(page.getByRole('button', { name: 'Check', exact: true })).toBeEnabled();

  const [request] = await Promise.all([
    page.waitForRequest((r) => r.url().endsWith('/api/cw/results') && r.method() === 'POST'),
    copy.press('Control+Enter'),
  ]);
  expect(request.postDataJSON()).toMatchObject({ sent: 'KM', complete: true });
  await page.getByRole('button', { name: 'Next lesson' }).click();
  await expect(page.getByRole('combobox', { name: /^Lesson/ })).toHaveValue('2');
  await expect(page.getByRole('heading', { name: /accuracy/ })).toHaveCount(0);
  await expect(copy).toHaveCount(0);
});

test('a complete signed-in practice appears in stats and letter history', async ({ page }) => {
  await page.goto('/login?next=/cw');
  await page.getByLabel('Username').fill('albert');
  await page.getByLabel('Password').fill('bertie99');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL('/cw');
  await expect(page.getByText('Practice adapts to the letters you miss')).toBeVisible();
  await expect(page.getByRole('heading', { name: "Matt's practice" })).toHaveCount(0);
  await expect(page.getByText('No sessions yet. Finish a practice to see your stats.')).toBeVisible();

  await page.getByRole('combobox', { name: /^Character speed/ }).selectOption('20');
  await page.getByRole('combobox', { name: /^Effective speed/ }).selectOption('15');
  await usePracticeText(page, 'KM');
  await page.getByRole('button', { name: 'Start' }).click();
  await page.getByLabel('Type what you hear').fill('KM');
  await page.getByRole('button', { name: 'Check', exact: true }).click();

  const stats = page.getByRole('region', { name: 'Your stats' });
  await expect(stats.getByText('1 session', { exact: true })).toBeVisible();
  const accuracyChart = stats.getByRole('group', { name: 'Session accuracy' });
  await expect(accuracyChart.locator('.recharts-line-dot')).toHaveCount(1);
  await expect(accuracyChart.getByText('L1', { exact: true })).toBeVisible();
  await stats.getByRole('button', { name: 'K', exact: true }).click();
  await expect(stats.getByRole('group', { name: 'Error rate by day for K' })).toBeVisible();
  await page.getByRole('combobox', { name: /^Lesson/ }).selectOption('2');
  await expect(stats.getByRole('button', { name: 'U', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(stats).toHaveCount(0);
});

test('public showcase stays on Matt’s lesson while guests change their own', async ({ page }) => {
  await page.goto('/cw');
  const showcase = page.getByRole('region', { name: "Matt's practice" });
  await expect(showcase.getByText('6 sessions', { exact: true })).toBeVisible();
  const chart = showcase.getByRole('group', { name: 'Session accuracy' });
  await expect(chart.getByText('L1', { exact: true })).toBeVisible();
  await expect(chart.getByText('L2', { exact: true })).toBeVisible();
  const letters = showcase.getByRole('heading', { name: "Letters in Matt's current lesson (Lesson 2)" });
  await expect(letters).toBeVisible();
  await showcase.getByRole('button', { name: 'K', exact: true }).click();
  await expect(showcase.getByRole('group', { name: 'Error rate by day for K' })).toBeVisible();
  await page.getByRole('combobox', { name: /^Lesson/ }).selectOption('3');
  await expect(letters).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your stats' })).toHaveCount(0);
});

test('error-rate axes switch between 50% and 100%', async ({ page }) => {
  const createdAt = '2026-01-01T12:00:00.000Z';
  let errors = 5;
  await page.route('**/api/cw/showcase', (route) => route.fulfill({
    json: {
      showcase: {
        lesson: 1,
        sessions: [{ id: 1, createdAt, lesson: 1, accuracy: 90, charWpm: 20, effWpm: 15 }],
        lessonStarts: [{ lesson: 1, sessionId: 1 }],
        letters: [
          { char: 'K', attempts: 10, errors, errorRate: errors / 10, multiplier: 1, share: 0.5, baselineShare: 0.5 },
          { char: 'M', attempts: 10, errors: 0, errorRate: 0, multiplier: 1, share: 0.5, baselineShare: 0.5 },
        ],
      },
    },
  }));
  await page.route('**/api/cw/showcase/letter?*', (route) => route.fulfill({
    json: { char: 'K', points: [{ createdAt, sent: 10, errors }] },
  }));

  const ticks = (name: string) => page.getByRole('group', { name })
    .locator('.recharts-yAxis-tick-labels .recharts-cartesian-axis-tick-value');
  const letterTicks = ticks('Error rate by letter');
  const dayTicks = ticks('Error rate by day for K');

  await page.goto('/cw');
  const lowTicks = ['0%', '10%', '20%', '30%', '40%', '50%'];
  await expect(letterTicks).toHaveText(lowTicks);
  await page.getByRole('button', { name: 'K', exact: true }).click();
  await expect(dayTicks).toHaveText(lowTicks);

  errors = 6;
  await page.reload();
  const highTicks = ['0%', '25%', '50%', '75%', '100%'];
  await expect(letterTicks).toHaveText(highTicks);
  await page.getByRole('button', { name: 'K', exact: true }).click();
  await expect(dayTicks).toHaveText(highTicks);
  await expect(ticks('Session accuracy')).toHaveText(highTicks);
});

test('CW mode follows the URL and shares the settings bar', async ({ page }) => {
  await page.goto('/cw');
  const testMode = page.getByRole('button', { name: 'Test', exact: true });
  const feedbackMode = page.getByRole('button', { name: 'Feedback', exact: true });
  await expect(testMode).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel('Duration')).toBeVisible();

  await feedbackMode.click();
  await expect(page).toHaveURL('/cw?mode=feedback');
  await expect(feedbackMode).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel('Duration')).toHaveCount(0);
  await expect(page.getByText(/^Each group plays, then waits/)).toBeVisible();
  await page.reload();
  await expect(feedbackMode).toHaveAttribute('aria-pressed', 'true');

  await testMode.click();
  await expect(page).toHaveURL('/cw');
  await expect(page.getByLabel('Duration')).toBeVisible();
});

test('Feedback scores each answer, adapts the next group, and does not post results', async ({ page }) => {
  await page.addInitScript(() => {
    window.__oscillators = 0;
    const createOscillator = AudioContext.prototype.createOscillator;
    AudioContext.prototype.createOscillator = function (this: AudioContext) {
      window.__oscillators++;
      return createOscillator.call(this);
    };
  });
  const oscillatorCount = () => page.evaluate(() => window.__oscillators);
  let groups = 0;
  let results = 0;
  page.on('request', (request) => {
    if (request.url().endsWith('/api/cw/results')) results++;
  });
  await page.route('**/api/cw/feedback/group', async (route) => {
    const group = ++groups === 1 ? 'KM' : 'MK';
    const response = await route.fetch();
    await route.fulfill({ response, json: { ...await response.json(), group } });
  });

  await page.goto('/cw?mode=feedback');
  await page.getByRole('button', { name: 'Start' }).click();
  const input = page.getByLabel('Type what you hear');
  await expect(input).toBeFocused();
  await expect(page.getByRole('button', { name: 'Test', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Feedback', exact: true })).toBeDisabled();
  const waiting = page.getByRole('img', { name: 'Waiting', exact: true });
  await expect(waiting).toHaveCount(2);
  const initialOscillators = await oscillatorCount();

  await input.press('!');
  await input.press('Backspace');
  await expect(waiting).toHaveCount(2);
  await expect(page.getByText('Right: 0 of 0', { exact: true })).toBeVisible();
  await input.press('k');
  await expect(page.getByRole('img', { name: 'K', exact: true })).toHaveClass(/cw-fb-right/);
  const nextRequest = page.waitForRequest((request) => request.url().endsWith('/api/cw/feedback/group'));
  await input.press('k');
  const wrong = page.getByRole('img', { name: 'M typed as K', exact: true });
  await expect(wrong.locator('.cw-fb-correct')).toHaveText('M');
  expect(await oscillatorCount()).toBe(initialOscillators + 1);
  const request = await nextRequest;
  expect(request.postDataJSON()).toEqual({ lesson: 1, groupLength: 5, recent: [{ K: [1, 0], M: [1, 1] }] });
  expect(await request.headerValue('authorization')).toBeNull();

  await expect(waiting).toHaveCount(2);
  await input.press('m');
  await input.press('Space');
  await expect(page.getByRole('img', { name: 'K missed', exact: true }).locator('.cw-fb-correct')).toHaveText('K');
  expect(await oscillatorCount()).toBe(initialOscillators + 1);
  await expect(page.getByText('Right: 2 of 4 (50%)', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Stop' }).click();
  const summary = page.getByRole('region', { name: 'Run summary' });
  await expect(summary.getByText('2 of 4 right (50%)')).toBeVisible();
  for (const char of ['K', 'M']) {
    const row = summary.getByRole('row').filter({ has: page.getByRole('rowheader', { name: char, exact: true }) });
    await expect(row.getByRole('cell').first()).toHaveText('2');
    await expect(row.getByRole('cell').nth(1)).toHaveText('1');
  }
  const [restart] = await Promise.all([
    page.waitForRequest((request) => request.url().endsWith('/api/cw/feedback/group')),
    page.getByRole('button', { name: 'Start' }).click(),
  ]);
  expect(restart.postDataJSON()).toEqual({ lesson: 1, groupLength: 5, recent: [] });
  await expect(page.getByText('Right: 0 of 0', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Stop' }).click();
  await expect(summary.getByText('No letters answered.')).toBeVisible();
  expect(results).toBe(0);
});

test('signed-in Feedback settings are shared with Test after reload', async ({ page }) => {
  await page.goto('/login?next=%2Fcw%3Fmode%3Dfeedback');
  await page.getByLabel('Username').fill('albert');
  await page.getByLabel('Password').fill('bertie99');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL('/cw?mode=feedback');
  await expect(page.getByText('Signed in as albert')).toBeVisible();
  await Promise.all([
    page.waitForResponse((response) => response.url().endsWith('/api/cw/settings') && response.request().method() === 'PUT' && response.ok()),
    page.getByLabel('Group length').selectOption('3'),
  ]);
  await page.reload();
  await expect(page.getByLabel('Group length')).toHaveValue('3');
  const [feedback] = await Promise.all([
    page.waitForRequest((request) => request.url().endsWith('/api/cw/feedback/group')),
    page.getByRole('button', { name: 'Start' }).click(),
  ]);
  expect(await feedback.headerValue('authorization')).toBeNull();
  expect(feedback.postDataJSON()).toMatchObject({ groupLength: 3 });
  await page.getByRole('button', { name: 'Stop' }).click();
  await page.getByRole('button', { name: 'Test', exact: true }).click();
  await expect(page.getByLabel('Group length')).toHaveValue('3');
});

test('Feedback wraps seven-letter groups on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/cw?mode=feedback');
  await page.getByLabel('Character speed').selectOption('50');
  await page.getByLabel('Effective speed').selectOption('50');
  await page.getByLabel('Group length').selectOption('7');
  await page.getByRole('button', { name: 'Start' }).click();

  const waiting = page.getByRole('img', { name: 'Waiting', exact: true });
  await expect(waiting).toHaveCount(7);
  await page.getByLabel('Type what you hear').fill('       ');
  const groups = page.locator('.cw-fb-group');
  await expect(groups).toHaveCount(2);
  const board = page.locator('.cw-fb-board');
  expect(await board.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  const [first, second] = await groups.evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().top));
  expect(second).toBeGreaterThan(first);
  await page.getByRole('button', { name: 'Stop' }).click();
});

test('Feedback clears a full board and keeps the run score and weighting history', async ({ page }) => {
  await page.route('**/api/cw/feedback/group', async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, json: { ...await response.json(), group: 'KM' } });
  });

  await page.goto('/cw?mode=feedback');
  await page.getByLabel('Character speed').selectOption('50');
  await page.getByLabel('Effective speed').selectOption('50');
  await page.getByLabel('Group length').selectOption('2');
  await page.getByRole('button', { name: 'Start' }).click();

  const input = page.getByLabel('Type what you hear');
  const waiting = page.getByRole('img', { name: 'Waiting', exact: true });
  const groups = page.locator('.cw-fb-group');
  for (let count = 1; count <= 12; count++) {
    await expect(groups).toHaveCount(count);
    await expect(waiting).toHaveCount(2);
    if (count < 12) await input.fill(count === 1 ? 'K ' : 'KM');
  }

  const [request] = await Promise.all([
    page.waitForRequest('**/api/cw/feedback/group'),
    input.fill('KM'),
  ]);
  expect(request.postDataJSON().recent).toEqual([
    ...Array.from({ length: 11 }, () => ({ K: [1, 0], M: [1, 0] })),
    { K: [1, 0], M: [1, 1] },
  ]);
  await expect(groups).toHaveCount(1);
  await expect(waiting).toHaveCount(2);
  await expect(input).toBeFocused();
  await expect(page.getByText('Right: 23 of 24 (96%)', { exact: true })).toBeVisible();
  await input.fill('KM');
  await page.getByRole('button', { name: 'Stop' }).click();
  await expect(page.getByRole('region', { name: 'Run summary' }).getByText('25 of 26 right (96%)')).toBeVisible();
});
