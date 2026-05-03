module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  collectCoverage: true,
  collectCoverageFrom: [
    'scripts.js',
    'chatbot.js',
    'cookie-banner.js',
    'service-worker.js'
  ],
  coverageThreshold: {
    './scripts.js': { lines: 60 }
  },
  coverageReporters: ['text', 'lcov'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    'test_minimal.test.js',
    'test_minimal2.test.js',
    'test_minimal3.test.js'
  ]
};
