# Motion, Carousels and Front-End Performance Audit

> **STATUS 2026-07-29:** several findings below are resolved, stale, or false positives.
> Read [`AUDIT-RESOLUTION-STATUS.md`](./AUDIT-RESOLUTION-STATUS.md) before actioning anything here.

Repo: `crowagent-website` (static HTML, Cloudflare Pages, no build step). Server: `http://localhost:8092`.
Method: source-read every implicated file, then verified live in Chrome via the `claude-in-chrome` MCP tools (DOM/computed-style inspection, forced scroll, `ScrollTrigger` introspection) until the extension disconnected partway through; the remainder is static analysis, clearly marked as such below.

## Executive Summary

The dominant live bug is not the five-system reveal mess the codebase's own comments worry about — most of those systems are dead. It is `sovereign-transformation-v2.js`'s GSAP `scrollReveals()`, which targets `.ca-card`/`.sv-block`/`.ca-method-item`/`.ca-trust-item`/`.ca-bento-item` on **~30 pages** and leaves them permanently at `opacity:0` even after they scroll fully into view. **Live-reproduced**: 20/20 cards stuck on `crowmark.html` (the flagship product page), 13/13 on `about.html`, 9/9 on `contact.html` — the last of these *has* the site's dedicated `reveal-failsafe.js` loaded, and it still doesn't help, because that failsafe's selectors don't match these classes. Five older reveal systems (`.stripe-reveal`, `.sf17-reveal`, `.ms-reveal`, `.sv-reveal`, plain `.reveal` outside the homepage-style pages) have **zero matching elements anywhere in the current HTML** — they are inert fossils, not actively fighting anything. GSAP+ScrollTrigger (112.9KB) load on 29 pages including `privacy.html` and `terms.html`, which have no GSAP-targeted element at all — 100% wasted payload there. Motion values are ad hoc: 43 distinct transition-durations, 35 distinct animation-durations, 9 hand-typed cubic-béziers (two of them the identical curve). `sovereign-transformation-v2.js`, the most widely loaded custom script on the site, has zero `prefers-reduced-motion` handling anywhere in its source.

## 1. Reveal systems — the strongest lead, resolved

### 1.1 Inventory: nine distinct reveal code paths

