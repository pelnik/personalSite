const bcrypt = require('bcryptjs');
const client = require('./client');

const ACCOUNT_COLUMNS = 'id, username, is_admin AS "isAdmin"';
// Unknown usernames take the same bcrypt path as incorrect passwords.
const UNKNOWN_USER_HASH = '$2b$10$1.0G1B4hNDXJgf83gPZ8X.K/mgIIlV3.4P9NZLhX2mthWwy4A3zaS';

async function createAccount({ username, password }) {
  const hash = await bcrypt.hash(password, 10);
  const { rows: [account] } = await client.query(
    `INSERT INTO accounts (username, password) VALUES ($1, $2)
     ON CONFLICT (username) DO NOTHING RETURNING ${ACCOUNT_COLUMNS}`,
    [username, hash]
  );
  return account;
}

async function authenticateAccount({ username, password }) {
  const { rows: [row] } = await client.query(
    `SELECT ${ACCOUNT_COLUMNS}, password FROM accounts WHERE username = $1`,
    [username]
  );
  if (!row) {
    await bcrypt.compare(password, UNKNOWN_USER_HASH);
    return;
  }
  if (!(await bcrypt.compare(password, row.password))) return;
  const { password: ignored, ...account } = row;
  return account;
}

async function getAccountById(id) {
  const { rows: [account] } = await client.query(
    `SELECT ${ACCOUNT_COLUMNS} FROM accounts WHERE id = $1`, [id]
  );
  return account;
}

async function getAccountByUsername(username) {
  const { rows: [account] } = await client.query(
    `SELECT ${ACCOUNT_COLUMNS} FROM accounts WHERE username = $1`, [username]
  );
  return account;
}

async function setAdmin(username, isAdmin) {
  const { rows: [account] } = await client.query(
    `UPDATE accounts SET is_admin = $2 WHERE username = $1 RETURNING ${ACCOUNT_COLUMNS}`,
    [username, isAdmin]
  );
  return account;
}

module.exports = { createAccount, authenticateAccount, getAccountById, getAccountByUsername, setAdmin };
