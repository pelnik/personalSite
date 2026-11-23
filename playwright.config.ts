import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
import useLocalDatabaseDefaults from './tests/support/localDatabases';

// The web server (seed and server.js) inherits these, so e2e runs work in a
// clone without a .env.
useLocalDatabaseDefaults();

// End-to-end tests against the built site (build/) served by the real Express
// server. Run `npm run build` first; `npm run test:e2e` does both.
//
// Projects:
//   functional  - behavior checks; runs in CI
//   visual      - full-page screenshot comparisons; local only, because font
//                 rendering differs between operating systems
// Not 3000, so a running `npm run dev` doesn't get in the way.
const PORT = 3100;

export default defineConfig({
  testDir: './tests/e2e',
  // Serial: the demo apps share one database, and screenshots must not catch
  // data another test created a moment ago.
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}-{projectName}{-platform}{ext}',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  expect: {
    toHaveScreenshot: { animations: 'disabled', maxDiffPixelRatio: 0.001 },
  },
  projects: [
    {
      name: 'functional',
      testIgnore: /visual\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'visual-desktop',
      testMatch: /visual\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'visual-mobile',
      testMatch: /visual\.spec\.ts/,
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: 'node tests/e2e/seed.js && node server.js',
    url: `http://localhost:${PORT}/api/fitness/health`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      NODE_ENV: 'development',
      HTTP_PORT: String(PORT),
      // The scents API creates its Stripe client at startup and throws without
      // a key. A dummy key also keeps a real one from .env out of e2e runs.
      STRIPE_KEY: 'sk_test_e2e_dummy',
      ACME_WEBROOT: 'tests/e2e/fixtures/acme',
    },
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
