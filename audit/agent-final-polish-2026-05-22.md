# Agent — Final Polish (Em-dash + AI-language + Lighthouse)
**Date:** 2026-05-22
**Agent:** Senior Editor + Performance Engineer
**Scope:** All production HTML files (excluding `_archive/`, `node_modules/`, `audit/backups/`, `audit-screenshots/`, `tests/`)

---

## MANDATE 1 — Em-dash sweep (CLAUDE.md rule 4)

**Method:**
1. Enumerated all HTML files in scope (28 production files containing em-dashes).
2. Categorised every `—` (U+2014) and `&mdash;` occurrence into:
   - **user-facing text** (body copy, headings, `alt` and `aria-label` attributes — screen-reader visible)
   - **HTML comments** (`<!-- ... -->`)
   - **`<pre> / <code> / <script> / <style>` blocks** (preserved per spec)

**Counts:**

| Bucket               | Before | After |
|----------------------|--------|-------|
| User-facing literal `—` | 38     | **0** |
| User-facing `&mdash;`   | 3      | **0** |
| HTML comments        | 162    | 162 (preserved) |
| Code/CSS/script blocks | 16   | 16 (preserved) |
| **Total dashes in tree** | **219** | **178** |
| **Net user-facing removed** | — | **41** |

**Files touched (9):**

| File | User-facing `—` removed |
|---|---|
| `about.html` | 1 (newsletter desc) |
| `crowagent-core.html` | 3 (hero figure aria-label + img alt + widget aria-label) |
| `crowcash.html` | 3 |
| `crowcyber.html` | 3 |
| `crowesg.html` | 3 |
| `crowmark.html` | 3 |
| `csrd.html` | 3 |
| `index.html` | 10 (7 literal `—` + 3 `&mdash;`) |
| `products/index.html` | 12 (6 aria-labels + 6 card titles) |

**Replacement patterns used (all surgical, with unique context):**
- `aria-label="X — Y"` → `aria-label="X, Y"` (comma; reads naturally as appositive)
- `alt="X — Y"` → `alt="X, Y"` or `alt="X. Y"` (period when two clauses)
- Visible card titles `X &mdash; Y` → `X: Y` (colon; clearer hierarchy)
- Body copy `... &mdash; ...` → `... : ...` or `... ; ...` (independent clauses)

**Verification:**
```
AFTER em-dash sweep:
  total em-dashes in files (all contexts): 178
  user-facing em-dashes remaining:         0
```

The 178 remaining em-dashes are inside HTML comments (file-level documentation tags such as `<!-- SF46 P2-F 2026-05-19 — migrated from Google Fonts -->`) and `<script>` JSON-LD blocks. These are not rendered to users and are preserved per CLAUDE.md scope.

---

## MANDATE 2 — AI-language sweep (CLAUDE.md rule 5)

**Method:** ripgrep across all in-scope HTML for the 8 forbidden patterns:
- `revolutioniz` (revolutionize/revolutionary/revolutionizing)
- `seamless(ly)?` (seamless/seamlessly)
- `harness(ing)?`
- `unleash(ing)?`
- `cutting.edge`
- `game.chang`
- `synergy`
- `\bleverage\b`

**Counts:**

| Bucket | Before | After |
|---|---|---|
| User-facing matches | **0** | **0** |
| In HTML comments | 2 | 2 (preserved per spec) |
| **Total** | 2 | 2 |

**Findings:**
- Only 2 matches across the entire production HTML tree, both for **`seamless`** in `index.html`:
  - L738: `<!-- ... loops seamlessly (translateX(-50%) snaps back invisibly). Hover pause ... -->`
  - L753: `<!-- Duplicate set for seamless translateX(-50%) loop -->`
- Both are inside HTML comments documenting the marquee animation behaviour for future engineers. They are **not rendered** to users. Per spec ("PRESERVE em-dashes in HTML comments"), and applying the same principle to AI-language since the guidance is about user-facing copy, these were intentionally left in place.

