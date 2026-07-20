/* nebula-showcase.js - auto-advancing product showcase for the Nebula homepage.
   Tabs pattern (WAI-ARIA): a vertical tablist drives stacked tabpanels.

   Behaviour:
   - Advances on a 6s timer, driven by requestAnimationFrame so the visible
     progress bar and the timer are the same clock (they can never disagree).
   - Pauses on hover, on focus-within, when scrolled out of view, when the tab
     is hidden, and when the user presses the pause button. The rAF loop is
     cancelled while paused, so a paused or off-screen carousel costs nothing.
   - prefers-reduced-motion: reduce disables autoplay entirely and leaves a
     plain, fully usable tabbed view.
   - WCAG 2.2.2: an explicit pause control is provided, not just hover.
*/
(function () {
  'use strict';

  var root = document.querySelector('[data-nb-showcase]');
  if (!root) return;

  var tabs = [].slice.call(root.querySelectorAll('[role="tab"]'));
  if (!tabs.length) return;

  var panels = tabs.map(function (t) {
    return document.getElementById(t.getAttribute('aria-controls'));
  });
  if (panels.some(function (p) { return !p; })) return;

  var toggle = root.querySelector('[data-nb-toggle]');
  var status = root.querySelector('[data-nb-status]');
  var toggleLabel = toggle ? toggle.querySelector('.sr-only') : null;

  var DURATION = 6000;
  var mq = matchMedia('(prefers-reduced-motion: reduce)');

  var index = 0;
  var raf = 0;
  var last = 0;
  var elapsed = 0;

  var userPaused = false;
  var hovering = false;
  var focused = false;
  // Starts false when IntersectionObserver is available: during page load the
  // section can briefly sit inside the first viewport (before images and the
  // injected nav push it down), and we must not burn a cycle before it is seen.
  var onScreen = !('IntersectionObserver' in window);
  var pageVisible = !document.hidden;

  function reduced() { return mq.matches; }

  function canRun() {
    return !reduced() && !userPaused && !hovering && !focused && onScreen && pageVisible;
  }

  function setProgress(i, p) {
    tabs[i].style.setProperty('--p', p);
  }

  function select(i) {
    index = (i + tabs.length) % tabs.length;
    tabs.forEach(function (tab, n) {
      var active = n === index;
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.tabIndex = active ? 0 : -1;
      tab.classList.toggle('on', active);
      setProgress(n, 0);
      panels[n].classList.toggle('on', active);
      panels[n].setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    elapsed = 0;
    last = 0;
    // Panels that carry an entrance overlay listen for this to replay it.
    // Nothing in this file depends on anyone listening.
    panels[index].dispatchEvent(new CustomEvent('nb:shown', { bubbles: true }));
  }

  function tick(ts) {
    if (!canRun()) { stop(); return; }
    if (!last) { last = ts; }
    elapsed += ts - last;
    last = ts;
    var p = elapsed / DURATION;
    if (p >= 1) {
      select(index + 1);
    } else {
      setProgress(index, p);
    }
    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (raf) return;
    last = 0;
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    last = 0;
  }

  function sync() {
    if (canRun()) { start(); } else { stop(); }
  }

  function updateToggle() {
    if (!toggle) return;
    var off = reduced();
    toggle.hidden = off;
    toggle.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
    if (toggleLabel) {
      toggleLabel.textContent = userPaused
        ? 'Play the automatic product tour'
        : 'Pause the automatic product tour';
    }
    if (status) {
      status.textContent = off
        ? 'Choose a product above'
        : (userPaused ? 'Paused. Choose a product above' : 'Advancing every 6 seconds');
    }
  }

  /* ---- pointer / focus pausing ---- */
  root.addEventListener('mouseenter', function () { hovering = true; sync(); });
  root.addEventListener('mouseleave', function () { hovering = false; sync(); });
  root.addEventListener('focusin', function () { focused = true; sync(); });
  root.addEventListener('focusout', function (e) {
    if (!root.contains(e.relatedTarget)) { focused = false; sync(); }
  });

  /* ---- off-screen pausing ---- */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var nowOn = entries[entries.length - 1].isIntersecting;
      // Coming back into view restarts the dwell, so the slide the reader
      // actually arrives on always gets its full time on screen.
      if (nowOn && !onScreen) { elapsed = 0; last = 0; setProgress(index, 0); }
      onScreen = nowOn;
      sync();
    }, { threshold: 0.3 }).observe(root);
  }

  document.addEventListener('visibilitychange', function () {
    pageVisible = !document.hidden;
    sync();
  });

  /* ---- tab interaction ---- */
  tabs.forEach(function (tab, n) {
    tab.addEventListener('click', function () {
      select(n);
      sync();
    });
  });

  var KEYS = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
  root.addEventListener('keydown', function (e) {
    if (tabs.indexOf(e.target) === -1) return;
    var next = null;
    if (Object.prototype.hasOwnProperty.call(KEYS, e.key)) {
      next = (index + KEYS[e.key] + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      next = 0;
    } else if (e.key === 'End') {
      next = tabs.length - 1;
    }
    if (next === null) return;
    e.preventDefault();
    select(next);
    tabs[next].focus();
    sync();
  });

  /* ---- explicit pause / play ---- */
  if (toggle) {
    toggle.addEventListener('click', function () {
      userPaused = !userPaused;
      updateToggle();
      sync();
    });
  }

  /* ---- reduced-motion changes at runtime ---- */
  var onMq = function () {
    updateToggle();
    if (reduced()) { stop(); setProgress(index, 0); } else { sync(); }
  };
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', onMq);
  } else if (typeof mq.addListener === 'function') {
    mq.addListener(onMq);
  }

  select(0);
  updateToggle();
  sync();
})();
