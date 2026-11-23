import { test, expect } from './fixtures';

test.describe('Juicebox demo', () => {
  test('returns to the new post form after login', async ({ page }) => {
    await page.goto('/juicebox/post');
    await page.getByRole('button', { name: 'Please Log In' }).click();
    await expect(page).toHaveURL('/login?next=%2Fjuicebox%2Fpost');

    await page.getByLabel('Username').fill('albert');
    await page.getByLabel('Password').fill('bertie99');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();

    await expect(page).toHaveURL('/juicebox/post');
    await expect(page.getByRole('heading', { name: 'Create New Post' })).toBeVisible();
  });

  test('shows the seeded posts', async ({ page }) => {
    await page.goto('/juicebox');

    await expect(page.getByRole('heading', { name: 'JuiceBox' })).toBeVisible();
    for (const title of ['First Post', 'Second Post', 'Third Post']) {
      await expect(page.getByRole('heading', { name: title })).toBeVisible();
    }
  });

  test('logs in, creates a post, then deletes it', async ({ page }) => {
    const title = `E2E post ${Date.now()}`;

    await page.goto('/juicebox/login');
    await expect(page).toHaveURL('/login?next=/juicebox');
    await page.getByLabel('Username').fill('albert');
    await page.getByLabel('Password').fill('bertie99');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();

    await expect(page).toHaveURL('/juicebox');
    await page.getByText('New Post').click();
    await expect(page.getByRole('heading', { name: 'Create New Post' })).toBeVisible();

    await page.getByLabel('Title').fill(title);
    await page.getByLabel('Content').fill('Written by the end-to-end tests.');
    await page.getByRole('button', { name: 'Post' }).click();

    const post = page.locator('.post-list > *').filter({
      has: page.getByRole('heading', { name: title }),
    });
    await expect(post).toBeVisible();

    // Clean up so the post doesn't appear in screenshots.
    await post.getByLabel('Delete').click();
    await expect(page.getByRole('heading', { name: title })).toHaveCount(0);

    await page.getByLabel('Log Out').click();
    await expect(page.getByLabel('Log In')).toBeVisible();
  });
});

test.describe('Fitness Tracker demo', () => {
  for (const path of ['/fitness', '/fitness/routines']) {
    test(`${path} shows the public routines`, async ({ page }) => {
      await page.goto(path);

      await expect(page).toHaveTitle(/^FitnessTrackr/);
      await expect(page.getByRole('heading', { name: 'Routines', level: 1 })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Name: Chest Day' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Name: Cardio Day' })).toBeVisible();
      // Private routines stay hidden.
      await expect(page.getByRole('heading', { name: 'Name: Leg Day' })).toHaveCount(0);
    });
  }

  // KNOWN BUG: the nav links are relative, so from /fitness/routines the
  // Activities tab points at /fitness/routines/activities.
  test('KNOWN BUG: nav links are relative to the current path', async ({ page }) => {
    await page.goto('/fitness/routines');

    await expect(page.getByRole('link', { name: 'Activities' })).toHaveAttribute(
      'href',
      '/fitness/routines/activities'
    );
  });

  test('lists activities', async ({ page }) => {
    await page.goto('/fitness');
    await page.getByRole('link', { name: 'Activities' }).click();

    await expect(page).toHaveURL('/fitness/activities');
    await expect(page.getByText('bench press').first()).toBeVisible();
  });

  // The login page sends you back where you came from (navigate(-1)), so this
  // starts on another page, the way a visitor would.
  test('logs in from the navbar and shows My Routines', async ({ page }) => {
    await page.goto('/fitness');
    await page.getByLabel('Log In').click();
    await expect(page).toHaveURL('/fitness/users/login');

    await page.locator('input[name="username"]').fill('albert');
    await page.locator('input[name="password"]').fill('bertie99');
    await page.getByRole('button', { name: 'Submit' }).click();

    // KNOWN BUG: after login the page both navigates to My Routines and
    // navigates back (navigate(-1)), so where you land depends on timing.
    // Only check that the login took effect.
    await expect(page.getByLabel('Log Out')).toBeVisible();

    // The Routines tab is an absolute link; go there first so the relative
    // My Routines link resolves correctly (see the nav link bug above).
    await page.getByRole('link', { name: 'Routines', exact: true }).click();
    await expect(page).toHaveURL('/fitness/');
    await page.getByRole('link', { name: 'My Routines' }).click();
    await expect(page).toHaveURL('/fitness/my-routines');
    await expect(page.getByRole('heading', { name: 'My Routines', level: 1 })).toBeVisible();
    // Both of albert's routines, including the private Leg Day, and no one else's.
    await expect(page.getByRole('heading', { name: 'Name: Chest Day' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Name: Leg Day' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /^Creator: / })).toHaveText([
      'Creator: albert',
      'Creator: albert',
    ]);
  });

  // KNOWN BUG: the token is restored from localStorage after the first
  // render, and My Routines redirects logged-out visitors on that render, so
  // loading /fitness/my-routines directly always bounces to /fitness.
  test('KNOWN BUG: loading My Routines directly bounces to /fitness', async ({ page }) => {
    await page.goto('/fitness');
    await page.getByLabel('Log In').click();
    await page.locator('input[name="username"]').fill('albert');
    await page.locator('input[name="password"]').fill('bertie99');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByLabel('Log Out')).toBeVisible();

    await page.goto('/fitness/my-routines');

    await expect(page).toHaveURL('/fitness');
    await expect(page.getByLabel('Log Out')).toBeVisible();
  });

  test('rejects a wrong password', async ({ page, allowErrors }) => {
    allowErrors(/HTTP 400: .*\/api\/fitness\/users\/login$/, /status of 400 \(Bad Request\)/);
    await page.goto('/fitness');
    await page.getByLabel('Log In').click();

    await page.locator('input[name="username"]').fill('albert');
    await page.locator('input[name="password"]').fill('wrongpassword');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText('Wrong username and/or password')).toBeVisible();
  });
});

test.describe("Stranger's Things demo", () => {
  test('shows posts from the (mocked) external API', async ({ page }) => {
    await page.goto('/stranger');

    await expect(page.getByRole('heading', { name: "Stranger's Things" })).toBeVisible();
    await expect(page.getByText('Gently used canoe')).toBeVisible();
    await expect(page.getByText('Vintage record player')).toBeVisible();
  });
});
