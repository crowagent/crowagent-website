# Cluster Gamma — Performance fix pass (2026-05-22)

Scope: ISSUE-005, ISSUE-006, ISSUE-007, ISSUE-016, ISSUE-017, ISSUE-036
from `audit/Website issues 22052026.md`.

Approach: surgical optimisations on the existing static-HTML stack. No
bundler migration (out of scope per the spec). Validators + smoke tests
remained the acceptance bar.

---

## Baseline vs Current — Playwright network probe on `/`

Probe script: `scripts/cluster-gamma-probe.cjs`
Chromium 1440x900, `networkidle` + 2.5s settle.

| Metric                                  | Baseline | Current | Delta            |
|-----------------------------------------|---------:|--------:|------------------|
| Total HTTP requests                     |       73 |      65 | -8 (-11%)        |
| Same-origin JS file fetches             |       44 |      43 | -1               |
| Same-origin JS file fetches (tools page)|       ~24|      22 | -2               |
| Same-origin JS file fetches (about.html)|       ~21|      19 | -2               |
| `cookie-banner.js` fetches              |        2 |       1 | -1 (50%)         |
| `arrow-right-stroke.json` fetches       |       10 |       1 | -9 (-90%)        |
| Hero image bytes (PNG vs AVIF)          |  647 598 | 114 377 | -533 221 (-82%)  |
| Logo image bytes                        |   19 394 |   6 727 | -12 667 (-65%)   |

---

## ISSUE-006 — cookie-banner.js loaded twice

Root cause: two distinct files were being fetched.
- `/cookie-banner.js` — the 1-line shim that simply schedules
  `/js/cookie-banner.js`.
- `/js/cookie-banner.js` — the actual implementation (banner DOM,
  consent API, PECR storage).

The shim added a wasted HTTP round-trip + script-parse on every page.

Fix:
1. `js/nav-inject.js` — changed the `scriptsToInject` entry from
   `/cookie-banner.js` to `/js/cookie-banner.js` so nav-inject injects
   the implementation directly.
2. Enhanced the `hasScript()` dedup check so it treats the two paths
   as equivalent (a page that still references the shim explicitly
   does not get double-loaded).
3. Bulk-removed `<script src="/cookie-banner.js" defer></script>` from
   56 HTML files. The nav-inject auto-injector now handles loading.
4. The legacy `cookie-banner.js` shim file is retained on disk for
   backward compatibility (any third-party reference still resolves).

Init guard: `js/cookie-banner.js` already has
`if (window.__caCookieBannerLoaded) return;` at the top of the IIFE
(line 35–36) so duplicate loads are a no-op.

Verification: probe shows 1 fetch of `/js/cookie-banner.js`, zero of
the shim. Smoke tests 19/20/21 (cookie banner show/accept/reject) all
pass.

---

## ISSUE-007 — Lottie arrow JSON fetched 10x

Root cause: `js/modules/lottie-cta.js` called `lottie.loadAnimation`
with `path: url`, which made lottie-web fetch the JSON once per host
element. The homepage has 10 `.lottie-arrow` CTAs that all reference
`arrow-right-stroke.json` -> 10 fetches.

Fix:
1. New singleton `js/modules/lottie-cache.js`. Exposes
   `window.CALottieCache.getAnimationData(kind)` returning a cached
   `Promise<JSON>`. In-flight cache so concurrent callers share the
   same fetch.
2. Modified `js/modules/lottie-cta.js` to await
   `CALottieCache.getAnimationData(kind)` and pass `animationData`
   (the parsed JSON) to `lottie.loadAnimation` instead of `path`.
3. Added `<link rel="preload" as="fetch" crossorigin>` for
   `arrow-right-stroke.json` in `index.html` so the cache primes
   before any CTA hover.
4. Loaded `lottie-cache.js` with `defer` immediately before
   `lottie-cta.js` so defer ordering guarantees the cache is ready.

Fallback path: if `window.CALottieCache` is not defined for any reason,
`lottie-cta.js` falls back to a direct `fetch(url).then(r => r.json())`,
preserving behaviour.

