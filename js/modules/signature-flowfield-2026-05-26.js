/* ============================================================
 * signature-flowfield-2026-05-26.js
 * Cinematic interactive flow-field for the hero atmosphere.
 * Hundreds of teal particles stream along an animated value-noise
 * field, glowing additively (a living "data / intelligence" current),
 * and react to the cursor (swirl + repulsion). Two depth tiers.
 *
 * Robust: Canvas2D — renders for every user AND headless (no WebGL).
 * Performance: DPR-capped, rAF, paused off-screen + when tab hidden,
 * particle count scales to area. Accessibility: prefers-reduced-motion
 * paints a single calm static frame and never animates.
 * No dependencies. Idempotent.
 * ============================================================ */
(function () {
  'use strict';
  if (window.__sigFlowInit) return;
  window.__sigFlowInit = true;

  var host = document.querySelector('.atmos');
  if (!host) return;
  var canvas = host.querySelector('.atmos__canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.className = 'atmos__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    var grid = host.querySelector('.atmos__grid');
    if (grid && grid.nextSibling) host.insertBefore(canvas, grid.nextSibling);
    else host.appendChild(canvas);
  }
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, particles = [], raf = null, running = false, t = 0;
  var mouse = { x: -9999, y: -9999, has: false };
  var hero = host.closest('.hero') || host;

  /* compact value-noise (hash + smoothed bilinear) → organic flow angles */
  function hash(x, y) { var n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); }
  function sstep(a, b, h) { h = h * h * (3 - 2 * h); return a + (b - a) * h; }
  function vnoise(x, y) {
    var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    return sstep(sstep(hash(xi, yi), hash(xi + 1, yi), xf),
                 sstep(hash(xi, yi + 1), hash(xi + 1, yi + 1), xf), yf);
  }

  function spawn() {
    var slow = Math.random() < 0.32;                 /* two depth tiers */
    return {
      x: Math.random() * W, y: Math.random() * H, px: 0, py: 0,
      sp: slow ? (0.25 + Math.random() * 0.35) : (0.7 + Math.random() * 0.9),
      sz: slow ? (1.1 + Math.random() * 1.7) : (0.5 + Math.random() * 0.9),
      a:  slow ? (0.07 + Math.random() * 0.16) : (0.16 + Math.random() * 0.38)
    };
  }

  function resize() {
    var r = host.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var target = Math.round(Math.min(420, (W * H) / 4200));
    particles = [];
    for (var i = 0; i < target; i++) particles.push(spawn());
    ctx.clearRect(0, 0, W, H);
  }

  function step() {
    t += 1;
    /* fade existing trails by erasing a little (keeps canvas transparent
       so the aurora shows through) */
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.055)';
    ctx.fillRect(0, 0, W, H);
    /* additive teal glow for new segments */
    ctx.globalCompositeOperation = 'lighter';
    var ns = 0.0016, ts = t * 0.00085;
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var ang = vnoise(p.x * ns, p.y * ns + ts) * Math.PI * 4;
      var vx = Math.cos(ang) * p.sp, vy = Math.sin(ang) * p.sp;
      if (mouse.has) {
        var dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 26000) {
          var d = Math.sqrt(d2) || 1, f = (160 - d) / 160 * 2.2;
          vx += (dx / d) * f - (dy / d) * f * 0.6;   /* repel + swirl */
          vy += (dy / d) * f + (dx / d) * f * 0.6;
        }
      }
      p.px = p.x; p.py = p.y; p.x += vx; p.y += vy;
      if (p.x < 0) p.x += W; else if (p.x > W) p.x -= W;
      if (p.y < 0) p.y += H; else if (p.y > H) p.y -= H;
      if (Math.abs(p.x - p.px) < 60 && Math.abs(p.y - p.py) < 60) {
        ctx.strokeStyle = 'rgba(12,201,168,' + p.a + ')';
        ctx.lineWidth = p.sz;
        ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(p.x, p.y); ctx.stroke();
        if (p.sz > 1.3) {                              /* node sparkle on slow tier */
          ctx.fillStyle = 'rgba(110,233,210,' + (p.a * 0.9) + ')';
          ctx.fillRect(p.x - 0.6, p.y - 0.6, 1.2, 1.2);
        }
      }
    }
  }

  function loop() { if (!running) return; step(); raf = window.requestAnimationFrame(loop); }
  function start() { if (running || REDUCED) return; running = true; loop(); }
  function stop() { running = false; if (raf) window.cancelAnimationFrame(raf); raf = null; }

  function debounce(fn, ms) { var id; return function () { clearTimeout(id); id = setTimeout(fn, ms); }; }
  window.addEventListener('resize', debounce(resize, 200), { passive: true });
  hero.addEventListener('pointermove', function (e) {
    var r = host.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.has = true;
  }, { passive: true });
  hero.addEventListener('pointerleave', function () { mouse.has = false; mouse.x = mouse.y = -9999; });
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  var ready = false;
  function init() {
    resize();
    if (W <= 2 || H <= 2) { window.requestAnimationFrame(init); return; } /* wait for layout */
    ready = true;
    if (REDUCED) { for (var k = 0; k < 90; k++) step(); }   /* one calm static current */
    else start();
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (ready) { e.isIntersecting ? start() : stop(); } });
    }, { threshold: 0.04 }).observe(host);
  }
  window.requestAnimationFrame(init);
})();
