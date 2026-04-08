/**
 * scripts.test.js — CrowAgent Website Comprehensive E2E Test Suite
 * Covers: functional behaviour, UI consistency, form validation,
 * accessibility, navigation, locale/currency, CSRD wizard,
 * cookie consent, analytics hooks, security, SEO metadata,
 * responsive helpers, and regression guards.
 *
 * Run: npm test
 */

// ── Global mocks (must be before require) ────────────────────────────────────

global.IntersectionObserver = class {
  constructor(cb) { this._cb = cb; }
  observe(el) { this._cb([{ isIntersecting: true, target: el }]); }
  unobserve() {}
  disconnect() {}
};

global.requestAnimationFrame = (() => {
  let t = 0;
  return (cb) => { t += 1000; setTimeout(() => cb(t), 0); return 1; };
})();

global.performance = global.performance || { now: () => Date.now() };

window.matchMedia = window.matchMedia || function (query) {
  return {
    matches: false, media: query, onchange: null,
    addListener() {}, removeListener() {},
    addEventListener() {}, removeEventListener() {},
    dispatchEvent() { return false; },
  };
};

const localStoreMock = (() => {
  let store = {};
  return {
    getItem: k => Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStoreMock, writable: true });

const sessionStoreMock = (() => {
  let store = {};
  return {
    getItem: k => Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(global, 'sessionStorage', { value: sessionStoreMock, writable: true });
