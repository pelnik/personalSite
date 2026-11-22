import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Main } from './components';
import { AuthProvider } from './components/Auth';

// Pages like the demo apps load as separate chunks. A deploy deletes the old
// chunks, so a tab still running the previous version can fail to load one.
// Reload to pick up the new version, at most once every 10 seconds so a
// chunk that is genuinely missing can't cause a reload loop.
// The failed import still rejects (no preventDefault): if the reload is
// skipped, the error surfaces instead of rendering an undefined component.
window.addEventListener('vite:preloadError', () => {
  const RELOAD_KEY = 'chunk-reload-at';
  let lastReload = 0;
  try {
    lastReload = Number(sessionStorage.getItem(RELOAD_KEY)) || 0;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // Storage unavailable: reloading once is still the best option.
  }
  if (Date.now() - lastReload > 10_000) {
    window.location.reload();
  }
});

const container = document.getElementById('app');
if (!container) {
  throw new Error('App container not found');
}
const root = createRoot(container);
root.render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <Main />
      </AuthProvider>
    </Router>
  </StrictMode>
);
