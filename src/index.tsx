import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Main } from './components';

const container = document.getElementById('app');
if (!container) {
  throw new Error('App container not found');
}
const root = createRoot(container);
root.render(
  <StrictMode>
    <Router>
      <Main />
    </Router>
  </StrictMode>
);
