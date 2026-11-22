import { test, expect } from './fixtures';

async function logIn(page: import('@playwright/test').Page) {
  await page.getByLabel('Username').fill('albert');
  await page.getByLabel('Password').fill('bertie99');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
}

test('site login survives reload and logs out', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveTitle('Log in - Matthew Pelnik');
  await logIn(page);
  await expect(page).toHaveURL('/');
  await expect(page.locator('#right-navbar')).toContainText('albert');
  await page.reload();
  await expect(page.locator('#right-navbar')).toContainText('albert');
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible();
});

test('wrong password shows an inline error', async ({ page, allowErrors }) => {
  allowErrors(/HTTP 400: .*\/api\/auth\/login$/, /status of 400 \(Bad Request\)/);
  await page.goto('/login');
  await page.getByLabel('Username').fill('albert');
  await page.getByLabel('Password').fill('wrongpassword');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Username or password is incorrect');
});

test('safe next path is honored', async ({ page }) => {
  await page.goto('/login?next=/about');
  await logIn(page);
  await expect(page).toHaveURL('/about');
});

test('protocol-relative next path goes home', async ({ page }) => {
  await page.goto('/login?next=//example.com');
  await logIn(page);
  await expect(page).toHaveURL('/');
});

test('registration signs in the new account', async ({ page }) => {
  const username = `reg-${Date.now()}`;
  await page.goto('/login');
  await page.getByRole('button', { name: 'Need an account? Create one' }).click();
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(page.locator('#right-navbar')).toContainText(username);
});
