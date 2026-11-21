// PM2 process config for the EC2 server. The deploy starts the app from this
// file, so these settings are versioned with the code. See DEPLOYMENT.md.
module.exports = {
  apps: [
    {
      name: 'personalsite',
      script: 'server.js',
      node_args: [
        // The instance has 512 MB of RAM. Without a cap, V8 lets the heap
        // grow toward a limit based on total memory before it collects
        // hard, which looks like a slow leak even when nothing leaks.
        '--max-old-space-size=192',
        // `kill -USR2 <pid>` writes a heap snapshot to the project folder,
        // for finding what keeps memory alive. No cost until it's used.
        '--heapsnapshot-signal=SIGUSR2',
      ],
      env: {
        NODE_ENV: 'production',
      },
      // Safety net: restart if memory still climbs past this.
      max_memory_restart: '300M',
      // server.js closes connections and pools on SIGINT, within 10s.
      kill_timeout: 12000,
      // Timestamp every log line, so memory trends can be lined up with time.
      time: true,
    },
  ],
};
