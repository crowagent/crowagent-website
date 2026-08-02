/**
 * Sitewide forensic sweep across every built Astro route.
 *
 * WHY THIS FILE EXISTS. I ran this sweep as an ad-hoc script after each change,
 * rewriting it from memory each time. That produced two classes of failure, and
 * both are worth naming because the checks below are written to prevent them.
 *
 * FALSE NEGATIVES — a check that passed while the site was broken:
 *   - "every image has alt" passed on 37 routes while ALL TWELVE images on the
 *     site were 404ing. It counted an attribute and never asked whether the
 *     image loaded. An accessible description of an image that never arrives is
 *     still nothing on the screen.
 *
 * FALSE POSITIVES — a check that failed while the site was fine, three turns
 * running, each costing a diagnosis:
 *   - substring matching against `innerText`, which omits content inside a
 *     closed <details>;
 *   - substring matching without normalising whitespace, when the source wraps
 *     a sentence across several lines;
 *   - treating a lazy image inside a hidden tab panel as broken, when deferring
 *     it is the optimisation working.
 *
 * The rule those three share: assert the OUTCOME a user gets, not the mechanism
 * that is supposed to produce it. Hence: only VISIBLE images must be loaded,
 * text comes from textContent with whitespace collapsed, and a route fails on a
 * real 4xx/5xx response rather than on a proxy for one.
 *
 * Routes are enumerated from astro/dist, so a new page is covered the moment it
 * is built and nobody has to remember to add it here.
 *
 *   ASTRO_URL=http://localhost:8095 npx playwright test tests/sitewide.spec.js --project=chromium
 */
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('fs');
const path = require('path');

const BASE = process.env.ASTRO_URL || 'http://localhost:8095';
const DIST = path.join(__dirname, '..', 'astro', 'dist');

/** Every built route, discovered rather than listed. */
function builtRoutes(dir, base = '') {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(builtRoutes(full, `${base}/${entry.name}`));
    else if (entry.name === 'index.html') out.push(`${base}/`);
  }
  return out;
}

const ROUTES = fs.existsSync(DIST) ? [...new Set(builtRoutes(DIST))].sort() : [];

test.describe('sitewide', () => {
  test('astro/dist exists and has routes to check', () => {
    expect(ROUTES.length, 'run `npm run build` in astro/ first').toBeGreaterThan(0);
  });

  for (const route of ROUTES) {
    test(`${route} is sound`, async ({ page }) => {
      /** Any response the browser could not fetch, for any subresource. */
      const failures = [];
      page.on('response', (res) => {
        if (res.status() >= 400) failures.push(`${res.status()} ${res.url()}`);
      });

      const response = await page.goto(`${BASE}${route}`, { waitUntil: 'load' });
      expect(response.status(), 'route must return 200').toBe(200);

      // ── Document ────────────────────────────────────────────────────────
      const meta = await page.evaluate(() => {
        const q = (s) => document.querySelector(s);
        return {
          h1: document.querySelectorAll('main h1').length,
          title: (document.title || '').trim(),
          description: q('meta[name="description"]')?.content?.trim() ?? '',
          canonical: q('link[rel="canonical"]')?.href ?? '',
          lang: document.documentElement.lang,
        };
      });

      expect(meta.h1, 'exactly one h1 in main').toBe(1);
      expect(meta.title.length, 'non-empty <title>').toBeGreaterThan(0);
      expect(meta.description.length, 'non-empty meta description').toBeGreaterThan(0);
      expect(meta.canonical, 'canonical must be absolute').toMatch(/^https:\/\//);
      expect(meta.lang, 'html[lang] must be set').toBeTruthy();

      // ── Structured data must PARSE, not merely exist ────────────────────
      const ldErrors = await page.evaluate(() => {
        const errs = [];
        for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
          try {
            JSON.parse(s.textContent);
          } catch (e) {
            errs.push(e.message);
          }
        }
        return errs;
      });
      expect(ldErrors, 'every JSON-LD block must parse').toEqual([]);

      // ── Images ──────────────────────────────────────────────────────────
      /*
       * SCROLL FIRST. `loading="lazy"` images below the fold have not fetched
       * at the `load` event, and asserting on them there reports the
       * optimisation as breakage — which this check did on /crowmark before the
       * scroll was added. That was the FOURTH false positive of this exact
       * shape, in a file written to prevent the first three, so it is worth
       * being blunt about the rule: exercise the page the way a reader does,
       * then assert on what they end up with.
       *
       * Images inside a hidden tab panel are still excluded below: a reader who
       * never opens that tab never requests them, and that is correct.
       */
      await page.evaluate(async () => {
        const step = window.innerHeight;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForLoadState('networkidle').catch(() => {});

      const images = await page.evaluate(() =>
        [...document.querySelectorAll('img')].map((img) => ({
          src: img.currentSrc || img.src,
          alt: img.getAttribute('alt'),
          hiddenByAncestor: !img.closest('[role="tabpanel"]')
            ? false
            : !!img.closest('[role="tabpanel"]').hidden,
          loaded: img.complete && img.naturalWidth > 0,
        }))
      );

      const brokenVisible = images.filter((i) => !i.hiddenByAncestor && !i.loaded);
      expect(
        brokenVisible.map((i) => i.src),
        'every visible image must actually load'
      ).toEqual([]);

      const missingAlt = images.filter((i) => i.alt === null);
      expect(missingAlt.map((i) => i.src), 'every image needs an alt attribute').toEqual([]);

      // ── Every link must have an accessible name ─────────────────────────
      const unnamed = await page.evaluate(() =>
        [...document.querySelectorAll('a')]
          .filter(
            (a) =>
              !a.textContent.trim() &&
              !a.getAttribute('aria-label') &&
              !a.querySelector('img[alt]:not([alt=""])')
          )
          .map((a) => a.getAttribute('href'))
      );
      expect(unnamed, 'no link may be announced with no name').toEqual([]);

      // ── Layout ──────────────────────────────────────────────────────────
      for (const width of [390, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        const overflows = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth
        );
        expect(overflows, `horizontal overflow at ${width}px`).toBe(false);
      }
      await page.setViewportSize({ width: 1440, height: 900 });

      // ── Accessibility ───────────────────────────────────────────────────
      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        axe.violations.map((v) => `${v.id} (${v.nodes.length})`),
        'WCAG 2.2 AA'
      ).toEqual([]);

      // ── Nothing on the page may 404 ─────────────────────────────────────
      // Last, so a genuine content failure above is reported first.
      expect(failures, 'no subresource may fail to load').toEqual([]);
    });
  }
});
