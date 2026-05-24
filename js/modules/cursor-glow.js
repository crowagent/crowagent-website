/**
 * Cursor-tracking glow on premium cards (2026-05-23)
 * Stripe Connect pattern — sets --cursor-x and --cursor-y on cards so the
 * CSS radial-gradient `::before` follows the cursor for a premium hover glow.
 * Only attached on devices with hover capability (skips touch).
 */
(function () {
  'use strict';
  if (window.__caCursorGlowLoaded) return;
  window.__caCursorGlowLoaded = true;

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia && !window.matchMedia('(hover: hover)').matches) return;

  function ready(fn) {
    if (document.readyState !== 'loading') return fn();
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  }

  function attachGlow(card) {
    let raf;
    card.addEventListener('mousemove', function (e) {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--cursor-x', x + '%');
        card.style.setProperty('--cursor-y', y + '%');
      });
    });
  }

  function init() {
    const selectors = [
      '.hp-jtbd-path',
      '.hp-trinity__card',
      '.stats .sv-card',
      '.hp-frameworks-list > li',
      '.f10-related-card',
      '.product-mockup-widget',
      // 2026-05-23 — Section-level spotlight follow (Linear blog pattern)
      '.hp-moat',
      '.hp-frameworks-strip',
      '.stats',
    ];
    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(attachGlow);
    });
  }

  ready(init);
})();
