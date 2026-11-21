import { test, expect } from './fixtures';

// The files crawlers look for, and the structured data on /about.
test.describe('crawler files', () => {
  test('robots.txt allows everything and points to the sitemap', async ({ request }) => {
    const response = await request.get('/robots.txt');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/plain');
    const text = await response.text();
    expect(text).toMatch(/^User-agent: \*$/m);
    expect(text).not.toMatch(/^Disallow: \S/m);
    expect(text).toMatch(/^Sitemap: https:\/\/pelnik\.dev\/sitemap\.xml$/m);
  });

  test('every page in sitemap.xml exists', async ({ request }) => {
    const response = await request.get('/sitemap.xml');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('xml');
    const urls = [...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => match[1]
    );
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) {
      expect(url).toMatch(/^https:\/\/pelnik\.dev\//);
      const page = await request.get(new URL(url).pathname, { maxRedirects: 0 });
      expect(page.status(), url).toBe(200);
    }
  });

  test('llms.txt is served as text with a title and a summary', async ({ request }) => {
    const response = await request.get('/llms.txt');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/plain');
    const text = await response.text();
    expect(text).toMatch(/^# Matthew Pelnik$/m);
    expect(text).toMatch(/^> \S/m);
  });

  test('/about has Person structured data linking to the same profiles', async ({ page }) => {
    await page.goto('/about');

    const json = await page.locator('script[type="application/ld+json"]').textContent();
    const person = JSON.parse(json ?? '');
    expect(person['@context']).toBe('https://schema.org');
    expect(person['@type']).toBe('Person');
    expect(person.name).toBe('Matthew Pelnik');

    const links = await page
      .locator('a.about-link')
      .evaluateAll((anchors) => anchors.map((a) => a.getAttribute('href')));
    expect(person.sameAs).toEqual(links);
  });
});
