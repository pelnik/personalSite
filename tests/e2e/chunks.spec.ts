import { test, expect } from './fixtures';

// The demo apps load as separate chunks. After a deploy, a tab still running
// the previous version asks for chunk files that no longer exist, and Express
// answers 404 (#36). The app should reload itself onto the new version
// instead of showing a blank page.
test('recovers when a page chunk is missing after a deploy', async ({ page, allowErrors }) => {
  // Errors from the old page's failed import, logged just before it reloads.
  // allowErrors(/./) would hide a broken page after the reload, so collect
  // what happens after the reload separately and require it to be clean.
  allowErrors(/./);
  const errorsAfterReload: string[] = [];

  // Until the page reloads, every request for the chunk gets what Express
  // sends for a file that isn't in build/: a 404. (Vite requests each chunk
  // twice, once to preload it and once to import it.)
  // Two cutoffs:
  // - Chunks stop failing once the reload's document is *requested*, which is
  //   before the new page asks for any chunk. (Client-side navigation makes
  //   no document request, so it doesn't count.)
  // - Errors count only once the new document has *loaded*, because the old
  //   page can still log its failed import while it's being torn down.
  let documents = 0;
  let loadedDocuments = 0;
  let staleResponses = 0;
  page.on('request', (request) => {
    if (request.resourceType() === 'document' && request.frame() === page.mainFrame()) {
      documents++;
    }
  });
  page.on('domcontentloaded', () => loadedDocuments++);
  page.on('console', (m) => loadedDocuments > 1 && m.type() === 'error' && errorsAfterReload.push(m.text()));
  page.on('pageerror', (e) => loadedDocuments > 1 && errorsAfterReload.push(e.message));
  page.on('requestfailed', (r) => loadedDocuments > 1 && errorsAfterReload.push(`failed: ${r.url()}`));
  page.on('response', (r) => loadedDocuments > 1 && r.status() >= 400 && errorsAfterReload.push(`HTTP ${r.status()}: ${r.url()}`));
  await page.route(/\/assets\/JuiceboxMain-[^/]+\.js$/, (route) => {
    if (documents > 1) return route.continue();
    staleResponses++;
    return route.fulfill({ status: 404, contentType: 'text/html', body: 'Not found' });
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Web Projects' })).toBeVisible();

  const reload = page.waitForEvent('load');
  await page.locator('a.project-link-container[href="/juicebox"]').click();
  await reload;

  await expect(page).toHaveURL('/juicebox');
  await expect(page.getByRole('heading', { name: 'JuiceBox' })).toBeVisible();
  expect(staleResponses).toBeGreaterThan(0);
  expect(documents).toBe(2);
  expect(errorsAfterReload).toEqual([]);
});
