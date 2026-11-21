// API integration tests, one Jest project per API module. They run against a
// real Postgres (see docker-compose.yml) and must run in band, because the
// spec files in each project share one database.
//
// Frontend coverage lives in tests/e2e (Playwright), which exercises the
// built site in a real browser.
const path = require('path');

const support = (file) => path.join(__dirname, 'tests/support', file);

const apiProject = (displayName, rootDir, overrides = {}) => ({
  displayName,
  rootDir: path.join(__dirname, rootDir),
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.spec.js'],
  setupFiles: [support('testEnv.js')],
  // Plain CommonJS; no transpiling needed.
  transform: {},
  // Every test app loads the whole /api router, which pulls in Stripe.
  moduleNameMapper: { '^stripe$': support('stripeStub.js') },
  ...overrides,
});

module.exports = {
  // Some modules (e.g. the juicebox seed) leave pool connections open.
  forceExit: true,
  testTimeout: 30000,
  projects: [
    apiProject('fitness', 'src/api/fitness-tracker', {
      globalSetup: '<rootDir>/tests/setup.js',
      globalTeardown: '<rootDir>/tests/tearDown.js',
    }),
    apiProject('juicebox', 'src/api/juicebox', {
      globalSetup: '<rootDir>/tests/setup.js',
    }),
    apiProject('scents', 'src/api/scents', {
      globalSetup: '<rootDir>/tests/setup.js',
    }),
    // The top-level /api router and shared helpers. No database setup.
    apiProject('core', 'src/api'),
  ],
};
