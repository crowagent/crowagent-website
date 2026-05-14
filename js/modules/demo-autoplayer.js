/**
 * demo-autoplayer.js — Part 4 deliverable
 * 
 * Orchestrates the "Step 1-2-3" auto-playing UI demo vignette.
 */
(function() {
  "use strict";
  if (typeof gsap === 'undefined') return;

  function init() {
    const section = document.querySelector('.demo-section');
    if (!section) return;

    const screens = section.querySelectorAll('.demo-screen');
    const dots = section.querySelectorAll('.demo-pdot');
    let current = 0;
    let timer;

    function showScreen(index) {
      screens.forEach((s, i) => {
        if (i === index) {
          s.classList.remove('is-hidden');
          s.removeAttribute('hidden');
        } else {
          s.classList.add('is-hidden');
          s.setAttribute('hidden', 'true');
        }
      });
      
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === index);
      });

      // Special logic for typing in screen 1
      if (index === 0) {
        const typed = screens[0].querySelector('.ds-typed');
        if (typed) {
          typed.textContent = "";
          const text = "EC1A 1BB";
          let charIndex = 0;
          const typing = setInterval(() => {
            typed.textContent += text[charIndex++];
            if (charIndex >= text.length) clearInterval(typing);
          }, 100);
        }
      }
    }

    function next() {
      current = (current + 1) % screens.length;
      showScreen(current);
    }

    // Only play when in view
    ScrollTrigger.create({
      trigger: section,
      start: "top center",
      onEnter: () => {
        showScreen(0);
        timer = setInterval(next, 5000);
      },
      onLeave: () => clearInterval(timer),
      onEnterBack: () => {
        timer = setInterval(next, 5000);
      },
      onLeaveBack: () => clearInterval(timer)
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
