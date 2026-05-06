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
    './scripts.js': {
      lines: 60,
      statements: 55,
      functions: 55,
      branches: 50
    }
  },
  coverageReporters: ['text', 'lcov'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/cloudflare-workers/',
    'test_minimal.test.js',
    'test_minimal2.test.js',
    'test_minimal3.test.js'
  ]
};
