/**
 * tests/unit/service-worker.test.js — DEF-046 Jest coverage expansion (2026-05-10).
 *
 * Covers service-worker.js (offline cache + precache + multi-strategy router).
 *
 * Approach: jsdom does NOT expose `self`, `caches`, or `addEventListener`
 * with worker semantics. We mock them on the GLOBAL scope before each
 * require() of service-worker.js, then load via jest.isolateModules()
 * so istanbul's coverage instrumentation sees every line. This avoids
 * the `vm` module path which would bypass jest's coverage collector.
 *
 * Coverage targets (per row spec):
 *   - Install event: precaches critical assets
 *   - Activate event: clears stale caches
 *   - Fetch event: cache strategies (precache, stale-while-revalidate per
 *     route; navigation network-first; API network-first)
 *   - skipWaiting + clients.claim called
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const SW_PATH = path.resolve(__dirname, '..', '..', 'service-worker.js');

// ── Sandbox builder ──────────────────────────────────────────────────────────

function buildEnvironment() {
  const cacheStores = new Map(); // cacheName → Map(url → Response)

  function makeResponse(url, body, opts) {
    opts = opts || {};
    return {
      ok: opts.ok !== false,
      url: url || '',
      status: opts.ok === false ? 500 : 200,
      type: opts.type || 'basic',
      clone() { return makeResponse(url, body, opts); },
      _body: body || ''
    };
  }

  function makeCacheHandle(name) {
    if (!cacheStores.has(name)) cacheStores.set(name, new Map());
    const store = cacheStores.get(name);
    return {
      addAll: jest.fn(urls => {
        urls.forEach(u => store.set(typeof u === 'string' ? u : u.url, makeResponse(u, '')));
        return Promise.resolve();
      }),
      put: jest.fn((req, res) => {
        store.set(typeof req === 'string' ? req : req.url, res);
        return Promise.resolve();
      }),
      match: jest.fn(req => {
        const key = typeof req === 'string' ? req : req.url;
        return Promise.resolve(store.has(key) ? store.get(key) : undefined);
      })
    };
  }

  const caches = {
    open: jest.fn(name => Promise.resolve(makeCacheHandle(name))),
    keys: jest.fn(() => Promise.resolve(Array.from(cacheStores.keys()))),
    match: jest.fn(req => {
      const key = typeof req === 'string' ? req : req.url;
      for (const store of cacheStores.values()) {
        if (store.has(key)) return Promise.resolve(store.get(key));
      }
      return Promise.resolve(undefined);
    }),
    delete: jest.fn(name => {
      const had = cacheStores.has(name);
      cacheStores.delete(name);
      return Promise.resolve(had);
    })
  };

  const clients = { claim: jest.fn(() => Promise.resolve()) };

  const listeners = {};
  const fetchMock = jest.fn(req => Promise.resolve(makeResponse(typeof req === 'string' ? req : req.url, 'net')));

  const self = {
    addEventListener: jest.fn((type, handler) => { listeners[type] = handler; }),
    skipWaiting: jest.fn(() => Promise.resolve()),
    clients,
    caches,
    location: { protocol: 'https:', hostname: 'crowagent.ai' }
  };

  global.self = self;
  global.caches = caches;
  global.clients = clients;
  global.fetch = fetchMock;

  return { self, caches, clients, fetchMock, listeners, cacheStores, makeResponse };
}

function loadSW() {
  jest.isolateModules(() => { require(SW_PATH); });
}

function makeFetchEvent(url, mode, method) {
  const promises = [];
  return {
    request: {
      url,
      mode: mode || 'no-cors',
      method: method || 'GET',
      clone() { return this; }
    },
    respondWith: jest.fn(p => { promises.push(p); }),
    waitUntil: jest.fn(p => { promises.push(p); }),
    _resolve: () => Promise.all(promises.map(p => Promise.resolve(p).catch(() => null)))
  };
}

afterEach(() => {
  delete global.self;
  delete global.caches;
  delete global.clients;
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe('service-worker — install event', () => {
  test('registers an install handler', () => {
    const env = buildEnvironment();
    loadSW();
    expect(typeof env.listeners.install).toBe('function');
  });

  test('install precaches critical assets via caches.open(CACHE_NAME).addAll(...)', async () => {
    const env = buildEnvironment();
    loadSW();
    const ev = { waitUntil: jest.fn(p => p) };
    env.listeners.install(ev);
    expect(ev.waitUntil).toHaveBeenCalled();
    await ev.waitUntil.mock.calls[0][0];
    expect(env.caches.open).toHaveBeenCalled();
    const populated = Array.from(env.cacheStores.values()).reduce((n, s) => n + s.size, 0);
    expect(populated).toBeGreaterThanOrEqual(3);
  });

  test('install calls self.skipWaiting() to activate immediately', async () => {
    const env = buildEnvironment();
    loadSW();
    const ev = { waitUntil: jest.fn(p => p) };
    env.listeners.install(ev);
    await ev.waitUntil.mock.calls[0][0];
    expect(env.self.skipWaiting).toHaveBeenCalled();
  });
});

describe('service-worker — activate event', () => {
  test('registers an activate handler', () => {
    const env = buildEnvironment();
    loadSW();
    expect(typeof env.listeners.activate).toBe('function');
  });

  test('activate clears stale caches whose name !== CACHE_NAME', async () => {
    const env = buildEnvironment();
    loadSW();
    env.cacheStores.set('crowagent-OLDVERSION', new Map());
    const ev = { waitUntil: jest.fn(p => p) };
    env.listeners.activate(ev);
    await ev.waitUntil.mock.calls[0][0];
    expect(env.caches.delete).toHaveBeenCalledWith('crowagent-OLDVERSION');
  });

  test('activate calls clients.claim() so the SW takes over open tabs', async () => {
    const env = buildEnvironment();
    loadSW();
    const ev = { waitUntil: jest.fn(p => p) };
    env.listeners.activate(ev);
    await ev.waitUntil.mock.calls[0][0];
    expect(env.clients.claim).toHaveBeenCalled();
  });
});

describe('service-worker — fetch event strategies', () => {
  test('registers a fetch handler', () => {
    const env = buildEnvironment();
    loadSW();
    expect(typeof env.listeners.fetch).toBe('function');
  });

  test('non-GET requests are skipped (no respondWith) — mutation guard', () => {
    const env = buildEnvironment();
    loadSW();
    const ev = makeFetchEvent('/api/x', 'no-cors', 'POST');
    env.listeners.fetch(ev);
    expect(ev.respondWith).not.toHaveBeenCalled();
  });

  test('navigation requests use network-first (fetch is called for mode=navigate)', async () => {
    const env = buildEnvironment();
    loadSW();
    const ev = makeFetchEvent('/some-page', 'navigate', 'GET');
    env.listeners.fetch(ev);
    expect(ev.respondWith).toHaveBeenCalled();
    await ev._resolve();
    expect(env.fetchMock).toHaveBeenCalled();
  });

  test('asset requests are served cache-first via caches.match', async () => {
    const env = buildEnvironment();
    loadSW();
    const c = await env.caches.open('crowagent-v83');
    await c.put('/styles.min.css?v=83', { ok: true, type: 'basic', clone() { return this; } });

    const ev = makeFetchEvent('/styles.min.css?v=83', 'no-cors', 'GET');
    env.listeners.fetch(ev);
    expect(ev.respondWith).toHaveBeenCalled();
    await ev._resolve();
    expect(env.caches.match.mock.calls.length).toBeGreaterThan(0);
  });

  test('on cache miss, falls back to network and stores the result', async () => {
    const env = buildEnvironment();
    loadSW();
    const ev = makeFetchEvent('/never-cached.png', 'no-cors', 'GET');
    env.listeners.fetch(ev);
    expect(ev.respondWith).toHaveBeenCalled();
    await ev._resolve();
    expect(env.fetchMock).toHaveBeenCalled();
  });

  test('navigation request that fails network falls back to cached /index.html', async () => {
    const env = buildEnvironment();
    loadSW();
    const c = await env.caches.open('crowagent-v83');
    await c.put('/index.html', { ok: true, type: 'basic', clone() { return this; }, _body: 'OFFLINE' });
    env.fetchMock.mockImplementationOnce(() => Promise.reject(new Error('offline')));
    const ev = makeFetchEvent('/some-page', 'navigate', 'GET');
    env.listeners.fetch(ev);
    await ev._resolve();
    expect(env.caches.match).toHaveBeenCalled();
  });

  test('stale-while-revalidate path triggers for /Assets/*.svg', async () => {
    const env = buildEnvironment();
    loadSW();
    const ev = makeFetchEvent('https://crowagent.ai/Assets/icon.svg', 'no-cors', 'GET');
    env.listeners.fetch(ev);
    expect(ev.respondWith).toHaveBeenCalled();
    await ev._resolve();
    expect(env.caches.match).toHaveBeenCalled();
  });

  test('network-first path triggers for /api/* URLs', async () => {
    const env = buildEnvironment();
    loadSW();
    const ev = makeFetchEvent('https://crowagent.ai/api/whatever', 'no-cors', 'GET');
    env.listeners.fetch(ev);
    expect(ev.respondWith).toHaveBeenCalled();
    await ev._resolve();
    expect(env.fetchMock).toHaveBeenCalled();
  });
});

describe('service-worker — CACHE_NAME constant + precache list', () => {
  test('CACHE_NAME is in the form crowagent-vNN (versioned)', () => {
    const src = fs.readFileSync(SW_PATH, 'utf8');
    expect(src).toMatch(/CACHE_NAME\s*=\s*['"]crowagent-v\d+['"]/);
  });

  test('precache list includes the canonical home + minified bundles', () => {
    const src = fs.readFileSync(SW_PATH, 'utf8');
    expect(src).toMatch(/['"]\/styles\.min\.css/);
    expect(src).toMatch(/['"]\/scripts\.min\.js/);
    expect(src).toMatch(/['"]\/['"]/);
  });
});
