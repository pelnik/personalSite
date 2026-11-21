import { test, expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';

// What a crawler that doesn't run JavaScript gets: the HTML as served. These
// check structure, not wording, so editing the page text doesn't break them.
async function getHtml(request: APIRequestContext, path: string) {
  const response = await request.get(path, { maxRedirects: 0 });
  expect(response.status(), path).toBe(200);
  expect(response.headers()['content-type'], path).toContain('text/html');
  return response.text();
}

function metaDescription(html: string) {
  return html.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1];
}

test.describe('prerendered pages', () => {
  test('/ has the intro and the project list in its HTML', async ({ request }) => {
    const html = await getHtml(request, '/');

    expect(html).toMatch(/<title>Homepage - Matthew Pelnik/);
    expect(html).toContain('<link rel="canonical" href="https://pelnik.dev/" />');
    expect(metaDescription(html)).toBeTruthy();
    expect(html).toContain('class="about-text"');
    expect(html).toContain('id="project-container"');
  });

  for (const path of ['/about', '/about/']) {
    test(`${path} has the intro, the links and the Stats link in its HTML`, async ({ request }) => {
      const html = await getHtml(request, path);

      expect(html).toMatch(/<title>About - Matthew Pelnik/);
      expect(html).toContain('<link rel="canonical" href="https://pelnik.dev/about" />');
      expect(metaDescription(html)).toBeTruthy();
      expect(html).toContain('class="about-link-card"');
      expect(html).toContain('href="/about/stats"');
    });
  }

  test('/about/stats has the stats in its HTML', async ({ request }) => {
    const html = await getHtml(request, '/about/stats');

    expect(html).toMatch(/<title>Stats - Matthew Pelnik/);
    expect(html).toContain('<link rel="canonical" href="https://pelnik.dev/about/stats" />');
    expect(metaDescription(html)).toBeTruthy();
    expect(html).toMatch(/<ul class="stats-list"><li>[^<]+<\/li>/);
  });

  test('each prerendered page has its own description', async ({ request }) => {
    const descriptions = new Set();
    for (const path of ['/', '/about', '/about/stats']) {
      descriptions.add(metaDescription(await getHtml(request, path)));
    }
    expect(descriptions.size).toBe(3);
  });

  test('other pages get the empty app shell, not a prerendered page', async ({ request }) => {
    for (const path of ['/portfolio', '/portfolio/', '/fitness', '/about/nope', '/no-such-page']) {
      const html = await getHtml(request, path);

      expect(html, path).toContain('<div id="app"></div>');
      expect(html, path).not.toContain('rel="canonical"');
    }
  });
});
