// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

/**
 * tests/parity.spec.js — LEGACY vs ASTRO visual/structural regression harness.
 *
 * WHY: the owner was burned by a deploy that changed page layouts without
 * approval. Before the Astro rebuild can replace the legacy static site, we
 * need per-route, evidence-backed proof of exactly what changed and what did
 * not. This spec is that proof. See migration/VISUAL-PARITY.md for the
 * generated report.
 *
 * Servers (playwright.config.js now starts BOTH, reusing any already running):
 *   LEGACY : http://127.0.0.1:8092  (repo root, `npx serve . -l 8092`)
 *   ASTRO  : http://127.0.0.1:8095  (astro/dist, `npx serve astro/dist -l 8095`)
 *
 * 2026-08-05 (O-16): the ASTRO default was port 8093, where nothing listens
 * and nothing in this repo has ever been configured to listen. Every one of
 * the 22 routes therefore failed with "route missing on ASTRO (status no
 * response)" — a whole spec reporting 22 regressions that were all the same
 * empty port. 8095 is the port astro/dist is actually served on, and the port
 * every other Astro-facing spec in this directory already defaults to.
 *
 * Routes are DERIVED from astro/dist (never hardcoded) — every directory
 * under blog/, compare/, sectors/, glossary/ that has an index.html is a
 * ported route and therefore comparable. 22 routes as of 2026-08-02.
 *
 * HARD FAILURES (true regressions vs a legacy static site being ported):
 *   - route missing on either side (non-200 or nav error)
 *   - <title> / meta description / canonical differ
 *   - JSON-LD @type set differs (live SEO surface)
 *   - normalised visible text differs by more than 2% (word-multiset method)
 *   - h1 count is 0 or more than 1
 *
 * Everything else (h2/h3 counts, link counts, geometry, screenshots) is
 * REPORTED only — the rebuild is a deliberate redesign, not a byte-for-byte
 * clone, so layout/structure differences are expected and are NOT failures.
 */

const LEGACY_BASE = process.env.LEGACY_BASE || 'http://127.0.0.1:8092';
const ASTRO_BASE =
  process.env.ASTRO_BASE || process.env.ASTRO_URL || 'http://127.0.0.1:8095';
const DIST_DIR = path.join(__dirname, '..', 'astro', 'dist');
const SHOTS_DIR = path.join(__dirname, 'parity-shots');
// Playwright runs each test file's tests across N worker PROCESSES by
// default, so a single in-memory accumulator array only ever sees the
// subset of routes that landed on that particular worker — the rest are
// silently lost when each worker writes "its" final results.json last one
// wins. Each test therefore writes its OWN result.json next to its
// screenshots; tests/build-parity-report.js merges all of them afterwards.
// This is correct under any --workers value, including the default.

const VIEWPORT = { width: 1280, height: 900 };
const TEXT_DIFF_HARD_FAIL_PCT = 2;

// ─────────────────────────────────────────────────────────────────────────
// Route discovery — walk astro/dist for every index.html under the four
// ported top-level sections. This is the ONLY source of truth for the route
// list; nothing here is hand-maintained.
// ─────────────────────────────────────────────────────────────────────────
function discoverRoutes() {
  const topSections = ['blog', 'compare', 'sectors', 'glossary'];
  const routes = [];

  function walk(dir, urlPrefix) {
    const indexFile = path.join(dir, 'index.html');
    if (fs.existsSync(indexFile)) {
      routes.push(urlPrefix);
    }
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), `${urlPrefix}${entry.name}/`);
      }
    }
  }

  for (const section of topSections) {
    const sectionDir = path.join(DIST_DIR, section);
    if (!fs.existsSync(sectionDir)) continue;
    walk(sectionDir, `/${section}/`);
  }

  routes.sort();
  return routes;
}

