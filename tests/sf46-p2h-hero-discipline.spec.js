// SF46 Phase 2 P2-H probe — verify hero discipline refinement.
// Asserts:
//   1. Earth scroll-zoom does not fire when reducedMotion=reduce
//   2. Hero motion count is bounded under reduced-motion
//
// 2026-07-30 dead-JS sweep: the former first assertion source-inspected
// /js/modules/cinematic-init.js for the `gsap.matchMedia()` API. That module was
// DELETED because no page loaded it (absent from every <script src>, from every
// dynamic import, and from the nav-inject.js scriptsToInject list). GSAP plugin
// registration is now done by js/modules/compiled/sovereign-transformation-v2.js,
// which every page loads. The two behavioural reduced-motion assertions below
// are unchanged and cover the same user-visible guarantee.

const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://localhost:8092';

test.describe('SF46 P2-H — hero discipline + a11y matchMedia gate', () => {
  test('P2-H under reduced-motion, hero earth has no transform animation', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('domcontentloaded');
    // Sample the hero earth element's animation state
    const result = await page.evaluate(() => {
      const earth = document.querySelector('.hero-earth-img');
      if (!earth) return { found: false };
      const cs = getComputedStyle(earth);
      return {
        found: true,
        animationDuration: cs.animationDuration,
        transitionDuration: cs.transitionDuration,
      };
    });
    if (result.found) {
      // Reduced-motion baseline forces animation-duration to 0.01ms.
      // Either no animation, or sub-millisecond duration.
      const ad = parseFloat(result.animationDuration);
      const td = parseFloat(result.transitionDuration);
      if (result.animationDuration.endsWith('s')) expect(ad).toBeLessThanOrEqual(0.001);
      if (result.transitionDuration.endsWith('s')) expect(td).toBeLessThanOrEqual(0.001);
    }
    await ctx.close();
  });

  test('P2-H GSAP scroll-zoom is gated by no-preference branch', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`);
    await page.waitForTimeout(800);
    // Scroll down 200px and verify earth transform doesn't aggressively zoom
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(300);
    const transform = await page.evaluate(() => {
      const earth = document.querySelector('.hero-earth-img');
      return earth ? getComputedStyle(earth).transform : 'none';
    });
    // Under reduced-motion, scale should stay near 1 (no aggressive scroll-driven zoom)
    if (transform !== 'none' && transform.includes('matrix')) {
      // Extract scale from matrix(a, b, c, d, ...)
      const m = transform.match(/matrix\(([^)]+)\)/);
      if (m) {
        const parts = m[1].split(',').map(parseFloat);
        const scaleX = parts[0];
        // Without scroll-zoom, scale should be 1 (or 1.05 if CSS sets resting state)
        expect(scaleX).toBeLessThanOrEqual(1.1);
      }
    }
    await ctx.close();
  });
});
