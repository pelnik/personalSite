import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';

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
