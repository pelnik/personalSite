import { test, expect } from './fixtures';

const PROJECT_LINKS = [
  '/cw',
  '/portfolio/ZooClicker/index.html',
  '/fitness',
  '/scents',
  '/snake',
  '/juicebox',
  '/stranger',
  '/api/fitness/docs',
  '/api/juicebox/docs',
  '/portfolio/DeucesWild/index.html',
];

test.describe('main site', () => {
  for (const path of ['/', '/portfolio']) {
    test(`${path} shows the intro and the project list`, async ({ page }) => {
      await page.goto(path);

      await expect(page).toHaveTitle(/^Homepage - Matthew Pelnik/);
      await expect(page.getByRole('link', { name: 'Matthew Pelnik' })).toBeVisible();
      await expect(page.locator('img.personal-pic')).toBeVisible();
      await expect(page.locator('.about-text')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Web Projects' })).toBeVisible();

      const hrefs = await page
        .locator('#project-container a[href^="/"]')
        .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
      expect(hrefs[0]).toBe('/cw');
      expect(new Set(hrefs)).toEqual(new Set(PROJECT_LINKS));

      // Every image, including the project screenshots, actually loaded.
      const images = page.locator('img');
      expect(await images.count()).toBeGreaterThan(10);
      for (const image of await images.all()) {
        await image.scrollIntoViewIfNeeded();
        await expect
          .poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth))
          .toBeGreaterThan(0);
      }
    });
  }

  test('/about shows the photo and the links', async ({ page }) => {
    await page.goto('/about');

    await expect(page).toHaveTitle(/^About - Matthew Pelnik/);
    await expect(page.locator('img.about-page-pic')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Links' })).toBeVisible();
    await expect(page.locator('.about-link-card').first()).toBeVisible();
  });

  test('the header About button opens /about', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'About', exact: true }).click();

    await expect(page).toHaveURL('/about');
    await expect(page.getByRole('heading', { name: 'Links' })).toBeVisible();
  });

  test('Stats opens an overlay at /about/stats, and the X closes it', async ({ page }) => {
    await page.goto('/about');

    await page.getByRole('link', { name: 'Stats' }).click();
    await expect(page).toHaveURL('/about/stats');
    await expect(page).toHaveTitle(/^Stats - Matthew Pelnik/);
    await expect(page.getByRole('dialog', { name: 'Stats' })).toBeVisible();

    await page.getByRole('link', { name: 'Close stats' }).click();
    await expect(page).toHaveURL('/about');
    await expect(page).toHaveTitle(/^About - Matthew Pelnik/);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('/about/stats loads directly over the About page, and Escape closes it', async ({ page }) => {
    await page.goto('/about/stats');

    await expect(page).toHaveTitle(/^Stats - Matthew Pelnik/);
    await expect(page.getByRole('dialog', { name: 'Stats' })).toBeVisible();
    await expect(page.locator('img.about-page-pic')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page).toHaveURL('/about');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('an unknown path shows the 404 page', async ({ page }) => {
    await page.goto('/this/page/does-not-exist');

    await expect(page).toHaveTitle(/^Oh no 404!/);
    await expect(page.getByRole('heading', { name: 'Page Not Found' })).toBeVisible();

    await page.getByRole('link', { name: 'here' }).first().click();
    await expect(page).toHaveURL('/');
  });

  test('the header name links home', async ({ page }) => {
    await page.goto('/about');
    await page.goto('/this-is-not-a-page');

    await page.getByRole('link', { name: 'Matthew Pelnik' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Web Projects' })).toBeVisible();
  });

  test('API docs pages render', async ({ page }) => {
    await page.goto('/api/fitness/docs');
    await expect(page).toHaveTitle(/^Fitness Tracker API Documentation/);
    await expect(
      page.getByRole('heading', { name: 'Fitness Tracker API Documentation' })
    ).toBeVisible();

    await page.goto('/api/juicebox/docs');
    await expect(page).toHaveTitle(/^JuiceBox API Documentation/);
    await expect(page.getByRole('heading', { name: 'Juicebox API Documentation' })).toBeVisible();
  });

  test('the Snake game starts and draws the board', async ({ page }) => {
    await page.goto('/snake');

    await expect(page).toHaveTitle(/^Classic Snake Game/);
    await expect(page.getByRole('heading', { name: 'Classic Snake' })).toBeVisible();
    await expect(page.locator('#game-content > *').first()).toBeAttached();

    await page.getByRole('button', { name: 'Start' }).click();
    await expect(page.locator('#points')).toHaveText(/^Points: \d+$/);
  });

  test('the Snake home button goes back to the portfolio', async ({ page }) => {
    await page.goto('/snake');

    await page.getByAltText('home icon').click();

    await expect(page).toHaveURL('/portfolio');
  });
});

test.describe('legacy static pages', () => {
  for (const path of [
    '/portfolio/ZooClicker/index.html',
    '/portfolio/DeucesWild/index.html',
    '/portfolio/qwirty/index.html',
  ]) {
    test(`${path} loads with all of its assets`, async ({ page }) => {
      const response = await page.goto(path);

      expect(response?.status()).toBe(200);
      await expect(page.locator('body')).not.toBeEmpty();
      await page.waitForLoadState('networkidle');
    });
  }
});
