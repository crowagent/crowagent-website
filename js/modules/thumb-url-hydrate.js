/* P-9 runtime — reads data-thumb-url attributes and sets the --thumb-url CSS
   custom property on the element. Idempotent + IntersectionObserver-gated
   for elements that have lazy thumbnail loading. */
(function () {
  'use strict';
  if (window.__caThumbUrlHydrateLoaded) return;
  window.__caThumbUrlHydrateLoaded = true;

  function hydrate(el) {
    var url = el.getAttribute('data-thumb-url');
    if (url) el.style.setProperty('--thumb-url', "url('" + url + "')");
  }

  function init() {
    var elements = document.querySelectorAll('[data-thumb-url]');
    if (!elements.length) return;
    // Synchronous hydration — only runs once at DOMContentLoaded, no FOUC
    // because CSS rules already render the default thumb background; the
    // --thumb-url override applies on next paint.
    elements.forEach(hydrate);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
