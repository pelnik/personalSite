// Test setup drops and rebuilds tables. Refuse to run it against anything
// other than a local database, in case .env points somewhere real.
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '::1', 'db'];

function assertLocalDatabase(envVar, fallback) {
  const connectionString = process.env[envVar] || fallback;

  if (!connectionString) {
    throw new Error(`${envVar} is not set; refusing to run database tests`);
  }

  const { hostname } = new URL(connectionString);

  if (!LOCAL_HOSTS.includes(hostname)) {
    throw new Error(
      `${envVar} points at "${hostname}", not a local database; refusing to drop its tables`
    );
  }
}

module.exports = assertLocalDatabase;
