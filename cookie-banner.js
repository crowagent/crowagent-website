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

/* A6 — 2026-05-21 — Accessibility: cookie banner controls should not be
   the first 4 tab stops on page load. Set tabindex="-1" by default + set
   to 0 only when user has scrolled past hero OR has interacted with the
   banner. The skip-link + nav remain first in the tab order. */
(function caCookieTabindexDefer(){
  if (window.__caCookieTabindexDeferLoaded) return;
  window.__caCookieTabindexDeferLoaded = true;
  function setTabindex(value) {
    var b = document.getElementById('ca-cookie');
    if (!b) return;
    b.querySelectorAll('button,a,input').forEach(function(el){
      el.setAttribute('tabindex', value);
    });
  }
  function activate() { setTabindex('0'); window.removeEventListener('scroll', onScroll); }
  function onScroll(){ if (window.scrollY > 200) activate(); }
  if (document.readyState !== 'loading') queueMicrotask(function(){ setTabindex('-1'); window.addEventListener('scroll', onScroll, { passive: true }); setTimeout(activate, 8000); });
  else document.addEventListener('DOMContentLoaded', function(){ setTabindex('-1'); window.addEventListener('scroll', onScroll, { passive: true }); setTimeout(activate, 8000); });
})();
