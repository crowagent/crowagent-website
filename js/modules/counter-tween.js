/**
 * Counter tween (2026-05-23) — number count-up on viewport entry.
 * Stripe.com pattern. Stats numbers tween from 0 → target over 1.5s when
 * scrolled into view. Supports prefixes (£), suffixes (%, +, K, M, B).
 * Respects prefers-reduced-motion (renders final value instantly).
 *
 * Targets:
 *   <span data-counter-to="150" data-counter-prefix="£" data-counter-suffix="K">£150K</span>
 *   <span data-counter-to="10" data-counter-suffix="%">10%</span>
 *   <span class="counter" data-target="2028">2028</span>
 *   <span class="u-stat-number">£170B+</span> (parses numeric, preserves suffix)
 */
(function () {
  'use strict';
  if (window.__caCounterTweenLoaded) return;
  window.__caCounterTweenLoaded = true;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function parseTarget(el) {
    if (el.dataset.counterTo) return { value: parseFloat(el.dataset.counterTo), prefix: el.dataset.counterPrefix || '', suffix: el.dataset.counterSuffix || '' };
    if (el.dataset.target) return { value: parseFloat(el.dataset.target), prefix: el.dataset.prefix || '', suffix: el.dataset.suffix || '' };
    // Try parsing from text content
    var txt = el.textContent.trim();
    var m = txt.match(/^([^\d\-+]*)([\d,.]+)([\w%+]*)/);
    if (!m) return null;
    var num = parseFloat(m[2].replace(/,/g, ''));
    if (isNaN(num)) return null;
    return { value: num, prefix: m[1] || '', suffix: m[3] || '' };
  }

  function formatValue(value, prefix, suffix) {
    var rounded = Math.round(value);
    var formatted = rounded.toLocaleString('en-GB');
    return prefix + formatted + suffix;
  }

  // CR-01 (2026-07-14): render the exact FINAL figure. The static DOM text
  // already carries the real figure (e.g. "£150K"); this restores it after
  // any partial/interrupted tween so the element can NEVER rest at 0.
  function finalize(el, target) {
    el.textContent = formatValue(target.value, target.prefix, target.suffix);
  }

  function tween(el, target) {
    // No motion (reduced-motion or no rAF) → show the real figure instantly.
    if (reduced || typeof requestAnimationFrame !== 'function') {
      finalize(el, target);
      return;
    }
    // Zero-out only at the moment the animation actually begins, and arm a
    // hard safety timer that guarantees the real figure is shown even if the
    // rAF chain is throttled (background tab), interrupted, or never completes.
    // This is the CR-01 fix: the count-up is pure progressive enhancement —
    // the element must always end on the true value, never on 0.
    var done = false;
    var duration = 1500;
    var guard = setTimeout(function () {
      if (!done) { done = true; finalize(el, target); }
    }, duration + 700);
    el.textContent = formatValue(0, target.prefix, target.suffix);
    var startTime = null;
    function step(t) {
      if (done) return;
      if (!startTime) startTime = t;
      var elapsed = t - startTime;
      var progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatValue(target.value * eased, target.prefix, target.suffix);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        done = true;
        clearTimeout(guard);
        finalize(el, target); // land exactly on the real figure
      }
    }
    requestAnimationFrame(step);
  }

  function init() {
    var selectors = '[data-counter-to], [data-target], .counter, .u-stat-number, .stat-card__number';
    var els = document.querySelectorAll(selectors);
    if (els.length === 0) return;

    // Progressive enhancement: if there is no IntersectionObserver, leave the
    // static real figures untouched (they are already correct in the DOM).
    if (typeof IntersectionObserver !== 'function') return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.dataset.counterTweened === '1') return;
        var target = parseTarget(el);
        if (!target) return;
        el.dataset.counterTweened = '1';
        io.unobserve(el);
        // tween() zeroes-out and animates ONLY when it can guarantee reaching
        // the final value (safety timer inside). No bare-zero gap is left in
        // the DOM before the animation is armed.
        tween(el, target);
      });
    }, { threshold: 0.4, rootMargin: '0px 0px -10% 0px' });

    els.forEach(function (el) { io.observe(el); });
  }

  if (document.readyState !== 'loading') setTimeout(init, 50);
  else document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 50); }, { once: true });
})();