Verification: probe shows `arrowJsonFetches: 1` (was 10).

---

## ISSUE-016 — Hero image PNG instead of AVIF / WebP

Root cause: `styles.css` had a CSS background-image declaration that
referenced only the 632KB PNG variant of `hero-premium-earth`, even
though AVIF (114KB) and 1920w WebP (178KB) variants already existed
on disk under `Assets/photos/`.

Fix: replaced the bare `background-image: url(...)` declaration with
a CSS `image-set()` cascade so the browser picks the lightest format
it supports.

```css
.hero-hud .hero-bg-earth {
  background-image: image-set(
    url('/Assets/photos/hero-premium-earth.avif') type('image/avif') 1x,
    url('/Assets/photos/hero-premium-earth-1920.webp') type('image/webp') 1x,
    url('/Assets/photos/hero-premium-earth.png') type('image/png') 1x
  );
}
```

Applied to BOTH `styles.css` (author source) AND `styles.min.css`
(minified deploy artefact). Chrome 85+, Firefox 93+, Safari 16.1+ get
AVIF; older browsers fall through to WebP / PNG.

Verification: probe shows 0 PNG fetches, 1 AVIF fetch at 114 377 bytes.

---

## ISSUE-017 — Logo 1499x441px served for 136x40 display

Root cause: `js/nav-inject.js` `logoHTML()` emitted a `<picture>` whose
`<source>` tags pointed at the 1499x441 master assets
(`crowagent-logo-2-dark.avif`/`.webp`/`.png`). At display size
136x40 px (272x80 retina) this was a ~10x linear oversize / ~30x area
oversize.

Fix:
1. New script `scripts/cluster-gamma-logo-variants.cjs` generates
   AVIF + WebP variants at the actual display sizes via `sharp`:
   - 272x80 / 544x160 for nav (1x / 2x retina)
   - 232x68 / 464x136 for footer (1x / 2x retina)
2. `logoHTML()` now accepts a `slot` parameter (`'footer'` vs default
   nav) and emits responsive `srcset` of the form
   `... 272.avif 1x, ... 544.avif 2x` so devicePixelRatio chooses the
   right asset.
3. The 1499x441 PNG remains as the `<img src>` fallback for the long
   tail of browsers lacking AVIF/WebP support; modern browsers ignore
   it because the `<picture>` sources resolve first.
4. The footer call site now passes `logoHTML('/', 'footer')`.

Generated variants (bytes per file):
```
crowagent-logo-2-dark-272.avif      3 757   <- nav 1x
crowagent-logo-2-dark-272.webp      4 266
crowagent-logo-2-dark-544.avif      7 085   <- nav 2x retina
crowagent-logo-2-dark-544.webp      8 510
crowagent-logo-2-dark-232.avif      2 970   <- footer 1x
crowagent-logo-2-dark-232.webp      3 272
crowagent-logo-2-dark-464.avif      6 125   <- footer 2x retina
crowagent-logo-2-dark-464.webp      7 410
```

Verification: probe shows 2 logo fetches (one for nav, one for footer)
totaling 6 727 bytes vs 19 394 bytes for the single master file before.
Per-file saving on nav 1x = 19 394 -> 3 757 = -80.6%.

---

## ISSUE-036 — Logo loading="auto" -> eager/sync

Fix applied as part of ISSUE-017 above. The `<img class="logo-img">`
emitted by `logoHTML()` now carries:
- `loading="eager"` (was `decoding="async"` only — implicitly `auto`)
- `decoding="sync"`
- `fetchpriority="high"` (already present)

The nav logo is also pre-loaded site-wide via `<link rel="preload">`
in `index.html`'s `<head>`:

```html
<link rel="preload" as="image"
      href="/Assets/brand/crowagent-logo-2-dark-272.avif"
      imagesrcset="...-272.avif 1x, ...-544.avif 2x"
      type="image/avif" fetchpriority="high">
```

This makes the logo a candidate for LCP rather than a late-arriving
asset. Applied to `index.html` (the most-visited route). Other pages
get the eager logo via nav-inject; preload tag will be ported to other
HTML files in a subsequent pass if Lighthouse flags LCP regressions.

