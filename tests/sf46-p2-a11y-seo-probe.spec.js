/**
 * SF46 P2-X + P2-Z + P2-AB + P2-AG + P2-AH — site-wide a11y + SEO probe.
 *
 * Asserts foundation premium-bar requirements across every public-facing
 * page. Currently runs against a curated set of representative pages
 * (every archetype + the most-visited specific pages) rather than every
 * single page in find . output — gives high signal at manageable test
 * cost, and the per-page checks here generalise.
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://localhost:8092';

// Representative pages — every archetype + the marketing-critical pages.
// Tools / glossary / blog have their own archetype representatives below.
const ROUTES = [
  '/index.html',
  '/crowagent-core.html',
  '/crowcyber.html',
  '/crowcash.html',
  '/crowmark.html',
  '/crowesg.html',
  '/csrd.html',
  '/pricing.html',
  '/about.html',
  '/contact.html',
  '/partners.html',
  '/faq.html',
  '/security.html',
  '/privacy.html',
  '/terms.html',
  '/cookies.html',
  '/changelog.html',
  '/roadmap.html',
  '/products/index.html',
  '/tools/index.html',
  '/tools/csrd-applicability-checker/index.html',
  '/tools/mees-risk-snapshot/index.html',
  '/tools/ppn-002-calculator/index.html',
  '/blog/index.html',
  '/blog/mees-band-c-2028.html',
  '/blog/csrd-omnibus-i-2026.html',
  '/glossary/index.html',
  '/glossary/csrd.html',
];

// ─── P2-Z — Color contrast (token-driven) ─────────────────────────
function srgbChannel(c) { c /= 255; return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); }
function relLum(rgb) {
  return 0.2126*srgbChannel(rgb[0]) + 0.7152*srgbChannel(rgb[1]) + 0.0722*srgbChannel(rgb[2]);
}
function contrast(a, b) {
  const la = relLum(a), lb = relLum(b);
  return (Math.max(la,lb) + 0.05) / (Math.min(la,lb) + 0.05);
}
function hexToRgb(hex) {
  hex = hex.replace('#','');
  if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
  return [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];
}

test.describe('P2-Z — WCAG color-contrast (token primitives)', () => {
  // Brand tokens (canonical hex from crowagent-brand-tokens.css)
  const TOKENS = {
    bg:      '#040E1A',
    surf:    '#0A1F3A',
    surf2:   '#0D2847',
    cloud:   '#E8F0FA',
    steel:   '#B8CCE0',
    mist:    '#8A9DB8',
    'dim-c': '#7E96B0',
    teal:    '#0CC9A8',
    success: '#22C55E',
    warn:    '#F59E0B',
    err:     '#EF4444',
    sky:     '#5BC8FF',
  };

  // Foreground/background pairs that MUST clear WCAG 4.5:1 (AA body).
  const AA_BODY_PAIRS = [
    ['cloud', 'bg'],
    ['steel', 'bg'],
    ['cloud', 'surf'],
    ['steel', 'surf'],
    ['dim-c', 'bg'],
  ];
  // Pairs that need only 3:1 (AA large/UI)
  const AA_LARGE_PAIRS = [
    ['mist', 'bg'],
    ['teal', 'bg'],
    ['success', 'bg'],
    ['warn', 'bg'],
    ['err', 'bg'],
    ['sky', 'bg'],
  ];

  for (const [fg, bg] of AA_BODY_PAIRS) {
    test(`P2-Z body — ${fg} on ${bg} ≥ 4.5:1`, async () => {
      const c = contrast(hexToRgb(TOKENS[fg]), hexToRgb(TOKENS[bg]));
      expect(c).toBeGreaterThanOrEqual(4.5);
    });
  }

  for (const [fg, bg] of AA_LARGE_PAIRS) {
    test(`P2-Z large/UI — ${fg} on ${bg} ≥ 3:1`, async () => {
      const c = contrast(hexToRgb(TOKENS[fg]), hexToRgb(TOKENS[bg]));
      expect(c).toBeGreaterThanOrEqual(3.0);
    });
  }
});

// ─── P2-X — Skip-link present and correctly wired ─────────────────
test.describe('P2-X — Skip-link present on every page', () => {
  for (const route of ROUTES) {
    test(`P2-X ${route} has skip-link with valid target`, async ({ page }) => {
      await page.goto(BASE + route);
      const skip = await page.evaluate(() => {
        const a = document.querySelector('a.skip-link, a.skip-to-main, a[href="#main"], a[href="#main-content"], a[href="#content"]');
        if (!a) return null;
        const href = a.getAttribute('href');
        const id = href.replace('#','');
        const target = document.getElementById(id);
        return { href, hasTarget: !!target, text: a.textContent.trim() };
      });
      expect(skip, `${route} missing a.skip-link[href="#..."]`).not.toBeNull();
      expect(skip.hasTarget, `${route} skip-link target missing: ${skip.href}`).toBe(true);
    });
  }
});

// ─── P2-AB — Landmark + heading-hierarchy ─────────────────────────
test.describe('P2-AB — Landmarks + heading-hierarchy', () => {
  for (const route of ROUTES) {
    test(`P2-AB ${route} has exactly one <main>`, async ({ page }) => {
      await page.goto(BASE + route);
      const count = await page.evaluate(() => document.querySelectorAll('main').length);
      expect(count, `${route} expected 1 <main>, got ${count}`).toBe(1);
    });

    test(`P2-AB ${route} has exactly one <h1>`, async ({ page }) => {
      await page.goto(BASE + route);
      const count = await page.evaluate(() => document.querySelectorAll('h1').length);
      expect(count, `${route} expected 1 <h1>, got ${count}`).toBe(1);
    });

    test(`P2-AB ${route} heading levels do not skip from h1 → h3`, async ({ page }) => {
      await page.goto(BASE + route);
      const violation = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'));
        const seen = new Set();
        for (const h of headings) {
          const level = parseInt(h.tagName.slice(1), 10);
          // First h1 seen: ok.
          // For any heading at level N>1, level N-1 must have already appeared.
          if (level === 1) { seen.add(1); continue; }
          if (!seen.has(level - 1)) return `${h.tagName} at "${h.textContent.trim().slice(0,40)}" skipped from h${level-1}`;
          seen.add(level);
        }
        return null;
      });
      expect(violation, `${route}: ${violation}`).toBeNull();
    });
  }
});

// ─── P2-AG — Canonical link on every page ─────────────────────────
test.describe('P2-AG — Canonical link', () => {
  for (const route of ROUTES) {
    test(`P2-AG ${route} has <link rel="canonical">`, async ({ page }) => {
      await page.goto(BASE + route);
      const canonical = await page.evaluate(() => {
        const link = document.querySelector('link[rel="canonical"]');
        return link ? link.getAttribute('href') : null;
      });
      expect(canonical, `${route} missing <link rel="canonical">`).not.toBeNull();
      expect(canonical.startsWith('http')).toBe(true);
    });
  }
});

// ─── P2-AH — Title + meta-description uniqueness + length ─────────
test.describe('P2-AH — Title + meta-description per page', () => {
  // Collect across all routes in one beforeAll so we can detect dupes.
  const seenTitles = new Map();
  const seenDescs  = new Map();

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    for (const route of ROUTES) {
      try {
        await page.goto(BASE + route);
        const t = await page.title();
        const d = await page.evaluate(() => {
          const m = document.querySelector('meta[name="description"]');
          return m ? m.getAttribute('content') : null;
        });
        if (t) {
          if (!seenTitles.has(t)) seenTitles.set(t, []);
          seenTitles.get(t).push(route);
        }
        if (d) {
          if (!seenDescs.has(d)) seenDescs.set(d, []);
          seenDescs.get(d).push(route);
        }
      } catch (e) {
        // page didn't load — separate landmark test will flag
      }
    }
    await ctx.close();
  });

  for (const route of ROUTES) {
    test(`P2-AH ${route} has a unique title ≤ 70 chars`, async ({ page }) => {
      await page.goto(BASE + route);
      const t = await page.title();
      expect(t, `${route} has empty title`).toBeTruthy();
      expect(t.length, `${route} title length ${t.length} > 70`).toBeLessThanOrEqual(70);
      const others = (seenTitles.get(t) || []).filter(r => r !== route);
      expect(others, `${route} title duplicated on ${others.join(', ')}`).toHaveLength(0);
    });

    test(`P2-AH ${route} has a unique meta-description ≤ 165 chars`, async ({ page }) => {
      await page.goto(BASE + route);
      const d = await page.evaluate(() => {
        const m = document.querySelector('meta[name="description"]');
        return m ? m.getAttribute('content') : null;
      });
      expect(d, `${route} missing meta description`).toBeTruthy();
      expect(d.length, `${route} description length ${d.length} > 165`).toBeLessThanOrEqual(165);
      const others = (seenDescs.get(d) || []).filter(r => r !== route);
      expect(others, `${route} description duplicated on ${others.join(', ')}`).toHaveLength(0);
    });
  }
});
