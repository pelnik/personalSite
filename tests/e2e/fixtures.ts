import { test as base, expect, Page } from '@playwright/test';
import strangerPosts from './fixtures/stranger-posts.json';

// Every test gets a page that:
// - never sends analytics, so test runs don't show up in Google Analytics
// - never reaches the live site: the demo apps call their APIs same-origin,
//   so any request to pelnik.dev means a hardcoded URL crept back in
// - mocks the Stranger's Things API, which is a third-party server
// - fails the test on any console error or failed request (e.g. a missing
//   image), which is how a broken asset path shows up
const STRANGER_API = 'https://strangers-things.herokuapp.com/api/**';

async function routeExternalTraffic(page: Page, errors: string[]) {
  await page.route(/googletagmanager\.com|google-analytics\.com/, (route) =>
    route.fulfill({ status: 200, contentType: 'text/javascript', body: '' })
  );

  await page.route(/^https?:\/\/(www\.)?pelnik\.dev\//, (route) => {
    errors.push(`request to the live site: ${route.request().url()}`);
    return route.abort('blockedbyclient');
  });

  await page.route(STRANGER_API, (route) => {
    if (route.request().method() === 'GET' && route.request().url().endsWith('/posts')) {
      return route.fulfill({ json: strangerPosts });
    }
    return route.fulfill({ json: { success: false, error: { message: 'Not mocked in e2e' } } });
  });
}

type Fixtures = {
  // Call with patterns for errors a test expects, e.g. a 400 from a failed login.
  allowErrors: (...patterns: RegExp[]) => void;
  allowedErrors: RegExp[];
};

export const test = base.extend<Fixtures>({
  allowedErrors: async ({}, use) => {
    await use([]);
  },

  allowErrors: async ({ allowedErrors }, use) => {
    await use((...patterns) => allowedErrors.push(...patterns));
  },

  page: async ({ page, allowedErrors }, use) => {
    const errors: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`console: ${message.text()}`);
    });
    page.on('pageerror', (error) => errors.push(`uncaught: ${error.message}`));
    page.on('requestfailed', (request) => {
      const reason = request.failure()?.errorText;
      // The browser cancels in-flight requests when the test navigates away.
      if (reason === 'net::ERR_ABORTED') return;
      errors.push(`request failed: ${request.url()} (${reason})`);
    });
    page.on('response', (response) => {
      if (response.status() >= 400) {
        errors.push(`HTTP ${response.status()}: ${response.url()}`);
      }
    });

    await routeExternalTraffic(page, errors);
    await use(page);
    // Requests still being forwarded when the test ends aren't failures.
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    const unexpected = errors.filter(
      (error) => !allowedErrors.some((pattern) => pattern.test(error))
    );
    expect(unexpected, 'console errors or failed requests').toEqual([]);
  },
});

export { expect };
