import { test, expect } from '@playwright/test';

// Behavior of server.js itself, checked over HTTP without a browser.
test.describe('Express server', () => {
  test('/scents redirects to the Netlify storefront', async ({ request }) => {
    const response = await request.get('/scents', { maxRedirects: 0 });

    expect(response.status()).toBe(302);
    expect(response.headers().location).toBe('https://makes-scents-store.netlify.app/');
  });

  test('deep links fall back to the SPA', async ({ request }) => {
    for (const path of ['/juicebox/login', '/fitness/routines', '/stranger/login', '/nope']) {
      const response = await request.get(path);

      expect(response.status(), path).toBe(200);
      expect(response.headers()['content-type'], path).toContain('text/html');
      expect(await response.text(), path).toContain('<div id="app"></div>');
    }
  });

  test('static assets are served from build/', async ({ request }) => {
    for (const path of ['/favicon.ico', '/Media/main/personal_pic.jpg', '/legacyJS/snakeGame.js']) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
    }
  });

  test('API routes are not swallowed by the SPA fallback', async ({ request }) => {
    const response = await request.get('/api/fitness/health');

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ message: 'All is well', db: 'ok' });
  });

  test('responses allow cross-origin requests (used by the Netlify storefront)', async ({
    request,
  }) => {
    const response = await request.get('/api/scents/health', {
      headers: { Origin: 'https://makes-scents-store.netlify.app' },
    });

    expect(response.headers()['access-control-allow-origin']).toBe('*');
  });
});
