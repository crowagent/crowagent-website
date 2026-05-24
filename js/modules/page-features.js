/**
 * page-features.js — H3-PERF-FIX 2026-05-10.
 *
 * Combined page-specific feature module. Each IIFE inside is self-gated
 * by a unique selector so loading this module on the home page (where
 * everything lives) is safe, and loading on a sparser page (e.g.
 * /products/csrd) is also safe — IIFEs whose selectors don't match
 * return early and cost ~zero.
 *
 * Bundled features (extracted from scripts.js for the H3-PERF-FIX size
 * budget — together they save ~4 KB minified off scripts.min.js):
 *
 *   1. ANIMATED PRODUCT DEMO       (gate: .ds-1 / .ds-2 / .ds-3)
 *   2. PARTICLE CANVAS             (gate: #ca-particles)
 *   3. TOOLTIP DISMISS (term[data-tip])
 *                                  (gate: span.term[data-tip])
 *   4. HOW IT WORKS — Tabbed
 *                                  (gate: .how-tab[data-hw-tab])
 *
 * Behaviour preserved exactly. Loader: scripts.js inserts a single
 * <script defer src="/js/modules/page-features.js"> tag at runtime when
 * any of the four gate selectors are found in the DOM. On pages with
 * none of these features, this file is never fetched.
 */
