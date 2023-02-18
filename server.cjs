const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');

const app = express();
const PORT = 80;
const sshPORT = 443;

const options = {
  key: fs.readFileSync('Keys/key.pem'),
  cert: fs.readFileSync('Keys/pelnik_dev.crt'),
  passphrase: fs.readFileSync('Keys/passphrase.txt', 'utf8'),
  ca: fs.readFileSync('Keys/pelnik_dev.ca-bundle'),
};

app.use(express.static('public'));

http.createServer(app).listen(PORT, () => {
  console.log(`http server listing on ${PORT}`);
});
https.createServer(options, app).listen(sshPORT, () => {
  console.log(`https server listing on ${sshPORT}`);
});

// app.listen(PORT, () => {
//   console.log(`Server listening on port: ${PORT}`);
// });