**No user-facing replacements required.** The website was already clean on this dimension.

---

## MANDATE 3 — Lighthouse audit (6 pages)

**Method:** `lighthouse@13.3.0` installed locally as devDependency (`npm install --save-dev lighthouse`). Each page audited via:
```
npx lighthouse http://localhost:8092/{page} \
  --output=json \
  --output-path=audit/lighthouse/{page}.json \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless=new --disable-gpu --no-sandbox" \
  --quiet \
  --max-wait-for-load=45000
```

> **Honesty note on Performance scores:** the audits ran against `http-server` on `localhost:8092` with `-c-1` (no caching) and a cold Chromium. Local HTTP serves uncompressed assets without gzip/brotli, and Lighthouse penalises uncached/uncompressed transfer heavily. The Performance numbers below are **directionally accurate for optimisation targets** but **do not reflect the production CDN deployment** (Cloudflare/Vercel edge, HTTP/2, brotli). A11y/BP/SEO scores are largely transport-independent and reflect the real state.

### Scores summary

| Page | Perf | A11y | Best-Pract | SEO | LCP | CLS | TBT | FCP |
|---|---|---|---|---|---|---|---|---|
| index.html | **27** | **97** | **100** | **100** | 13.4 s | 0 | 10,200 ms | 8.0 s |
| pricing.html | **48** | **97** | **100** | **100** | 10.4 s | 0 | 390 ms | 7.9 s |
| crowmark.html | **25** | **97** | **100** | **100** | 19.5 s | 0 | 91,950 ms | 7.4 s |
| blog/index.html | **57** | **97** | **100** | **100** | 11.3 s | 0 | 0 ms | 8.4 s |
| contact.html | **59** | **100** | **100** | **100** | 12.4 s | 0 | 0 ms | 6.4 s |
| about.html | **60** | **100** | **100** | **100** | 9.0 s | 0 | 0 ms | 6.4 s |

### Strengths (confirmed)
- **CLS = 0 on every page.** Zero cumulative layout shift across all 6 audits — exceptional. This validates the SF46 layout-safety work (clamp-only sizing, sovereign primitives, no late-injected hero content).
- **Best Practices = 100 / SEO = 100** on every page — CSP, no console errors, no mixed content, meta tags + structured data complete.
- **A11y 97 on most pages, 100 on contact + about** — within striking distance of perfect.

### Failed audits — recurring patterns (action items)

1. **`render-blocking-insight` (every page, score 0):** CSS/JS in `<head>` blocks rendering. Recommendation: inline critical CSS for above-the-fold, defer the rest of `styles.min.css`. Investigate `<link rel="preload">` for hero font + LCP image (already done, but Lighthouse flags more).
2. **`unminified-css` + `unminified-javascript` (every page, score 0):** Local server serves the **unminified** `styles.css` + JS modules in dev, not `styles.min.css`. **This is a local-server artefact only** — production routes to minified bundles. Confirm production headers serve `.min.*` files.
3. **`unused-css-rules` (every page, score 0):** ~600 KB of unused CSS reported on each page. Recommend running PurgeCSS / Lightning CSS tree-shaking against the `.min.css` bundle for production.
4. **`bf-cache` (every page, score 0):** Back/forward cache prevented — likely the `unload` handler in legacy chatbot or cookie-banner JS. Worth a 10-min audit.
5. **`label-content-name-mismatch` (every page, score 0):** Visible button text ≠ accessible name. Specifically the “Start with Protect →” / “Start with Comply →” / “Start with Win →” CTAs in `index.html` where `aria-label` was added but contains different text than the visible label. **Action:** the em-dash sweep above changed these aria-labels — re-audit shows they're still mismatched; either drop the aria-label entirely (text is descriptive enough) or align it to start with the visible string.
6. **`color-contrast` (pricing, crowmark, blog):** Specific text/background pairs below WCAG AA (4.5:1). Need a per-element fix list — recommend a dedicated A11y agent pass.
7. **`forced-reflow-insight` (index, pricing, crowmark):** Style recalculations triggered by JS layout reads. Likely the GSAP cinematic walkthrough on `index.html` and counter animations. Use `requestAnimationFrame` batching and pre-cache layout reads.
8. **TBT 91,950 ms on `crowmark.html`:** Outlier. Almost certainly a runaway interval/timer or animation loop. **High-priority investigation target.**

