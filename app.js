// The Express app: API routes, the built frontend, and the SPA fallback.
// server.js listens on the ports; tests can load this module directly.
require('dotenv').config();

const express = require('express');
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

app.use(express.static('build'));

// A file that isn't in build/ (e.g. an old /assets chunk after a deploy) is a
// 404. Serving index.html for it would hand the browser HTML where it asked
// for JavaScript, CSS or an image. (#36)
app.use((req, res, next) => {
  if (path.extname(req.path)) {
    return res.status(404).send('Not found');
  }
  next();
});

// Every other path is a page of the single-page app.
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.resolve('build', 'index.html'));
});

module.exports = app;
