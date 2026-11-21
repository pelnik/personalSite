import { test, expect } from './fixtures';

// The demo apps load as separate chunks. After a deploy, a tab still running
// the previous version asks for chunk files that no longer exist, and Express
// answers with index.html. The app should reload itself onto the new version
// instead of showing a blank page.
test('recovers when a page chunk is missing after a deploy', async ({ page, allowErrors }) => {
  allowErrors(/Failed to fetch dynamically imported module|MIME type|Failed to load module script/);

  // Until the page reloads, every request for the chunk gets what Express
  // sends today for a file that isn't in build/: index.html. (Vite requests
  // each chunk twice, once to preload it and once to import it.)
  let pageLoads = 0;
  let staleResponses = 0;
  page.on('load', () => pageLoads++);
  await page.route(/\/assets\/JuiceboxMain-[^/]+\.js$/, (route) => {
    if (pageLoads > 1) return route.continue();
    staleResponses++;
    return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html>' });
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Web Projects' })).toBeVisible();

  const reload = page.waitForEvent('load');
  await page.locator('a.project-link-container[href="/juicebox"]').click();
  await reload;

  await expect(page).toHaveURL('/juicebox');
  await expect(page.getByRole('heading', { name: 'JuiceBox' })).toBeVisible();
  expect(staleResponses).toBeGreaterThan(0);
  expect(pageLoads).toBe(2);
});
