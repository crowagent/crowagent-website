/* ============================================================
   sf23-counters.js
   Sitewide "always-playing" pulse for visible stats.

   Scope:
     - .sc-num, .u-stat-number, .counter, .hhc-number
     - .sf18-api-stat strong, .sf18-stat-number, .sf18-stat strong
     - elements with [data-pulse], [data-stat], [data-counter]

   Behaviour:
     - On DOMContentLoaded, scans for stat-like nodes.
     - Skips elements already marked, hidden, or counting via
       IntersectionObserver counters (those keep their own anim).
     - Adds class .sf23-pulse-num so always-playing-sf23.css
       drives the keyframes.
     - Re-runs on a MutationObserver so dynamic content (carousel
       re-renders, htmx swaps, etc.) gets the pulse too.
   ============================================================ */

(function () {
  'use strict';

  if (typeof document === 'undefined') return;

  // Selectors covering every stat-shaped element on the site.
  var STAT_SELECTOR = [
    '.sc-num',
    '.u-stat-number',
    '.counter',
    '.hhc-number',
    '.sf18-api-stat strong',
    '.sf18-stat-number',
    '.sf18-stat strong',
    '.sf21-stat-number',
    '.metric-number',
    '.stat-number',
    '.stat-value',
    '.kpi-value',
    '[data-pulse]',
    '[data-stat]',
    '[data-counter]'
  ].join(',');

  // Honour reduced motion at runtime as well as via CSS.
  var prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function shouldSkip(el) {
    if (!el || el.nodeType !== 1) return true;
    if (el.classList.contains('sf23-pulse-num')) return true;
    if (el.classList.contains('sf23-pulse-num--applied')) return true;
    // Elements that already animate (counter-up libraries) usually toggle
    // a data attribute when finished — leave both states alone.
    if (el.dataset && el.dataset.target && !el.dataset.counted) return true;
    return false;
  }

  function tagElement(el) {
    if (shouldSkip(el)) return;
    el.classList.add('sf23-pulse-num');
    el.classList.add('sf23-pulse-num--applied');

    // Tier the pulse: big hero numbers get the slow drift; tiny
    // delta chips get the fast heartbeat.
    var fontSize = 0;
    try {
      fontSize = parseFloat(
        window.getComputedStyle(el).fontSize || '14'
      );
    } catch (_e) {
      fontSize = 14;
    }
    if (fontSize >= 40) {
      el.classList.add('sf23-pulse-num--slow');
    } else if (fontSize <= 14) {
      el.classList.add('sf23-pulse-num--fast');
    }
  }

  function run(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var nodes = scope.querySelectorAll(STAT_SELECTOR);
    for (var i = 0; i < nodes.length; i++) {
      tagElement(nodes[i]);
    }
  }

  function start() {
    if (prefersReduced) return; // CSS already silences keyframes, skip work
    run(document);

    // Re-pulse on dynamic DOM changes (carousel swaps, blog filtering, etc.)
    if (typeof MutationObserver === 'function') {
      var mo = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var m = mutations[i];
          if (m.addedNodes && m.addedNodes.length) {
            for (var j = 0; j < m.addedNodes.length; j++) {
              var n = m.addedNodes[j];
              if (n && n.nodeType === 1) {
                if (n.matches && n.matches(STAT_SELECTOR)) tagElement(n);
                if (n.querySelectorAll) run(n);
              }
            }
          }
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
