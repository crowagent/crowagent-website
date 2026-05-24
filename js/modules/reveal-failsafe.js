/**
 * Reveal fail-safe (2026-05-24).
 *
 * The homepage layers several scroll-reveal systems:
 *   - GSAP ScrollTrigger (section-motion-choreography.js / premium-motion.js)
 *   - native IntersectionObserver (stripe-motion-system.js -> .in-view)
 *   - sf17-scroll-reveal.js (-> .is-revealed)
 * After content was pulled in from the legacy build the section order/heights
 * changed, leaving some sections stuck at opacity:0 because (a) GSAP
 * ScrollTrigger positions went stale (no refresh after layout changed) and
 * (b) the existing IntersectionObserver missed a few targets.
 *
 * Principle: animation is an enhancement; content must NEVER stay hidden.
 * Belt-and-suspenders, without disturbing working animations (only acts on
 * elements a system left un-revealed):
 *   - refreshGSAP(): fixes stale GSAP ScrollTrigger positions once layout settles.
 *   - An IntersectionObserver reveals reveal-tagged elements as they enter view.
 *   - A throttled scroll/raf geometric sweep catches any element the observers
 *     miss (e.g. the final CTA band).
 *   - Reveal = add the classes the CSS already expects (.in-view / .is-revealed)
 *     and clear a stuck inline opacity:0.
 */
(function () {
  'use strict';
  var SEL = '.stripe-reveal:not(.in-view), .sf17-reveal:not(.is-revealed), [class*="reveal"]:not(.in-view):not(.is-revealed)';

  function refreshGSAP() {
    try {
      if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
        window.ScrollTrigger.refresh();
      }
    } catch (e) { /* no-op */ }
  }

  function reveal(el) {
    el.classList.add('in-view', 'is-revealed');
    // Clear a stuck inline opacity AND visibility. GSAP autoAlpha leaves both
    // (opacity:0 + visibility:hidden) inline; clearing only opacity would still
    // leave the element visibility:hidden (observed on the homepage .hp-cta-band).
    if (el.style.opacity && parseFloat(el.style.opacity) < 1) el.style.opacity = '';
    if (el.style.visibility === 'hidden') el.style.visibility = '';
  }

  /* Product-hero rescue (2026-05-24).
   * On product pages the hero figure (.hero-visual) and the readiness widget
   * (.product-mockup-widget) animate in via GSAP fromTo({autoAlpha:0}). The
   * WebGL hero-mesh issues synchronous readPixels that stall the GPU and starve
   * the GSAP ticker, so those tweens don't advance until ~window.load — leaving
   * the bulk of the hero blank for 3–6s. These elements have no "reveal" class,
   * so the selector above never touches them. Force them visible if still fully
   * stuck (opacity≈0 / visibility:hidden); the opacity guard means a healthy
   * in-progress fade (opacity>0) is left alone. Scoped to .hero-product so the
   * homepage hero is unaffected. */
  var HERO_SEL = '.hero-product .hero-visual, .hero-product .product-mockup-widget';
  function heroRescue() {
    document.querySelectorAll(HERO_SEL).forEach(function (el) {
      var cs = getComputedStyle(el);
      if (parseFloat(cs.opacity) >= 0.01 && cs.visibility !== 'hidden') return; // visible or mid-fade — leave it
      if (window.gsap) {
        try {
          window.gsap.killTweensOf(el);
          window.gsap.set(el, { autoAlpha: 1, scale: 1, y: 0, clearProps: 'transform' });
          return;
        } catch (e) { /* fall through to manual clear */ }
      }
      el.style.opacity = '1';
      el.style.visibility = 'visible';
      el.style.transform = 'none';
    });
  }

  var io = (typeof IntersectionObserver !== 'undefined')
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
        });
      }, { threshold: 0, rootMargin: '0px 0px 10% 0px' })
    : null;

  function observeAll() {
    document.querySelectorAll(SEL).forEach(function (el) {
      if (el.getBoundingClientRect().height === 0) return;
      if (io) io.observe(el); else reveal(el);
    });
  }

  // Geometric catch-all: reveal anything in/near the viewport an observer missed.
  function sweep() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    document.querySelectorAll(SEL).forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.height === 0) return;
      if (r.top < vh && r.bottom > 0) reveal(el);
    });
  }

  /* Force-visible catch-all (2026-05-24).
   * Adding .in-view / .is-revealed is not enough when the CSS reveal rule itself
   * fails to win (e.g. .stripe-reveal.in-view{opacity:1} dropped by PurgeCSS or
   * out-specified) — observed on the homepage: .hero-demo-section had in-view +
   * is-revealed yet stayed opacity:0, and #live-demo / .hp-cta-band never revealed
   * because they had height:0 when first observed. Belt-and-suspenders: any
   * reveal-tagged element that has scrolled meaningfully into view (top above 60%
   * of the viewport, or already scrolled past) but is still effectively invisible
   * gets its visibility forced inline. Geometric gate => a healthy in-progress
   * fade (which has only just crossed the bottom edge) is never snapped. */
  /* Content containers too: GSAP autoAlpha (section-motion-choreography) can leave
     a <section>/<article> stuck at opacity:0 with no reveal-class hook (observed on
     privacy/terms legal bodies — content invisible). Any in-view content block that
     is effectively invisible must be forced visible. */
  var FORCE_SEL = '.stripe-reveal, .sf17-reveal, [class*="reveal"], main section, main article, [class*="-section"], [class*="-article"]';
  function forceVisibleStuck() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    document.querySelectorAll(FORCE_SEL).forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.height < 8) return;
      // Skip only if it has NOT meaningfully entered view: top still below 60% AND
      // bottom still past the viewport (element entering from the bottom — leave it
      // to the normal fade). A bottom-pinned final band sits low but is fully in
      // view (bottom <= vh) and the page cannot scroll it higher, so still force it.
      if (r.top > vh * 0.6 && r.bottom > vh) return;
      var cs = getComputedStyle(el);
      if (parseFloat(cs.opacity) < 0.05 || cs.visibility === 'hidden') {
        reveal(el);
        // Some of these are driven by a GSAP ScrollTrigger whose trigger never
        // fires, so it re-applies autoAlpha:0 on every tick and overwrites a plain
        // inline set. Kill any tween on the element, then write the visible state
        // with !important — inline-!important beats GSAP's non-important inline
        // writes and any stylesheet rule. Last-resort belt: only stuck-in-view
        // elements reach here, so forcing them visible is always correct.
        if (window.gsap) { try { window.gsap.killTweensOf(el); } catch (e) {} }
        el.style.setProperty('opacity', '1', 'important');
        el.style.setProperty('visibility', 'visible', 'important');
        if (cs.transform && cs.transform !== 'none') el.style.setProperty('transform', 'none', 'important');
      }
    });
  }

  function ready(fn) {
    if (document.readyState !== 'loading') return fn();
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  }

  ready(function () {
    function pass() { refreshGSAP(); observeAll(); sweep(); }
    pass();
    [300, 800, 1500].forEach(function (t) { setTimeout(pass, t); }); // catch late layout/fonts
    // Hero rescue + force-visible run slightly later so a healthy entrance fade can complete first.
    [800, 1400, 2500].forEach(function (t) { setTimeout(function () { heroRescue(); forceVisibleStuck(); }, t); });
    window.addEventListener('load', function () { pass(); heroRescue(); forceVisibleStuck(); });

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { sweep(); heroRescue(); forceVisibleStuck(); ticking = false; });
    }, { passive: true });

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(pass, 200);
    }, { passive: true });
  });
})();
