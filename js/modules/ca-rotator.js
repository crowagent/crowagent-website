/**
 * .ca-rotator — generic content rotator (2026-05-23)
 * Auto-cycles `.ca-rotator__item` children with 4.5s cadence (configurable).
 * Pauses on hover/focus/visibility-change. Respects prefers-reduced-motion.
 *
 * Usage:
 *   <span class="ca-rotator" data-rotator-cadence="4500" aria-live="polite">
 *     <span class="ca-rotator__item ca-rotator__item--first" aria-current="true">Score</span>
 *     <span class="ca-rotator__item">Recover</span>
 *     <span class="ca-rotator__item">Protect</span>
 *   </span>
 */
(function () {
  'use strict';
  if (window.__caRotatorLoaded) return;
  window.__caRotatorLoaded = true;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initRotator(holder) {
    var items = holder.querySelectorAll('.ca-rotator__item');
    if (items.length < 2) return;
    var cadence = parseInt(holder.dataset.rotatorCadence || '4500', 10);
    var idx = 0;
    var paused = false;

    function tick() {
      if (paused || reduced) return;
      items[idx].setAttribute('aria-current', 'false');
      items[idx].classList.remove('ca-rotator__item--first');
      idx = (idx + 1) % items.length;
      items[idx].setAttribute('aria-current', 'true');
      // If holder is anchor with data-rotator-href-target, swap href to active item's data-href
      if (holder.hasAttribute('data-rotator-href-target')) {
        var nextHref = items[idx].getAttribute('data-href');
        if (nextHref) holder.setAttribute('href', nextHref);
      }
      // If holder is button-in-form with data-rotator-form-action, sync form action + input placeholder
      if (holder.hasAttribute('data-rotator-form-action')) {
        var formAction = items[idx].getAttribute('data-form-action');
        var form = holder.closest('form');
        if (form && formAction) form.setAttribute('action', formAction);
        if (form) {
          var input = form.querySelector('input[data-rotator-placeholder-' + idx + '], input[type=text]');
          if (input) {
            var ph = input.getAttribute('data-rotator-placeholder-' + idx);
            if (ph) input.setAttribute('placeholder', ph);
          }
        }
      }
    }

    setInterval(tick, cadence);
    holder.addEventListener('mouseenter', function () { paused = true; });
    holder.addEventListener('mouseleave', function () { paused = false; });
    holder.addEventListener('focusin', function () { paused = true; });
    holder.addEventListener('focusout', function () { paused = false; });
    document.addEventListener('visibilitychange', function () { paused = document.hidden; });
  }

  function init() {
    document.querySelectorAll('.ca-rotator').forEach(initRotator);
  }

  if (document.readyState !== 'loading') setTimeout(init, 100);
  else document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 100); }, { once: true });
})();
