// Summarizes the metrics lines that server.js writes every few minutes, one
// row per hour (or per day with --daily), to show whether memory is leaking.
//
//   node scripts/memory-report.js ~/.pm2/logs/personalsite-out.log
//   node scripts/memory-report.js --daily ~/.pm2/logs/personalsite-out.log*
//
// The column to watch is "heap floor": the lowest heapUsed in each period,
// which is roughly what survives garbage collection. Normal use makes heapUsed
// rise and fall; a leak makes the floor climb period after period.
const fs = require('fs');

const args = process.argv.slice(2);
const daily = args.includes('--daily');
const files = args.filter((arg) => arg !== '--daily');

if (files.length === 0) {
  console.error('Usage: node scripts/memory-report.js [--daily] <log file>...');
  process.exit(1);
}

// Read every file first and sort by time: log globs list the current file
// before the rotated, older ones, and restarts are detected by uptime going
// backwards, which only works in time order.
const entries = [];
for (const file of files) {
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    // PM2 prefixes lines with a timestamp (time: true), so find the JSON.
    const start = line.indexOf('{"type":"metrics"');
    if (start === -1) continue;

    try {
      entries.push(JSON.parse(line.slice(start)));
    } catch {
      continue;
    }
  }
}
entries.sort((a, b) => a.time.localeCompare(b.time));

const periods = new Map();
let previousUptime = null;

for (const entry of entries) {
  const key = entry.time.slice(0, daily ? 10 : 13).replace('T', ' ');
  const period = periods.get(key) ?? {
    heapFloor: Infinity,
    heapPeak: 0,
    rssPeak: 0,
    p99Peak: 0,
    samples: 0,
    restarts: 0,
  };

  period.heapFloor = Math.min(period.heapFloor, entry.memoryMB.heapUsed);
  period.heapPeak = Math.max(period.heapPeak, entry.memoryMB.heapUsed);
  period.rssPeak = Math.max(period.rssPeak, entry.memoryMB.rss);
  period.p99Peak = Math.max(period.p99Peak, entry.eventLoopDelayMs.p99);
  period.samples += 1;
  // Uptime going backwards means the process restarted.
  if (previousUptime !== null && entry.uptimeSeconds < previousUptime) {
    period.restarts += 1;
  }
  previousUptime = entry.uptimeSeconds;

  periods.set(key, period);
}

if (periods.size === 0) {
  console.error('No metrics lines found. Is the server logging them (METRICS_INTERVAL_MS)?');
  process.exit(1);
}

console.log(
  [daily ? 'day (UTC)'.padEnd(13) : 'hour (UTC)'.padEnd(13), 'heap floor', 'heap peak', 'rss peak', 'loop p99', 'samples', 'restarts']
    .join('  ')
);
for (const [key, p] of [...periods].sort(([a], [b]) => a.localeCompare(b))) {
  console.log(
    [
      key.padEnd(13),
      `${p.heapFloor} MB`.padStart(10),
      `${p.heapPeak} MB`.padStart(9),
      `${p.rssPeak} MB`.padStart(8),
      `${p.p99Peak} ms`.padStart(8),
      String(p.samples).padStart(7),
      String(p.restarts || '').padStart(8),
    ].join('  ')
  );
}
