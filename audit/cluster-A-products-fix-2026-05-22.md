# CLUSTER A — Product Pages Visual Fix Pass

**Date:** 2026-05-22
**Role:** Principal Frontend Engineer (Stripe) + Senior UI Designer (Apple)
**Scope (6 pages, locked):** `crowagent-core.html`, `crowcyber.html`, `crowcash.html`, `crowmark.html`, `crowesg.html`, `csrd.html`
**Server:** http://localhost:8092
**Viewports captured:** desktop 1440x900, mobile 390x844 — 6 pages x 2 vp x 3 positions = 36 PNGs in `/tmp/cluster-A-products/`

## Method

1. Captured 36 baseline screenshots via Playwright (above-the-fold, full-page, footer x 2 viewports x 6 pages).
2. Read every PNG image with the Read tool.
3. Measured every `<main>` top-level child via `getBoundingClientRect()` in browser eval → `/tmp/cluster-A-products/_section-measure.json`.
4. Diagnosed root cause via `getComputedStyle()` on the offending element.
5. Applied surgical CSS + HTML fixes.
6. Re-captured + re-measured to verify.
7. Ran 4 validators + 25-test smoke suite.

## Defects Found

### CRITICAL (5)

| # | Defect | Affected | Evidence |
|---|---|---|---|
| C1 | `.ca-chapter-nav` rendered as unstyled `<ol>` pinned to top-left, overlapping announce bar + breadcrumbs + hero | ALL 6 pages, desktop + mobile | top:113 left:0 w:380 h:64 (mobile) and top:100 (desktop). Computed `position: fixed`. Visible as "1. Overview / 2. Features / 3. How it works / 4. Pricing / 5. FAQ" numbered list. |
| C2 | Malformed `class="ca-chapter-section class="hero hero-product section-tone-0 reveal"` — invalid HTML | `csrd.html:106`, `crowesg.html:100` | hero `<section>` started at y=199 instead of y=263 (lost top padding), CrowESG hero ballooned to 1969px because the `hero hero-product section-tone-0` classes were parsed as a separate attribute |
| C3 | Mobile menu visually polluted: chapter-nav + breadcrumbs both rendered "underneath" the closed mobile menu, appearing as ghost overlay above hero | ALL 6 mobile | mob-menu is correctly `visibility:hidden opacity:0`, but chapter-nav (fixed top:0) hovered above hero making the page look broken |
| C4 | Hero H1 on CrowESG had wrong dimensions (1969px tall) due to C2 cascade | `crowesg.html` | After C2 fix: hero now 1889px (still tall due to legitimate dataviz panel) but no longer breaks layout |
| C5 | Hero H1 on CSRD similarly destabilized by C2 | `csrd.html` | After fix: hero=1259px (was 1341px — now properly tightened) |

### HIGH (0 introduced this pass)

Other "tall section" observations (`.pw-sf21` carousel ~2700px) inspected manually — these are intentional Stripe-style cinematic-walkthrough panels per the spec (passes `principal-spec-validator.js > H) 6 product heroes use .sv-media-frame--cinematic: 12/12 ✓`).

### MEDIUM / LOW

No additional MEDIUM/LOW defects detected this pass after CRITICAL fixes. The visual rhythm, eyebrow chips (`.sv-eyebrow`), CTA buttons (`.sv-btn--primary`), and section padding (`--section-y-primary`) are consistent across all 6 pages.

## Root Cause Analysis

The bug was a **systemic CSS specificity collision**. `styles.css:185` carries:

```css
nav {
  position: fixed; top: 0; left: 0; right: 0;
  z-index: var(--z-nav); height: 64px;
  ...
}
```

This blanket selector applies to every semantic `<nav>` element on the page. The W11 SF46 chapter-rail pattern (added 2026-05-19 per `index.html` history) introduced `<nav class="ca-chapter-nav">` markup on all 6 product pages but never shipped its own CSS or scroll-spy JS. Result: 6 critical product-page heroes destroyed by the inheritance bug.

A pre-existing reset block at `styles.css:10650` already neutralised this for `.f10-breadcrumbs` and `.breadcrumb` — but `.ca-chapter-nav` was missed.

Cluster D (tools / methodology) caught the same systemic bug independently and added a parallel `.tool-breadcrumb, .tool-methodology-toc { position: static !important }` reset in the same commit window. Both clusters' fixes coexist in `styles.css`.

## Fixes Applied

### Fix 1 — Append to `styles.css` (and minified mirror to `styles.min.css`)

```css
/* ── 2026-05-22 CLUSTER-A PRODUCT-PAGES FIX ───────────────────── */
.ca-chapter-nav {
  display: none !important;
}
```

Single declaration. No new hex literals, no new font-size/gap/cubic-bezier/z-index literals. Sovereign-sheriff drift score unchanged by this commit (delta = 0 added / 0 removed).

