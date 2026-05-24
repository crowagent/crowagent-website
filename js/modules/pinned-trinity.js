/**
 * REC-4: Scroll-pinned trinity showcase (2026-05-23)
 * Pin .hp-jtbd / .hp-trinity for 180% scroll-height, scrub 3 path cards
 * through a focus/scale curve. Desktop-gated (≥900px). GSAP ScrollTrigger.
 * Respects prefers-reduced-motion.
 */
(function () {
  'use strict';
  if (window.__caPinnedTrinityLoaded) return;
  window.__caPinnedTrinityLoaded = true;

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia && !window.matchMedia('(min-width: 900px)').matches) return;

  function init() {
    if (!window.gsap || !window.ScrollTrigger) return;
    var section = document.querySelector('.hp-jtbd, .hp-trinity');
    if (!section) return;
    var cards = section.querySelectorAll('.hp-jtbd-path, .hp-trinity__card');
    if (cards.length < 2) return;

    // Initial state — non-active cards dimmed
    cards.forEach(function (card, i) {
      card.style.transition = 'transform 0.5s var(--ease-signature), opacity 0.5s var(--ease-signature), filter 0.5s var(--ease-signature)';
      if (i !== 0) {
        card.style.opacity = '0.55';
        card.style.transform = 'scale(0.96)';
        card.style.filter = 'saturate(0.85)';
      }
    });

    window.gsap.registerPlugin(window.ScrollTrigger);

    var st = window.ScrollTrigger.create({
      trigger: section,
      start: 'top top+=80',
      end: '+=' + (section.offsetHeight * 1.4),
      pin: true,
      pinSpacing: true,
      scrub: 0.8,
      onUpdate: function (self) {
        var progress = self.progress;
        var active = Math.min(cards.length - 1, Math.floor(progress * cards.length));
        cards.forEach(function (card, i) {
          if (i === active) {
            card.style.opacity = '1';
            card.style.transform = 'scale(1.02)';
            card.style.filter = 'saturate(1.15)';
          } else {
            card.style.opacity = '0.55';
            card.style.transform = 'scale(0.96)';
            card.style.filter = 'saturate(0.85)';
          }
        });
      }
    });
  }

  if (document.readyState !== 'loading') setTimeout(init, 100);
  else document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 100); }, { once: true });
})();
