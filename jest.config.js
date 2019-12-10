// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
  ],

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTests.js',
  ],

  // The test environment that will be used for testing
  testEnvironment: 'node',

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/?(*.)+(spec|test).[tj]s?(x)',
  ],

  // Enable testing TypeScript files
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },

  // Ignore certain paths when determining what to test and mock
  modulePathIgnorePatterns: [
    // Tell Jest to ignore build output (fixes "duplicate manual mock found" warnings)
    '<rootDir>/dist/',
  ],
};
