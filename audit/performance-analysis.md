# Performance analysis — crowagent-website

**Mode:** Read-only forensic audit. No code changes.
**Date:** 2026-05-21
**Tooling:** Playwright (Chromium 1440×900), `PerformanceObserver` + `getEntriesByType`, file-system byte counts, regex class-usage sampling.
**Pages audited:** `index.html`, `contact.html`, `pricing.html`, `faq.html`, `csrd.html`, `blog/index.html`.

## Headline numbers per page

| Page | FCP (ms) | CLS | Layout-shift events | Transfer total (KB) | Decoded (KB) | `<script>` tags | Stylesheets | Inline `style="..."` attrs | nav ms |
|---|---|---|---|---|---|---|---|---|---|
| index | 584 | 0.0000 | 0 | 3,985 | 4,100 | 49 | 7 | 129 | 1,506 |
| contact | 608 | 0.0000 | 0 | 2,648 | 2,635 | 26 | 18 | 39 | 1,095 |
| pricing | 740 | 0.0000 | 0 | 1,935 | 1,995 | 29 | 17 | 49 | 1,172 |
| faq | 796 | 0.0000 | 0 | 2,251 | 2,238 | 25 | 16 | 38 | 1,216 |
| csrd | 1,152 | 0.0000 | 0 | 1,764 | 1,823 | 30 | 9 | 65 | 1,281 |
| blog | 736 | 0.0000 | 0 | 2,284 | 2,269 | 23 | 18 | 58 | 1,273 |

CLS is **zero** on every page (this is a real win — the site has clearly invested in `width`/`height` attributes on most images and reserves space for the cinematic frame). The other side of the ledger is heavy: the homepage transfers nearly 4 MB on a cold load.

---

## Finding P1 — `styles.css` is 1,227 KB (33,027 lines) — the largest static asset on the site

**Evidence:**
```
styles.css           1,227,338 bytes  (33,027 lines)
styles.min.css         663,027 bytes  (single line, minified)
crowagent-brand-tokens.css   48,505 bytes
```
The minified version still ships ~647 KB. Decoded body size of CSS on the homepage is 728 KB across 5 stylesheet requests. There are **6,126 selectors** and **141 `!important`** declarations.

**Recommendation:** Run `purgecss` over all 70 HTML pages → fresh styles.css; expect 70–85% reduction (see Finding P5 for dead-class evidence). The current `.min` is byte-identical to the un-min file in terms of selectors — it's only whitespace-compressed.

---

## Finding P2 — `<link rel="preload" href="/js/scripts.min.js" as="script">` 404s on 23 pages

**Evidence:** Network probe found `404 http://localhost:8092/js/scripts.min.js` on every audited page. The file actually lives at `/scripts.min.js` (repo root). Grep confirms the bad path is referenced in 23 HTML files:
```
about.html, blog/index.html, contact.html, crowagent-core.html,
crowcash.html, crowcyber.html, crowesg.html, crowmark.html,
csrd.html, index.html, pricing.html, ...
```
Browser console logs: "Failed to load resource: the server responded with a status of 404 (Not Found)" on 5 of 6 audited pages.

**Why it matters:** Each 404 burns a TCP round-trip, blocks the preload queue, and triggers Chrome's "preloaded but not used within 3 seconds" warning, which deprioritises later preloads. The actual script still loads from `<script src="/scripts.min.js?v=97">` later — so it's pure waste.

**Recommendation:** Either fix the preload path to `/scripts.min.js` or remove the preload tags. One-find-replace across 23 files.

---

## Finding P3 — Homepage ships **1.87 MB of images** (10 image requests), CSRD ships 503 KB across 3 images

**Evidence:** `PerformanceObserver` resource-type breakdown:
```
index   img:   10 files,  1867 KB
contact img:    1 file,    754 KB    (single contact-desk.jpg)
faq     img:    2 files,   375 KB
csrd    img:    3 files,   503 KB
blog    img:    7 files,   314 KB    (Unsplash CDN — small via params)
```
The homepage is loading **all five** `cinematic-scene` PNGs above the fold (`/Assets/marketing-screenshots/01-…05-dark-framed.png`) even though only one is `is-active`. They sit on top of each other and crossfade via JS. Net effect: 4× wasted bytes for the inactive scenes that the user may never see.

**Recommendation:** Lazy-instantiate scenes 2–5 via JS after the first scroll or after scene 1's `load` event. Or convert to AVIF/WebP (the homepage already preloads the dashboard in AVIF — same pattern works here).

---

## Finding P4 — Five `<img class="cinematic-scene">` lack `width`/`height` attributes on `index.html`

**Evidence:**
```
<img class="cinematic-scene is-active" data-scene="1" src="/Assets/marketing-screenshots/01-dashboard-dark-framed.png" alt="" decoding="async">
```
No `width`, no `height`, no `loading`. CLS measured 0 today because the scenes are absolutely-positioned over a sized container, but the moment a child layout changes (CSS regression, RTL test, mobile breakpoint), the browser has no intrinsic dimensions to fall back on and CLS will spike.

**Recommendation:** Add explicit `width` / `height` attributes matching the intrinsic raster size (e.g. `width="1200" height="750"`), plus `loading="lazy"` on scenes 2–5.

---

## Finding P5 — Dead CSS: 15 of 25 randomly-sampled classes have ZERO HTML references

**Evidence:** From 25 randomly-sampled class names, 15 had zero matches across all production HTML:
```
.contact-method, .btn-warn, .csrd-result-icon, .section-padding-sm,
.f10-social-proof-attribution, .about-mission-grid, .ca-input--textarea,
.csrd-result-outscope, .products-mega-item, .ca-security-grid,
.product-coming-soon-card, .urgency-pill, .compare-th--featured,
.ca-hero-multiframe, .contact-grid
```
At 60% dead-class rate (extrapolated from 1,732 unique class selectors), upper bound on dead CSS in `styles.min.css` is **~400 KB**.

