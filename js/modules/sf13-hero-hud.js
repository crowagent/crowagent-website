// SF13 Hero HUD — 2026-05-17
// Live countdown to 2026-04-27 Cyber Essentials v3.3 Danzell deadline,
// and easing count-up on the bottom-left metrics ticker (5.5M / 37K+ / £26B).
// Both halted under prefers-reduced-motion: reduce.
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') return fn();
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  }

  ready(function () {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ─── Live countdown to 2026-04-27 — SF16 (TASK 2 audit fix) ───
    // If the deadline has passed, the panel switches to a "✓ NOW IN FORCE"
    // badge instead of showing a misleading "0" or fake fallback number.
    var deadlineUtc = new Date('2026-04-27T00:00:00Z').getTime();
    var countEl = document.getElementById('sf13-count-number');
    var hudCounter = document.querySelector('.hero-hud-counter');
    function tickCountdown() {
      if (!countEl || !hudCounter) return;
      var diffMs = deadlineUtc - Date.now();
      var days = Math.ceil(diffMs / 86400000);
      var inForce = !isFinite(days) || days <= 0;
      if (inForce) {
        // Switch panel into "in force" mode
        hudCounter.classList.add('is-in-force');
        hudCounter.setAttribute('aria-label', 'Cyber Essentials v3.3 Danzell is now in force');
        var countdown = hudCounter.querySelector('.hhc-countdown');
        var caption = hudCounter.querySelector('.hhc-caption');
        var label = hudCounter.querySelector('.hhc-label');
        if (label) label.textContent = 'Status · v3.3';
        if (countdown) {
          countdown.innerHTML =
            '<span class="hhc-tick" aria-hidden="true">' +
              '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
            '</span>' +
            '<span class="hhc-in-force-text">IN FORCE</span>';
        }
        if (caption) caption.innerHTML = '<strong>Cyber Essentials v3.3 (Danzell)</strong> &mdash; active from 27 Apr 2026.';
      } else {
        hudCounter.classList.remove('is-in-force');
        countEl.textContent = String(days);
      }
    }
    tickCountdown();
    if (!reduced) setInterval(tickCountdown, 3600000);

    // ─── Metrics count-up ───
    function formatVal(n, fmt) {
      if (fmt === 'abbr') {
        if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (n >= 1000)    return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        return Math.round(n).toLocaleString();
      }
      if (fmt === 'bn') return Math.round(n).toString();
      return Math.round(n).toLocaleString();
    }
    var counters = document.querySelectorAll('[data-sf13-target]');
    function animateCounter(el) {
      var target = parseFloat(el.getAttribute('data-sf13-target'));
      var fmt = el.getAttribute('data-sf13-format') || '';
      if (reduced) { el.textContent = formatVal(target, fmt); return; }
      var duration = 1400;
      var start = performance.now();
      function step(t) {
        var p = Math.min(1, (t - start) / duration);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = formatVal(target * e, fmt);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = formatVal(target, fmt);
      }
      requestAnimationFrame(step);
    }
    if ('IntersectionObserver' in window && counters.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      counters.forEach(function (c) { io.observe(c); });
    } else {
      counters.forEach(animateCounter);
    }
  });
})();
