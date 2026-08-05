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
 * ── RULES REVISED 2026-08-05 (O-16) ────────────────────────────────────────
 *
 * With the empty-port bug fixed (see above) this spec ran properly for the
 * first time, and reported 22 hard failures out of 22 routes. Every one of
 * them was either the harness or a decision that had already been taken:
 *
 *   18 x "route missing on LEGACY (404)" — a URL-SHAPE bug, not a missing
 *        page. The legacy tree stores these as flat files
 *        (/blog/frameworks-and-dps-explained.html); the Astro build emits
 *        directory routes (/blog/frameworks-and-dps-explained/). The spec
 *        asked both servers for the Astro shape. Fixed below by resolving the
 *        legacy side through candidate forms. All 22 routes exist on both.
 *
 *   13 x "title differs" — A-89 deliberately rewrote the site's titles for
 *        length ("titles under 20 chars 5 -> 0", two over-length descriptions
 *        cut) and added an optional seoTitle to the blog schema precisely so a
 *        SERP line and a headline could diverge. A hard failure on a title
 *        change asks the rebuild to undo an approved decision.
 *
 *    4 x "JSON-LD @type set differs" — in every case the Astro side ADDS
 *        Organization. Strictly more structured data than the page it
 *        replaces.
 *
 *    4 x "visible text differs by >2%" — the 2% symmetric threshold assumed a
 *        port. This is a redesign, and the file's own header says so two
 *        paragraphs up while the rule contradicted it.
 *
 * So the hard-failure set is rewritten around what must hold for a REPLACEMENT
 * rather than a clone, and one weak rule is replaced by a stronger one:
 *
 * HARD FAILURES
 *   - route missing on either side (after legacy URL-shape resolution)
 *   - canonical differs. The title is a SERP line and may be tuned; the
 *     canonical is the page's claim about which URL it IS, and a redesign has
 *     no business changing that.
 *   - h1 count is 0 or more than 1
 *   - JSON-LD fails to PARSE on either side (parsing is correctness; which
 *     @types are present is editorial)
 *   - SUBSTANCE LOSS on an article route: the Astro page carries more than 10%
 *     fewer words than the legacy page it replaces. This is the repo's
 *     standing "ELEVATE presentation, NEVER delete substance" rule, and it is
 *     ASYMMETRIC on purpose — a rewrite that says more is not a regression,
 *     one that quietly says less is. Measured spread across the 18 article
 *     routes when written: -3.7% to +5.2%, so 10% is real headroom and not a
 *     threshold drawn around the current numbers.
 *   - COVERAGE on a section index: every article route under that section must
 *     be linked from the index. An index is a list, and word count is a poor
 *     proxy for a list — see the note in the index branch below.
 *
 * REPORTED, NOT FAILED: title, meta description, JSON-LD @type set, symmetric
 * text-diff percentage, h2/h3 counts, link counts, geometry, screenshots.
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

/**
 * A section index — /blog/, /compare/, /sectors/, /glossary/ — as opposed to an
 * article underneath one. Exactly two path segments and the second empty.
 */
function isSectionIndex(route) {
  return route.split('/').filter(Boolean).length === 1;
}

/**
 * The legacy tree and the Astro build do NOT share a URL shape. Astro emits
 * /blog/frameworks-and-dps-explained/; the legacy tree holds
 * blog/frameworks-and-dps-explained.html. Asking the legacy server for the
 * Astro shape 404s on every article, which is what produced 18 of this file's
 * 22 "regressions" the first time it ran against a live server. Candidates are
 * ordered so the directory form wins where both exist.
 */
function legacyCandidates(route) {
  const trimmed = route.replace(/\/$/, '');
  return [route, `${trimmed}.html`, `${route}index.html`];
}

