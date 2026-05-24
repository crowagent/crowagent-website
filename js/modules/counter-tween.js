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

  function tween(el, target) {
    if (reduced) {
      el.textContent = formatValue(target.value, target.prefix, target.suffix);
      return;
    }
    var startTime = null;
    var duration = 1500;
    function step(t) {
      if (!startTime) startTime = t;
      var elapsed = t - startTime;
      var progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = target.value * eased;
      el.textContent = formatValue(current, target.prefix, target.suffix);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function init() {
    var selectors = '[data-counter-to], [data-target], .counter, .u-stat-number, .stat-card__number';
    var els = document.querySelectorAll(selectors);
    if (els.length === 0) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.dataset.counterTweened === '1') return;
        var target = parseTarget(el);
        if (!target) return;
        el.dataset.counterTweened = '1';
        // Set initial value
        if (!reduced) el.textContent = formatValue(0, target.prefix, target.suffix);
        // Defer tween slightly so reveal animation can start first
        setTimeout(function () { tween(el, target); }, 150);
        io.unobserve(el);
      });
    }, { threshold: 0.4, rootMargin: '0px 0px -10% 0px' });

    els.forEach(function (el) { io.observe(el); });
  }

  if (document.readyState !== 'loading') setTimeout(init, 50);
  else document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 50); }, { once: true });
})();
