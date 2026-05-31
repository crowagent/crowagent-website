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
    var camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    camera.position.z = 12;

    var wide = function () { return window.innerWidth > 1150; };

    /* The circular object: fine wireframe icosahedron (detail 15 → reads as a globe). */
    var geometry = new THREE.IcosahedronGeometry(4, 15);
    var material = new THREE.MeshPhongMaterial({
      color: 0x0CC9A8, wireframe: true, transparent: true, opacity: 0.1, shininess: 50
    });
    var citadel = new THREE.Mesh(geometry, material);
    citadel.position.x = wide() ? 7 : 0;
    citadel.position.y = wide() ? 0 : -3;
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
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));

    function resize() {
      var ww = container.clientWidth || window.innerWidth;
      var hh = container.clientHeight || window.innerHeight;
      camera.aspect = ww / hh; camera.updateProjectionMatrix();
      renderer.setSize(ww, hh);
      citadel.position.x = wide() ? 7 : 0;
      citadel.position.y = wide() ? 0 : -3;
    }
    window.addEventListener('resize', resize);

    var running = !reduce;
    function animate() {
      if (!running) return;
      requestAnimationFrame(animate);
      citadel.rotation.y += 0.001;
      citadel.rotation.x += 0.0005;
      particles.rotation.y -= 0.0006;
      renderer.render(scene, camera);
    }
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