const WORD_LOSS_HARD_FAIL_PCT = 10;

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

    // Raw hrefs, path-normalised, for the section-index coverage rule. The
    // legacy tree links /blog/x.html and the Astro tree links /blog/x, so the
    // extension and any trailing slash are stripped to make them comparable.
    const internalHrefs = links
      .map((a) => a.getAttribute('href') || '')
      .filter((h) => h && !h.startsWith('#') && !/^(mailto|tel|javascript):/i.test(h))
      .map((h) => {
        try {
          const u = new URL(h, location.href);
          if (u.origin !== origin) return null;
          return u.pathname.replace(/\.html$/i, '').replace(/\/$/, '') || '/';
        } catch (_) {
          return null;
        }
      })
      .filter(Boolean);

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
      internalHrefs: [...new Set(internalHrefs)],
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
  /*
   * 2026-08-05 (O-16). Chromium only. This spec compares TWO SERVERS, not two
   * rendering engines: it asks whether the rebuild kept the content of the
   * legacy page. Running it under firefox and webkit as well triples a
   * two-minute job and produces three copies of the same answer — and it did
   * worse than that, because loading two pages with networkidle plus two
   * full-page screenshots per route overran the 30s budget on Gecko, so seven
   * of the twenty-two routes reported "Test timeout" as though they were
   * regressions. Engine differences are covered by sitewide.spec.js and the
   * cross-browser project, both of which run everywhere.
   */
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'content parity is a server-to-server comparison; engine coverage lives in sitewide + cross-browser',
  );

  /*
   * 2026-08-05 (O-16). Every route here loads TWO pages with networkidle and
   * takes TWO full-page screenshots of documents that run to several thousand
   * words. Two of the longer blog routes overran 30s when the machine was busy.
   * Tripled; the work is genuinely large, not slow by accident.
   */
  test.slow();

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
        let resp = null;
        for (const candidate of legacyCandidates(route)) {
          resp = await legacyPage.goto(`${LEGACY_BASE}${candidate}`, {
            waitUntil: 'networkidle',
            timeout: 20000,
          });
          if (resp && resp.status() < 400) {
            result.legacyUrl = candidate;
            break;
          }
        }
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

        // ---- HARD FAILURE: canonical ----
        // Kept hard. Title and description are downgraded to notes below,
        // per A-89; the canonical is identity, not presentation.
        if (L.canonical !== A.canonical) {
          result.hardFailures.push(
            `canonical differs: LEGACY "${L.canonical}" vs ASTRO "${A.canonical}"`,
          );
        }

        // ---- HARD FAILURE: JSON-LD must PARSE on both sides ----
        if (L.jsonLdParseErrors || A.jsonLdParseErrors) {
          result.hardFailures.push(
            `JSON-LD failed to parse: legacy ${L.jsonLdParseErrors} block(s), astro ${A.jsonLdParseErrors} block(s)`,
          );
        }

        // ---- Reported: title / description / @type set ----
        if (L.title !== A.title)
          result.notes.push(`title: LEGACY "${L.title}" vs ASTRO "${A.title}"`);
        if (L.metaDesc !== A.metaDesc)
          result.notes.push(
            `meta description: LEGACY "${L.metaDesc}" vs ASTRO "${A.metaDesc}"`,
          );
        if (!sameArray(L.jsonLdTypes, A.jsonLdTypes))
          result.notes.push(
            `JSON-LD @type set: LEGACY [${L.jsonLdTypes.join(', ')}] vs ASTRO [${A.jsonLdTypes.join(', ')}]`,
          );

        // ---- Reported: symmetric text diff (how much wording moved) ----
        const textDiff = diffWordSets(L.text, A.text);
        result.textDiff = textDiff;
        if (textDiff.pct > TEXT_DIFF_HARD_FAIL_PCT) {
          result.notes.push(
            `visible text differs by ${textDiff.pct}%. ` +
              `Legacy-only sample: "${textDiff.removedSample}" | Astro-only sample: "${textDiff.addedSample}"`,
          );
        }

        // ---- HARD FAILURE: substance loss on an article route ----
        // Asymmetric: saying more is not a regression, quietly saying less is.
        if (!isSectionIndex(route)) {
          const lost = ((textDiff.legacyWordCount - textDiff.astroWordCount) /
            Math.max(textDiff.legacyWordCount, 1)) * 100;
          if (lost > WORD_LOSS_HARD_FAIL_PCT) {
            result.hardFailures.push(
              `substance loss: ${textDiff.legacyWordCount} words on LEGACY -> ${textDiff.astroWordCount} on ASTRO ` +
                `(-${lost.toFixed(1)}%, over the ${WORD_LOSS_HARD_FAIL_PCT}% floor). ` +
                `Legacy-only sample: "${textDiff.removedSample}"`,
            );
          }
        }

        /*
         * ---- HARD FAILURE: a section index must still list everything ----
         *
         * Word count is the wrong instrument for an index and this is why the
         * substance-loss rule above skips them. Measured: /blog/ went 525 words
         * to 325, -38%, which under a word-count rule reads as a third of the
         * page deleted. What actually changed is presentation — the legacy
         * index carried a category filter row, a per-post excerpt and topic
         * chips on every row; the rebuild is a compact ledger with one featured
         * excerpt. No article lost anything: all eighteen article routes sit
         * inside ±5%.
         *
         * The property that DOES matter for a list is that it still lists
         * everything. An index that silently stops linking a post buries it,
         * and no word-count threshold would notice — dropping one row of a
         * title-only ledger is a handful of words.
         */
        if (isSectionIndex(route)) {
          const children = routes.filter((r) => r !== route && r.startsWith(route));
          const linked = new Set(A.internalHrefs);
          const unlisted = children.filter((c) => !linked.has(c.replace(/\/$/, '')));
          if (unlisted.length > 0) {
            result.hardFailures.push(
              `section index does not link ${unlisted.length} of its ${children.length} pages: ${unlisted.join(', ')}`,
            );
          }
          const legacyLinked = new Set(L.internalHrefs);
          const legacyUnlisted = children.filter((c) => !legacyLinked.has(c.replace(/\/$/, '')));
          result.notes.push(
            `index coverage: astro lists ${children.length - unlisted.length}/${children.length}, legacy lists ${children.length - legacyUnlisted.length}/${children.length}`,
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
