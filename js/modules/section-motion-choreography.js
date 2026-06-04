/**
 * Section Motion Choreography
 * Staggers child elements within sections on scroll reveal using GSAP.
 * Adds stagger timing on top of the existing reveal logic in cinematic-init.js.
 * Respects prefers-reduced-motion.
 */
(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReduced.matches) return;

  gsap.registerPlugin(ScrollTrigger);

  function initChoreography() {
    var sections = document.querySelectorAll('.reveal, [data-stagger]');

    sections.forEach(function (section) {
      var children = [];
      var eyebrows = section.querySelectorAll('.ca-eyebrow');
      var headings = section.querySelectorAll('h2');
      var paragraphs = section.querySelectorAll('p');
      var buttons = section.querySelectorAll('.btn, .sv-btn');

      eyebrows.forEach(function (el) { children.push({ el: el, delay: 0 }); });
      headings.forEach(function (el) { children.push({ el: el, delay: 0.1 }); });
      paragraphs.forEach(function (el) { children.push({ el: el, delay: 0.2 }); });
      buttons.forEach(function (el) { children.push({ el: el, delay: 0.3 }); });

      if (children.length === 0) return;

      children.forEach(function (item) {
        gsap.from(item.el, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          delay: item.delay,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            once: true
          }
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChoreography);
  } else {
    initChoreography();
  }
})();
