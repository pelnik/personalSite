// The local Postgres from docker-compose.yml, used for any database URL that
// .env (or the environment, as in CI) doesn't set. A fresh clone has no .env,
// and tests should still run against the shared local container.
const LOCAL_DATABASES = {
  DATABASE_URL: 'postgres://postgres:postgres@localhost:5432/juicebox',
  FITNESS_DATABASE_URL: 'postgres://postgres:postgres@localhost:5432/fitness',
  SCENTS_DATABASE_URL: 'postgres://postgres:postgres@localhost:5432/scents',
  AUTH_DATABASE_URL: 'postgres://postgres:postgres@localhost:5432/auth',
};

// Call after dotenv has loaded, so values from .env still win.
function useLocalDatabaseDefaults() {
  for (const [name, url] of Object.entries(LOCAL_DATABASES)) {
    process.env[name] = process.env[name] || url;
  }
}

module.exports = useLocalDatabaseDefaults;
