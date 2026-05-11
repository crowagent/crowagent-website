/* H1-HERO-PERF 10-10 (2026-05-10)
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
 * - Initialised on `pageshow` against <canvas data-hero-mesh></canvas>.
 * - Cleans up on `pagehide`.
 */
(function () {
  'use strict';

  if (typeof window === 'undefined') return;

  /** Brand colour CSS custom properties (4 blobs). */
  var BLOB_VARS = ['--teal', '--lime', '--sky', '--mark'];

  /** Internal state. Module-level so we can clean up on pagehide. */
  var state = {
    canvases: [],
    rafId: 0,
    lastT: 0,
    lastFrameMs: 0,
  };

  // ── Gracefully bail if env is hostile ────────────────────────────────────
  function shouldSkip() {
    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return 'reduced-motion';
      }
      var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn && conn.saveData === true) return 'save-data';
      // Probe WebGL2 once on a throwaway canvas
      var probe = document.createElement('canvas');
      var gl = probe.getContext('webgl2', { antialias: false, alpha: true });
      if (!gl) return 'no-webgl2';
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
      visible: true,
      resize: resize,
    };

    resize();

    // Pause when off-screen (perf).
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { inst.visible = e.isIntersecting; });
      }, { threshold: 0 });
      io.observe(canvas);
      inst.io = io;
    }

    // Resize handler (per-instance — we share one window listener).
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

  function tick(now) {
    state.rafId = window.requestAnimationFrame(tick);
    var t = now * 0.001;
    if (state.lastFrameMs && (now - state.lastFrameMs) < FRAME_INTERVAL_MS) return;
    state.lastFrameMs = now;
    for (var i = 0; i < state.canvases.length; i++) {
      renderInstance(state.canvases[i], t);
    }
    state.lastT = t;
  }

  function disposeInstance(inst) {
    if (!inst) return;
    try { if (inst.io && inst.io.disconnect) inst.io.disconnect(); } catch (e) { /* noop */ }
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
    state.canvases.forEach(disposeInstance);
    state.canvases = [];
    state.lastFrameMs = 0;
  }

  function init() {
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
    state.canvases = [];
    for (var j = 0; j < canvases.length; j++) {
      var inst = initCanvas(canvases[j]);
      if (inst) state.canvases.push(inst);
      else canvases[j].style.display = 'none'; // graceful per-canvas fallback
    }
    if (!state.canvases.length) return;
    if (!state.rafId) state.rafId = window.requestAnimationFrame(tick);
  }

  // Defer init until AFTER the page is loaded + idle so we never compete
  // with the LCP paint. requestIdleCallback (with a 1s deadline) where
  // available, otherwise a setTimeout fallback.
  function deferredInit() {
    var go = function () {
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(init, { timeout: 1500 });
      } else {
        window.setTimeout(init, 800);
      }
    };
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
  }

  // Bind on `pageshow` (also fires on bfcache restore) and tear down on
  // `pagehide` so we don't leak GL contexts when navigating away. We use the
  // deferred path on first show so the shader never blocks the LCP frame.
  window.addEventListener('pageshow', function (e) {
    // bfcache restores are typically already complete — re-init eagerly so
    // there's no second-load flash.
    if (e.persisted) init();
    else deferredInit();
  });
  window.addEventListener('pagehide', teardown);
})();
