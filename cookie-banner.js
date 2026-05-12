/**
 * Root cookie-banner.js — backward-compatible shim.
 *
 * WS-AUDIT-028 (2026-05-10): all logic (banner DOM injection, first-load
 * show, public consent API) consolidated into /js/cookie-banner.js as
 * the single source of truth. This file remains a 1-liner shim solely
 * to avoid breaking the 59 existing <script src="/cookie-banner.js">
 * references across HTML pages — replacing every reference would be a
 * cross-cutting risk for a no-code-change refactor.
 *
 * Idempotency: /js/cookie-banner.js itself uses a __caCookieBannerLoaded
 * guard, so loading it twice (e.g. via this shim AND a stale explicit
 * include) cannot double-init the banner.
 */
(function () {
  'use strict';
  if (window.__caCookieShimLoaded) return;
  window.__caCookieShimLoaded = true;
  if (document.querySelector('script[data-ca-cookie-impl]')) return;
  var s = document.createElement('script');
  s.src = '/js/cookie-banner.js';
  s.defer = true;
  s.setAttribute('data-ca-cookie-impl', '1');
  document.head.appendChild(s);
})();
