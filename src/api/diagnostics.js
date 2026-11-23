const { execFileSync } = require('node:child_process');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const v8 = require('node:v8');
const express = require('express');
const { checkDatabases } = require('./checkDatabases');
const { snapshot, toMB } = require('./metrics');

const diagnosticsRouter = express.Router();

function readServerVersion() {
  try {
    const [commit, committedAt] = execFileSync('git', ['log', '-1', '--format=%h %cI'], {
      cwd: path.join(__dirname, '..', '..'),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim().split(' ');
    return { commit, committedAt };
  } catch {
    return { commit: null, committedAt: null };
  }
}

const { commit: serverCommit, committedAt: serverCommittedAt } = readServerVersion();
const { max_memory_restart: maxMemoryRestart } = require('../../ecosystem.config.js').apps[0];
const restartLimitMatch = /^(\d+)M$/.exec(maxMemoryRestart);
const restartLimitMB = restartLimitMatch ? Number(restartLimitMatch[1]) : null;

const toGB = (bytes) => Math.round((bytes / 1024 ** 3) * 10) / 10;

async function readDisk() {
  try {
    const { blocks, bsize, bavail } = await fs.statfs('/');
    return { total: toGB(blocks * bsize), available: toGB(bavail * bsize) };
  } catch {
    return null;
  }
}

diagnosticsRouter.get('/diagnostics', async (req, res, next) => {
  try {
    const [databases, diskGB] = await Promise.all([checkDatabases(), readDisk()]);
    const { memoryMB, eventLoopDelayMs, uptimeSeconds } = snapshot();
    const { socket } = req;
    const secure = Boolean(socket.encrypted);

    res.set('Cache-Control', 'no-store').send({
      generatedAt: new Date().toISOString(),
      status: Object.values(databases).every(({ status }) => status === 'ok') ? 'ok' : 'error',
      server: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cpuCount: os.availableParallelism(),
        loadAverage: os.loadavg().map((load) => Number(load.toFixed(2))),
        systemUptimeSeconds: Math.round(os.uptime()),
        processUptimeSeconds: uptimeSeconds,
      },
      memoryMB: {
        systemTotal: toMB(os.totalmem()),
        systemAvailable: toMB(os.freemem()),
        processRss: memoryMB.rss,
        heapUsed: memoryMB.heapUsed,
        heapTotal: memoryMB.heapTotal,
        heapLimit: toMB(v8.getHeapStatistics().heap_size_limit),
        restartLimit: process.env.pm_id !== undefined ? restartLimitMB : null,
      },
      diskGB,
      eventLoopDelayMs,
      databases,
      versions: { serverCommit, serverCommittedAt },
      tls: secure ? {
        protocol: socket.getProtocol(),
        certificateExpires: new Date(socket.getCertificate().valid_to).toISOString(),
      } : null,
      visitor: {
        ip: socket.remoteAddress?.replace(/^::ffff:/, '') ?? null,
        userAgent: req.get('User-Agent') ?? null,
        httpVersion: req.httpVersion,
        secure,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = diagnosticsRouter;
