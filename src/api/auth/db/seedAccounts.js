const bcrypt = require('bcryptjs');
const client = require('./client');

const SEED_ACCOUNTS = [
  { username: 'albert', password: 'bertie99' },
  { username: 'sandra', password: 'sandra123' },
  { username: 'glamgal', password: 'glamgal123' },
];

async function seedAccounts() {
  const accounts = {};
  for (const { username, password } of SEED_ACCOUNTS) {
    const hash = await bcrypt.hash(password, 10);
    const { rows: [account] } = await client.query(
      `INSERT INTO accounts (username, password) VALUES ($1, $2)
       ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password
       RETURNING id, username, is_admin AS "isAdmin"`,
      [username, hash]
    );
    accounts[username] = account;
  }
  return accounts;
}

module.exports = { SEED_ACCOUNTS, seedAccounts };