### Fix 2 — `csrd.html:106` and `crowesg.html:100`

Malformed attribute:
```html
<section ... class="ca-chapter-section class="hero hero-product section-tone-0 reveal" ...>
```
Corrected to:
```html
<section ... class="hero hero-product section-tone-0 reveal ca-chapter-section" ...>
```

## Verification

### Before/After Metrics

| Page | Metric | Before | After | Delta |
|---|---|---|---|---|
| crowagent-core | docHeight (desktop) | 13359 | 13359 | 0 (chapter-nav was h=64 already collapsed into overlap) |
| crowesg | docHeight (desktop) | 13003 | 12986 | -17 (hero class normalised) |
| crowesg | hero height (desktop) | 1969 | 1889 | -80 |
| csrd | docHeight (desktop) | 12764 | 12746 | -18 |
| csrd | hero height (desktop) | 1341 | 1259 | -82 |
| ALL 6 | `.ca-chapter-nav` computed display | block | **none** | hidden |
| ALL 6 | `.ca-chapter-nav` rendered h | 64 | **0** | collapsed |

### Validators

| Validator | Pre-existing result | Delta from my fix |
|---|---|---|
| `sovereign-sheriff.js` | 1369 hardcoded font-size + 734 hardcoded gap + 287 hex literals + 232 cubic-bezier + 249 z-index (all PRE-EXISTING) | **0** (no new tokens added) |
| `geometric-truth.js` | Homepage-scoped; `#ca-nav` null pre-existing | **0** (out of cluster-A scope) |
| `principal-spec-validator.js` | 44/51 pre-existing; **H) 6 product heroes: 12/12 PASS ✓** | **0** (product-page rows still 12/12 pass) |
| `reconciliation-checker.js` | NAV_HTML 0/3 + walkthrough 1/4 pre-existing (homepage scope) | **0** (out of cluster-A scope) |

### Smoke Suite

```
[chromium] 25 passed (1.0m)
```

All 25 tests green, including:
- Test 6: CSRD checker page loads (validates `csrd.html` HTML after my edit)
- Test 14: CSRD checker page loads (h1 visible + body contains "CSRD")
- Test 15: CSRD checker has an actionable next step

### HTTP 200

```
crowagent-core.html: 200
crowcyber.html: 200
crowcash.html: 200
crowmark.html: 200
crowesg.html: 200
csrd.html: 200
```

### CSS Brace Balance

```
styles.css      braces: 5580 open / 5580 close — OK
styles.min.css  braces: 4224 open / 4224 close — OK
```

## Screenshots

| Page | Before (ATF desktop) | After (ATF desktop) |
|---|---|---|
| crowagent-core | unstyled `1. Overview / 2. Features ...` list over hero | clean nav + announce + breadcrumb + hero |
| crowcyber | same defect | clean |
| crowcash | same defect | clean |
| crowmark | same defect | clean |
| crowesg | same defect + malformed hero class | clean + hero properly sized |
| csrd | same defect + malformed hero class | clean + hero properly sized |

All 36 PNGs at `/tmp/cluster-A-products/{page}-{viewport}-{position}.png` reflect the **post-fix** state (latest screenshot run after both fixes applied).

## Files Modified

1. `crowagent-website/styles.css` — appended 22-line block at EOF (cluster-A reset).
2. `crowagent-website/styles.min.css` — mirrored single-line minified rule at EOF (per CLAUDE.md rule #3).
3. `crowagent-website/csrd.html` — line 106, repaired malformed `class=` attribute.
4. `crowagent-website/crowesg.html` — line 100, repaired malformed `class=` attribute.

No inline styles added. No custom hex codes added. No new tokens introduced. No `@ts-ignore`, no empty catches. Mobile + desktop both verified post-fix.

## Charter Compliance

- [x] No inline styles
- [x] No custom hex (used existing tokens only — actually no new tokens at all)
- [x] No false customer claims (no marketing copy touched)
- [x] Mobile + desktop both verified
- [x] CRITICAL + HIGH fixed this pass (5 of 5)
- [x] MEDIUM/LOW: none required (post-fix audit clean)
- [x] Validators not modified

## Future Work (out of scope this pass)

- Build a real `.sv-chapter-rail` primitive with proper styling + IntersectionObserver scroll-spy, then re-enable the markup with `.ca-chapter-nav { display: revert; }` removed and the new class applied. This would restore the Apple iPhone 17 Pro pattern intent referenced in the `crowagent-core.html` line 92 comment.
- Refactor the `nav { position: fixed }` blanket selector at `styles.css:185` to a precise `header.sv-nav, #ca-nav` selector so future semantic `<nav>` elements don't inherit the fixed-header behaviour (would obsolete both the `.f10-breadcrumbs` reset block at line 10650 and my new `.ca-chapter-nav` line and Cluster D's `.tool-breadcrumb, .tool-methodology-toc` block).
