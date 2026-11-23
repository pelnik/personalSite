import { execFileSync } from 'node:child_process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function gitCommit() {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

process.env.VITE_BUILD_COMMIT ??= gitCommit();
process.env.VITE_BUILD_TIME ??= new Date().toISOString();

export default defineConfig({
  plugins: [react()],
  build: {
    // server.js serves build/, and CI deploys it.
    outDir: 'build',
  },
  server: {
    // Express runs on 3000 in development (npm run dev starts both).
    port: 3001,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        // Pages like /api/fitness/docs are SPA routes. Serve them from Vite
        // instead of proxying, or Express answers with the production build.
        bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : undefined),
      },
    },
  },
});
