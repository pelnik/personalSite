const { GITHUB_WEBHOOK } = process.env;

const express = require('express');
const crypto = require('crypto');
const adminRouter = express.Router();

let encoder = new TextEncoder();

// Signature verification from github
// https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries#examples
async function verifySignature(secret, header, payload) {
  let parts = header.split('=');
  let sigHex = parts[1];

  let algorithm = { name: 'HMAC', hash: { name: 'SHA-256' } };

  let keyBytes = encoder.encode(secret);
  let extractable = false;
  let key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    algorithm,
    extractable,
    ['sign', 'verify']
  );

  let sigBytes = hexToBytes(sigHex);
  let dataBytes = encoder.encode(payload);
  let equal = await crypto.subtle.verify(
    algorithm.name,
    key,
    sigBytes,
    dataBytes
  );

  return equal;
}

function hexToBytes(hex) {
  let len = hex.length / 2;
  let bytes = new Uint8Array(len);

  let index = 0;
  for (let i = 0; i < hex.length; i += 2) {
    let c = hex.slice(i, i + 2);
    let b = parseInt(c, 16);
    bytes[index] = b;
    index += 1;
  }

  return bytes;
}

adminRouter.post('/github', async (req, res, next) => {
  try {
    req_sha = req.get('X-Hub-Signature-256');
    console.log('req body', req.body);
    console.log('type of req body', typeof req.body);

    if (await verifySignature(GITHUB_WEBHOOK, req_sha, req.body)) {
      res.send(200);
    } else {
      next({
        name: 'SecretMismatch',
        message: 'Secret did not match',
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

adminRouter.use('*', (req, res, next) => {
  res.status(404);
  res.send({
    name: 'FitnessPathDoesNotExist',
    message: 'Path does not exist',
  });
});

adminRouter.use((error, req, res, next) => {
  res.status(400);
  res.send({
    name: error.name,
    message: error.message,
  });
});

module.exports = adminRouter;
