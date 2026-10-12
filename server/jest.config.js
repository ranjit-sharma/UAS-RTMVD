export default {
  testEnvironment: 'node',
  testTimeout: 30000,
  transform: {},
  extensionsToTreatAsEsm: [],
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: [],
  // jestSetup sets NODE_ENV=test BEFORE dotenv/config loads
  setupFiles: ['./tests/helpers/jestSetup.js', 'dotenv/config'],
  collectCoverageFrom: ['src/**/*.js'],
};