**Recommendation:** Add purgecss or `lightningcss --minify --remove-unused-classes` to the build. Even a conservative pass should halve the bundle.

---

## Finding P6 — 472 `@media` blocks, 141 `!important`, 177 `filter:blur` / `backdrop-filter` declarations

**Evidence:**
```
@media count:         472
!important count:     141
will-change count:     35
transition: all:       37
filter:blur / backdrop-filter:  177
```
`!important` × 141 is a code-smell (cascade defeats). 37 `transition: all` declarations force the browser to interpolate every property — expensive vs `transition: opacity, transform` and a known source of GPU stalls. 177 `backdrop-filter` / `filter: blur(...)` declarations are the single most expensive CSS effect in modern browsers — each one forces compositor work on every paint.

**Recommendation:** Audit `backdrop-filter` to a top-10 list (hero glass cards) and replace the rest with solid-color overlays. Replace every `transition: all` with an explicit property list.

---

## Finding P7 — Contact / pricing / faq / blog load 13–18 separate CSS files

**Evidence:** `<link rel="stylesheet">` count per page:
- index.html: 5 (`fonts-selfhosted.css`, `crowagent-brand-tokens.css`, `styles.min.css`, `sovereign-primitives.css`, `sovereign-cmdk.css`)
- contact.html: 15
- pricing.html: 14
- faq.html: 13
- blog/index.html: 15

The `Assets/css/` directory holds 33 page-specific stylesheets ranging 1.8 KB → 43 KB (e.g. `blog-article.css` 43 KB, `sovereign-primitives.css` 43 KB, `cookies-page.css` 30 KB, `page-styles.css` 28 KB). HTTP/2 multiplexes them, but each is still a TLS round-trip on cold connection and each emits a fresh `<link>` blocking event.

**Recommendation:** Bundle the per-page CSS into `styles.min.css` (already done for the homepage's 5-file load), or critical-inline the above-the-fold 14 KB and async-load the rest.

---

## Finding P8 — Browsing the blog index fetches Unsplash images cross-origin with no preconnect on every other page

**Evidence:** Only `index.html` has `<link rel="preconnect" href="https://images.unsplash.com" crossorigin>`. The blog index page fetches **7 Unsplash images** at first paint but `dns-prefetch`/`preconnect` is not in its `<head>`. Each new origin costs ~300 ms of TLS+DNS on a cold cellular connection.

**Recommendation:** Move the unsplash preconnect into the global head fragment, or pre-render the blog hero card images to local files (already a charter rule — Unsplash images should be downloaded and licence-credited per `feedback_website_images_royalty_free.md`).

---

## Finding P9 — Inline `style="..."` attribute appears **129 times on `index.html`** (49 on pricing, 65 on csrd, 39 on contact)

**Evidence:** Probe `document.querySelectorAll('[style]').length`:
```
index:    129
pricing:   49
csrd:      65
contact:   39
blog:      58
faq:       38
```
Every inline style fights the cascade and blocks CSP `style-src` from being tightened (the HTTP CSP keeps `'unsafe-inline'` open for this reason). It also disables WCAG 1.4.12 text-spacing override (see accessibility finding A1).

**Recommendation:** Repeat the May-9 migration (`scripts/migrate-inline-styles.py` per the `_headers` comment) — clearly there has been regression since.

---

## Finding P10 — Service worker precache versions are out of sync with HTML

**Evidence:** `service-worker.js` (APP_VERSION='50') precaches `/styles.min.css?v=92` and `/scripts.min.js?v=92`, but HTML loads `styles.min.css?v=97`. The precached `?v=92` is therefore never served — every visit refetches `?v=97` from origin. APP_VERSION still correctly invalidates older caches; the precache list itself is wrong.

Strategy split is otherwise sound: navigations network-first → `/index.html` offline fallback, `/api/*` + formspree + railway network-first, design assets (`/Assets/*.{svg,png,webp,jpg,jpeg,gif,avif}`) stale-while-revalidate, everything else cache-first with background refresh.

**Recommendation:** Promote the `?v=` query string to a single source of truth read by both the SW and the HTML inliner.

---

## Finding P11 — Homepage byte split: images 47%, CSS 18%, JS 12%

**Evidence:** Homepage transfer (KB): img 1,867 (47%) · link preloads + css 894+728 combined · script 463 (12%) · xhr 33. Contact page (no hero imagery): 1,568 KB of preloaded link assets dominates — most of which is unused CSS (see P5/P7).

**Recommendation:** Cap homepage image budget at ≤ 800 KB. (a) lazy-load cinematic scenes 2–5, (b) AVIF re-encode (already exists for one scene), (c) drop scenes 2–5 below 768 px width.

---

## Summary

CLS is locked at 0 across the site — a real achievement. The principal wins available without redesign work are:

1. **Fix the broken `<link rel="preload">` to `/js/scripts.min.js`** (4-letter fix × 23 files, saves a 404 round-trip per page-load).
2. **Run purgecss / lightningcss to remove dead selectors** (likely halves `styles.min.css` from 647 KB → ~300 KB).
3. **Lazy-load cinematic scenes 2–5** (~1.4 MB saved on the homepage).
4. **Bundle the per-page CSS into `styles.min.css`** (contact/pricing/faq/blog load 13–18 separate stylesheets).
5. **Sync service-worker.js `PRECACHE` versions with the HTML `?v=` versions** (currently mismatched at v92 vs v97).
