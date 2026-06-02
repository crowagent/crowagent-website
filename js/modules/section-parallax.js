/**
 * section-parallax.js — Part 4 deliverable
 * 
 * Implements subtle scroll-driven parallax for decorative background elements.
 */
(function() {
  "use strict";
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  function init() {
    const parallaxSections = document.querySelectorAll('[data-parallax-speed], .section-parallax-bg');
    
    parallaxSections.forEach(section => {
      const speed = parseFloat(section.dataset.parallaxSpeed) || 0.2;
      const orbs = section.querySelectorAll('.parallax-orb');
      
      gsap.to(orbs, {
        y: (i, target) => {
          const depth = (i + 1) * speed * 100;
          return -depth;
        },
        ease: "none",
        scrollTrigger: {
          trigger: section.closest('section') || section,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
