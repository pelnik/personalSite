const jwt = require('jsonwebtoken');

const ISSUER = 'personalsite-auth';

function signToken(account) {
  return jwt.sign(
    { id: account.id, username: account.username },
    process.env.JWT_SECRET,
    { issuer: ISSUER, expiresIn: '1w' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET, { issuer: ISSUER });
}

module.exports = { ISSUER, signToken, verifyToken };