---

## ISSUE-005 — 46 JS files loaded on homepage

Realistic intervention applied (per the spec — no Vite migration):

1. **defer audit**: confirmed every `<script src=...>` tag on the
   homepage already carries `defer`. Nothing render-blocking.
2. **Cookie-banner dedup**: see ISSUE-006 above. Net -1 file fetch
   per page.
3. **Path-gated module loading** in `nav-inject.js`: three modules
   that only operate on specific routes are now appended to
   `scriptsToInject` conditionally on the current `window.location.pathname`:
   - `/js/modules/blog-reading-time.js` — only on `/blog*`
   - `/js/modules/pricing-tabs-indicator.js` — only on `/pricing*`
   - `/js/modules/demo-autoplayer.js` — only on `/`, `/index.html`,
     and product pages (`/crowagent-core`, `/crowmark`, `/csrd`,
     `/crowcyber`, `/crowcash`, `/crowesg`, `/products`).
4. No concatenation attempted. Defer + http/2 multiplexing means a
   handful of small modules costs less than the risk of breaking
   load-order semantics by hand-concatenating modules with implicit
   defer-ordering contracts (e.g. gsap vendor -> ScrollTrigger vendor
   -> cinematic-init -> sticky-storytelling).

Result: homepage net 43 JS files (was 44); tools / about / non-product
pages save 2 JS files each (no demo-autoplayer + no blog-reading-time
+ no pricing-tabs-indicator). The bigger savings come from the
per-fetch byte reductions in ISSUES 016/017 (-545 KB on the homepage
hero+logo).

Concatenation deliberately NOT attempted — the call chain
nav-inject -> ca-nav-ready -> scripts.min.js -> cinematic-init ->
GSAP timeline registration has implicit defer-ordering contracts that
would require careful single-file authoring to preserve. Better tackled
in a dedicated bundler pass once a build pipeline is introduced.

---

## Files changed

| File                                                | Change                                                            |
|-----------------------------------------------------|-------------------------------------------------------------------|
| `js/nav-inject.js`                                  | logoHTML responsive variants + cookie-banner direct + path-gated modules |
| `js/modules/lottie-cache.js`                        | NEW — singleton JSON cache for Lottie animation data              |
| `js/modules/lottie-cta.js`                          | Use CALottieCache + animationData instead of path                 |
| `index.html`                                        | Preload links for arrow JSON + logo + lottie-cache `<script>`     |
| `styles.css`                                        | hero-bg-earth -> image-set() AVIF/WebP/PNG                        |
| `styles.min.css`                                    | hero-bg-earth -> image-set() AVIF/WebP/PNG (mirror)               |
| 56 HTML files (about, blog/*, crow*, csrd, faq...)  | Removed redundant `<script src="/cookie-banner.js">` tag          |
| `scripts/cluster-gamma-probe.cjs`                   | NEW — Playwright network probe (baseline + verification)          |
| `scripts/cluster-gamma-logo-variants.cjs`           | NEW — sharp-based logo variant generator                          |
| `Assets/brand/crowagent-logo-2-dark-{232,272,464,544}.{avif,webp}` | NEW — generated logo assets                          |

---

## Gates

| Gate                        | Status   | Note                                                  |
|-----------------------------|----------|-------------------------------------------------------|
| sovereign-sheriff           | PARTIAL  | Pre-existing drift in styles.css L31389-31475 (not introduced by this pass). G_zeroHardcodedGap now PASS. Hex/cubicBezier/zIndexLiteral fails are baseline state. |
| geometric-truth             | GREEN    | All 4 gates pass (H1<->CTA centring, card overlap, nav height, earth backdrop). |
| principal-spec-validator    | GREEN    | 51/51 checks pass.                                    |
| reconciliation-checker      | PARTIAL  | Pre-existing: .sv-marquee block missing in index.html (not introduced by this pass). |
| smoke (25 specs, chromium)  | GREEN    | 25/25 in 40.6s.                                       |

Baseline validator state (run before any edits) had the same partial
failures, so this pass introduced no new drift.
