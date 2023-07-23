let config = {};

if (process.env.JEST_ENV === 'fitness') {
  config = {
    verbose: true,
    globalSetup: './tests/setup.js',
    globalTeardown: './tests/tearDown.js',
    collectCoverage: false,
    forceExit: true,
    rootDir: './src/api/fitness-tracker',
  };
} else {
  config = {
    moduleNameMapper: {
      '\\.(css|less|sass|scss)$': '<rootDir>/src/__mocks__/styleMock.js',
      '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/src/__mocks__/fileMock.js',
    },
    testEnvironment: 'jsdom',
    testPathIgnorePatterns: ['/node_modules/', '/src/api/fitness-tracker/'],
  };
}

module.exports = config;
