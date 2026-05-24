/**
 * Eyebrow rotator (2026-05-23) — Linear/Vercel banner pattern above H1.
 * Rotates 4 use-case messages with 4.5s cadence, 320ms fade+8px rise.
 * aria-live="polite", pauses on hover/focus and reduced-motion.
 */
(function () {
  'use strict';
  if (window.__caEyebrowRotatorLoaded) return;
  window.__caEyebrowRotatorLoaded = true;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    var holder = document.querySelector('[data-eyebrow-rotator]');
    if (!holder) return;
    var items = holder.querySelectorAll('[data-eyebrow-item]');
    if (items.length < 2) return;
    var idx = 0;
    var paused = false;
    items.forEach(function (el, i) {
      el.style.position = i === 0 ? 'relative' : 'absolute';
      el.style.inset = '0';
      el.style.transition = 'opacity 320ms var(--ease-signature), transform 320ms var(--ease-signature)';
      el.style.opacity = i === 0 ? '1' : '0';
      el.style.transform = i === 0 ? 'translateY(0)' : 'translateY(8px)';
    });
    holder.style.position = 'relative';
    holder.setAttribute('aria-live', 'polite');

    function tick() {
      if (paused || reduced) return;
      var prev = items[idx];
      idx = (idx + 1) % items.length;
      var next = items[idx];
      prev.style.opacity = '0';
      prev.style.transform = 'translateY(-8px)';
      next.style.opacity = '1';
      next.style.transform = 'translateY(0)';
    }

    var interval = setInterval(tick, 4500);
    holder.addEventListener('mouseenter', function () { paused = true; });
    holder.addEventListener('mouseleave', function () { paused = false; });
    holder.addEventListener('focusin', function () { paused = true; });
    holder.addEventListener('focusout', function () { paused = false; });
    document.addEventListener('visibilitychange', function () { paused = document.hidden; });
  }

  if (document.readyState !== 'loading') setTimeout(init, 100);
  else document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 100); }, { once: true });
})();
