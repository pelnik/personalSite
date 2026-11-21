const { monitorEventLoopDelay } = require('perf_hooks');
const { pools } = require('./createPool');

// Event loop delay: how long timers and I/O callbacks wait for the main
// thread. A rising p99 means something is blocking it.
const SAMPLE_EVERY_MS = 20;
const eventLoopDelay = monitorEventLoopDelay({ resolution: SAMPLE_EVERY_MS });
eventLoopDelay.enable();

const toMB = (bytes) => Math.round((bytes / 1024 / 1024) * 10) / 10;
// The histogram counts the sampling interval itself as delay (an idle loop
// reads about SAMPLE_EVERY_MS), so subtract it.
const delayMs = (nanoseconds) =>
  Math.max(0, Math.round((nanoseconds / 1e6 - SAMPLE_EVERY_MS) * 10) / 10);

// A point-in-time view of the process, for spotting slow memory growth.
// Watch heapUsedMB over days: normal use rises and falls with garbage
// collection, while a leak shows up as a floor that keeps rising.
function snapshot() {
  const memory = process.memoryUsage();

  const databasePools = {};
  for (const [name, pool] of pools) {
    databasePools[name] = {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount,
    };
  }

  return {
    uptimeSeconds: Math.round(process.uptime()),
    memoryMB: {
      rss: toMB(memory.rss),
      heapTotal: toMB(memory.heapTotal),
      heapUsed: toMB(memory.heapUsed),
      external: toMB(memory.external),
      arrayBuffers: toMB(memory.arrayBuffers),
    },
    eventLoopDelayMs: {
      p50: delayMs(eventLoopDelay.percentile(50)),
      p99: delayMs(eventLoopDelay.percentile(99)),
      max: delayMs(eventLoopDelay.max),
    },
    activeResources: process.getActiveResourcesInfo().length,
    databasePools,
  };
}

// Logs one JSON line per interval, easy to pull out of the PM2 logs:
//   grep '"type":"metrics"' ~/.pm2/logs/personalsite-out.log
// Each line's delay percentiles cover that interval. With logging off
// (METRICS_INTERVAL_MS=0), /api/metrics reports them since startup instead.
function startMetricsLog(intervalMs) {
  const timer = setInterval(() => {
    console.log(JSON.stringify({ type: 'metrics', time: new Date().toISOString(), ...snapshot() }));
    // Delay percentiles cover one interval each.
    eventLoopDelay.reset();
  }, intervalMs);
  timer.unref();
  return timer;
}

module.exports = { snapshot, startMetricsLog };
