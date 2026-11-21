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

app.get('*', (req, res) => {
  res.sendFile(path.resolve('build', 'index.html'));
});

module.exports = app;
