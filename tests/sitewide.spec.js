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
  /*
   * 2026-08-05 (O-16). Each of these tests loads a route, scrolls the whole
   * page in steps, waits for network quiet, samples every image, measures
   * three viewports and then runs a full axe pass. That is comfortably the
   * heaviest test in the suite, it runs once per route per engine, and at 30s
   * it timed out on Gecko on the three longest pages whenever the machine was
   * also running the other five projects. Those timeouts said nothing about
   * the site. Tripled here rather than globally.
   */
  test.slow();

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

      const readImages = () =>
        page.evaluate(() =>
          [...document.querySelectorAll('img')].map((img) => {
            const panel = img.closest('[role="tabpanel"]');
            return {
              src: img.currentSrc || img.src,
              alt: img.getAttribute('alt'),
              /*
               * ── WHAT COUNTS AS HIDDEN, 2026-08-05 (O-16) ─────────────────
               *
               * Was `[role="tabpanel"][hidden]` only. That missed the carousel,
               * and the miss cost real time: /crowmark/ and /crowmark-buyers/
               * failed on Firefox and WebKit naming all eight product screens,
               * and passed in isolation every time.
               *
               * Measured markup: the carousel STACKS its eight slides at one
               * position (all at x=108, w=1065) and marks the seven that are
               * not current with aria-hidden="true". Every image is
               * loading="lazy". So seven of eight are, by the page's own
               * declaration, not being shown to anybody, and whether their lazy
               * fetch has happened yet is timing, not breakage — under a
               * parallel run the sample lands before the fetches, in isolation
               * after them.
               *
               * This file's own header states the rule it is applying: "Images
               * inside a hidden tab panel are still excluded: a reader who
               * never opens that tab never requests them, and that is correct."
               * An aria-hidden carousel slide is the same situation described
               * with a different attribute. The exclusion was under-specified,
               * not wrong.
               *
               * The teeth are kept, and are checked: the CURRENT slide is not
               * aria-hidden and must load like everything else, and the
               * assertion below refuses to pass vacuously on a page where the
               * exclusion swallowed every image.
               */
              hiddenByAncestor:
                (panel ? !!panel.hidden : false) ||
                !!img.closest('[aria-hidden="true"]') ||
                // ...and not rendered at all. Measured on the homepage under
                // reduced motion: four product screens sit inside a
                // .ps__panel with display:none and a 0x0 box — the tab panels
                // the reader has not opened. They are the same case as the
                // hidden tabpanel above, expressed with a class instead of the
                // `hidden` attribute, and asserting on them reports the
                // optimisation as breakage. Measuring the BOX rather than
                // naming the mechanism means the next component to hide
                // something a fifth way is covered without an edit here.
                img.getBoundingClientRect().width === 0 ||
                img.getBoundingClientRect().height === 0,
              loaded: img.complete && img.naturalWidth > 0,
            };
          })
        );

      /*
       * ── LOOK AT AN IMAGE BEFORE DEMANDING IT HAVE LOADED ─────────────────
       * 2026-08-05 (O-16).
       *
       * The scroll sweep above ends with `window.scrollTo(0, 0)`, so by the
       * time the assertion runs every below-the-fold image has been scrolled
       * AWAY from. WebKit treats that as licence to abandon a lazy load that
       * had not begun, and it does: /crowmark-buyers/ reported its first
       * carousel screen — a genuinely displayed 1065x665 element at y=2519 —
       * as never loading, on WebKit only, at one worker, repeatedly, while
       * Chromium and Firefox loaded it. Scroll to it and it appears
       * immediately, which is lazy loading behaving exactly as specified.
       *
       * So the reader is simulated properly: each candidate is brought into
       * view, as somebody reading the page would, and only then is it required
       * to have arrived. This is the same principle the header of this file
       * sets out — exercise the page the way a reader does, then assert on
       * what they end up with — applied to the horizontal axis the original
       * sweep never covered.
       */
      for (const handle of await page.locator('img').elementHandles()) {
        const needsView = await handle.evaluate((img) => {
          const r = img.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return false;
          if (img.closest('[aria-hidden="true"]')) return false;
          const panel = img.closest('[role="tabpanel"]');
          if (panel && panel.hidden) return false;
          return !(img.complete && img.naturalWidth > 0);
        });
        if (needsView) {
          await handle.scrollIntoViewIfNeeded().catch(() => {});
          await page.waitForTimeout(150);
        }
        await handle.dispose();
      }
      await page.evaluate(() => window.scrollTo(0, 0));

      /*
       * ── 2026-08-05 (O-16): THIS PAGE MOVES WHILE YOU MEASURE IT ───────────
       *
       * The check failed intermittently on WebKit, on / and /blog/ and
       * /crowmark/ and one compare route, naming product screens. It looked
       * like broken images and it is not. Measured on the homepage in WebKit,
       * sampling the same page repeatedly after the scroll sweep:
       *
       *     +0 ms    broken = 0
       *     +3000 ms broken = 0
       *     +8000 ms broken = 1  (sup-2-tender-questions-light.webp)
       *
       * An image cannot come UNLOADED. What is happening is A-104 item 2: the
       * product component autoplays through its tabs on a loop, and each swap
       * puts a newly-selected candidate into currentSrc that is, for a few
       * frames, not yet complete. Sample during that window and the page
       * reports a broken image; sample a moment later and it does not.
       *
       * Asserting once, at whatever instant the runner happens to arrive, is
       * therefore not a measurement — it is a coin toss whose odds depend on
       * machine load, which is exactly why this only appeared under a
       * full-suite run. Note also that my first repair made it WORSE: waiting
       * for lazy loading pushed the sample later, into the autoplay.
       *
       * expect.poll is the correct shape here. The claim being tested is
       * "every visible image DOES load", so the page satisfies it the moment
       * any single sample is clean. An image that 404s or cannot be decoded is
       * never clean in any sample, so the poll exhausts and reports it by name
       * exactly as before. Nothing is weakened; the sampling is just no longer
       * a race against an animation.
       */
      await expect
        .poll(
          async () => (await readImages()).filter((i) => !i.hiddenByAncestor && !i.loaded).map((i) => i.src),
          {
            message: 'every visible image must actually load',
            timeout: 20000,
            intervals: [250, 500, 1000, 1000, 2000],
          }
        )
        .toEqual([]);

      const images = await readImages();

      // The exclusion above must not be allowed to swallow the whole check. On
      // any route that ships images, at least one must be on show to a reader —
      // if a change ever marks every image aria-hidden, that is itself the
      // finding, and without this line it would read as a pass.
      if (images.length > 0) {
        expect(
          images.filter((i) => !i.hiddenByAncestor).length,
          'every image on this route is hidden from readers — the load check is asserting nothing',
        ).toBeGreaterThan(0);
      }

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
