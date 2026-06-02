/**
 * tests/unit/service-worker.test.js — rewritten 2026-06-02.
 *
 * service-worker.js was rewritten (owner 2026-05-31) from a multi-strategy
 * precache/fetch router into a minimal SELF-HEAL / NETWORK-ONLY worker:
 *   - install  → skipWaiting() (take control immediately)
 *   - activate → delete EVERY cache, then clients.claim()
 *   - NO fetch handler (every request hits the network = always fresh)
 * The previous test asserted the old cache-strategy behaviour (CACHE_NAME,
 * respondWith routing) that no longer exists, so it failed. This tests the
 * actual current worker.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const SW_PATH = path.resolve(__dirname, '..', '..', 'service-worker.js');

function buildEnv() {
  const listeners = {};
  const deleted = [];
  const env = {
    skipWaitingCalled: false,
    claimCalled: false,
    cacheKeys: ['crowagent-old-1', 'crowagent-old-2'],
    deleted,
    listeners,
    self: {
      addEventListener(type, handler) { listeners[type] = handler; },
      skipWaiting() { env.skipWaitingCalled = true; },
      clients: { claim() { env.claimCalled = true; return Promise.resolve(); } },
    },
    caches: {
      keys() { return Promise.resolve(env.cacheKeys); },
      delete(k) { deleted.push(k); return Promise.resolve(true); },
    },
  };
  return env;
}

function loadSW(env) {
  global.self = env.self;
  global.caches = env.caches;
  jest.isolateModules(() => { require(SW_PATH); });
}

describe('service-worker — self-heal / network-only', () => {
  let env;
  beforeEach(() => { env = buildEnv(); loadSW(env); });
  afterEach(() => { delete global.self; delete global.caches; });

  test('registers install + activate listeners and NO fetch handler', () => {
    expect(typeof env.listeners.install).toBe('function');
    expect(typeof env.listeners.activate).toBe('function');
    expect(env.listeners.fetch).toBeUndefined();
  });

  test('install: takes control immediately via skipWaiting()', () => {
    env.listeners.install();
    expect(env.skipWaitingCalled).toBe(true);
  });

  test('activate: deletes every cache, then claims clients', async () => {
    let waited;
    env.listeners.activate({ waitUntil(p) { waited = p; } });
    await waited;
    expect(env.deleted).toEqual(env.cacheKeys);
    expect(env.claimCalled).toBe(true);
  });

  test('source is the network-only self-heal worker (no fetch caching handler)', () => {
    const src = fs.readFileSync(SW_PATH, 'utf8');
    // no fetch LISTENER registered (the word "respondWith" still appears in a
    // comment explaining why there is none, so match the registration instead).
    expect(src).not.toMatch(/addEventListener\(\s*['"]fetch['"]/);
    expect(src).toMatch(/skipWaiting/);
    expect(src).toMatch(/clients\.claim/);
  });
});
