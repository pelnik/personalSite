import { test, expect } from './fixtures';
import type { Page, Locator } from '@playwright/test';

// Full-page screenshots of every page, compared against baselines taken from
// the CRA build. Local only: baselines are platform-specific (-darwin), and
// font rendering differs between operating systems.
//
// Create or refresh baselines (only when a visual change is intended):
//   npx playwright test --project=visual-desktop --project=visual-mobile --update-snapshots

type Shot = {
  name: string;
  path: string;
  heading?: string | RegExp;
  // Parts of the page that change on every load.
  mask?: (page: Page) => Locator[];
  // Pre-existing errors, by Playwright project name.
  knownErrors?: Record<string, RegExp[]>;
};

const SHOTS: Shot[] = [
  { name: 'home', path: '/', heading: 'Web Projects' },
  { name: 'about', path: '/about', heading: 'Links' },
  { name: 'about-stats', path: '/about/stats', heading: 'Stats' },
  { name: 'not-found', path: '/no-such-page', heading: 'Page Not Found' },
  {
    name: 'snake',
    path: '/snake',
    heading: 'Classic Snake',
    mask: (page) => [page.locator('#game-content')],
    // KNOWN BUG: at phone width snakeGame.js looks up a board square that
    // doesn't exist and throws.
    knownErrors: { 'visual-mobile': [/reading 'classList'/] },
  },
  { name: 'docs-fitness', path: '/api/fitness/docs', heading: 'Fitness Tracker API Documentation' },
  { name: 'docs-juicebox', path: '/api/juicebox/docs', heading: 'Juicebox API Documentation' },
  { name: 'juicebox', path: '/juicebox', heading: 'Third Post' },
  { name: 'juicebox-login', path: '/juicebox/login', heading: 'Login' },
  { name: 'fitness-routines', path: '/fitness', heading: 'Name: Chest Day' },
  { name: 'fitness-activities', path: '/fitness/activities' },
  { name: 'fitness-login', path: '/fitness/users/login', heading: 'Login' },
  { name: 'stranger', path: '/stranger', heading: "Stranger's Things" },
  { name: 'legacy-zoo-clicker', path: '/portfolio/ZooClicker/index.html' },
  { name: 'legacy-deuces-wild', path: '/portfolio/DeucesWild/index.html' },
  { name: 'legacy-qwirty', path: '/portfolio/qwirty/index.html' },
];

async function waitUntilSettled(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  // Lazy and offscreen images: load them all before the full-page shot.
  await page.evaluate(async () => {
    await Promise.all(
      Array.from(document.images, (img) => {
        img.loading = 'eager';
        // Resolve on error too, so a broken image fails through the error
        // fixture with its URL instead of hanging until the timeout.
        return img.complete
          ? null
          : new Promise((done) => {
              img.addEventListener('load', done, { once: true });
              img.addEventListener('error', done, { once: true });
            });
      })
    );
  });
}

for (const shot of SHOTS) {
  test(shot.name, async ({ page, allowErrors }, testInfo) => {
    allowErrors(...(shot.knownErrors?.[testInfo.project.name] ?? []));
    await page.goto(shot.path);
    if (shot.heading) {
      await expect(page.getByRole('heading', { name: shot.heading }).first()).toBeVisible();
    }
    await waitUntilSettled(page);

    await expect(page).toHaveScreenshot(`${shot.name}.png`, {
      fullPage: true,
      mask: shot.mask?.(page),
    });
  });
}
