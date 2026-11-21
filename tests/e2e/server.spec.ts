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

  test('missing files are a 404, not the SPA page (#36)', async ({ request }) => {
    for (const path of [
      '/assets/JuiceboxMain-old-deploy.js',
      '/assets/index-old-deploy.css',
      '/Media/main/no-such-image.png',
      '/favicon-missing.ico',
    ]) {
      const response = await request.get(path);

      expect(response.status(), path).toBe(404);
      expect(await response.text(), path).not.toContain('<div id="app"></div>');
    }
  });

  test("Let's Encrypt challenge tokens are served from the ACME webroot", async ({ request }) => {
    const response = await request.get('/.well-known/acme-challenge/e2e-token');

    expect(response.status()).toBe(200);
    expect(await response.text()).toBe('e2e-token.key-authorization\n');
  });

  test('unknown challenge tokens 404 instead of falling back to the SPA', async ({ request }) => {
    const response = await request.get('/.well-known/acme-challenge/missing');

    expect(response.status()).toBe(404);
    expect(await response.text()).not.toContain('<div id="app"></div>');
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
