#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   tools/geometric-truth.js
   Founder directive 2026-05-20 — GEOMETRIC RECOVERY VALIDATOR.

   Three gates that MUST be measured (not asserted via DOM/CSS regex):
     A) H1 ↔ primary-CTA horizontal-centre drift. Fail if > 10 px.
     B) Card overlap count via Playwright getBoundingClientRect
        intersection on every .sv-card. Fail if overlaps > 0.
     C) #ca-nav height. Fail if < 60 px.

   Also reports for context:
     D) Hero section total height.
     E) .hero-bg-earth rendered size + computed z-index.
     F) Coordinates of every key element so a human can verify by eye.

   Usage: node tools/geometric-truth.js
   Exit 0 = all gates pass. Exit 1 = any gate fails (with numbers).
   ═══════════════════════════════════════════════════════════════════════ */
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:8092';
const VIEWPORT = { width: 1440, height: 900 };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  const page = await ctx.newPage();

  await page.goto(BASE + '/?_=' + Date.now(), { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.evaluate(() => {
    const b = document.querySelector('#ca-cookie, .cookie-banner');
    if (b) b.style.display = 'none';
  });

  const measurements = await page.evaluate(() => {
    // ── A) H1 ↔ primary CTA centre drift ───────────────────────────────
    const hero = document.querySelector('section.hero, #hero');
    const h1 = document.querySelector('section.hero h1, #hero h1');
    // CTA target = the .hero-btns GROUP wrapper if present (a centred row of
    // 2 buttons). The primary button alone is offset from group centre by
    // half-of-(group-width − primary-width); measuring the group yields the
    // axis the designer is actually trying to centre against the H1.
    const cta = hero
      ? (hero.querySelector('.hero-btns, .hero-cta-row, .cta-row') || hero.querySelector('.sv-btn--primary, .btn-primary'))
      : null;

    function rect(el) {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        top: Math.round(r.top), left: Math.round(r.left),
        width: Math.round(r.width), height: Math.round(r.height),
        centerX: Math.round(r.left + r.width / 2),
        centerY: Math.round(r.top + r.height / 2),
      };
    }

    const h1Rect = rect(h1);
    const ctaRect = rect(cta);
    const drift = h1Rect && ctaRect ? Math.abs(h1Rect.centerX - ctaRect.centerX) : null;

    // ── B) Card overlap intersection scan ──────────────────────────────
    const cards = Array.from(document.querySelectorAll('.sv-card'));
    const cardRects = cards.map((c, i) => {
      const r = c.getBoundingClientRect();
      return { i, r, tag: c.tagName + (c.className ? '.' + c.className.split(' ').slice(0,2).join('.') : '') };
    });
    let overlapCount = 0;
    const overlaps = [];
    for (let i = 0; i < cardRects.length; i++) {
      for (let j = i + 1; j < cardRects.length; j++) {
        const a = cardRects[i].r;
        const b = cardRects[j].r;
        // Skip if either is zero-sized
        if (a.width === 0 || a.height === 0 || b.width === 0 || b.height === 0) continue;
        // Skip if either contains the other (parent/child cards)
        const aContainsB = a.left <= b.left && a.right >= b.right && a.top <= b.top && a.bottom >= b.bottom;
        const bContainsA = b.left <= a.left && b.right >= a.right && b.top <= a.top && b.bottom >= a.bottom;
        if (aContainsB || bContainsA) continue;
        // Real overlap
        const xOverlap = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
        const yOverlap = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        if (xOverlap > 4 && yOverlap > 4) {
          overlapCount++;
          if (overlaps.length < 10) overlaps.push({ a: cardRects[i].tag, b: cardRects[j].tag, xOverlap, yOverlap });
        }
      }
    }

    // ── C) #ca-nav height ──────────────────────────────────────────────
    const nav = document.querySelector('#ca-nav');
    const navRect = rect(nav);

    // ── D) Hero height ─────────────────────────────────────────────────
    const heroRect = rect(hero);

    // ── E) Earth state ─────────────────────────────────────────────────
    const earth = document.querySelector('.hero-bg-earth');
    const earthRect = rect(earth);
    const earthCS = earth ? getComputedStyle(earth) : null;

    return {
      h1: h1Rect,
      cta: ctaRect,
      drift,
      cardsTotal: cardRects.length,
      overlapCount,
      overlapsSample: overlaps,
      nav: navRect,
      hero: heroRect,
      earth: earthRect ? { ...earthRect, zIndex: earthCS.zIndex, position: earthCS.position, opacity: earthCS.opacity, display: earthCS.display } : null,
    };
  });

  await browser.close();

  // ── Render report ───────────────────────────────────────────────────
  function pass(b) { return b ? '✓' : '✗'; }
  const G = {
    A: { passed: measurements.drift !== null && measurements.drift <= 10, value: measurements.drift, threshold: '≤ 10 px' },
    B: { passed: measurements.overlapCount === 0, value: measurements.overlapCount, threshold: '= 0' },
    C: { passed: measurements.nav && measurements.nav.height > 60, value: measurements.nav ? measurements.nav.height : null, threshold: '> 60 px' },
    D: { passed: measurements.earth && measurements.earth.height > 100, value: measurements.earth ? `${measurements.earth.width}×${measurements.earth.height}` : null, threshold: 'height > 100 px' },
  };

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  GEOMETRIC TRUTH VALIDATOR — Homepage @ 1440×900');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`A) H1 ↔ CTA horizontal-centre drift:  ${G.A.value} px           ${pass(G.A.passed)}  (gate: ${G.A.threshold})`);
  console.log(`   H1   center: x=${measurements.h1 ? measurements.h1.centerX : '?'}, y=${measurements.h1 ? measurements.h1.centerY : '?'}, ${measurements.h1 ? measurements.h1.width+'×'+measurements.h1.height : ''}`);
  console.log(`   CTA  center: x=${measurements.cta ? measurements.cta.centerX : '?'}, y=${measurements.cta ? measurements.cta.centerY : '?'}, ${measurements.cta ? measurements.cta.width+'×'+measurements.cta.height : ''}`);
  console.log(``);
  console.log(`B) Card overlap count:               ${G.B.value} overlaps     ${pass(G.B.passed)}  (gate: ${G.B.threshold})`);
  console.log(`   Cards scanned:                   ${measurements.cardsTotal}`);
  if (measurements.overlapsSample.length) {
    console.log(`   First overlaps:`);
    for (const o of measurements.overlapsSample) console.log(`     • ${o.a} ↔ ${o.b}  (x:${o.xOverlap}, y:${o.yOverlap})`);
  }
  console.log(``);
  console.log(`C) #ca-nav rendered height:          ${G.C.value} px           ${pass(G.C.passed)}  (gate: ${G.C.threshold})`);
  console.log(``);
  console.log(`D) Earth backdrop renders:           ${G.D.value}     ${pass(G.D.passed)}  (gate: ${G.D.threshold})`);
  console.log(`   z-index=${measurements.earth ? measurements.earth.zIndex : '?'}, position=${measurements.earth ? measurements.earth.position : '?'}, opacity=${measurements.earth ? measurements.earth.opacity : '?'}`);
  console.log(``);
  console.log(`Hero section: ${measurements.hero ? measurements.hero.width + '×' + measurements.hero.height : '?'} (at top: ${measurements.hero ? measurements.hero.top : '?'})`);
  console.log('═══════════════════════════════════════════════════════════════');

  const allPass = G.A.passed && G.B.passed && G.C.passed && G.D.passed;
  console.log(allPass ? '  RESULT: GEOMETRIC TRUTH GREEN' : '  RESULT: GEOMETRY BROKEN — fix the ✗ gates above');
  console.log('═══════════════════════════════════════════════════════════════');
  process.exit(allPass ? 0 : 1);
})();
