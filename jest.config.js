let config = {};

if (process.env.JEST_ENV === 'fitness') {
  config = {
    verbose: true,
    globalSetup: './src/api/fitness-tracker/tests/setup.js',
    globalTeardown: './src/api/fitness-tracker/tests/tearDown.js',
    collectCoverage: false,
    forceExit: true,
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

console.log('jest config', config);

module.exports = config;
