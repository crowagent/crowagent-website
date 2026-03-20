module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  collectCoverage: true,
  collectCoverageFrom: ['scripts.js'],
  coverageThreshold: {
    global: { lines: 70 }
  },
  coverageReporters: ['text', 'lcov'],
};
