import { test, expect } from './fixtures';

test('logged-out CW practice shows results without stats', async ({ page }) => {
  await page.goto('/cw');
  await expect(page).toHaveTitle('CW Trainer - Matthew Pelnik');
  await expect(page.getByLabel('Lesson')).toHaveValue('1');
  await expect(page.getByLabel('Character speed')).toHaveValue('20');
  await expect(page.getByLabel('Effective speed')).toHaveValue('15');
  await expect(page.getByLabel('Tone')).toHaveValue('700');
  await expect(page.getByLabel('Duration')).toHaveValue('1');
  await expect(page.getByLabel('Group length')).toHaveValue('5');
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.getByRole('status')).toContainText('Group 1 of');
  await page.getByRole('button', { name: 'Stop' }).click();
  await expect(page.getByLabel('Type what you hear')).toBeFocused();
  await page.getByLabel('Type what you hear').fill('KM');
  await page.getByLabel('Lesson').selectOption('2');
  const [request] = await Promise.all([
    page.waitForRequest((r) => r.url().endsWith('/api/cw/results') && r.method() === 'POST'),
    page.getByRole('button', { name: 'Check' }).click(),
  ]);
  expect(request.postDataJSON().lesson).toBe(1);
  await expect(page.getByRole('heading', { name: /accuracy/ })).toBeVisible();
  await expect(page.getByText('Log in to save your progress')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your stats' })).toHaveCount(0);
});

test('logged-in CW settings and result persist', async ({ page }) => {
  await page.goto('/login?next=/cw');
  await page.getByLabel('Username').fill('albert');
  await page.getByLabel('Password').fill('bertie99');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL('/cw');
  await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/cw/settings') && r.request().method() === 'PUT' && r.ok()),
    page.getByLabel('Tone').selectOption('650'),
  ]);
  await page.reload();
  await expect(page.getByLabel('Tone')).toHaveValue('650');
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.getByRole('status')).toContainText('Group 1 of');
  await page.getByRole('button', { name: 'Stop' }).click();
  await page.getByLabel('Type what you hear').fill('KM');
  await page.getByRole('button', { name: 'Check' }).click();
  await expect(page.getByRole('heading', { name: /accuracy/ })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});
