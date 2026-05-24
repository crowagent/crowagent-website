/**
 * lottie-cache.js — ISSUE-007 fix (Cluster Gamma 2026-05-22)
 *
 * Singleton cache for Lottie animation JSON. Pre-fetches each animation
 * URL once and exposes the resolved JSON to every caller, eliminating the
 * 10× network fetch of `arrow-right-stroke.json` observed on the homepage
 * (one fetch per `.lottie-arrow` CTA host).
 *
 * Public API on `window.CALottieCache`:
 *   - getAnimationData(kind: string) => Promise<object>
 *       Returns the cached JSON for a known animation key.
 *       Keys: 'arrow-right-stroke' | 'checkmark-bounce' | 'loading-dots'.
 *
 * Pattern: ES5 IIFE, window guards, no exports — matches the existing
 * /js/modules/* convention. Idempotent via `__caLottieCacheLoaded`.
 */
(function () {
  'use strict';
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window.__caLottieCacheLoaded) return;
  window.__caLottieCacheLoaded = true;

  var ASSET_BASE = '/Assets/lottie/';
  var REGISTRY = {
    'arrow-right-stroke': ASSET_BASE + 'arrow-right-stroke.json',
    'checkmark-bounce': ASSET_BASE + 'checkmark-bounce.json',
    'loading-dots': ASSET_BASE + 'loading-dots.json'
  };

  /* In-flight + resolved cache. Maps `kind` → Promise<JSON>. */
  var cache = Object.create(null);

  function fetchAnimation(kind) {
    var url = REGISTRY[kind];
    if (!url) return Promise.reject(new Error('Unknown lottie kind: ' + kind));
    if (cache[kind]) return cache[kind];
    cache[kind] = fetch(url, { credentials: 'same-origin' })
      .then(function (resp) {
        if (!resp.ok) throw new Error('lottie-cache: HTTP ' + resp.status + ' for ' + url);
        return resp.json();
      })
      .catch(function (err) {
        /* Invalidate cache on failure so the next attempt can retry. */
        delete cache[kind];
        throw err;
      });
    return cache[kind];
  }

  window.CALottieCache = {
    getAnimationData: fetchAnimation,
    /* Test helper — list known keys. Not used in production code. */
    keys: function () { return Object.keys(REGISTRY); }
  };
})();
