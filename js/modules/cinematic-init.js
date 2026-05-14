/**
 * CrowAgent Cinematic UI Initializer
 * Registers GSAP plugins and defines global motion defaults.
 */
(function() {
  if (typeof gsap === 'undefined') return;

  // Register ScrollTrigger
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Global ScrollTrigger defaults
  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true
  });

  // Cinematic revealed log (debug only)
  if (window.location.hostname === 'localhost' || window.__CA_DEBUG__) {
    console.log('✨ CrowAgent Cinematic Engine Initialized');
  }
})();
