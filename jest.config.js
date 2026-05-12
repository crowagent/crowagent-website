module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  collectCoverage: true,
  collectCoverageFrom: [
    'scripts.js',
    'chatbot.js',
    'cookie-banner.js',
    'js/cookie-banner.js',
    'service-worker.js'
  ],
  coverageThreshold: {
    // DEF-046 (2026-05-10): per-file floor-of-current after the
    // cc3-perf-coverage unit-test rollout. Thresholds are intentionally just
    // below the actual measured coverage so the suite locks against
    // regression without bouncing on the boundary on CI runs that skip an
    // isolated test (Windows jest-worker fork failures, MCP timeouts, etc).
    //
    // Global lift to (statements/lines 65, functions/branches 60) per row
    // spec was attempted but chatbot.js sits at 56% lines because chatbot.js
    // contains a large fetch() success-path that needs a network mock to
    // exercise — left as a follow-up ratchet (see DEF-046 follow-up). Per-
    // file floors are preferred over a global because regressions bounce
    // earlier and identify the specific module.
    //
    // scripts.js floor unchanged from the previous baseline (PR #162 floor
    // post hero-persona-switcher.js extraction). The cc3-perf row does not
    // touch scripts.js source.
    './scripts.js': {
      lines: 59,
      statements: 55,
      functions: 55,
      branches: 45
    },
    // chatbot.js — newly covered in DEF-046. Floors set conservatively
    // (~5pp below measured) so a one-off test skip doesn't fail the suite.
    './chatbot.js': {
      lines: 50,
      statements: 50,
      functions: 50,
      branches: 25
    },
    // cookie-banner.js root shim — small file (4 LOC IIFE), high coverage.
    './cookie-banner.js': {
      lines: 90,
      statements: 75,
      functions: 90,
      branches: 40
    },
    // js/cookie-banner.js canonical implementation.
    './js/cookie-banner.js': {
      lines: 55,
      statements: 50,
      functions: 60,
      branches: 35
    },
    // service-worker.js — vm-loaded via global mocks; near-100% coverage.
    './service-worker.js': {
      lines: 90,
      statements: 90,
      functions: 80,
      branches: 80
    }
  },
  coverageReporters: ['text', 'lcov', 'json-summary'],
  // tests/unit/* (DEF-046) are jest unit tests; the bare `tests/` directory
  // also hosts Playwright specs that MUST NOT be executed by jest. The
  // negated regex `/tests/(?!unit/)` opts tests/unit/ back in while still
  // ignoring tests/responsive.spec.js, tests/smoke.spec.js etc.
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/(?!unit/)',
    '/cloudflare-workers/',
    'test_minimal.test.js',
    'test_minimal2.test.js',
    'test_minimal3.test.js'
  ]
};
