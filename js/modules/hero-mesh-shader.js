/* H1-HERO-PERF 10-10 (2026-05-10, lazy-init refactor 2026-05-12)
 * hero-mesh-shader.js — Stripe-style WebGL2 mesh-gradient backdrop.
 *
 * - Single fragment shader (no library); ~10kb minified.
 * - 4 colour blobs sourced from CSS custom properties:
 *     --teal, --lime, --sky, --mark.
 * - Animated mesh distortion via simplex-style noise on u_time.
 * - 60fps via requestAnimationFrame (paused when off-screen).
 * - Falls back to existing .hero-glow static gradient if:
 *     • WebGL2 not supported
 *     • prefers-reduced-motion: reduce
 *     • navigator.connection.saveData === true
 * - Discovers <canvas data-hero-mesh></canvas> on `pageshow`.
 * - LAZY: WebGL context + shader compile + rAF loop are only created on the
 *   first IntersectionObserver hit (rootMargin: 100px). Off-screen heroes
 *   contribute ZERO TBT until they enter the viewport. Also paused while the
 *   document is `hidden` (visibilitychange).
 * - Cleans up on `pagehide`.
 */
(function () {
  'use strict';

  if (typeof window === 'undefined') return;

  /** Brand colour CSS custom properties (4 blobs). */
  var BLOB_VARS = ['--teal', '--lime', '--sky', '--mark'];

  /** Internal state. Module-level so we can clean up on pagehide. */
  var state = {
    canvases: [],       // live instances (post-init only)
    pending: [],        // observed canvases awaiting first intersection
    io: null,           // single shared IntersectionObserver
    rafId: 0,
    rafRunning: false,
    lastT: 0,
    lastFrameMs: 0,
    docHidden: false,
  };

  // ── Gracefully bail if env is hostile ────────────────────────────────────
  // NOTE: we deliberately do NOT probe WebGL2 here. Doing so would allocate
  // a throwaway GL context on every page-load, which is exactly the cost we
  // are trying to defer. Per-canvas init handles "no webgl2" gracefully.
  function shouldSkip() {
    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return 'reduced-motion';
      }
      var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn && conn.saveData === true) return 'save-data';
    } catch (e) {
      return 'probe-error';
    }
    return null;
  }

  // ── Hex → vec3 helper ────────────────────────────────────────────────────
  function hexToVec3(hex) {
    var s = String(hex || '').trim().replace(/^#/, '');
    if (s.length === 3) s = s.split('').map(function (c) { return c + c; }).join('');
    if (!/^[0-9a-fA-F]{6}$/.test(s)) return [0.05, 0.79, 0.66]; // fallback teal
    var r = parseInt(s.slice(0, 2), 16) / 255;
    var g = parseInt(s.slice(2, 4), 16) / 255;
    var b = parseInt(s.slice(4, 6), 16) / 255;
    return [r, g, b];
  }

  function readBrandColours() {
    var styles = window.getComputedStyle(document.documentElement);
    return BLOB_VARS.map(function (v) { return hexToVec3(styles.getPropertyValue(v)); });
  }

  // ── Shaders ──────────────────────────────────────────────────────────────
  // Fullscreen triangle vertex pass.
  var VERT = '#version 300 es\n' +
    'in vec2 a_pos;\n' +
    'out vec2 v_uv;\n' +
    'void main(){\n' +
    '  v_uv = a_pos * 0.5 + 0.5;\n' +
    '  gl_Position = vec4(a_pos, 0.0, 1.0);\n' +
    '}\n';

  // Fragment: 4 drifting blobs over a navy base.
  // Distortion via cheap simplex-like noise (Ashima/Inigo Quilez style hash).
  var FRAG = '#version 300 es\n' +
    'precision highp float;\n' +
    'in vec2 v_uv;\n' +
    'out vec4 fragColor;\n' +
    'uniform float u_time;\n' +
    'uniform vec2  u_res;\n' +
    'uniform vec3  u_c0;\n' +
    'uniform vec3  u_c1;\n' +
    'uniform vec3  u_c2;\n' +
    'uniform vec3  u_c3;\n' +
    'uniform vec3  u_bg;\n' +
    // 2D hash
    'vec2 hash22(vec2 p){\n' +
    '  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));\n' +
    '  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);\n' +
    '}\n' +
    // Simplex-ish 2D noise (cheap, smooth enough for blob drift)
    'float noise(vec2 p){\n' +
    '  const float K1 = 0.366025404;\n' +
    '  const float K2 = 0.211324865;\n' +
    '  vec2 i = floor(p + (p.x + p.y) * K1);\n' +
    '  vec2 a = p - i + (i.x + i.y) * K2;\n' +
    '  vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\n' +
    '  vec2 b = a - o + K2;\n' +
    '  vec2 c = a - 1.0 + 2.0 * K2;\n' +
    '  vec3 h = max(0.5 - vec3(dot(a,a), dot(b,b), dot(c,c)), 0.0);\n' +
    '  vec3 n = h*h*h*h*vec3(dot(a, hash22(i)), dot(b, hash22(i+o)), dot(c, hash22(i+1.0)));\n' +
    '  return dot(n, vec3(70.0));\n' +
    '}\n' +
    // Blob: smooth radial falloff at moving centre.
    'float blob(vec2 uv, vec2 centre, float radius){\n' +
    '  float d = length(uv - centre);\n' +
    '  return smoothstep(radius, 0.0, d);\n' +
    '}\n' +
    'void main(){\n' +
    '  // Aspect-correct UV so circles stay round on wide viewports\n' +
    '  vec2 uv = v_uv;\n' +
    '  vec2 aspect = vec2(u_res.x / max(u_res.y, 1.0), 1.0);\n' +
    '  vec2 uvA = uv * aspect;\n' +
    '  // Mesh distortion driven by simplex noise on time (single noise call per axis)\n' +
    '  float t = u_time * 0.06;\n' +
    '  vec2 warp = vec2(noise(uv * 1.7 + t), noise(uv * 1.7 - t)) * 0.10;\n' +
    '  vec2 p = uvA + warp;\n' +
    '  // 4 blob centres drifting on cheap sin/cos so the per-pixel cost stays\n' +
    '  // O(1) regardless of blob count. Different phases keep them desynced.\n' +
    '  vec2 c0 = vec2(0.30, 0.35) * aspect + 0.18 * vec2(sin(t*1.10), cos(t*0.95));\n' +
    '  vec2 c1 = vec2(0.78, 0.30) * aspect + 0.18 * vec2(sin(t*0.85 + 1.7), cos(t*1.20 + 5.1));\n' +
    '  vec2 c2 = vec2(0.25, 0.78) * aspect + 0.18 * vec2(sin(t*1.30 + 3.2), cos(t*0.75 + 9.3));\n' +
    '  vec2 c3 = vec2(0.80, 0.80) * aspect + 0.18 * vec2(sin(t*0.65 + 4.1), cos(t*1.45 + 8.7));\n' +
    '  // Per-blob radius (large + soft) — additive blend over navy base\n' +
    '  float a0 = blob(p, c0, 0.55);\n' +
    '  float a1 = blob(p, c1, 0.55);\n' +
    '  float a2 = blob(p, c2, 0.55);\n' +
    '  float a3 = blob(p, c3, 0.55);\n' +
    '  vec3 col = u_bg;\n' +
    '  // Soft additive blend with intensity capped to keep page-bg legibility\n' +
    '  col += u_c0 * a0 * 0.55;\n' +
    '  col += u_c1 * a1 * 0.40;\n' +
    '  col += u_c2 * a2 * 0.50;\n' +
    '  col += u_c3 * a3 * 0.45;\n' +
    '  // Vignette to keep edges quiet\n' +
    '  float vig = smoothstep(1.20, 0.20, length(uv - 0.5));\n' +
    '  col = mix(u_bg, col, 0.55 + 0.45 * vig);\n' +
    '  fragColor = vec4(col, 0.92);\n' +
    '}\n';

  // ── GL helpers ───────────────────────────────────────────────────────────
  function compile(gl, type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      var info = gl.getShaderInfoLog(sh);
      gl.deleteShader(sh);
      throw new Error('shader compile failed: ' + info);
    }
    return sh;
  }

  function link(gl, vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      var info = gl.getProgramInfoLog(p);
      gl.deleteProgram(p);
      throw new Error('program link failed: ' + info);
    }
    return p;
  }

  // ── Per-canvas instance ──────────────────────────────────────────────────
  // Heavy: allocates GL context, compiles + links shaders, creates buffers
  // and looks up uniform locations. ONLY called from the IO callback when the
  // canvas is intersecting (rootMargin: 100px).
  function initCanvas(canvas) {
    var gl;
    try {
      gl = canvas.getContext('webgl2', { antialias: false, alpha: true, premultipliedAlpha: true });
    } catch (e) { gl = null; }
    if (!gl) return null;

    var vs, fs, prog;
    try {
      vs = compile(gl, gl.VERTEX_SHADER, VERT);
      fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      prog = link(gl, vs, fs);
    } catch (e) {
      // Surface compile/link failures via structured log; bail to fallback.
      try {
        console.error(JSON.stringify({
          level: 'error',
          service: 'hero-mesh-shader',
          operation: 'init',
          error: e && e.message ? e.message : String(e),
          timestamp: new Date().toISOString(),
        }));
      } catch (ignore) { /* logging must never throw */ }
      return null;
    }

    // Fullscreen triangle (covers clip space without a quad).
    var vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  3, -1,  -1,  3,
    ]), gl.STATIC_DRAW);
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    var aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    var u_time = gl.getUniformLocation(prog, 'u_time');
    var u_res  = gl.getUniformLocation(prog, 'u_res');
    var u_c0   = gl.getUniformLocation(prog, 'u_c0');
    var u_c1   = gl.getUniformLocation(prog, 'u_c1');
    var u_c2   = gl.getUniformLocation(prog, 'u_c2');
    var u_c3   = gl.getUniformLocation(prog, 'u_c3');
    var u_bg   = gl.getUniformLocation(prog, 'u_bg');

    var colours = readBrandColours();
    var styles = window.getComputedStyle(document.documentElement);
    var bg = hexToVec3(styles.getPropertyValue('--bg'));

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(2, Math.floor(canvas.clientWidth  * dpr));
      var h = Math.max(2, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    var inst = {
      canvas: canvas,
      gl: gl,
      prog: prog,
      vao: vao,
      vbo: vbo,
      vs: vs,
      fs: fs,
      u: { time: u_time, res: u_res, c0: u_c0, c1: u_c1, c2: u_c2, c3: u_c3, bg: u_bg },
      colours: colours,
      bg: bg,
      visible: true, // first IO callback already established intersection
      resize: resize,
    };

    resize();

    // Shared IO from `lazyInit` continues observing this canvas to flip
    // `visible` on/off as the user scrolls. No per-instance IO needed.
    return inst;
  }

  function renderInstance(inst, tSeconds) {
    if (!inst || !inst.visible) return;
    var gl = inst.gl;
    inst.resize();
    gl.useProgram(inst.prog);
    gl.bindVertexArray(inst.vao);
    gl.uniform1f(inst.u.time, tSeconds);
    gl.uniform2f(inst.u.res, inst.canvas.width, inst.canvas.height);
    gl.uniform3fv(inst.u.c0, inst.colours[0]);
    gl.uniform3fv(inst.u.c1, inst.colours[1]);
    gl.uniform3fv(inst.u.c2, inst.colours[2]);
    gl.uniform3fv(inst.u.c3, inst.colours[3]);
    gl.uniform3fv(inst.u.bg, inst.bg);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // Frame throttling — cap at ~30fps to halve CPU cost on the main thread.
  // The mesh-gradient drift is slow enough that 30fps reads as continuous.
  var FRAME_INTERVAL_MS = 1000 / 30;

  function anyVisible() {
    for (var i = 0; i < state.canvases.length; i++) {
      if (state.canvases[i].visible) return true;
    }
    return false;
  }

  function tick(now) {
    // Stop the loop entirely when no live instance is on-screen OR when the
    // document is hidden. The IO callback / visibilitychange handler will
    // restart it when something becomes visible again.
    if (state.docHidden || !anyVisible()) {
      state.rafRunning = false;
      state.rafId = 0;
      return;
    }
    state.rafId = window.requestAnimationFrame(tick);
    state.rafRunning = true;
    var t = now * 0.001;
    if (state.lastFrameMs && (now - state.lastFrameMs) < FRAME_INTERVAL_MS) return;
    state.lastFrameMs = now;
    for (var i = 0; i < state.canvases.length; i++) {
      renderInstance(state.canvases[i], t);
    }
    state.lastT = t;
  }

  function startRafIfNeeded() {
    if (state.rafRunning || state.rafId) return;
    if (state.docHidden) return;
    if (!anyVisible()) return;
    state.rafId = window.requestAnimationFrame(tick);
    state.rafRunning = true;
  }

  function disposeInstance(inst) {
    if (!inst) return;
    var gl = inst.gl;
    try {
      if (inst.vao) gl.deleteVertexArray(inst.vao);
      if (inst.vbo) gl.deleteBuffer(inst.vbo);
      if (inst.prog) gl.deleteProgram(inst.prog);
      if (inst.vs) gl.deleteShader(inst.vs);
      if (inst.fs) gl.deleteShader(inst.fs);
      var ext = gl.getExtension('WEBGL_lose_context');
      if (ext && typeof ext.loseContext === 'function') ext.loseContext();
    } catch (e) { /* swallow GL teardown noise */ }
  }

  function teardown() {
    if (state.rafId) {
      window.cancelAnimationFrame(state.rafId);
      state.rafId = 0;
    }
    state.rafRunning = false;
    try { if (state.io && state.io.disconnect) state.io.disconnect(); } catch (e) { /* noop */ }
    state.io = null;
    state.canvases.forEach(disposeInstance);
    state.canvases = [];
    state.pending = [];
    state.lastFrameMs = 0;
  }

  // Promote a pending canvas → live instance on first intersection.
  // Idempotent via the `_caHeroMeshInit` data flag.
  function ensureInitialised(canvas) {
    if (canvas._caHeroMeshInit) return canvas._caHeroMeshInst || null;
    canvas._caHeroMeshInit = true;
    var inst = initCanvas(canvas);
    if (!inst) {
      // graceful per-canvas fallback
      canvas.style.display = 'none';
      return null;
    }
    canvas._caHeroMeshInst = inst;
    state.canvases.push(inst);
    return inst;
  }

  function onVisibilityChange() {
    state.docHidden = document.hidden === true;
    if (!state.docHidden) startRafIfNeeded();
  }

  function lazyInit() {
    var skip = shouldSkip();
    if (skip) {
      // Fallback path — leave .hero-glow alone, hide any canvases so they
      // don't capture layout/space.
      var nodes = document.querySelectorAll('canvas[data-hero-mesh]');
      for (var i = 0; i < nodes.length; i++) nodes[i].style.display = 'none';
      return;
    }
    var canvases = document.querySelectorAll('canvas[data-hero-mesh]');
    if (!canvases.length) return;

    state.docHidden = document.hidden === true;

    // If IntersectionObserver isn't available, eagerly init all canvases —
    // there's no other way to know visibility. This is the legacy path.
    if (!('IntersectionObserver' in window)) {
      for (var j = 0; j < canvases.length; j++) ensureInitialised(canvases[j]);
      startRafIfNeeded();
      return;
    }

    // Shared IO: rootMargin 100px so the shader is "warm" by the time the
    // canvas scrolls into the actual viewport. Threshold 0 = boolean
    // intersect/not-intersect — we don't need sub-pixel precision here.
    state.io = new IntersectionObserver(function (entries) {
      var changed = false;
      for (var k = 0; k < entries.length; k++) {
        var entry = entries[k];
        var canvas = entry.target;
        if (entry.isIntersecting) {
          var inst = ensureInitialised(canvas);
          if (inst) {
            inst.visible = true;
            changed = true;
          }
        } else if (canvas._caHeroMeshInst) {
          canvas._caHeroMeshInst.visible = false;
        }
      }
      if (changed) startRafIfNeeded();
    }, { rootMargin: '100px', threshold: 0 });

    for (var m = 0; m < canvases.length; m++) {
      state.pending.push(canvases[m]);
      state.io.observe(canvases[m]);
    }
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────
  // We bind `lazyInit` directly on `pageshow` (and on bfcache restore). No
  // requestIdleCallback wrapper: setting up a single IO + observe() is cheap
  // (<1ms) and we WANT the observer attached before the user can scroll. The
  // expensive work (shader compile, GL context) is what the IO defers.
  window.addEventListener('pageshow', function () { lazyInit(); });
  window.addEventListener('pagehide', teardown);
  document.addEventListener('visibilitychange', onVisibilityChange);
})();
