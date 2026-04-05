export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'mjs'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['server/**/*.js', '!server/index.js'],
  coverageDirectory: 'coverage',
  verbose: true
};
