/**
 * Magnetic Pull Effect
 * Applies a subtle magnetic pull toward the cursor on [data-magnetic] elements.
 * 60px radius, max 4px offset, spring return on mouseleave.
 * Respects prefers-reduced-motion.
 * Uses requestAnimationFrame for performance.
 */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReduced.matches) return;

  var RADIUS = 60;
  var MAX_OFFSET = 4;
  var SPRING_EASING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

  function init() {
    var elements = document.querySelectorAll('[data-magnetic]');

    elements.forEach(function (el) {
      var rafId = null;
      var currentX = 0;
      var currentY = 0;

      el.style.transition = 'transform 0.3s ' + SPRING_EASING;

      el.addEventListener('mousemove', function (e) {
        if (rafId) cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(function () {
          var rect = el.getBoundingClientRect();
          var centerX = rect.left + rect.width / 2;
          var centerY = rect.top + rect.height / 2;

          var deltaX = e.clientX - centerX;
          var deltaY = e.clientY - centerY;
          var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

          if (distance < RADIUS) {
            var strength = (RADIUS - distance) / RADIUS;
            currentX = deltaX * strength * (MAX_OFFSET / RADIUS);
            currentY = deltaY * strength * (MAX_OFFSET / RADIUS);

            currentX = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, currentX));
            currentY = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, currentY));

            el.style.transform = 'translate(' + currentX + 'px, ' + currentY + 'px)';
          } else {
            el.style.transform = 'translate(0px, 0px)';
          }

          rafId = null;
        });
      });

      el.addEventListener('mouseleave', function () {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        el.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
