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
    if (el.style.opacity && parseFloat(el.style.opacity) < 1) el.style.opacity = '';
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

  function ready(fn) {
    if (document.readyState !== 'loading') return fn();
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  }

  ready(function () {
    function pass() { refreshGSAP(); observeAll(); sweep(); }
    pass();
    [300, 800, 1500].forEach(function (t) { setTimeout(pass, t); }); // catch late layout/fonts
    // Hero rescue runs slightly later so a healthy entrance fade can complete first.
    [800, 1400, 2500].forEach(function (t) { setTimeout(heroRescue, t); });
    window.addEventListener('load', function () { pass(); heroRescue(); });

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { sweep(); heroRescue(); ticking = false; });
    }, { passive: true });

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(pass, 200);
    }, { passive: true });
  });
})();