(function () {
  'use strict';

  // ── 1. ANIMATED PRODUCT DEMO ───────────────────────────────────────────
  (function () {
    var screens = ['.ds-1', '.ds-2', '.ds-3'];
    var dots = ['#dd0', '#dd1', '#dd2'];
    if (!document.querySelector(screens[0])) return;
    var current = 0;
    var interval;

    var postcode = 'SW1A 2AA';
    var typed = document.querySelector('.ds-typed');
    var charIdx = 0;
    function typeNext() {
      if (!typed) return;
      if (charIdx < postcode.length) {
        typed.textContent += postcode[charIdx++];
        setTimeout(typeNext, 120);
      }
    }

    function animateCounter() {
      var el = document.querySelector('.ds-count');
      if (!el) return;
      var target = 42000;
      var step = 1000;
      var val = 0;
      var t = setInterval(function () {
        val = Math.min(val + step, target);
        el.textContent = val.toLocaleString('en-GB');
        if (val >= target) clearInterval(t);
      }, 40);
    }

    function animateGaps() {
      document.querySelectorAll('.ds-gap-item').forEach(function (el, i) {
        el.style.opacity = '0';
        el.style.transform = 'translateX(-8px)';
        setTimeout(function () {
          el.style.transition = 'opacity .4s ease, transform .4s ease';
          el.style.opacity = '1';
          el.style.transform = 'translateX(0)';
        }, i * 200);
      });
    }

    function showScreen(idx) {
      screens.forEach(function (s, i) {
        var el = document.querySelector(s);
        if (el) el.style.display = i === idx ? 'block' : 'none';
      });
      dots.forEach(function (d, i) {
        var el = document.querySelector(d);
        if (el) el.classList.toggle('active', i === idx);
      });
      if (idx === 0) { charIdx = 0; if (typed) typed.textContent = ''; setTimeout(typeNext, 600); }
      if (idx === 1) { setTimeout(animateCounter, 400); animateGaps(); }
    }

    function advance() {
      current = (current + 1) % screens.length;
      showScreen(current);
    }

    showScreen(0);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      interval = setInterval(advance, 7000);
    }

    dots.forEach(function (d, i) {
      var el = document.querySelector(d);
      if (el) el.addEventListener('click', function () {
        clearInterval(interval);
        current = i;
        showScreen(current);
        interval = setInterval(advance, 7000);
      });
    });

    window.addEventListener('pagehide', function () {
      if (interval) { clearInterval(interval); interval = null; }
    });
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        if (interval) { clearInterval(interval); interval = null; }
      } else if (!interval && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        interval = setInterval(advance, 7000);
      }
    });
  }());

  // ── 2. PARTICLE CANVAS ─────────────────────────────────────────────────
  // SF18 ENH 25 — 3 size classes (1/2/3px), opacity variation 0.15-0.50,
  // randomised float vector, reduced-motion early-return. Cap 60 particles.
  (function () {
    var cv = document.getElementById('ca-particles');
    if (!cv) return;
    // Reduced motion: don't even initialise the renderer
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { cv.style.display = 'none'; return; }
    var ctx = cv.getContext('2d');
    var W, H, pts = [];
    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W; cv.height = H;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });
    for (var i = 0; i < 60; i++) {
      // 3 size buckets — favour smaller dots for an airy field
      var roll = Math.random();
      var size = roll < 0.55 ? 1 : (roll < 0.88 ? 2 : 3);
      pts.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        size: size,
        opacity: 0.15 + Math.random() * 0.35  // [0.15, 0.50]
      });
    }
    var running = false;
    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        pts[i].x += pts[i].vx; pts[i].y += pts[i].vy;
        if (pts[i].x < 0 || pts[i].x > W) pts[i].vx *= -1;
        if (pts[i].y < 0 || pts[i].y > H) pts[i].vy *= -1;
        for (var j = i + 1; j < pts.length; j++) {
          var dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = 'rgba(12,201,168,' + (0.08 * (1 - d / 120)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(pts[i].x, pts[i].y, pts[i].size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(12,201,168,' + pts[i].opacity.toFixed(3) + ')';
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    function start() { if (!running) { running = true; draw(); } }
    function stop() { running = false; }
    if (document.visibilityState === 'visible') start();
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') { start(); } else { stop(); }
    });
  }());

  // ── 3. TOOLTIP DISMISS ON CLICK/ESCAPE — WP-QA-001 BUG #3 ──────────────
  // DEF-029: ensure span.term[data-tip] is keyboard-focusable + AT-readable.
  (function () {
    function decorateTerms() {
      var counter = 0;
      document.querySelectorAll('span.term[data-tip]').forEach(function (el) {
        if (el.hasAttribute('data-tip-bound')) return;
        el.setAttribute('data-tip-bound', '1');
        counter += 1;
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
        if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
        var tipId = 't-' + counter + '-' + Date.now().toString(36);
        var tipText = el.getAttribute('data-tip') || '';
        if (!el.hasAttribute('aria-describedby')) {
          var tip = document.createElement('span');
          tip.id = tipId;
          tip.setAttribute('role', 'tooltip');
          tip.className = 'sr-only';
          tip.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
          tip.textContent = tipText;
          if (el.parentNode) el.parentNode.insertBefore(tip, el.nextSibling);
          el.setAttribute('aria-describedby', tipId);
        }
        el.addEventListener('keydown', function (evt) {
          if (evt.key === 'Enter' || evt.key === ' ') {
            evt.preventDefault();
            document.querySelectorAll('.term.active').forEach(function (other) {
              if (other !== el) other.classList.remove('active');
            });
            el.classList.toggle('active');
          }
        });
      });
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', decorateTerms);
    } else {
      decorateTerms();
    }
    document.addEventListener('ca-nav-ready', decorateTerms);
    document.addEventListener('ca-footer-ready', decorateTerms);

    document.addEventListener('click', function (e) {
      var term = e.target.closest('.term');
      document.querySelectorAll('.term.active').forEach(function (el) {
        if (el !== term) el.classList.remove('active');
      });
      if (term) term.classList.toggle('active');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.term.active').forEach(function (el) {
          el.classList.remove('active');
        });
      }
    });
  }());

  // ── 4. HOW IT WORKS — Tabbed product workflow selector ────────────────
  (function () {
    var tabs = document.querySelectorAll('.how-tab[data-hw-tab]');
    var panels = document.querySelectorAll('.hw-panel');
    var pill = document.querySelector('.how-tab-pill');
    if (!tabs.length || !panels.length) return;

    function positionPill(tab) {
      if (!pill) return;
      pill.style.left = tab.offsetLeft + 'px';
      pill.style.width = tab.offsetWidth + 'px';
    }

    function activate(tabKey) {
      tabs.forEach(function (t) {
        var isActive = t.getAttribute('data-hw-tab') === tabKey;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
        if (isActive) positionPill(t);
      });
      panels.forEach(function (p) {
        var isActive = p.id === 'hw-panel-' + tabKey;
        p.classList.toggle('active', isActive);
        p.hidden = !isActive;
      });
    }

    // P5 2026-05-17: Stripe-grade tab cross-fade.
    // Hard hide/show is preserved (hidden attribute) but wrapped in a
    // 180ms opacity dip via .is-tab-fading on .how. Reduced motion bypasses.
    var howSection = document.querySelector('.how');
    var rmm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    function activateAnimated(tabKey) {
      if (!howSection || (rmm && rmm.matches)) {
        activate(tabKey);
        return;
      }
      howSection.classList.add('is-tab-fading');
      setTimeout(function () {
        activate(tabKey);
        requestAnimationFrame(function () {
          howSection.classList.remove('is-tab-fading');
        });
      }, 180);
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        activateAnimated(tab.getAttribute('data-hw-tab'));
      });
    });

    var tabList = document.querySelector('.how-tabs');
    if (tabList) {
      tabList.addEventListener('keydown', function (e) {
        var tabArr = Array.from(tabs);
        var idx = tabArr.indexOf(document.activeElement);
        if (idx < 0) return;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          var next = tabArr[(idx + 1) % tabArr.length];
          next.focus();
          activateAnimated(next.getAttribute('data-hw-tab'));
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          var prev = tabArr[(idx - 1 + tabArr.length) % tabArr.length];
          prev.focus();
          activateAnimated(prev.getAttribute('data-hw-tab'));
        }
      });
    }

    var activeTab = document.querySelector('.how-tab.active');
    if (activeTab) positionPill(activeTab);

    window.addEventListener('resize', function () {
      var active = document.querySelector('.how-tab.active');
      if (active) positionPill(active);
    }, { passive: true });

    // ── AUTOPLAY (added 2026-05-20 per founder directive) ─────────────────
    // Tab auto-rotates every 7s. Pauses on hover, pointer-down, keyboard focus
    // anywhere inside the .how section, page visibility change, and when
    // prefers-reduced-motion: reduce is set. Re-starts when the user leaves
    // the section. Per-panel scene cards animate via the .is-scene-active
    // class added to .hw-panel on activation — CSS-driven stagger fade-in.
    var AUTOPLAY_MS = 7000;
    var autoplayTimer = null;
    var paused = false;

    function indexFromActive() {
      var i = 0;
      for (var k = 0; k < tabs.length; k++) {
        if (tabs[k].classList.contains('active')) { i = k; break; }
      }
      return i;
    }
    function nextTabKey() {
      var i = indexFromActive();
      var nxt = tabs[(i + 1) % tabs.length];
      return nxt && nxt.getAttribute('data-hw-tab');
    }
    function stepAutoplay() {
      if (paused) return;
      var key = nextTabKey();
      if (key) activateAnimated(key);
    }
    function startAutoplay() {
      if (rmm && rmm.matches) return;
      if (autoplayTimer) return;
      autoplayTimer = setInterval(stepAutoplay, AUTOPLAY_MS);
    }
    function stopAutoplay() {
      if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
    }

    if (howSection) {
      howSection.addEventListener('pointerenter', function () { paused = true; });
      howSection.addEventListener('pointerleave', function () { paused = false; });
      howSection.addEventListener('focusin',     function () { paused = true; });
      howSection.addEventListener('focusout',    function () { paused = false; });
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAutoplay(); else startAutoplay();
    });
    if (rmm && typeof rmm.addEventListener === 'function') {
      rmm.addEventListener('change', function (e) {
        if (e.matches) stopAutoplay(); else startAutoplay();
      });
    }

    // Wire panel-activation to scene-animation class
    var origActivate = activate;
    activate = function (tabKey) {
      origActivate(tabKey);
      panels.forEach(function (p) {
        if (p.id === 'hw-panel-' + tabKey) {
          p.classList.remove('is-scene-active');
          // force reflow so the CSS animation re-runs on every panel change
          void p.offsetWidth;
          p.classList.add('is-scene-active');
        }
      });
    };

    // Kick off autoplay once the section is visible (so initial paint isn't churned)
    if ('IntersectionObserver' in window && howSection) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) startAutoplay();
          else stopAutoplay();
        });
      }, { threshold: 0.15 });
      io.observe(howSection);
    } else {
      startAutoplay();
    }
  }());
}());