function slugForRoute(route) {
  const trimmed = route.replace(/^\/|\/$/g, '');
  return trimmed === '' ? 'root' : trimmed.replace(/\//g, '-');
}

// ─────────────────────────────────────────────────────────────────────────
// Word-multiset text diff. Chosen over an O(n*m) LCS/Myers diff because some
// ported pages run to several thousand words and this needs to run for 22
// routes x 2 in one spec run without timing out. It is a proxy for "how much
// of the wording changed", not a literary diff — documented as such in the
// generated report. Symmetric-difference-over-max-length gives an intuitive
// 0% (identical bag of words) to 100% (nothing in common) scale.
// ─────────────────────────────────────────────────────────────────────────
function diffWordSets(legacyText, astroText) {
  const wa = legacyText.split(' ').filter(Boolean);
  const wb = astroText.split(' ').filter(Boolean);

  const counts = new Map();
  for (const w of wa) counts.set(w, (counts.get(w) || 0) + 1);

  const addedSample = [];
  let common = 0;
  for (const w of wb) {
    const c = counts.get(w) || 0;
    if (c > 0) {
      counts.set(w, c - 1);
      common++;
    } else if (addedSample.length < 20) {
      addedSample.push(w);
    }
  }

  const removedSample = [];
  for (const [w, c] of counts.entries()) {
    for (let i = 0; i < c && removedSample.length < 20; i++) removedSample.push(w);
    if (removedSample.length >= 20) break;
  }

  const total = Math.max(wa.length, wb.length, 1);
  const differing = total - common;
  const pct = (differing / total) * 100;

  return {
    pct: Math.round(pct * 100) / 100,
    legacyWordCount: wa.length,
    astroWordCount: wb.length,
    removedSample: removedSample.join(' '),
    addedSample: addedSample.join(' '),
  };
}

// ─────────────────────────────────────────────────────────────────────────
// In-page extraction. Uses real DOM APIs (not regex over source) so
// attribute order / self-closing tags / whitespace never produce false
// positives — the legacy pages in particular have `content` before `name`
// on some meta tags.
// ─────────────────────────────────────────────────────────────────────────
async function extractPageData(page) {
  return page.evaluate(() => {
    function norm(s) {
      return (s || '').replace(/\s+/g, ' ').trim();
    }

    const title = norm(document.title);
    const metaDesc = norm(
      document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    );
    const canonicalRaw =
      document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
    // Normalise trailing slash so a directory-index href and a slash-less
    // href are not reported as a canonical mismatch.
    const canonical = canonicalRaw.trim().replace(/\/$/, '');

    const h1 = document.querySelectorAll('h1').length;
    const h2 = document.querySelectorAll('h2').length;
    const h3 = document.querySelectorAll('h3').length;

    const origin = location.origin;
    const links = Array.from(document.querySelectorAll('a[href]'));
    const internalLinks = links.filter((a) => {
      const href = a.getAttribute('href') || '';
      if (!href || href.startsWith('#')) return false;
      if (href.startsWith('mailto:') || href.startsWith('tel:')) return false;
      if (href.startsWith('javascript:')) return false;
      if (/^https?:\/\//i.test(href)) {
        try {
          return new URL(href).origin === origin;
        } catch (_) {
          return false;
        }
      }
      return true;
    }).length;

    const jsonLdNodes = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]'),
    );
    const jsonLdTypes = [];
    let jsonLdParseErrors = 0;
    function collectTypes(node) {
      if (!node || typeof node !== 'object') return;
      if (node['@type']) {
        const t = node['@type'];
        if (Array.isArray(t)) jsonLdTypes.push(...t);
        else jsonLdTypes.push(t);
      }
      if (Array.isArray(node['@graph'])) {
        for (const g of node['@graph']) collectTypes(g);
      }
    }
    for (const node of jsonLdNodes) {
      try {
        const parsed = JSON.parse(node.textContent || '');
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of arr) collectTypes(item);
      } catch (_) {
        jsonLdParseErrors++;
      }
    }

    const text = norm(document.body ? document.body.innerText : '');
    const scrollHeight = document.documentElement.scrollHeight;

    function rect(sel) {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { width: Math.round(r.width), height: Math.round(r.height) };
    }

    return {
      title,
      metaDesc,
      canonical,
      h1,
      h2,
      h3,
      internalLinks,
      jsonLdBlockCount: jsonLdNodes.length,
      jsonLdTypes: jsonLdTypes.slice().sort(),
      jsonLdParseErrors,
      text,
      scrollHeight,
      main: rect('main'),
      nav: rect('nav'),
      footer: rect('footer'),
    };
  });
}

