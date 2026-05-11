/* H3-FIGMA-WAVE-F-P2 10-10 (2026-05-10) — Lottie CTA micro-interactions
 *
 * Wires the .lottie-arrow / .lottie-success / .lottie-loading placeholders
 * to lottie-web (CDNJS, CSP-allowed). On hover of a primary CTA the arrow
 * Lottie plays once. On a form-success state ([data-show="true"]) the
 * checkmark plays. Reduced-motion users get a static SVG fallback.
 *
 * IIFE / ES5 / window+document guards / no exports — matches the existing
 * js/modules/* pattern.
 */
(function () {
  'use strict';
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  var ASSET_BASE = '/Assets/lottie/';
  var LIB_URL = 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.13.0/lottie_light.min.js';
  var ANIMS = {
    'arrow-right-stroke': ASSET_BASE + 'arrow-right-stroke.json',
    'checkmark-bounce': ASSET_BASE + 'checkmark-bounce.json',
    'loading-dots': ASSET_BASE + 'loading-dots.json'
  };

  var reduceMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  function staticFallback(host, kind) {
    /* SVG fallback — same teal stroke colour as the Lottie. */
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    var path = document.createElementNS(svgNS, 'path');
    if (kind === 'checkmark-bounce') {
      path.setAttribute('d', 'M5 12l5 5L20 7');
    } else {
      /* arrow-right-stroke + loading-dots default: arrow */
      path.setAttribute('d', 'M5 12h14M13 6l6 6-6 6');
    }
    svg.appendChild(path);
    host.appendChild(svg);
  }

  var libLoadingPromise = null;
  function loadLib() {
    if (window.lottie) return Promise.resolve(window.lottie);
    if (libLoadingPromise) return libLoadingPromise;
    libLoadingPromise = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = LIB_URL;
      s.async = true;
      s.crossOrigin = 'anonymous';
      s.onload = function () { resolve(window.lottie); };
      s.onerror = function () { reject(new Error('lottie-web failed to load')); };
      document.head.appendChild(s);
    });
    return libLoadingPromise;
  }

  /* Per-element bookkeeping: { el, anim, kind } */
  var registry = [];

  function buildAnim(host, kind) {
    var url = ANIMS[kind];
    if (!url) return;
    /* Reduced-motion → static SVG, no JS runtime cost */
    if (reduceMQ.matches) {
      host.classList.add('lottie-static');
      staticFallback(host, kind);
      return;
    }
    /* Optimistic SVG fallback while lottie-web loads (also covers
       CSP / network failure — SVG stays if lib never resolves). */
    host.classList.add('lottie-loading-state');
    staticFallback(host, kind);

    loadLib().then(function (lottie) {
      if (!lottie) return;
      /* Remove the SVG fallback */
      while (host.firstChild) host.removeChild(host.firstChild);
      host.classList.remove('lottie-loading-state');
      var anim = lottie.loadAnimation({
        container: host,
        renderer: 'svg',
        loop: kind === 'loading-dots',
        autoplay: kind === 'loading-dots',
        path: url
      });
      registry.push({ el: host, anim: anim, kind: kind });
    }).catch(function (err) {
      /* Leave the SVG fallback in place; log via console.error per the
         project's structured-logging guidance. */
      try {
        console.error(JSON.stringify({
          level: 'error', service: 'lottie-cta',
          operation: 'load-lib', error: String((err && err.message) || err),
          timestamp: new Date().toISOString()
        }));
      } catch (e) {}
    });
  }

  function findAnim(el) {
    for (var i = 0; i < registry.length; i++) {
      if (registry[i].el === el) return registry[i];
    }
    return null;
  }

  function attachHoverPlay(btn) {
    var host = btn.querySelector('.lottie-arrow');
    if (!host) return;
    function play() {
      var rec = findAnim(host);
      if (!rec || !rec.anim) return;
      try { rec.anim.stop(); rec.anim.play(); } catch (e) {}
    }
    btn.addEventListener('mouseenter', play);
    btn.addEventListener('focus', play);
  }

  function watchSuccess(host) {
    /* Trigger checkmark when [data-show="true"] is set on the host. */
    var rec = findAnim(host);
    var fired = false;
    function check() {
      if (fired) return;
      if (host.getAttribute('data-show') === 'true') {
        fired = true;
        if (rec && rec.anim) {
          try { rec.anim.stop(); rec.anim.play(); } catch (e) {}
        }
      }
    }
    /* Initial + observed mutations */
    check();
    if (typeof MutationObserver !== 'undefined') {
      var mo = new MutationObserver(check);
      mo.observe(host, { attributes: true, attributeFilter: ['data-show'] });
    }
  }

  function init() {
    var hosts = document.querySelectorAll('[data-lottie]');
    if (!hosts || !hosts.length) return;
    for (var i = 0; i < hosts.length; i++) {
      var h = hosts[i];
      var kind = h.getAttribute('data-lottie');
      buildAnim(h, kind);
    }
    /* Wire hover on all .btn-primary-v2 with a .lottie-arrow */
    var btns = document.querySelectorAll('.btn-primary-v2');
    for (var j = 0; j < btns.length; j++) attachHoverPlay(btns[j]);
    /* Wire success-state hosts */
    var successHosts = document.querySelectorAll('.lottie-success[data-lottie="checkmark-bounce"]');
    for (var k = 0; k < successHosts.length; k++) watchSuccess(successHosts[k]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
