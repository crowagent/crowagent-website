/**
 * Layout soundness gate — header geometry, single h1, and card overlap.
 *
 * ── WHAT THIS FILE USED TO BE (O-16, 2026-08-05) ────────────────────────────
 *
 * "Principal Architect Visual Audit": three tests, ZERO assertions. It gathered
 * a metrics object, `console.log`ged it, took a screenshot, and returned. It
 * could not fail. And by the time it was read, none of what it measured
 * existed: `.hero-bg-earth`, `.sv-btn--primary`, `.btn-primary-v2` and
 * `.sv-card` all occur zero times in index.html, so `metrics` came back holding
 * a nav entry and nothing else, and the overlap loop ran over an empty array
 * and found the zero overlaps it was always going to find. Three more
 * permanently-green tests in the total.
 *
 * ── WHAT IT IS NOW ──────────────────────────────────────────────────────────
 *
 * The one idea here that nothing else in the suite covers is OVERLAP: two boxes
 * occupying the same pixels. sitewide.spec.js catches horizontal overflow, axe
 * catches contrast and naming, the visual-regression project catches drift
 * against a baseline — none of them notice two cards sitting on top of each
 * other inside a container that fits.
 *
 * So overlap is kept and made real, and the two other cheap structural facts
 * the original gestured at are asserted properly: the header must be present
 * with real height, and there must be exactly one h1.
 *
 * Overlap is compared only between cards of the SAME class. Cards of different
 * classes legitimately nest — a stat tile inside a panel is not a defect — and
 * comparing across classes reports every nesting as breakage, which is how an
 * overlap check earns its reputation for noise and gets deleted.
 *
 * Targets the ASTRO tree: it navigated with relative paths against a baseURL
 * that used to be live production.
 */
const { test, expect } = require('@playwright/test');

const BASE = process.env.ASTRO_URL || 'http://127.0.0.1:8095';

const PAGES = [
  { name: 'homepage', path: '/' },
  { name: 'pricing', path: '/pricing/' },
  { name: 'about', path: '/about/' },
];

for (const p of PAGES) {
  test(`layout of ${p.name} is sound at 1440`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const res = await page.goto(`${BASE}${p.path}`, { waitUntil: 'load' });
    expect(res?.status(), `${p.path} must exist`).toBe(200);
    // Reveal animations and the magnetic/hover wiring settle first; geometry
    // read during an arrival animation is geometry of the animation, which has
    // faked failures on this site before.
    await page.waitForTimeout(1500);

    const metrics = await page.evaluate(() => {
      const header = document.querySelector('header.ca-nav');
      const headerBox = header ? header.getBoundingClientRect() : null;

      const cards = [...document.querySelectorAll('.card, [class*="__card"]')]
        .map((el) => {
          const r = el.getBoundingClientRect();
          // The primary class, ignoring Astro's scoped astro-* hashes.
          const cls = (typeof el.className === 'string' ? el.className : '')
            .split(/\s+/)
            .filter((c) => c && !c.startsWith('astro-'))[0];
          return { cls, x: r.x, y: r.y, w: r.width, h: r.height };
        })
        .filter((c) => c.w > 0 && c.h > 0 && c.cls);

      const overlaps = [];
      for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
          const a = cards[i];
          const b = cards[j];
          if (a.cls !== b.cls) continue;
          const apart =
            a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y;
          if (!apart) {
            overlaps.push(
              `two .${a.cls} overlap: (${Math.round(a.x)},${Math.round(a.y)} ${Math.round(a.w)}x${Math.round(a.h)}) and (${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.w)}x${Math.round(b.h)})`,
            );
          }
        }
      }

      return {
        hasHeader: !!header,
        headerHeight: headerBox ? Math.round(headerBox.height) : 0,
        headerTop: headerBox ? Math.round(headerBox.top) : null,
        h1Count: document.querySelectorAll('h1').length,
        cardCount: cards.length,
        overlaps,
      };
    });

    expect(metrics.hasHeader, 'header.ca-nav must be in the document').toBe(true);
    expect(metrics.headerHeight, 'the header must have real height').toBeGreaterThan(40);
    expect(metrics.headerTop, 'the header must start at the top of the viewport').toBe(0);
    expect(metrics.h1Count, 'exactly one h1').toBe(1);
    // If this ever reads 0 the selector has drifted and the overlap check has
    // silently stopped checking anything — which is the failure that made this
    // whole file worthless. Assert it can see its subject.
    expect(metrics.cardCount, 'the card selector must still match something').toBeGreaterThan(0);
    expect(metrics.overlaps, 'no two cards of the same kind may overlap').toEqual([]);
  });
}
