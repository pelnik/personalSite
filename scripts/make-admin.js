const { client, setAdmin } = require('../src/api/auth/db');

async function main() {
  const username = process.argv[2];
  if (!username) throw new Error('Usage: npm run auth:make-admin -- <username>');
  const account = await setAdmin(username, true);
  if (!account) throw new Error(`No account named ${username}`);
  console.log(account);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(() => client.end());
