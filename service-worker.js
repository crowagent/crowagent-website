// RESET / SELF-HEAL SERVICE WORKER (owner 2026-05-31)
// =====================================================================
// WHY: a previously-registered service worker was serving STALE cached
// CSS/JS (cache-first), so site updates — incl. the new homepage hero —
// did not reach browsers even after a hard refresh (a hard refresh does
// NOT bypass an active SW). Bumping the cache name alone wasn't reliably
// taking over.
//
// WHAT: this version takes control immediately (skipWaiting + claim),
// DELETES every cache, and then serves everything NETWORK-ONLY (it does
// not intercept fetches with cache). Net effect: the stale cache is gone
// and every request hits the network, so the site is always fresh.
// Offline pre-caching is intentionally dropped for now (pre-launch, no
// customers); a proper caching SW can be reintroduced later if wanted.
// =====================================================================

const APP_VERSION = '52';

self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) { return Promise.all(keys.map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});

// No fetch handler that calls respondWith() → the browser performs its
// normal network fetch for every request (no SW caching). This guarantees
// fresh content. (Intentionally a no-op pass-through.)
