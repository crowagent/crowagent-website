/* ULTRA-PREMIUM HERO BACKDROP (owner 2026-05-31)
   Three.js teal wireframe icosahedron ("citadel") + starfield, ported from
   concept-citadel-master-fusion-v2.html. External module (NOT inline) so it
   satisfies the production CSP (script-src 'self'; inline blocked). Three.js is
   loaded from cdnjs (allowed by the CSP). Guards: WebGL support + reduced-motion.
   Renders into #hero-canvas (absolute, behind the hero content). */
(function () {
  'use strict';
  function start() {
    var container = document.getElementById('hero-canvas');
    if (!container || typeof window.THREE === 'undefined') return;
    if (container.dataset.citadelInit === '1') return;
    container.dataset.citadelInit = '1';

    var THREE = window.THREE;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var w = container.clientWidth || window.innerWidth;
    var h = container.clientHeight || window.innerHeight;

    var renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch (e) { return; } /* no WebGL — leave the CSS glow as the backdrop */
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    /* WIDE perspective = reference fov75/z12 → full cinematic DEPTH + a DENSE
       starfield (a narrow lens showed too few stars). The globe is kept on the
       camera axis (world 0,0,0) so it stays perfectly ROUND with full perspective
       depth; a LENS SHIFT (projectionMatrix offset, applied in resize()) then
       positions it right + slightly down WITHOUT any off-axis distortion. */
    var camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    camera.position.z = 12;
    /* globe screen-position as canvas fractions (centre of globe). Desktop: right
       side so its left edge lands between the "a" and "n" of "compliant", and a
       touch low so its top sits on the middle line "Get paid.". */
    var gFx = function () { return wide() ? 0.822 : 0.5; };
    /* gFy centres the globe on the MIDDLE of the [Get paid. / Stay compliant. /
       description] block (viewport ~604 → canvas-y 471 / 1663 = 0.283) so it sits
       parallel to + behind those lines, NOT pushed below them (owner 2026-05-31). */
    var gFy = function () { return wide() ? 0.283 : 0.30; };
    var applyLensShift = function () {
      /* For an on-axis point, NDC_x = -elements[8] and NDC_y = -elements[9].
         Target NDC: x = 2*gFx-1 (right), y = 1-2*gFy (down) → NEGATE for the matrix. */
      camera.projectionMatrix.elements[8] = 1 - 2 * gFx();   /* → globe RIGHT */
      camera.projectionMatrix.elements[9] = 2 * gFy() - 1;   /* → globe DOWN */
    };

    var wide = function () { return window.innerWidth > 1150; };

    /* The circular object: fine wireframe icosahedron (detail 15 → reads as a globe). */
    /* radius 2.15 (not 4): the canvas now covers the full ~1660px hero, so radius
       2.15 renders ~196px — the SAME size as the reference globe on its 900px canvas. */
    var geometry = new THREE.IcosahedronGeometry(2.15, 15);
    var material = new THREE.MeshPhongMaterial({
      color: 0x0CC9A8, wireframe: true, transparent: true, opacity: 0.1, shininess: 50
    });
    var citadel = new THREE.Mesh(geometry, material);
    /* Owner 2026-05-31: text centred; reference-sized globe (radius 2.15 ~195px)
       shifted RIGHT — TOP at the middle of "Get paid.", LEFT edge at the "n" in
       "compliant". Tuned for the full-hero canvas (~1680px, 91.2px/world-unit):
       x=5.32, y=2.15 world. */
    /* Globe stays ON-AXIS (0,0,0) → perfectly round + full perspective depth.
       The lens shift (applyLensShift) moves it to its screen position. */
    citadel.position.set(0, 0, 0);
    scene.add(citadel);

    /* Starfield */
    var pCount = 1000;
    var pGeo = new THREE.BufferGeometry();
    var pPos = new Float32Array(pCount * 3);
    for (var i = 0; i < pCount * 3; i++) pPos[i] = (Math.random() - 0.5) * 60;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    var particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0x0CC9A8, size: 0.1, transparent: true, opacity: 0.5
    }));
    scene.add(particles);

    var light = new THREE.PointLight(0x0CC9A8, 2, 50);
    /* directly ABOVE the (on-axis) globe so the top is lit and the BOTTOM fades
       dark like the reference. */
    light.position.set(0, 6, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.2)); /* EXACT reference ambient */

    function resize() {
      var ww = container.clientWidth || window.innerWidth;
      var hh = container.clientHeight || window.innerHeight;
      camera.aspect = ww / hh; camera.updateProjectionMatrix();
      applyLensShift();           /* re-apply after every projection rebuild */
      renderer.setSize(ww, hh);
    }
    window.addEventListener('resize', resize);
    resize();                     /* apply the lens shift on first run */

    var running = !reduce;
    function animate() {
      if (!running) return;
      requestAnimationFrame(animate);
      citadel.rotation.y += 0.001;
      citadel.rotation.x += 0.0005;
      particles.rotation.y -= 0.0006;
      renderer.render(scene, camera);
    }
    /* CRITICAL (owner 2026-05-31): the canvas now covers the full #hero, whose
       height GROWS after the carousel images load. The drawing buffer was sized
       once at init (shorter #hero) then CSS-stretched taller → the sphere rendered
       as a vertical ELLIPSE + mis-positioned. A ResizeObserver re-runs resize()
       (camera.aspect + renderer.setSize) on every container size change, keeping
       the buffer matched to the display so the globe stays perfectly CIRCULAR. */
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(function () { resize(); renderer.render(scene, camera); });
      ro.observe(container);
    }
    window.addEventListener('load', function () { setTimeout(function () { resize(); renderer.render(scene, camera); }, 300); });

    /* Pause the loop when the hero scrolls out of view (perf). */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var vis = entries[0] && entries[0].isIntersecting;
        if (vis && !running && !reduce) { running = true; animate(); }
        else if (!vis) { running = false; }
      }, { threshold: 0.01 }).observe(container);
    }

    if (reduce) {
      renderer.render(scene, camera); /* one static frame */
    } else {
      animate();
      if (window.gsap) {
        try { window.gsap.from(citadel.scale, { x: 0, y: 0, z: 0, duration: 2.2, ease: 'expo.out', delay: 0.35 }); } catch (e) {}
      }
    }
  }

  /* Three.js is a deferred cdnjs script — it may not be ready when this runs. Poll briefly. */
  function whenReady() {
    if (typeof window.THREE !== 'undefined') { start(); return; }
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      if (typeof window.THREE !== 'undefined') { clearInterval(iv); start(); }
      else if (tries > 50) clearInterval(iv); /* give up after ~5s */
    }, 100);
  }

  if (document.readyState !== 'loading') whenReady();
  else document.addEventListener('DOMContentLoaded', whenReady);
})();
