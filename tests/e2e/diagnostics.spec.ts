import { test, expect } from './fixtures';

test('the footer opens diagnostics and shows the live snapshot', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Diagnostics' }).click();
  await expect(page).toHaveURL('/diagnostics');
  await expect(page.getByRole('heading', { name: 'Diagnostics', exact: true })).toBeVisible();

  const status = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Status' }) });
  for (const name of ['auth', 'fitness', 'juicebox', 'scents']) {
    await expect(status.locator(`dt:text-is("${name}") + dd`)).toHaveText(/^ok · \d+ ms$/);
  }
  await expect(page.getByRole('heading', { name: 'Your connection' })).toBeVisible();
  await expect(page.locator('dt:text-is("IP") + dd')).toHaveText(/^(127\.0\.0\.1|::1)$/);
  const serverCommit = page.locator('dt:text-is("Server commit") + dd a');
  const frontendCommit = page.locator('dt:text-is("Frontend commit") + dd a');
  await expect(serverCommit).toHaveText(/^[0-9a-f]{7,}$/);
  await expect(frontendCommit).toHaveText(await serverCommit.innerText());
  await expect(page.getByText('Frontend and server are on different commits')).toHaveCount(0);
});

test('Refresh requests a new snapshot', async ({ page }) => {
  await page.goto('/diagnostics');
  await expect(page.getByRole('status')).toContainText('Fetched');
  const request = page.waitForRequest('**/api/diagnostics');

  await page.getByRole('button', { name: 'Refresh' }).click();

  await request;
  await expect(page.getByRole('status')).toContainText('Fetched');
});

test('a failed request leaves browser and frontend details visible', async ({ page, allowErrors }) => {
  allowErrors(/500/);
  await page.route('**/api/diagnostics', (route) => route.fulfill({ status: 500 }));
  await page.goto('/diagnostics');

  await expect(page.getByRole('alert')).toHaveText("Couldn't reach the server: Server answered 500");
  await expect(page.getByText('Time zone', { exact: true })).toBeVisible();
  await expect(page.getByText('Frontend commit', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Memory' })).toHaveCount(0);
});
