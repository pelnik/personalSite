require('dotenv').config();

const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const apiRouter = require('./src/api');
const { ensureDbInitialized } = require('./src/api/fitness-tracker/db/seedData');

let PORT = 80;
let sshPORT = 443;

if (process.env.NODE_ENV === 'development') {
  PORT = 3000;
  sshPORT = 3443;
}

const app = express();
app.use(cors());

app.use(morgan('combined'));

app.use('/api', apiRouter);

app.get('/scents', (req, res, next) => {
  console.log('entered redirect');
  res.redirect('https://makes-scents-store.netlify.app/');
});

app.use(express.static('build'));

app.get('*', (req, res) => {
  res.sendFile(path.resolve('build', 'index.html'));
});

if (process.env.NODE_ENV === 'development') {
  ensureDbInitialized();
}

const server = http.createServer(app);
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Run "lsof -ti :${PORT} | xargs kill" to free it.`);
    process.exit(1);
  }
  throw err;
});
server.listen(PORT, () => {
  console.log(`http server listening on ${PORT}`);
});

// Only start HTTPS server in production with SSL certs
if (process.env.NODE_ENV === 'production') {
  try {
    const options = {
      key: fs.readFileSync('Keys/key.pem'),
      cert: fs.readFileSync('Keys/pelnik_dev.crt'),
      ca: fs.readFileSync('Keys/pelnik_dev.ca-bundle'),
    };
    https.createServer(options, app).listen(sshPORT, () => {
      console.log(`https server listening on ${sshPORT}`);
    });
  } catch (err) {
    console.warn('SSL certificates not found, HTTPS server not started');
  }
}
