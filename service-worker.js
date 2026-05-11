// === CC1 cross-cutting closer 10-05 ===
// WS-AUDIT-036 — service worker cache strategy upgrade.
//
// PRIOR STATE (v82):
//   - Single cache, single strategy per request mode.
//   - Navigations: network-then-cache.
//   - Assets: cache-first (with naive background revalidation).
//   - Cache list mixed critical shell with 30+ marketing pages — bloats
//     the install step and any byte change to a single page invalidated
//     the whole cache.
//
// NEW STATE (v83):
//   1. PRECACHE only the critical shell:
//        - / (root navigation fallback)
//        - /index.html
//        - /styles.min.css?v=83  (bumped in lock-step with HTML)
//        - /scripts.min.js?v=83
//        - /Assets/brand/crowagent_wordmark_transparent_560x140.png
//        - /favicon.ico, /manifest.json
//      Everything else is fetched on-demand and cached opportunistically.
//
//   2. STALE-WHILE-REVALIDATE for SVG mockups + screenshots
//      (anything matching /Assets/**.svg or /Assets/**.png/.webp/.jpg).
//      Returns the cached copy immediately, refreshes in background.
//      This is the ideal pattern for design assets that change rarely
//      and do not need to be byte-perfect on every load.
//
//   3. NETWORKFIRST for API endpoints (/api/*, /status.json, formspree.io,
//      crowagent-platform-production.up.railway.app/api/*).
//      Honours fresh data, falls back to cache on network failure.
//
//   4. NAVIGATION (HTML): network-first (unchanged) → falls back to the
//      cached /index.html shell when offline.
//
// Self-update: skipWaiting() in install + clients.claim() in activate so
// new SW versions take over immediately on the next page load — no need
// to close all tabs of crowagent.ai for the update to apply.

// FINAL-2-LCP 2026-05-10 (v89): bumped from v83 to align with the HTML
// cache-buster on the 7 LCP-target pages (index + 6 product landings).
// Critical-shell precache now also includes:
//   - Assets/css/critical-above-fold.css (the source-of-truth for the
//     inline <style> block; cached for offline parity and to give a
//     repeat-visit warm cache).
//   - Assets/screenshots/avif/dashboard-1200.avif (homepage LCP image
//     AVIF sibling — preloaded in index.html <head>; precaching makes
//     the second visit's LCP near-instant).
//   - Assets/fonts/PlusJakartaSans-700.woff2 (heaviest H1 font weight;
//     preloaded on all 7 pages).
const CACHE_NAME = 'crowagent-v89';

// Precache: the smallest shell that lets the homepage render offline,
// PLUS the LCP-critical assets so a repeat visit paints LCP < 500ms.
// All other pages are cached the first time the user visits them.
const PRECACHE = [
  '/',
  '/index.html',
  '/styles.min.css?v=89',
  '/scripts.min.js?v=89',
  '/Assets/css/critical-above-fold.css',
  '/Assets/fonts/PlusJakartaSans-700.woff2',
  '/Assets/screenshots/avif/dashboard-1200.avif',
  '/manifest.json',
  '/favicon.ico',
  '/Assets/brand/crowagent_wordmark_transparent_560x140.png'
];

// Patterns for stale-while-revalidate (design assets).
function isStaleWhileRevalidate(url) {
  return /\/Assets\/.+\.(svg|png|webp|jpg|jpeg|gif|avif)(\?|$)/i.test(url) ||
         /\/Assets\/screenshots\//i.test(url);
}

// Patterns for network-first (live data / form submissions).
function isNetworkFirst(url) {
  return /\/api\//i.test(url) ||
         /\/status\.json(\?|$)/i.test(url) ||
         /formspree\.io/i.test(url) ||
         /crowagent-platform-production\.up\.railway\.app/i.test(url);
}

self.addEventListener('install', event => {
  // FINAL-2-LCP 2026-05-10: addAll() retained for compatibility with the
  // jest tests in tests/unit/service-worker.test.js (the test mock only
  // exposes addAll/put/match, not the per-URL add()). All 9 PRECACHE
  // URLs are verified-on-disk at SW author time so addAll() reliably
  // succeeds. If a future URL is added that may be optional, move only
  // that entry to a separate best-effort cache.put() step inside the
  // .then() chain so it cannot break the install rollup.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return; // never cache mutations

  const url = request.url;

  // 1. NAVIGATIONS: network-first → /index.html offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(response => {
        if (response && response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
        }
        return response;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 2. NETWORKFIRST: API + status.json + form endpoints
  if (isNetworkFirst(url)) {
    event.respondWith(
      fetch(request).then(response => {
        if (response && response.ok && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(() => caches.match(request))
    );
    return;
  }

  // 3. STALE-WHILE-REVALIDATE: design assets (SVGs, screenshots, brand PNGs)
  if (isStaleWhileRevalidate(url)) {
    event.respondWith(
      caches.match(request).then(cached => {
        const networkFetch = fetch(request).then(response => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        }).catch(() => cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  // 4. DEFAULT: cache-first → network with opportunistic refresh
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) {
        // Background refresh
        fetch(request).then(response => {
          if (response && response.ok) {
            const bgClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, bgClone));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.ok && networkResponse.type === 'basic') {
          const netClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, netClone));
        }
        return networkResponse;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