| # | Marker class / selector | Reveal mechanism | Pages that load the JS | Elements with the marker class in current HTML | Status |
|---|---|---|---|---|---|
| 1 | `.nb-reveal`, `.reveal` (nebula pages) | `js/nebula-home.js` → adds `.in`, IO + 1500ms/`load`/`visibilitychange` failsafe | 10 nebula pages (`index.html`, `blog/index.html`, `glossary/index.html`, `sectors/index.html` + 4 sector pages, `tools/index.html`, `tools/ppn-002-calculator/index.html`) | 14 elements on `index.html` alone (`nb-card`, `nb-head`, `nb-phase`, etc.) | **Live and working** (verified by source; see §"genuinely good") |
| 2 | `.reveal`, `[data-stagger]` | `js/modules/section-motion-choreography.js` (GSAP, `gsap.from(...)` per child) | 5 pages: `blog/ppn-002-social-value-guide.html`, `contact.html`, `partners.html`, `roadmap.html`, `security.html` | **0** — no page outside the nebula group has a bare `class="reveal"` or a `data-stagger` attribute anywhere in the repo | **Inert** — loaded, runs, finds nothing |
| 3 | `.reveal` → `.visible` | `scripts.js`/`scripts.min.js` (plain IntersectionObserver, line 44-57 of `scripts.js`) | ~20 pages via `scripts.min.js` (blog posts, compare/*, contact, faq, integrations, partners, resources, roadmap, security) | **0** on any of those pages | **Inert** |
| 4 | `.stripe-reveal:not(.in-view)`, `.sf17-reveal:not(.is-revealed)`, `[class*="reveal"]` | `js/modules/reveal-failsafe.js` (SEL) | Same 5 pages as #2 | **0** matches for `.stripe-reveal`/`.sf17-reveal`; the wildcard `[class*="reveal"]` also finds nothing since no class on these 5 pages contains the substring "reveal" | **Inert for its primary selector.** Its secondary `FORCE_SEL` (`main section, main article, [class*="-section"], [class*="-article"]`) still runs but does not match `.ca-card` (see §1.3) |
| 5 | `.sf17-reveal` → `.is-revealed` | `js/modules/sf17-scroll-reveal.js` | **Loaded on zero pages** — no `<script src=".../sf17-scroll-reveal.js">` exists anywhere in the repo | n/a | **Fully dead file** (1.1KB). Its CSS (`styles.css:26763-26778`) is also dead, and `styles.css` itself is not loaded by any marketing page (confirmed: `index.html`/`about.html`/`contact.html` all load `sovereign-core-v2.compiled.css` instead) |
| 6 | `.ms-reveal` → `.ms-in` | `js/modules/motion-system.js` | 14 pages (5 reveal-failsafe pages + `compare/*` (5) + `resources.html` + `integrations.html` + blog posts loading `motion-system.js` directly) | **0** anywhere in the repo's HTML | **Inert.** Its own stylesheet, `Assets/css/motion-system.css` (defines `.ms-reveal`/`.ms-in`), is **linked from zero HTML files** — even if a `.ms-reveal` element existed, most pages carry no CSS to hide/show it. `Assets/css/resources-page.css:92-98` defines a *different* pair, `.ms-reveal`/`.ms-reveal.is-visible` (mismatched: `motion-system.js` only ever writes `.ms-in`, never `.is-visible`) |
| 7 | `.sv-reveal` → `.sv-revealed` | `js/modules/sv-reveal.js` | **Loaded on zero pages** | n/a | **Fully dead file** (6.6KB), and unstyled — no `.sv-reveal`/`.sv-revealed` CSS rule exists anywhere either |
| 8 | `.ca-card`, `.sv-block`, `.ca-method-item`, `.ca-trust-item`, `.ca-bento-item` | `SovereignTransformation.scrollReveals()` inside `js/modules/compiled/sovereign-transformation-v2.js:190-205` (GSAP `gsap.from(block,{scrollTrigger:{start:'top 98%',toggleActions:'play none none reverse'},opacity:0,y:12})`) | **~29-30 pages** — every page that loads `sovereign-transformation-v2.js`, i.e. everything except the 10 nebula pages | 20 on `crowmark.html`, 13 on `about.html`, 9 on `contact.html`, 6 on `pricing.html`/`roadmap.html`, 4 on `resources.html`, 3 on `partners.html` (7 pages confirmed with markup by grep) | **Live and broken — see §1.2.** No failsafe anywhere in the codebase targets these classes. |
| 9 | `.roadmap-milestone` → `.visible` | `js/modules/roadmap-reveal.js` | `roadmap.html` only | Yes, milestone nodes | **Live and working** — small, single-purpose, own reduced-motion + IO handling, doesn't overlap with anything else |

**Net finding:** the reveal-failsafe.js header comment (2026-05-24) accurately diagnosed a real problem at the time it was written, and #4/#2 were a correct fix for it — but the marker classes it targets (`.reveal`, `.stripe-reveal`, `.sf17-reveal`) were subsequently stripped from every page's HTML during later redesigns, leaving both the disease and the medicine as dead code. Meanwhile a **new, unrelated, unfixed instance of the identical bug class** (GSAP `gsap.from()` + `ScrollTrigger` leaving content invisible) was introduced later in `sovereign-transformation-v2.js`, targeting different classes, and nobody extended the failsafe to cover it.

### 1.2 The live bug, reproduced

Navigated to `crowmark.html`, scrolled to `y=3400` (four `.ca-card` elements fully inside the 585px-tall viewport, `top: 299px`), waited 1.2-3s (well past `reveal`'s own [300,800,1500,2500]ms passes and the `load` event):

```json
{"scrollY":3400,"inViewCount":4,"inViewStuckCount":4}
```

All four remained `opacity: 0`. Called `window.ScrollTrigger.refresh()` directly — no change. Inspected the trigger object itself:

```json
{"start":3126,"end":4045,"progress":0.298,"isActive":true,"triggerTop":3699.3,"animProgress":0}
```

The `ScrollTrigger` is *not* stale (`start`/`end` match the element's real position, `isActive:true`, `progress` tracks scroll correctly) — but `animation.progress()` is `0`: the tween's `play` toggle-action never fired even though the trigger considers itself active inside its zone. This means `ScrollTrigger.refresh()` — the exact remedy `reveal-failsafe.js` was built around — **does not fix this failure mode**, because the trigger isn't stale, its associated tween just never played.

Repeated on `about.html` with a slower, more realistic scroll (13 steps of 800px, 150ms apart, then back to top): **13/13 `.ca-card` elements stayed at `opacity:0`.** Repeated on `contact.html` (which *does* load `reveal-failsafe.js`) with a 3-second settle after a full page scroll: **9/9 stuck.** `reveal-failsafe.js`'s `FORCE_SEL` (`main section, main article, [class*="-section"], [class*="-article"]`) does not match a `<div class="ca-card">`, and forcing the parent `<section>` visible (which was never hidden — only the child card was) does nothing for the card.

**Practical exposure**: every page with `.ca-card`/`.sv-block`/etc. markup is affected — confirmed by grep on `about.html` (13), `crowmark.html` (20), `contact.html` (9), `partners.html` (3), `roadmap.html` (6), `pricing.html` (6), `resources.html` (4). Only three of these were re-verified live; the other four carry the identical unguarded code path and should be assumed broken until checked.

### 1.3 The 2026-07-29 CSS failsafe: covers its own case only

`html.nb-js .reveal{opacity:0}` / `.reveal.in{opacity:1}` (with a synchronous stamping `<script>` at the top of `<head>`, `Assets/css/premium-v2.css:474-481`, duplicated inline in `index.html:301-308`) is present on exactly the **10 nebula pages** — the same set that already had a working reveal system (§1.1 #1). It guards `.reveal`/`.nb-reveal` only. It does not exist on any of the 29 GSAP pages, and even where it does exist it has no bearing on `.ca-card`, `.stripe-reveal`, `.sf17-reveal`, `.ms-reveal`, or `.sv-reveal`. It is a good pattern (visible-by-default, JS-stamp-to-hide, so a script failure can never blank the page) but it closes a gap that was already closed by #1's own failsafe timers, and it does not touch the one reveal path that is actually broken.

## 2. Carousels

Two live, real carousels found; four additional carousel-shaped files exist but are dead code (§5).

### 2.1 `[data-pcar]` — `js/modules/product-carousel-2026-05-26.js` + `Assets/css/product-carousel-2026-05-26.css` (28 pages, per grep on `data-pcar`)

- **GPU-accelerated**: crossfade is `opacity` + `transform: scale(0.99→1)` on absolutely-positioned stacked slides (`product-carousel-2026-05-26.css:53-66`), `will-change: opacity, transform` set. No layout properties touched.
- **Timing/easing**: 900ms, `var(--ease-canonical)`.
- **Driver**: `requestAnimationFrame` loop (`product-carousel-2026-05-26.js:91-105`), not `setInterval` — timer drift-free, ties directly to the visible SVG progress-ring countdown so the two can never disagree.
- **Autoplay pausable**: yes — hover (`mouseenter`/`mouseleave`), focus (`focusin`/`focusout`), and off-screen (`IntersectionObserver`, threshold 0.25) all pause/resume it (lines 152-162).
- **Reduced motion**: `REDUCED` flag read once at load via `matchMedia`; `tick()` skips advancing when set (line 96); CSS also collapses the crossfade to a 1ms swap (`product-carousel-2026-05-26.css:161-164`).
- **Keyboard**: `ArrowLeft`/`ArrowRight` on the carousel root move slides and move focus to the corresponding tab (lines 142-149). Tabs are real `role="tab"`/`role="tablist"` with `aria-selected` (lines 33-40), `:focus-visible` outline defined (`product-carousel-2026-05-26.css:116,140`).
- **Touch**: `touchstart`/`touchend` swipe, 40px threshold (lines 131-137).
- **CLS**: `.pcar__viewport { aspect-ratio: 1440/822 }` (`product-carousel-2026-05-26.css:50`) reserves space before any image loads. No CLS risk from this component.
- **Defect found**: `Assets/css/nav-global-fix-2026-05-27.css` (loads *after* `product-carousel-2026-05-26.css` in every page's `<head>`) independently redefines the same element: `.pcar__tab::before{width:7px;height:7px;transition:width .3s ease,background .3s ease}` versus the carousel's own `.pcar__tab::before{width:6px;height:6px;transition:background 220ms ease,transform 220ms ease}` (`product-carousel-2026-05-26.css:130-135`). Two stylesheets, loaded on the same pages, disagree on the dot's size, duration, and — worse — one of them animates `width` (non-composited, forces layout) where the carousel's own CSS deliberately used `transform: scale()`. The later-loading rule wins the base state, so the dot indicator is silently animating on a non-composited property on every one of the 28 carousel pages, contradicting the file's own "GPU-friendly (opacity/transform)" header comment.

### 2.2 `[data-nb-showcase]` — `js/nebula-showcase.js` + presumably `nebula-livepanels.css`-adjacent styling (homepage only)

- rAF-driven 6000ms dwell per tab, same-clock progress bar (no drift).
- Pauses on hover, focus-within, off-screen (`IntersectionObserver`, threshold 0.3), tab-hidden (`visibilitychange`), and via an **explicit pause button** (`data-nb-toggle`) — this is WCAG 2.2.2 done correctly, not just a hover-pause.
- `prefers-reduced-motion`: disables autoplay entirely via a live `matchMedia` change listener (lines 184-192), leaves a fully keyboard-usable static tablist.
- Keyboard: Arrow/Home/End on the tablist (WAI-ARIA tab pattern), `role="tab"`/`role="tabpanel"` structure assumed from markup (`aria-controls` resolution, lines 23-26).
- No touch-swipe handling found in this file (tabs are click/keyboard only) — minor gap relative to `product-carousel`.

### 2.3 Dead carousel-shaped code

`js/modules/carousel.js` (19.2KB), `js/modules/platform-carousel.js` (3.1KB), `js/modules/ca-rotator.js` (2.9KB), `js/modules/demo-autoplayer.js` (2.0KB) — none are referenced by any `<script>` tag in any HTML file (verified excluding the stale `coverage/` report, which is why a naive grep can misleadingly show 1 hit). 27.2KB of carousel logic sitting unused; `carousel.js` alone is bigger than the two live carousel scripts combined.

## 3. GSAP weight

- `js/vendor/gsap.min.js`: **72,225 bytes** (70.5KB)
- `js/vendor/ScrollTrigger.min.js`: **43,391 bytes** (42.4KB)
- Combined: **115,616 bytes (112.9KB)**, uncompressed — the local `http-server` does not gzip/brotli (`Content-Length` header matches raw file size exactly, no `Content-Encoding`), so this is the true byte count for the transfer method in use locally; Cloudflare Pages in production will compress text assets, so real production transfer will be lower but the multiplier is not something this audit can measure without hitting the live CDN.
- Loaded via `<script defer>` in both cases — **not render-blocking**, confirmed on every page in the script-tag survey.
- Loaded on **29 pages** (every page except the 10 nebula pages).
- **Usage audit, by what the payload actually buys**:
  - `privacy.html`, `terms.html`: **zero** `.ca-card`-family elements, zero `[data-pcar]`, zero `.sv-btn` elements. `sovereign-transformation-v2.js`'s `scrollReveals()`, `setupSlabInteraction()`, and `setupMagneticButtons()` all find empty NodeLists. GSAP+ScrollTrigger (112.9KB) buys **nothing** on these two pages.
  - `cookies.html`, `cookie-preferences.html`, `glossary/ppn-002.html`, `glossary/toms-framework.html`, `tools-ppn002-calculator-methodology.html`, `changelog.html`, `404.html`: zero `.ca-card`-family, zero `[data-pcar]`, but 2-4 `.sv-btn` elements each — the entire GSAP payload on these 7 pages buys a mouse-follow "magnetic" pull on 2-4 buttons (`setupMagneticButtons()`, lines 207-221), a feature that needs no scroll-linked animation library at all.
  - On the pages that do have `.ca-card` markup (§1.2), the payload is justified in principle but the feature it drives is broken.
- `heroEntrance()` (lines 136-171 of `sovereign-transformation-v2.js`) is fully implemented but **never called** — not present in the `init()` call list (`init()` calls `setupKineticTypography`, `setupMagneticButtons`, `scrollReveals`, `mouseGlows`, `setupSlabInteraction`, `setupHeroParallax` only). Dead code inside a live, loaded file.
- `setupKineticTypography()` (lines 76-134) is also effectively a no-op: `const headings = [];` is initialized empty and never populated before `headings.forEach(h => splitElement(h))` runs — the char-splitting function is fully written but has no input on any page.

## 4. Motion quality

Survey scope: every stylesheet actually `<link>`-ed from a real page (`Assets/css/*.css` + `crowagent-brand-tokens.css`); the 1.2MB `styles.css`/`styles.min.css`/`styles.purged.css` were excluded because no marketing page loads them (confirmed by `<link>` audit on `index.html`/`about.html`/`contact.html`/`resources.html`, all of which load `sovereign-core-v2.compiled.css` instead) — including them would only inflate the ad-hoc-ness further.

- **43 distinct `transition-duration` values** in use (most frequent: `2s`×28, `0.2s`×18, `3s`×12, `180ms`×10, `25s`×10, `220ms`×9…).
- **35 distinct `animation-duration` values** in use.
- **9 hand-written `cubic-bezier()` curves**, two of which are the *same* curve typed two different ways: `cubic-bezier(0.16, 1, 0.3, 1)` (2 occurrences, spaced) and `cubic-bezier(.16,1,.3,1)` (1 occurrence, condensed) — evidence of copy-paste rather than a shared token.
- A real duration/easing **token scale does exist** — `crowagent-brand-tokens.css`: `--motion-fast:0.15s; --motion-base:0.3s; --motion-medium:0.5s; --motion-slow:0.8s; --ease-out; --ease-in-out; --ease-spring; --ease-standard; --duration-btn:200ms; --duration-btn-press:50ms` — but the 43/35-value spread shows most component CSS bypasses it and hardcodes arbitrary numbers instead.
- **Duplicate/fragile easing tokens**: `--ease-out` and `--ease-canonical` are defined in *both directions* across two different files — `crowagent-brand-tokens.css` sets `--ease-out: cubic-bezier(0.16,1,.3,1)` then `--ease-canonical: var(--ease-out)`; `Assets/css/sovereign-core-v2.compiled.css:94` sets `--ease-out: var(--ease-canonical)` (the reverse reference). This only avoids an actual circular-reference break because `crowagent-brand-tokens.css` happens to be `<link>`-ed *after* `sovereign-core-v2.compiled.css` on every page audited, so its concrete value wins the cascade last. It is correct today by accident of link order, not by design — reordering the `<link>` tags on any single page would silently break every easing that depends on `--ease-canonical`/`--ease-out`. `--ease-in-out` and `--ease-tactile` are each defined twice too (`sovereign-core-v2.compiled.css:95` vs `crowagent-brand-tokens.css`; `premium-v2.css:28` vs `crowagent-brand-tokens.css`).
- **Non-composited properties animated via `transition`** (excluding the well-known, intentional `transition:background-color 600000s` Chrome-autofill-defeat hack in `nav-global-fix-2026-05-27.css`, which is not a bug):
  - `Assets/css/pricing-sf16.css:161` — `transition: max-height 320ms var(--ease-standard);` (accordion/expand pattern; forces layout on every frame of the transition).
  - `Assets/css/ultra-premium-interactions.css:38` — `.nav-links a::after { width: 0 → 100%; transition: width 200ms var(--ease-out); }` (nav underline hover effect — non-composited on a low-cost element, minor but avoidable with a `transform: scaleX()` approach).
  - `Assets/css/nav-global-fix-2026-05-27.css` — `.pcar__tab::before{transition:width .3s ease,background .3s ease}` (see §2.1's carousel-dot conflict — this is the more consequential instance since it overrides an already-correct `transform`-based rule).

## 5. `prefers-reduced-motion`

**Honour it** (verified by direct grep + read): `ca-form-validation.js`, `ca-rotator.js`(dead), `carousel.js`(dead), `cinematic-init.js`(dead), `cinematic-walkthrough.js`(dead), `counter-tween.js`(dead), `eyebrow-rotator.js`(dead), `hero-citadel.js`(dead), `hero-mesh-shader.js`(dead), `hero-parallax.js`(dead), `hero-persona-switcher.js`, `hero-staggered-entrance.js`(dead), `logo-shimmer.js`(dead), `magnetic-pull.js`, `motion-system.js`, `nav-shrink.js`(dead), `page-features.js`(dead), `platform-carousel.js`(dead), `pricing-billing-toggle.js`, `pricing-tabs-indicator.js`, `product-carousel-2026-05-26.js`, `products-filter.js`(dead), `roadmap-reveal.js`, `section-motion-choreography.js`, `sf17-scroll-reveal.js`(dead), `sf21-back-to-top.js`(dead), `sf23-counters.js`(dead), `sovereign-features.js`, `spotlight.js`(dead), `sticky-storytelling.js`(dead), `sv-reveal.js`(dead), `nebula-home.js`, `nebula-livepanels.js`, `nebula-shotpanels.js`, `nebula-showcase.js`, `premium-v2.js`(dead). Also a sitewide CSS blanket in `crowagent-brand-tokens.css`: `@media (prefers-reduced-motion:reduce){*,::after,::before{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}` — this neuters every CSS `transition`/`animation` for reduced-motion users regardless of whether the individual component remembered to handle it.

**Ignore it — confirmed by full read, zero matches for "prefers-reduced-motion" anywhere in the file**: `js/modules/compiled/sovereign-transformation-v2.js` — loaded on ~29-30 pages, the single most widely-loaded custom motion script on the site. This matters concretely because:
- The blanket CSS rule above only touches CSS `transition`/`animation`; it has **no effect** on GSAP, which sets inline styles via its own tween engine, not CSS transitions.
- `setupHeroParallax()` (lines 173-188) runs a scroll-scrubbed `gsap.to(..., {scrollTrigger:{scrub:true}, y:60, scale:0.99, opacity:0.9})` on every page's hero — scroll-linked parallax is one of the most common vestibular-disorder triggers, and it runs unconditionally for reduced-motion users on every one of these ~29 pages.
- `mouseGlows()` (lines 223-235) and `setupMagneticButtons()` (lines 207-221) also run unconditionally.

`js/modules/pricing-tabs-indicator.js` and `js/modules/hero-persona-switcher.js` each reference `prefers-reduced-motion` once — not independently re-verified for correctness, flagged only as present.

## 6. Dead JavaScript

Cross-referenced every `.js` file's basename against every `<script src="...">` in every real HTML page (`coverage/` build-report HTML excluded — it contains stale references to files that inflate a naive count, e.g. it made `carousel.js`, `page-features.js`, `csrd-wizard.js`, and `sf21-back-to-top.js` look "used" when they are not).

**39 files, ~240KB of source, are referenced by zero pages:**

| Bytes | File |
|---|---|
| 19,643 | `js/modules/carousel.js` |
| 17,236 | `js/modules/hero-mesh-shader.js` |
| 16,057 | `js/modules/page-features.js` |
| 12,764 | `js/tool-engine-vsme-materiality-light.js` |
| 12,713 | `js/modules/csrd-wizard.js` |
| 11,119 | `js/tool-engine-cyber-essentials-readiness.js` |
| 10,755 | `js/modules/cinematic-init.js` |
| 9,691 | `js/analytics-init.js` |
| 9,138 | `js/modules/hero-citadel.js` |
| 9,107 | `js/tool-engine-late-payment-calculator.js` |
| 8,019 | `js/modules/hero-persona-switcher.js`* |
| 7,174 | `js/tool-engine-csrd-applicability-checker.js` |
| 7,142 | `js/premium-v2.js` |
| 6,736 | `js/modules/sv-reveal.js` |
| 6,601 | `js/modules/blog-filter.js` (root `js/blog-filter.js` duplicate also dead) |
| 6,552 | `js/modules/pricing-tabs-indicator.js`* |
| 6,247 | `js/modules/d-batch-runtime.js` |
| 5,762 | `js/modules/hero-staggered-entrance.js` |
| 5,470 | `js/modules/sf21-back-to-top.js` |
| 4,884 | `js/modules/counter-tween.js` |
| 4,832 | `js/modules/sticky-storytelling.js` |
| 4,443 | `js/modules/cinematic-walkthrough.js` |
| 3,910 | `js/modules/sf23-counters.js` |
| 3,779 | `js/modules/blog-reading-time.js` |
| 3,766 | `js/modules/e-batch-runtime.js` |
| 3,665 | `js/modules/view-transitions.js` |
| 3,584 | `js/modules/products-filter.js` |
| 3,068 | `js/modules/platform-carousel.js` |
| 2,975 | `js/modules/ca-rotator.js` |
| 2,605 | `js/modules/spotlight.js` |
| 2,574 | `js/modules/hero-parallax.js` |
| 2,376 | `js/modules/nav-shrink.js` |
| 2,133 | `js/modules/eyebrow-rotator.js` |
| 2,024 | `js/modules/demo-autoplayer.js` |
| 1,800 | `js/modules/glossary-search.js` |
| 1,794 | `js/blog-filter.js` |
| 1,569 | `js/modules/logo-shimmer.js` |
| 1,153 | `js/modules/sf17-scroll-reveal.js` |
| 1,101 | `js/modules/section-parallax.js` |

\* `hero-persona-switcher.js` and `pricing-tabs-indicator.js` do check `prefers-reduced-motion` in their source (§5) despite being unreferenced — dead but not sloppily written.

**Plus one dead vendor file that dwarfs all of the above combined**: `js/vendor/three.min.js`, **603,451 bytes (589KB)**, a full Three.js WebGL build, referenced by **zero** HTML files. Given `js/modules/hero-mesh-shader.js` (also dead, above) is named exactly for a WebGL hero effect, and `reveal-failsafe.js`'s own header comment references "the WebGL hero-mesh issues synchronous readPixels that stall the GPU" as a *live* concern its `heroRescue()` function still guards against (lines 44-53, 97-137) — this is iteration debris: a WebGL hero effect was built, shipped, apparently caused enough trouble that a defensive rescue was written into the reveal failsafe, and was later pulled from every page, but neither the 589KB library nor its own shader script nor the now-pointless rescue code were cleaned up.

None of this dead code costs page-weight to real visitors — it isn't `<script src>`'d anywhere. It costs repo size, audit time, and the risk that someone re-links one of these files (e.g. `three.min.js`) thinking it's live.

**Referenced/live JS files, for contrast**: `nav-inject.js` (41 pages), `sovereign-transformation-v2.js` (29), `product-carousel-2026-05-26.js` (20), `motion-system.js` (14), `nebula-home.js` (10), `cookie-banner.js` (6), `reveal-failsafe.js`/`share-system.js`/`section-motion-choreography.js` (5 each), `sovereign-features.js`/`nebula-shotpanels.js`/`ca-form-validation.js`/`analytics-init.js`(referenced-count false-positive, actually dead — see above)/`partners-form.js`(2), plus ~10 single-page tool/feature scripts. Roughly 24 real files are live against 39 confirmed dead plus 1 dead vendor bundle — consistent with the brief's "~25 of 88."

## 7. Console errors

**Live verification was interrupted**: the Chrome extension used for `claude-in-chrome` MCP tooling disconnected partway through this audit (after the DOM/`ScrollTrigger` evidence in §1.2 had already been captured, but before `read_console_messages`/`read_network_requests` could be run on the required page set: `/`, `/crowmark`, `/pricing`, `/compare`, `/blog`, `/sectors`, `/tools`, `/about`, `/faq`, `/contact`). Reconnection attempts (`tabs_context_mcp`) failed with "Browser extension is not connected" — this needs the user to check the extension in Chrome; it cannot be fixed from this session.

What was verified as a substitute:
- `node --check` (and `--input-type=module` for the one ES-module file) against every JS file that is actually `<script>`-tagged on a real page: **zero syntax errors** across `nav-inject.js`, `cookie-banner.js`, `nebula-home.js`, `nebula-livepanels.js`, `nebula-shotpanels.js`, `nebula-showcase.js`, `motion-system.js`, `section-motion-choreography.js`, `reveal-failsafe.js`, `product-carousel-2026-05-26.js`, `sovereign-features.js`, `magnetic-pull.js`, `pricing-tabs-panel.js`, `pricing-billing-toggle.js`, `faq-search.js`, `analytics-init.js`, `partners-form.js`, `ca-form-validation.js`, `scripts.js`, `sovereign-transformation-v2.js`.
- A related, out-of-scope-but-adjacent defect surfaced while reading `sovereign-features.js` for the reduced-motion check (§5): its Cmd+K command palette (`buildPalette()`, lines 119-181) hard-codes a 47-route search index. Spot-checking 24 of those routes against the filesystem: **17 point to pages that do not exist** on this static site (`/demo.html`, `/crowcyber.html`, `/crowcash.html`, `/crowesg.html`, `/csrd.html`, `/products/`, `/intel/cyber-essentials-tracker/`, `glossary/csrd.html`, 7 of 8 sampled blog posts, all 4 methodology pages). This is a content/IA defect, not a motion defect, but it lives inside a file this audit already had open — worth a line since Cmd+K is a "premium" interaction surface and currently 404s more often than it succeeds.
- No `mousemove`/`scroll` throttling issue could be *timed* live, but is called out precisely in §8.

This section should be re-run once the browser extension is reconnected; treat the console-error question as **not yet answered** rather than assume clean.

## 8. Layout stability

- **Images**: 0 of 60 `<img>` tags across all 41 real pages are missing `width=`; 0 are missing `height=` (both checked separately). No image-driven CLS risk found.
- **Fonts**: `Assets/css/fonts-selfhosted.css` — all 7 `@font-face` rules carry `font-display: swap`. Consistent, no FOIT risk.
- **Nav injection**: `<header id="ca-nav" class="sv-nav" role="banner"></header>` starts empty and gets its `outerHTML` swapped by `nav-inject.js`'s `inject()` (`js/nav-inject.js:590-595`) on `DOMContentLoaded`. This does **not** cause CLS in practice: `nav-global-fix-2026-05-27.css` (loaded on every page) forces `.sv-nav{position:fixed!important;height:var(--ca-nav-h)}` with `--ca-nav-h:72px` and `body{padding-top:var(--ca-nav-h)}` — the 72px is reserved by fixed positioning + body padding from first paint, independent of when the JS swap happens. A `sovereign-primitives.css` comment (`.sv-nav{min-block-size:4.5rem}`, lines 495-511) documents this exact intent ("the placeholder reserves layout space before nav-inject.js runs — no CLS") but that file is **not linked from any HTML page** — the protection it describes is real, just delivered by a different, unrelated stylesheet than the one that claims credit for it.
- **Footer injection**: `<div id="ca-footer"></div>` (`index.html:1060`) has no reserved height anywhere in the loaded CSS and is not `position:fixed`. It is swapped in the same `DOMContentLoaded` pass as the nav. Because the footer is the last element on the page, a late height-change here does not shift already-rendered above-the-fold content in the common case (nothing sits below it to be pushed), but it does mean the document's total scrollable height is wrong for a brief window after `DOMContentLoaded` and before the swap — this can affect scroll-based reveal timing (§1) and would show as a real CLS event for any visitor who is already scrolled near the bottom of the page during that window (e.g. a fast back-navigation with scroll-position restoration racing the injection). Minor relative to the reveal bug, but a genuine gap: no CSS reserves footer height the way the nav's is reserved.
- **`sovereign-transformation-v2.js` calls `window.scrollTo(0,0)` unconditionally** on every `init()` (line 25), after setting `history.scrollRestoration = 'manual'`. This is documented in-code as an intentional 2026 fix for a "jump to bottom" bug (LM-016), but its side effect is that the browser's native scroll-position restoration on back/forward navigation is permanently disabled sitewide (every page always opens at the top) — not a CLS issue, but a real navigation-UX cost of a motion-adjacent fix, worth the owner knowing it's still in effect.

## What is genuinely good

- **`product-carousel-2026-05-26.js`/`.css`** (§2.1) is close to reference-quality: rAF-driven, GPU-only properties, `aspect-ratio`-reserved (zero CLS), pauses on hover/focus/off-screen, full keyboard support with focus management, touch swipe, real ARIA tab pattern, and a correct reduced-motion fallback. Preserve this file as-is; do not let a later "unify all carousels" pass rewrite it into something worse. The only defect is the external CSS override on the dot indicator (§2.1/§4) — fix the override, not the carousel.
- **`nebula-showcase.js`** (§2.2) has the best `prefers-reduced-motion` behaviour on the site: a live `matchMedia` change listener (motion preference toggled *during* the session is honoured immediately) and an explicit, visible pause button rather than relying on hover alone (correct WCAG 2.2.2 handling, which most autoplay implementations get wrong).
- **`nebula-home.js`'s reveal system** (§1.1 #1) is small (1.8KB) and correct: single `IntersectionObserver`, a genuine multi-layer failsafe (1500ms timer + `load` + `visibilitychange`), reduced-motion bail-out before any hidden state is ever applied. This is the pattern the rest of the site's reveal code should have converged on instead of accumulating five parallel, uncoordinated alternatives.
- **`nebula-shotpanels.js`** (40KB, the largest custom module, loaded on `index.html`/`crowmark.html`/`contact.html`) is a sophisticated but disciplined system for animating data overlays onto product screenshots — single shared rAF loop that only runs while something is mid-entrance, `IntersectionObserver`-gated per element, snaps to final values instead of leaving a half-drawn state when scrolled away or tab-hidden, and explicitly handles `prefers-reduced-motion` by painting final values immediately. Its own header comment is honest about *why* it exists (empty demo-account screenshots) rather than dressing it up — worth preserving as an example of restraint (one shared loop, not one per element).
- **The sitewide reduced-motion CSS blanket** in `crowagent-brand-tokens.css` (`*{animation-duration:.01ms!important;transition-duration:.01ms!important}`) is a solid safety net for every CSS-driven animation on the site, and a real design-token scale for durations/easings (`--motion-fast/base/medium/slow`, `--ease-out/in-out/spring/standard`) already exists in the same file — the problem is adoption (§4), not absence of a system to adopt.
- **Every image on every page carries explicit `width`/`height`**, and every `@font-face` uses `font-display:swap` — two of the most common CLS sources are fully closed off sitewide.
