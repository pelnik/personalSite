// Prerenders a few pages to static HTML after `vite build`, so crawlers that
// don't run JavaScript still see their content. Runs as part of `npm run build`.
//
// Each page is loaded from the built site in headless Chromium. Its rendered
// #app, its title and a description go into a copy of the built index.html.
// In the browser, React renders over that HTML as usual (createRoot, not
// hydration), so components need nothing special.
//
// Output, in build/:
//   spa.html            the empty app shell, for every page not listed here
//   index.html          /  (replaces the shell Vite wrote)
//   <route>/index.html  every other route below
//   prerendered.json    route -> file, read by app.js
import fs from 'node:fs/promises';
import path from 'node:path';
import { preview } from 'vite';
import { chromium } from '@playwright/test';

const SITE_URL = 'https://pelnik.dev';
const BUILD_DIR = path.resolve('build');

const ROUTES = [
  {
    route: '/',
    description:
      'Matthew Pelnik is a Data Analyst in the Tulsa area who uses Databricks, Python and Spark to find provider fraud for Medicare. His personal site and past web projects.',
  },
  {
    route: '/about',
    description:
      'About Matthew Pelnik, a Tulsa-area Data Analyst building proactive models to find Medicare provider fraud in Databricks with Python and Spark. Links to his GitHub and LinkedIn.',
  },
  {
    route: '/about/stats',
    description: 'Education and achievements of Matthew Pelnik, Data Analyst.',
  },
];

const OG_IMAGE = `${SITE_URL}/Media/main/personal_pic.jpg`;

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function fileForRoute(route) {
  return route === '/' ? 'index.html' : `${route.slice(1)}/index.html`;
}

// search is a string or a non-global regex. A function replacement, so `$` in
// the page text isn't read as a replacement pattern.
function replaceOnce(html, search, replacement, what) {
  const found = typeof search === 'string' ? html.includes(search) : search.test(html);
  if (!found) {
    throw new Error(`Prerender: ${what} not found in the built index.html`);
  }
  return html.replace(search, () => replacement);
}

function renderPage(shell, { route, description }, { title, appHtml }) {
  const url = `${SITE_URL}${route}`;
  const head = [
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:image" content="${escapeHtml(OG_IMAGE)}" />`,
  ].join('\n    ');

  let html = replaceOnce(
    shell,
    /<title>[\s\S]*?<\/title>/,
    `<title>${escapeHtml(title)}</title>`,
    '<title>'
  );
  html = replaceOnce(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    '<meta name="description">'
  );
  html = replaceOnce(html, '</head>', `  ${head}\n  </head>`, '</head>');
  html = replaceOnce(html, '<div id="app"></div>', `<div id="app">${appHtml}</div>`, '<div id="app"></div>');
  return html;
}

async function capture(browser, baseUrl, route) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  // Never count a build as a visit.
  await page.route(/googletagmanager\.com|google-analytics\.com/, (request) =>
    request.fulfill({ status: 200, contentType: 'text/javascript', body: '' })
  );

  await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
  const result = await page.evaluate(() => ({
    title: document.title.trim(),
    appHtml: document.getElementById('app')?.innerHTML ?? '',
  }));
  await page.close();

  if (errors.length) {
    throw new Error(`Prerender: ${route} threw:\n  ${errors.join('\n  ')}`);
  }
  if (!result.appHtml.trim()) {
    throw new Error(`Prerender: ${route} rendered nothing`);
  }
  return result;
}

async function main() {
  const shellPath = path.join(BUILD_DIR, 'index.html');
  const spaPath = path.join(BUILD_DIR, 'spa.html');
  // vite build empties build/ first, so spa.html here means this already ran
  // and index.html is no longer the empty shell.
  if (await fs.stat(spaPath).catch(() => null)) {
    throw new Error('Prerender: build/ is already prerendered. Run `vite build` first.');
  }
  const shell = await fs.readFile(shellPath, 'utf8');

  // Capture every page before writing any, while the preview server still
  // serves the empty shell for every route.
  const server = await preview({ logLevel: 'warn', preview: { port: 4173 } });
  const browser = await chromium.launch();
  const pages = [];
  try {
    const baseUrl = server.resolvedUrls.local[0].replace(/\/$/, '');
    for (const entry of ROUTES) {
      pages.push({ entry, captured: await capture(browser, baseUrl, entry.route) });
    }
  } finally {
    await browser.close();
    await server.close();
  }

  await fs.writeFile(spaPath, shell);
  const manifest = {};
  for (const { entry, captured } of pages) {
    const file = fileForRoute(entry.route);
    await fs.mkdir(path.dirname(path.join(BUILD_DIR, file)), { recursive: true });
    await fs.writeFile(path.join(BUILD_DIR, file), renderPage(shell, entry, captured));
    manifest[entry.route] = file;
    console.log(`prerendered ${entry.route} -> build/${file}`);
  }
  await fs.writeFile(path.join(BUILD_DIR, 'prerendered.json'), `${JSON.stringify(manifest, null, 2)}\n`);
}

await main();
