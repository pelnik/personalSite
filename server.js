const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

const PORT = 3080;
const sshPORT = 3443;

const app = express();

const options = {
  key: fs.readFileSync('Keys/key.pem'),
  cert: fs.readFileSync('Keys/pelnik_dev.crt'),
  passphrase: fs.readFileSync('Keys/passphrase.txt', 'utf8'),
  ca: fs.readFileSync('Keys/pelnik_dev.ca-bundle'),
};

app.use(morgan('combined'));
app.use(express.static('build'));

app.get('/stranger', (req, res) => {
  res.redirect('https://strangers-things-classified-ads.netlify.app');
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve('build', 'index.html'))
}
);

http.createServer(app).listen(PORT, () => {
  console.log(`http server listing on ${PORT}`);
});
https.createServer(options, app).listen(sshPORT, () => {
  console.log(`https server listing on ${sshPORT}`);
});
