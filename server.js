require('dotenv').config();

const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const apiRouter = require('./src/api');
const { client } = require('./src/api/juicebox/db');

let PORT = 80;
let sshPORT = 443;

if (process.env.NODE_ENV === 'development') {
  PORT = 3000;
  sshPORT = 3443;
}

const app = express();
app.use(cors());

const options = {
  key: fs.readFileSync('Keys/key.pem'),
  cert: fs.readFileSync('Keys/pelnik_dev.crt'),
  passphrase: fs.readFileSync('Keys/passphrase.txt', 'utf8'),
  ca: fs.readFileSync('Keys/pelnik_dev.ca-bundle'),
};

app.use(morgan('combined'));

app.use('/api', apiRouter);

app.get('/scents', (req, res, next) => {
  console.log('entered redirect');
  res.redirect('https://makes-scents.netlify.app');
});

app.use(express.static('build'));

app.get('*', (req, res) => {
  res.sendFile(path.resolve('build', 'index.html'));
});

client.connect();

http.createServer(app).listen(PORT, () => {
  console.log(`http server listing on ${PORT}`);
});
https.createServer(options, app).listen(sshPORT, () => {
  console.log(`https server listing on ${sshPORT}`);
});