function sameArray(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

// ─────────────────────────────────────────────────────────────────────────
// Test run
// ─────────────────────────────────────────────────────────────────────────
const routes = discoverRoutes();

fs.mkdirSync(SHOTS_DIR, { recursive: true });

test.describe('LEGACY vs ASTRO parity', () => {
  test.beforeAll(() => {
    if (routes.length === 0) {
      throw new Error(
        `No routes discovered under ${DIST_DIR}. Did you run \`npm run build\` inside astro/ first?`,
      );
    }
  });

  for (const route of routes) {
    test(`parity: ${route}`, async ({ browser }) => {
      const slug = slugForRoute(route);
      const shotDir = path.join(SHOTS_DIR, slug);
      fs.mkdirSync(shotDir, { recursive: true });

      const result = {
        route,
        legacyOk: false,
        astroOk: false,
        legacyStatus: null,
        astroStatus: null,
        legacy: null,
        astro: null,
        textDiff: null,
        hardFailures: [],
        notes: [],
      };

      const context = await browser.newContext({ viewport: VIEWPORT });

      // ---- LEGACY ----
      const legacyPage = await context.newPage();
      try {
        const resp = await legacyPage.goto(`${LEGACY_BASE}${route}`, {
          waitUntil: 'networkidle',
          timeout: 20000,
        });
        result.legacyStatus = resp ? resp.status() : null;
        result.legacyOk = !!resp && resp.status() < 400;
        if (result.legacyOk) {
          result.legacy = await extractPageData(legacyPage);
          await legacyPage.screenshot({
            path: path.join(shotDir, 'legacy.png'),
            fullPage: true,
          });
        }
      } catch (err) {
        result.notes.push(`legacy load error: ${err.message}`);
      }
      await legacyPage.close();

      // ---- ASTRO ----
      const astroPage = await context.newPage();
      try {
        const resp = await astroPage.goto(`${ASTRO_BASE}${route}`, {
          waitUntil: 'networkidle',
          timeout: 20000,
        });
        result.astroStatus = resp ? resp.status() : null;
        result.astroOk = !!resp && resp.status() < 400;
        if (result.astroOk) {
          result.astro = await extractPageData(astroPage);
          await astroPage.screenshot({
            path: path.join(shotDir, 'astro.png'),
            fullPage: true,
          });
        }
      } catch (err) {
        result.notes.push(`astro load error: ${err.message}`);
      }
      await astroPage.close();

      await context.close();

      // ---- HARD FAILURE: route missing on either side ----
      if (!result.legacyOk) {
        result.hardFailures.push(
          `route missing on LEGACY (status ${result.legacyStatus ?? 'no response'})`,
        );
      }
      if (!result.astroOk) {
        result.hardFailures.push(
          `route missing on ASTRO (status ${result.astroStatus ?? 'no response'})`,
        );
      }

      if (result.legacyOk && result.astroOk) {
        const L = result.legacy;
        const A = result.astro;

        // ---- HARD FAILURE: title / description / canonical ----
        if (L.title !== A.title) {
          result.hardFailures.push(
            `title differs: LEGACY "${L.title}" vs ASTRO "${A.title}"`,
          );
        }
        if (L.metaDesc !== A.metaDesc) {
          result.hardFailures.push(
            `meta description differs: LEGACY "${L.metaDesc}" vs ASTRO "${A.metaDesc}"`,
          );
        }
        if (L.canonical !== A.canonical) {
          result.hardFailures.push(
            `canonical differs: LEGACY "${L.canonical}" vs ASTRO "${A.canonical}"`,
          );
        }

        // ---- HARD FAILURE: JSON-LD @type set ----
        if (!sameArray(L.jsonLdTypes, A.jsonLdTypes)) {
          result.hardFailures.push(
            `JSON-LD @type set differs: LEGACY [${L.jsonLdTypes.join(', ')}] vs ASTRO [${A.jsonLdTypes.join(', ')}]`,
          );
        }

        // ---- HARD FAILURE: text diff > threshold ----
        const textDiff = diffWordSets(L.text, A.text);
        result.textDiff = textDiff;
        if (textDiff.pct > TEXT_DIFF_HARD_FAIL_PCT) {
          result.hardFailures.push(
            `visible text differs by ${textDiff.pct}% (> ${TEXT_DIFF_HARD_FAIL_PCT}% threshold). ` +
              `Legacy-only sample: "${textDiff.removedSample}" | Astro-only sample: "${textDiff.addedSample}"`,
          );
        }

        // ---- HARD FAILURE: h1 count ----
        if (L.h1 !== 1) {
          result.hardFailures.push(`LEGACY has ${L.h1} <h1> elements (must be exactly 1)`);
        }
        if (A.h1 !== 1) {
          result.hardFailures.push(`ASTRO has ${A.h1} <h1> elements (must be exactly 1)`);
        }

        // ---- Reported-only notes (never fail) ----
        if (L.h2 !== A.h2) result.notes.push(`h2 count: legacy ${L.h2} vs astro ${A.h2}`);
        if (L.h3 !== A.h3) result.notes.push(`h3 count: legacy ${L.h3} vs astro ${A.h3}`);
        if (L.internalLinks !== A.internalLinks)
          result.notes.push(
            `internal link count: legacy ${L.internalLinks} vs astro ${A.internalLinks}`,
          );
        if (L.jsonLdBlockCount !== A.jsonLdBlockCount)
          result.notes.push(
            `JSON-LD script block count: legacy ${L.jsonLdBlockCount} vs astro ${A.jsonLdBlockCount}`,
          );
        if (L.jsonLdParseErrors || A.jsonLdParseErrors)
          result.notes.push(
            `JSON-LD parse errors: legacy ${L.jsonLdParseErrors} vs astro ${A.jsonLdParseErrors}`,
          );
        const scrollDelta = Math.abs(L.scrollHeight - A.scrollHeight);
        result.notes.push(
          `scrollHeight: legacy ${L.scrollHeight}px vs astro ${A.scrollHeight}px (Δ${scrollDelta}px)`,
        );
        for (const sel of ['main', 'nav', 'footer']) {
          result.notes.push(`${sel} geometry: legacy ${JSON.stringify(L[sel])} vs astro ${JSON.stringify(A[sel])}`);
        }
      }

      // Each test writes its own result file (see the worker-process note
      // above) so the report step can merge across all workers reliably.
      fs.writeFileSync(
        path.join(shotDir, 'result.json'),
        JSON.stringify(result, null, 2),
      );

      if (result.hardFailures.length > 0) {
        // Fail the Playwright test with the full evidence list, but do not
        // throw before both screenshots/results are captured above.
        expect(result.hardFailures, `Hard-failure regressions on ${route}`).toEqual([]);
      }
    });
  }
});
