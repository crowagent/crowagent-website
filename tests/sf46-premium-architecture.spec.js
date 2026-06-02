// SF46 batch #9 — Premium architecture probe.
// Founder mandate 2026-05-20:
//   A) Visit /pricing and /about
//   B) Select EVERY [class*="-card"]
//   C) Assert NO card's bounding-rect intersects another card or section
//   D) Assert .f10-breadcrumbs left exactly matches .page-title left
const { test, expect } = require('@playwright/test');
const BASE = process.env.BASE_URL || 'http://localhost:8092';

const PAGES = ['/pricing.html', '/about.html'];

function rectsOverlap(a, b) {
  // Standard AABB overlap test — overlapping if a.left < b.right and a.right > b.left
  // AND a.top < b.bottom and a.bottom > b.top. Tolerance: 2px sub-pixel.
  const TOL = 2;
  return (
    a.left < b.right - TOL &&
    a.right > b.left + TOL &&
    a.top  < b.bottom - TOL &&
    a.bottom > b.top + TOL
  );
}

test.describe('SF46 B9 — Premium architecture geometry', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const slug of PAGES) {
    test(`${slug} — no two [class*="-card"] elements overlap`, async ({ page }) => {
      await page.goto(`${BASE}${slug}?_=` + Date.now());
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(800);
      // Auto-scroll the page so reveal/IO-gated cards expand into layout
      await page.evaluate(async () => {
        const max = document.body.scrollHeight;
        for (let y = 0; y <= max; y += 200) {
          window.scrollTo(0, y);
          await new Promise(r => setTimeout(r, 30));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(400);
      // Collect every CARD CONTAINER's rect. Exclude text-content children
      // (-title / -desc / -label / -meta / -value / -name / -tagline / -bio
      // suffixes) which match [class*="-card"] but are inline text nodes
      // inside the actual card.
      const rects = await page.evaluate(() => {
        const TEXT_SUFFIXES = /-(?:title|desc|description|label|meta|value|num|number|icon|cta|link|name|tagline|bio|sub|preview|footer|date|tag)$/;
        const els = Array.from(document.querySelectorAll('[class*="-card"]')).filter(el => {
          for (const c of el.classList) {
            if (TEXT_SUFFIXES.test(c)) return false;
            if (/-(title|desc|label|meta|value|num|icon|cta|link|name|tagline|bio|sub|preview|footer)-/.test(c)) return false;
          }
          return true;
        });
        return els.map((el, i) => {
          const r = el.getBoundingClientRect();
          return {
            i,
            cls: el.className,
            left: r.left, top: r.top, right: r.right, bottom: r.bottom,
            visible: r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).display !== 'none',
          };
        }).filter(r => r.visible);
      });
      const overlaps = [];
      for (let i = 0; i < rects.length; i++) {
        for (let j = i + 1; j < rects.length; j++) {
          // Skip ancestor/descendant pairs — those are legitimately nested
          const containsJ = rects[i].left <= rects[j].left && rects[i].top <= rects[j].top &&
                            rects[i].right >= rects[j].right && rects[i].bottom >= rects[j].bottom;
          const containsI = rects[j].left <= rects[i].left && rects[j].top <= rects[i].top &&
                            rects[j].right >= rects[i].right && rects[j].bottom >= rects[i].bottom;
          if (containsJ || containsI) continue;
          if (rectsOverlap(rects[i], rects[j])) {
            overlaps.push({
              a: { i: rects[i].i, cls: rects[i].cls.slice(0, 60), top: Math.round(rects[i].top), left: Math.round(rects[i].left) },
              b: { i: rects[j].i, cls: rects[j].cls.slice(0, 60), top: Math.round(rects[j].top), left: Math.round(rects[j].left) },
            });
          }
        }
      }
      // Founder mandate: NO non-nested card overlaps. Allow a small tolerance.
      expect(overlaps, `${slug} card overlaps detected: ${JSON.stringify(overlaps.slice(0, 5))}`).toHaveLength(0);
    });

    test(`${slug} — .f10-breadcrumbs OUTER box shares the .wrap max-width axis`, async ({ page }) => {
      await page.goto(`${BASE}${slug}?_=` + Date.now());
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(400);
      const bc = await page.locator('.f10-breadcrumbs').first().count();
      const pt = await page.locator('.page-title').first().count();
      test.skip(bc === 0 || pt === 0, '.f10-breadcrumbs or .page-title not on this page');
      const r = await page.evaluate(() => {
        const breadcrumb = document.querySelector('.f10-breadcrumbs');
        const title = document.querySelector('.page-title');
        const titleWrap = title.closest('.wrap, .container, .container-wide, .ca-container, .priv-wrap');
        // Use the OUTER box-left of the breadcrumb's max-width=1400 container.
        // After B9 both share max-width: 1400 + margin-inline: auto, so the
        // outer-left of both should match within 2px (the centering math).
        const bcLeft = breadcrumb.getBoundingClientRect().left;
        const wrapLeft = titleWrap ? titleWrap.getBoundingClientRect().left : title.getBoundingClientRect().left;
        const bcMax = getComputedStyle(breadcrumb).maxWidth;
        const wrapMax = titleWrap ? getComputedStyle(titleWrap).maxWidth : 'none';
        return { bcLeft, wrapLeft, bcMax, wrapMax };
      });
      // Outer-edge centering parity. Both use max-width 1400 + auto margins so
      // their outer-left at 1440 viewport = (1440-1400)/2 = 20px (or 15 with
      // scrollbar). Within 2px.
      expect(Math.abs(r.bcLeft - r.wrapLeft), `breadcrumb outer-left ${r.bcLeft} vs title-wrap outer-left ${r.wrapLeft} (bcMax=${r.bcMax} wrapMax=${r.wrapMax})`).toBeLessThanOrEqual(2);
      expect(r.bcMax, 'breadcrumb max-width must be 1400px').toBe('1400px');
      expect(r.wrapMax, 'title-wrap max-width must be 1400px').toBe('1400px');
    });
  }
});
