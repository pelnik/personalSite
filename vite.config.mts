import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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
