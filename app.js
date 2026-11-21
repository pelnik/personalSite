// The Express app: API routes, the built frontend, and the SPA fallback.
// server.js listens on the ports; tests can load this module directly.
require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const apiRouter = require('./src/api');

const app = express();
app.use(cors());

app.use(morgan('combined'));

app.use('/api', apiRouter);

app.get('/scents', (req, res) => {
  res.redirect('https://makes-scents-store.netlify.app/');
});

// Let's Encrypt HTTP-01 challenges, written by `certbot --webroot`. Served from outside
// build/, because the deploy's `rsync --delete` replaces build/. Unknown tokens get a 404
// instead of the SPA fallback.
const acmeWebroot = process.env.ACME_WEBROOT || '/var/www/certbot';
app.use(
  '/.well-known/acme-challenge',
  express.static(path.join(acmeWebroot, '.well-known', 'acme-challenge'), { fallthrough: false })
);

// No redirect from /about to /about/ when build/about/ is a folder (it holds a
// prerendered page): the fallback below serves /about itself.
app.use(express.static('build', { redirect: false }));

// A file that isn't in build/ (e.g. an old /assets chunk after a deploy) is a
// 404. Serving index.html for it would hand the browser HTML where it asked
// for JavaScript, CSS or an image. (#36)
app.use((req, res, next) => {
  if (path.extname(req.path)) {
    return res.status(404).send('Not found');
  }
  next();
});

// Pages prerendered at build time (scripts/prerender.mjs), route -> file in
// build/. Missing until the first build, e.g. in the API tests.
let prerenderedPages = {};
try {
  prerenderedPages = JSON.parse(fs.readFileSync(path.resolve('build', 'prerendered.json'), 'utf8'));
} catch {
  // Not built yet: every page gets the app shell.
}

// Every other path is a page of the single-page app: its prerendered HTML if
// it has one, otherwise the empty app shell.
app.get('/{*splat}', (req, res) => {
  const route = req.path.replace(/\/+$/, '') || '/';
  const file = Object.hasOwn(prerenderedPages, route) ? prerenderedPages[route] : 'spa.html';
  res.sendFile(path.resolve('build', file));
});

module.exports = app;
