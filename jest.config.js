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
    // Adjusted post-PR-#162 (a85ddff): hero-persona-switcher logic was
    // extracted into js/modules/hero-persona-switcher.js, which dropped
    // scripts.js coverage by ~1pp on lines and ~1.4pp on branches relative
    // to the previous baseline. Thresholds are floor-of-current to lock
    // against further regression without bouncing on the boundary.
    './scripts.js': {
      lines: 59,
      statements: 55,
      functions: 55,
      branches: 48
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
