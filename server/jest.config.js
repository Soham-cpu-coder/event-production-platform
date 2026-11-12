module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/**/*.test.js'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
};
