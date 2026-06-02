/* ============================================================================
   Animated Product Showcase engine  (2026-05-25)
   Drives .ca-showcase components: on scroll-in, sweeps the readiness gauge
   0 -> data-value, grows .ca-bar fills to data-pct, tweens [data-countup]
   numbers, and cascades rows in. Runs once per component. Dependency-free.
   Honours prefers-reduced-motion (jumps straight to the final state).

   MARKUP CONTRACT (configure per product; data is illustrative + labelled):
   <div class="ca-showcase" style="--cas-accent: var(--teal)">
     <div class="ca-showcase__chrome"><span class="ca-showcase__dot"></span>x3
       <span class="ca-showcase__url">app.crowagent.ai/cyber</span></div>
     <div class="ca-showcase__body">
       <div class="ca-showcase__head"><h3 class="ca-showcase__title">..</h3>
         <span class="ca-showcase__tag">v3.3 Danzell · illustrative</span></div>
       <div class="ca-showcase__grid">
         <div class="ca-gauge" data-value="87">
           <div class="ca-gauge__ring"><svg viewBox="0 0 144 144">
             <defs><linearGradient id="cas-grad" x1="0" y1="0" x2="1" y2="1">
               <stop offset="0" stop-color="var(--cas-accent)"/>
               <stop offset="1" stop-color="var(--sky,#2f6df0)"/></linearGradient></defs>
             <circle class="ca-gauge__track" cx="72" cy="72" r="62" stroke-width="10"/>
             <circle class="ca-gauge__arc"   cx="72" cy="72" r="62" stroke-width="10"/></svg>
             <div class="ca-gauge__center"><div class="ca-gauge__num">
               <span data-countup="87">0</span><sup>%</sup></div></div></div>
           <div class="ca-gauge__label">Overall readiness</div></div>
         <ul class="ca-bars">
           <li><span class="ca-bars__label">Firewalls</span><span class="ca-bars__val">100%</span>
             <span class="ca-bar" data-pct="100"><i></i></span></li> ...
         </ul>
       </div>
       <div class="ca-showcase__foot">
         <div class="ca-stat"><div class="ca-stat__num"><span data-countup="44">0</span></div>
           <div class="ca-stat__label">Controls assessed</div></div> ...
       </div>
     </div>
   </div>
   <p class="ca-showcase-caption">Caption that matches what the dashboard shows.</p>

   data-countup: target number. Add data-group for thousands separators.
   Wrap currency/unit affixes in <span class="cas-prefix">£</span> outside the countup span.
   ============================================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function circ(arc) { var r = parseFloat(arc.getAttribute('r') || 62); return 2 * Math.PI * r; }

  function setup(s) {
    var gauge = s.querySelector('.ca-gauge');
    if (gauge) {
      var arc = gauge.querySelector('.ca-gauge__arc');
      var v = parseFloat(gauge.getAttribute('data-value') || '0');
      v = Math.max(0, Math.min(100, isNaN(v) ? 0 : v));
      if (arc) {
        var c = circ(arc);
        s.style.setProperty('--cas-circ', c.toFixed(1));
        s.style.setProperty('--cas-offset', (c * (1 - v / 100)).toFixed(1));
      }
    }
    s.querySelectorAll('.ca-bar').forEach(function (b) {
      var p = parseFloat(b.getAttribute('data-pct') || '0');
      b.style.setProperty('--cas-w', (isNaN(p) ? 0 : Math.max(0, Math.min(100, p))) + '%');
    });
  }

  function tween(el) {
    var target = parseFloat(el.getAttribute('data-countup') || '0');
    if (isNaN(target)) return;
    var group = el.hasAttribute('data-group');
    function fmt(n) { n = Math.round(n); return group ? n.toLocaleString('en-GB') : String(n); }
    if (reduce) { el.textContent = fmt(target); return; }
    var dur = 1300, t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(target);
    }
    requestAnimationFrame(step);
  }

  function run(s) {
    void s.offsetWidth; // commit the armed empty-state before transitioning
    s.classList.add('is-inview');
    requestAnimationFrame(function () {
      s.classList.add('is-animating');
      s.querySelectorAll('[data-countup]').forEach(function (e) {
        setTimeout(function () { tween(e); }, 220);
      });
    });
  }

  function init() {
    var shows = document.querySelectorAll('.ca-showcase');
    if (!shows.length) return;
    // Always set the CSS vars so the DEFAULT (no-animation) state is the
    // correct FILLED dashboard — never invisible/empty content.
    shows.forEach(setup);
    // No animation when reduced-motion or no IntersectionObserver: the markup
    // already shows final counter values and the filled gauge/bars stay put.
    if (reduce || !('IntersectionObserver' in window)) return;
    // Arm: switch each showcase to the empty start-state, reset counters to 0.
    shows.forEach(function (s) {
      s.classList.add('cas-anim');
      s.querySelectorAll('[data-countup]').forEach(function (e) {
        e.textContent = e.hasAttribute('data-group') ? '0' : '0';
      });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.35, rootMargin: '0px 0px -8% 0px' });
    shows.forEach(function (s) { io.observe(s); });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
