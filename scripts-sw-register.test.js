/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://crowagent.ai/"}
 *
 * scripts-sw-register.test.js
 *
 * Covers the service-worker registration IIFE at the top of scripts.js, which had
 * ZERO branch coverage: in the main suite jsdom exposes no `navigator.serviceWorker`
 * and runs on http://, so the guard `if (!('serviceWorker' in navigator)) return;`
 * took its early-return 135 times and never once fell through. Every line of the
 * actual registration path was therefore untested.
 *
 * Why this file exists separately: the registration path needs an HTTPS document
 * URL, which is per-file in Jest (`@jest-environment-options`), and it must be set
 * BEFORE scripts.js is required because the IIFE runs at require time.
 *
 * This also restores headroom on the `scripts.js` branch-coverage floor. That
 * threshold is documented in jest.config.js as deliberately "just below the actual
 * measured coverage so the suite locks against regression without bouncing on the
 * boundary" — but coverage had drifted to 44.99% against a 45% floor, i.e. exactly
 * the boundary-bouncing it was written to prevent, which blocked pushes with all
 * 208 tests passing. Adding real coverage is the fix; lowering the floor would
 * discard the regression lock.
 */

describe('scripts.js — service worker registration (HTTPS + supported)', () => {
  let registerMock;

  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = '';

    // jsdom provides no serviceWorker container at all.
    registerMock = jest.fn(() => Promise.resolve({ scope: '/' }));
    Object.defineProperty(window.navigator, 'serviceWorker', {
      value: { register: registerMock, ready: Promise.resolve() },
      configurable: true,
      writable: true,
    });

    // Minimal globals the rest of scripts.js touches on load.
    global.IntersectionObserver = class {
      constructor(cb) { this._cb = cb; }
      observe() {} unobserve() {} disconnect() {}
    };
    global.requestAnimationFrame = (cb) => { setTimeout(() => cb(0), 0); return 1; };
    window.matchMedia = window.matchMedia || function (query) {
      return {
        matches: false, media: query, onchange: null,
        addListener() {}, removeListener() {},
        addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; },
      };
    };
  });

  afterEach(() => {
    delete window.navigator.serviceWorker;
  });

  test('registers /service-worker.js at root scope when the document is already complete', () => {
    Object.defineProperty(document, 'readyState', {
      value: 'complete', configurable: true,
    });

    require('./scripts.js');

    expect(registerMock).toHaveBeenCalled();
    const [url, opts] = registerMock.mock.calls[0];
    // Scope matters: a narrower scope would silently stop the SW controlling the
    // whole marketing site.
    expect(url).toBe('/service-worker.js');
    expect(opts).toEqual({ scope: '/' });
  });

  test('defers registration to the load event when the document is still loading', () => {
    Object.defineProperty(document, 'readyState', {
      value: 'loading', configurable: true,
    });

    require('./scripts.js');

    // Deferred on purpose so registration never blocks first paint on slow
    // connections — it must NOT have fired yet.
    expect(registerMock).not.toHaveBeenCalled();

    window.dispatchEvent(new window.Event('load'));
    expect(registerMock).toHaveBeenCalledWith('/service-worker.js', { scope: '/' });
  });

  test('a rejected registration is swallowed and never becomes an unhandled rejection', async () => {
    Object.defineProperty(document, 'readyState', {
      value: 'complete', configurable: true,
    });
    registerMock.mockImplementation(() => Promise.reject(new Error('boom')));

    expect(() => require('./scripts.js')).not.toThrow();
    // Let the rejection settle; the .catch() inside scripts.js must absorb it.
    await Promise.resolve();
    await Promise.resolve();
    expect(registerMock).toHaveBeenCalled();
  });

  test('a synchronous throw from register() does not break page bootstrap', () => {
    Object.defineProperty(document, 'readyState', {
      value: 'complete', configurable: true,
    });
    // Some origins (disabled SW, sandboxed iframes) throw synchronously rather
    // than returning a rejected promise — scripts.js wraps this in try/catch.
    registerMock.mockImplementation(() => { throw new Error('disabled origin'); });

    expect(() => require('./scripts.js')).not.toThrow();
  });
});
