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
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.getByLabel('Type what you hear')).toBeFocused();
  const elapsed = page.getByText(/^Elapsed:/);
  await expect(elapsed).toHaveText(/^Elapsed: 0:0[1-9] of \d+:\d{2} \(\d+%\)$/);
  await expect(page.getByText(/^Group \d+ of/)).toHaveCount(0);
  await page.getByRole('button', { name: 'Stop' }).click();
  await page.getByLabel('Type what you hear').fill('KM');
  await page.getByRole('combobox', { name: /^Lesson/ }).selectOption('2');
  const [request] = await Promise.all([
    page.waitForRequest((r) => r.url().endsWith('/api/cw/results') && r.method() === 'POST'),
    page.getByRole('button', { name: 'Check' }).click(),
  ]);
  expect(request.postDataJSON()).toMatchObject({ lesson: 1, complete: false });
  await expect(page.getByRole('heading', { name: /accuracy/ })).toBeVisible();
  await expect(page.getByText('Log in to save your progress')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your stats' })).toHaveCount(0);
});

test('logged-in CW settings persist and partial practices are not saved', async ({ page }) => {
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
  // Leave a word gap after the first K so Stop has more time to land.
  await usePracticeText(page, 'K KK');
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.getByText(/^Elapsed:/)).toHaveText(/^Elapsed: 0:0[1-9] of/);
  await page.getByRole('button', { name: 'Stop' }).click();
  await page.getByLabel('Type what you hear').fill('K');
  const [partial] = await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/cw/results') && r.request().method() === 'POST'),
    page.getByRole('button', { name: 'Check' }).click(),
  ]);
  expect(await partial.json()).toMatchObject({ saved: false });
  await expect(page.getByRole('heading', { name: /100% accuracy/ })).toBeVisible();
  await expect(page.getByText("You stopped early, so this practice wasn't saved.")).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next lesson' })).toHaveCount(0);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page.getByText('Signed in as albert')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Log in', exact: true }).first()).toBeVisible();
  await expect(page.getByLabel('Tone')).toHaveValue('700');
  await expect(page).toHaveURL('/cw');
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
