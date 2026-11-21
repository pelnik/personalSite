require('dotenv').config();

const https = require('https');
const http = require('http');
const fs = require('fs');
const app = require('./app');
const { endAllPools } = require('./src/api/createPool');
const { ensureDbInitialized } = require('./src/api/fitness-tracker/db/seedData');

let PORT = 80;
let sshPORT = 443;

if (process.env.NODE_ENV === 'development') {
  PORT = Number(process.env.HTTP_PORT) || 3000;
  sshPORT = 3443;
}

if (process.env.NODE_ENV === 'development') {
  ensureDbInitialized();
}

const server = http.createServer(app);
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Run "lsof -ti :${PORT} | xargs kill" to free it.`);
    process.exit(1);
  }
  throw err;
});
server.listen(PORT, () => {
  console.log(`http server listening on ${PORT}`);
});

const servers = [server];

// Only start HTTPS server in production with SSL certs
if (process.env.NODE_ENV === 'production') {
  try {
    const options = {
      key: fs.readFileSync('Keys/key.pem'),
      cert: fs.readFileSync('Keys/pelnik_dev.crt'),
      ca: fs.readFileSync('Keys/pelnik_dev.ca-bundle'),
    };
    const httpsServer = https.createServer(options, app).listen(sshPORT, () => {
      console.log(`https server listening on ${sshPORT}`);
    });
    servers.push(httpsServer);
  } catch (err) {
    console.warn('SSL certificates not found, HTTPS server not started');
  }
}

// PM2 sends SIGINT on restart (SIGTERM in some setups). Stop accepting
// connections, let in-flight requests finish, close the database pools, then
// exit. Give up after 10 seconds so a stuck connection can't block a restart.
let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received, shutting down`);

  setTimeout(() => {
    console.error('Shutdown took longer than 10s, exiting anyway');
    process.exit(1);
  }, 10_000).unref();

  try {
    await Promise.all(
      servers.map((s) => new Promise((resolve) => s.close(resolve)))
    );
    await endAllPools();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