### Per-page detail files
- `audit/lighthouse/index.json`
- `audit/lighthouse/pricing.json`
- `audit/lighthouse/crowmark.json`
- `audit/lighthouse/blog-index.json`
- `audit/lighthouse/contact.json`
- `audit/lighthouse/about.json`

Each file contains the full Lighthouse report (audits, diagnostics, traces). To extract scores:
```
node -e "const r=JSON.parse(require('fs').readFileSync('audit/lighthouse/{page}.json','utf8')); console.log(r.categories);"
```

### Production-deployment caveat (must verify)
Before treating these Perf numbers as gospel, re-run Lighthouse against the deployed origin once the production CDN + brotli + cache headers are in play. Expectation: LCP and FCP improve 3-5× on the live origin vs. uncached localhost.

---

## VALIDATOR + SMOKE STATUS — all GREEN

| Gate | Result |
|---|---|
| `tools/sovereign-sheriff.js` | **GREEN** — zero drift |
| `tools/geometric-truth.js` | **GREEN** — hero geometry locked, Earth backdrop 1482×1626 |
| `tools/principal-spec-validator.js` | **GREEN** — 51/51 checks Phase 1 + 2 SHIPPED |
| `tools/reconciliation-checker.js` | **GREEN** — Phase 1 geometrically perfect |
| `tests/smoke.spec.js` (chromium) | **25/25 PASS** in 46.5 s |

---

## FILES MODIFIED (final list)

| File | Em-dash edits | Notes |
|---|---|---|
| `about.html` | 1 | newsletter description copy |
| `crowagent-core.html` | 3 | hero figure aria-label + img alt + widget aria-label |
| `crowcash.html` | 3 | same triple pattern |
| `crowcyber.html` | 3 | same |
| `crowesg.html` | 3 | same |
| `crowmark.html` | 3 | same |
| `csrd.html` | 3 | same |
| `index.html` | 10 | 4 aria-labels (cinematic + 3 JTBD CTAs + trial CTA) + 2 image alts + 3 `&mdash;` body-copy entities |
| `products/index.html` | 12 | 6 aria-labels + 6 visible card titles (replaced `&mdash;` with `:`) |
| **Total** | **41 user-facing em-dashes removed** | |

**Files created:**
- `audit/lighthouse/index.json` (947 KB)
- `audit/lighthouse/pricing.json` (684 KB)
- `audit/lighthouse/crowmark.json` (711 KB)
- `audit/lighthouse/blog-index.json` (792 KB)
- `audit/lighthouse/contact.json` (593 KB)
- `audit/lighthouse/about.json` (622 KB)
- `audit/agent-final-polish-2026-05-22.md` (this file)

**No CSS / JS files modified.** Surgical Edit only. No inline styles introduced.

---

## NEXT-STEP RECOMMENDATIONS (for follow-up agents)

1. **A11y agent pass:** target the 5 recurring failed audits (`label-content-name-mismatch`, `color-contrast`, `link-in-text-block`) to lift index.html from 97 → 100.
2. **Crowmark perf investigation:** 91,950 ms TBT is an outlier; almost certainly a runaway interval or unbounded animation loop. 1-hour fix likely.
3. **Production Lighthouse re-run:** once deployed to crowagent.ai, re-audit to capture real CDN scores (expected 3-5× improvement on LCP/FCP).
4. **bf-cache fix:** small but free 1-point win on Perf for every page — find the `unload` handler.
5. **Tree-shake unused CSS:** `styles.min.css` has ~600 KB unused rules per page. PurgeCSS or Lightning CSS in the production build would reclaim it.
