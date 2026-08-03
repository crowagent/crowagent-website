# JS Audit — crowagent-website → Astro migration

Scope: `js/*.js` (10 files), `js/modules/*.js` (25 files) + `js/modules/compiled/*.js`
(1 file), `js/vendor/*.js` (2 files) — 38 files, ~502 KB. Evidence gathered by
scanning `<script src>` tags across all 44 real HTML pages, reading `js/nav-inject.js`
(120,485 B — the largest file by a wide margin) and `js/modules/sf21-back-to-top.js`
for what they inject at runtime, reading `scripts/build-dist.js`'s asset-reachability
deny list (the site's own build already measured most of the dead files, independently
re-verified here by direct grep), and reading git history (`git log`, `git show`) for
two files where an actual production incident and its fix are recorded in the commit
message. Not run in a browser, no `npm install`/build/test — every claim is static
text evidence, cited by file:line.

`js/modules/compiled/sovereign-transformation-v2.js` is referred to below as
"sovereign-v2.js" for brevity.

---

## 1. The two page architectures

As in the CSS audit, pages split into two groups by which bundle they load, plus one
singular prototype page. This governs which motion systems are even present on a
given page:

- **Legacy/sovereign, 33 pages** — load `js/vendor/gsap.min.js` +
  `js/vendor/ScrollTrigger.min.js` + `js/modules/compiled/sovereign-transformation-v2.js`
  statically, plus (on 5-7 of them) `reveal-failsafe.js` and
  `section-motion-choreography.js`, plus (on 7 of them) `magnetic-pull.js`.
- **Nebula, 9 pages** (`index.html`, `sectors/*` × 5, `blog/index.html`,
  `glossary/index.html`, `tools/index.html`, `tools/ppn-002-calculator/index.html`) —
  load `js/nebula-home.js` instead. No GSAP, no ScrollTrigger, no sovereign-v2.js.
- **`homepage-claude-v1.html`** (the 44th page, prototype) — loads neither bundle.
  Static `<script>` tags are only `js/nav-inject.js` and `js/modules/magnetic-pull.js`
  (`homepage-claude-v1.html:55-56`); everything else on the page (five-plus separate
  inline `IntersectionObserver`s and a bespoke shared failsafe) is hand-written inline
  in the page itself. See §3.

`js/nav-inject.js` loads on all 44 real pages (verified directly; the only HTML file
without it is the non-page `googlef2adc6102725418d.html` verification stub).

---

## 2. Per-file inventory

### `js/` (root)

| File | Size | Loaded by | What it does |
|---|---:|---|---|
| `nav-inject.js` | 120,485 B | all 44 pages, static `<script defer>` | The sitewide bootstrap: injects/updates the nav+footer markup and 4 CSS files (§CSS-AUDIT §1), injects `sv-reveal.js`, `sf21-back-to-top.js`, and a `scriptsToInject` array of shared modules (view-transitions, analytics-init, hero-parallax, d/e-batch-runtime, sovereign-features, conditionally pricing-tabs-indicator, cookie-banner), reasserts `history.scrollRestoration='manual'` against a GSAP ScrollTrigger race, builds the brand SVG logo inline, and carries ~10 named "REMOVED 2026-07-30" comments documenting its own dead-code cleanup history (§4). |
| `cookie-banner.js` | 24,165 B | injected on every page via `nav-inject.js:1583` (`/js/cookie-banner.js?v=20260730b`); a handful of pages also declare it statically, deduped by `hasScript()` | PECR/UK-GDPR consent banner + consent API. Header comment: "consolidated" from a former split between a root shim and this impl. |
| `analytics-init.js` | 10,121 B | injected on every page via `nav-inject.js` `scriptsToInject` | PostHog EU-instance init, consent-gated. |
| `nebula-home.js` | 1,780 B | static, the 9 "nebula" pages | Scroll-progress bar + `.nb-reveal`/`.reveal` `IntersectionObserver` with a 1500ms/300ms/`visibilitychange` failsafe. A 4th independent scroll-reveal implementation (see §3). |
| `nebula-showcase.js` | 7,416 B | **0 pages** | **DEAD.** Drove the homepage tab-showcase carousel (`[data-nb-showcase]`, `[role=tab]`, `.nb-panels`); orphaned 2026-07-30 when that carousel was removed. Confirmed by `scripts/build-dist.js:239-244` and independently by direct grep (zero matches for the filename in any `.html`). |
| `nebula-livepanels.js` | 9,036 B | **0 pages** | **DEAD**, and easy to confuse with the *live* `Assets/css/nebula-livepanels.css` (same name stem, different half of a pair — CSS lives on, JS doesn't). `build-dist.js:229-230, 237`: "8 selectors match 0; the only mentions of `[data-nbl]` in index.html are inside comments." |
| `partners-form.js` | 10,476 B | static, `partners.html` only | Partners-page form submission handler with Cloudflare Turnstile wiring; externalized from an inline script for CSP compliance. |
| `tool-engine-ppn-002-calculator.js` | 11,716 B | static, `tools/ppn-002-calculator/index.html` only | PPN 002 Social Value Calculator engine: intercepts form submit, computes the floor analysis, renders a result card. Header comment records it fixed a "form just reloads, no result" bug (the engine literally didn't exist before). |
| `tool-teaser.js` | 6,346 B | static, `tools/ppn-002-calculator/index.html` (and presumably other tool teaser pages not in this repo snapshot — see below) | Shared client-side helpers for the free-tools "teaser" pattern (exposes `CAToolTeaser`/`CrowAgentTeaser`, per `build-dist.js:234`, "called by 3 other files" — not fully traced here, but `build-dist.js` explicitly kept it on evidence it's live, unlike `motion-system.js`/`ca-form-validation.js` in the same review pass). |

### `js/modules/`

| File | Size | Loaded by | What it does |
|---|---:|---|---|
| `sv-reveal.js` | 6,736 B | injected on every page via `nav-inject.js:147-152` (`/js/modules/sv-reveal.js`) | Sitewide `main > section` fade-up-on-scroll. **Central to the known incident — see §3.** |
| `reveal-failsafe.js` | 8,740 B | static, 5 pages: `contact.html`, `partners.html`, `roadmap.html`, `security.html`, `blog/ppn-002-social-value-guide.html` | A failsafe *for other systems'* reveal classes (`.stripe-reveal`, `.sf17-reveal`, `[class*="reveal"]`) plus a hero-specific rescue for GSAP-stuck `.hero-product` figures. Explicitly designed to catch GSAP ScrollTrigger going stale and IntersectionObserver misses on the same 5 pages that also load `section-motion-choreography.js`. See §3. |
| `section-motion-choreography.js` | 2,003 B | static, the same 5 pages as `reveal-failsafe.js` | GSAP+ScrollTrigger stagger: on `.reveal, [data-stagger]` sections, animates `.ca-eyebrow`/`h2`/`p`/`.btn,.sv-btn` children in via `gsap.from(...opacity:0...)`, gated `scrollTrigger:{trigger:section,start:'top 80%',once:true}`. No-ops if `gsap`/`ScrollTrigger` are undefined. |
| `hero-parallax.js` | 2,574 B | injected on every page via `nav-inject.js:1534` | Cursor-driven (not scroll-driven) drift on `.hero` glow blobs: writes `--mouse-x`/`--mouse-y` CSS custom properties on `mousemove`, read by `styles.css`. Skips on `prefers-reduced-motion` and `(hover:none)`. |
| `magnetic-pull.js` | 2,267 B | static, 7 pages: `contact.html`, `crowmark.html`, `crowmark-buyers.html`, `partners.html`, `pricing.html`, `homepage-claude-v1.html`, `index.html` | Cursor-follow "magnetic" effect on `[data-magnetic]` elements (60px radius, 4px max offset), writes inline `transform` via rAF. |
| `motion-system.js` | 7,713 B | **0 pages** | **DEAD.** Formerly loaded directly on 17 pages; `build-dist.js:222-225`: "its 6 selectors (`.ms-reveal`, `.ms-scene-step`, `[data-ms-scene]`, `.ms-parallax-soft`, `.ms-demo video`) match 0 elements on all 17, and `window.caMotion` is referenced by 0 other files." Orphaned 2026-07-30 by removing the `<script src>` tags, not by deleting the file. |
| `sticky-storytelling.js` | 4,832 B | **0 pages** | **DEAD.** GSAP ScrollTrigger pin-and-scrub for `.story-visual-wrap`/`.story-step`. Self-guards with `if (!document.querySelector(".story-shell")) return;` (`sticky-storytelling.js:18`) so it was already a safe no-op before removal; `build-dist.js:215, 221-224` confirms zero `.story-shell` targets anywhere in the repo. |
| `section-parallax.js` | 1,101 B | **0 pages** | **DEAD.** "Subtle scroll-driven parallax for decorative background elements" — `build-dist.js:212-217, 221`: zero `.parallax-orb`/`[data-parallax-speed]`/`.section-parallax-bg` targets. |
| `logo-shimmer.js` | 1,569 B | **0 pages** | **DEAD.** One-shot shimmer on the nav logo, fires on `pageshow`. `build-dist.js:1555-1556`: its selector was `.ca-logo`, but the actual nav logo markup is `.logo.logo-lockup` — the module had drifted off its own target before it was even orphaned. |
| `demo-autoplayer.js` | 2,024 B | **0 pages** | **DEAD.** "Orchestrates the Step 1-2-3 auto-playing UI demo vignette." `build-dist.js:212-217`: zero `.demo-screen`/`.demo-section`/`.ds-typed`/`.demo-pdot` targets. |
| `blog-reading-time.js` | 3,779 B | **0 pages** | **DEAD.** Normalises "X min read" badges on `.article-card` elements on the blog index. `build-dist.js:212-217`: zero `.article-card` targets — the blog index markup uses a different class today. |
| `nav-shrink.js` | 2,376 B | **0 pages** | **DEAD.** Toggled `body.is-scrolled` past an 80px scroll threshold; `build-dist.js:199-207` and `nav-inject.js:1515-1533`: verified on 5 live pages that forcing the class changes nothing (no loaded stylesheet reacts to it — the stylesheet that would have, `nav-footer-sf21.css`, is itself dead). |
| `ca-form-validation.js` | 6,815 B | **0 pages** | **DEAD.** Central form-validation library, exposes `window.CAFormValidation`. `build-dist.js:226-228`: "nothing calls anywhere. roadmap.html has 0 forms at all; partners.html's form is handled by partners-form.js [instead]." |
| `view-transitions.js` | 3,665 B | injected on every page via `nav-inject.js:1513` | Safe wrapper around `document.startViewTransition()`; fixes an `InvalidStateError`/`AbortError` thrown by a legacy raw call in `sovereign-features.js`. Must load before `sovereign-features.js` — listed first in `scriptsToInject` deliberately (comment at `nav-inject.js:1508-1512`). |
| `d-batch-runtime.js` | 6,382 B | injected on every page via `nav-inject.js:1561` | Grab-bag of small DOM fixes ("D-batch runtime polish"), e.g. postcode-form Enter-key submit. |
| `e-batch-runtime.js` | 3,766 B | injected on every page via `nav-inject.js:1562` | Sibling grab-bag ("E-batch runtime"); its own top comment records that its original breadcrumb-injection feature was itself removed 2026-05-28 for causing a duplicated breadcrumb stack. |
| `sovereign-features.js` | 31,539 B | injected on every page via `nav-inject.js:1565` (`?v=20260731a`) | The Cmd/Ctrl+K command palette (`.sv-cmdk`), largest of the injected modules. `nav-inject.js:1596` records a real bug this file's cache-buster caused (double-injection on `contact.html`/`partners.html`, two `#cmdk-search-input` elements) and its fix. |
| `pricing-tabs-indicator.js` | 6,552 B | injected only on `/pricing` via `nav-inject.js:1571` (`isPricing` path check) | Visual slide indicator for pricing plan tabs. |
| `pricing-billing-toggle.js` | 5,999 B | static, `pricing.html` | Monthly/annual billing toggle. |
| `pricing-tabs-panel.js` | 4,840 B | static, `pricing.html` | Panel-visibility half of the tab system; complements `pricing-tabs-indicator.js`. |
| `product-carousel-2026-05-26.js` | 10,480 B | static, `crowmark.html` (the only page that also loads `product-carousel-2026-05-26.css`) | Drives `[data-pcar]` product-screenshot carousels: crossfade autoplay, dot tabs, prev/next, pause on hover/focus. Also duplicated in spirit by `sovereign-v2.js`'s `setupSlabInteraction()` (a `[data-pcar]` mouse-tilt effect — different behaviour, same target attribute, see §3). |
| `roadmap-reveal.js` | 820 B | static, `roadmap.html` | Small scroll-reveal specific to roadmap milestones — a 5th distinct reveal implementation, page-scoped. |
| `share-system.js` | 2,969 B | static, all `blog/*.html` except `blog/index.html` (8 pages) | Blog article "copy link" share button (the LinkedIn/X/email buttons are plain static links, no JS needed for those). |
| `faq-search.js` | 3,691 B | static, `faq.html` | Debounced live search/filter over FAQ accordions. |
| `draft-demo.js` | 11,228 B | static, `index.html` (paired with `draft-demo-2026-07-30.css`) | Autoplay controller for the "how an answer gets drafted" homepage demo section; added 2026-07-30. |
| `sf21-back-to-top.js` | 7,838 B | injected on every page via `nav-inject.js:1755-1764` | Universal back-to-top widget; self-injects `Assets/css/back-to-top.css` (`sf21-back-to-top.js:17-20`) — the only CSS injection that happens outside `nav-inject.js` itself. |
| `page-features.js` | 16,057 B | **dynamically loaded**, not by `nav-inject.js` but by `scripts.min.js`'s own `loadOnce('/js/modules/page-features.js')` (`scripts.js:1896`, minified twin in `scripts.min.js`) — so only on the ~20 pages that load `scripts.min.js` | Bundle of 4 self-gated IIFEs extracted from the old monolithic `scripts.js`: animated product demo, tooltip dismiss, particle canvas, "how it works" tabs. Each IIFE gates on its own selector so it's safe on pages that don't have the feature. |

### `js/modules/compiled/`

| File | Size | Loaded by | What it does |
|---|---:|---|---|
| `sovereign-transformation-v2.js` | 12,722 B | static, all 33 "legacy" pages | The legacy-page motion orchestrator: kinetic typography (char-split — see §5 for why it's dead weight), hero entrance timeline (also dead weight, §5), scroll-scrubbed hero parallax on `.ca-hero .ca-container`, GSAP scroll-reveals on `.ca-card`/`.sv-block`/`.ca-method-item`/`.ca-trust-item`/`.ca-bento-item`, magnetic-button drift on `.sv-btn-premium`/`.sv-btn`, `[data-pcar]` mouse-tilt, and a global `mousemove` "mouse glow" on `.ca-card`/`.ca-bento-item`. Self-invokes on `DOMContentLoaded` (`:295-298`). **A second, independently-implemented motion system with heavy conceptual overlap with the `js/modules/*` ones above — see §3.** |

### `js/vendor/`

| File | Size | Loaded by | What it does |
|---|---:|---|---|
| `gsap.min.js` | 72,225 B | static, all 33 "legacy" pages | GSAP core, minified 3rd-party. |
| `ScrollTrigger.min.js` | 43,391 B | static, all 33 "legacy" pages | GSAP ScrollTrigger plugin, minified 3rd-party. |

---

## 3. The scroll/animation systems — what triggers each, what it touches, where they collide

The task names 7: `sv-reveal.js`, `reveal-failsafe.js`, `section-motion-choreography.js`,
`sticky-storytelling.js`, `section-parallax.js`, `hero-parallax.js`, `magnetic-pull.js`,
plus `motion-system.js` and GSAP+ScrollTrigger. Direct evidence below on each, plus
**two systems the task didn't name that are just as real**: `sovereign-v2.js`'s own
bundled scroll-reveal/parallax/magnetic code (§3, table row 9), and `nebula-home.js`
(a 4th independent reveal implementation, table row 10), and `roadmap-reveal.js` (a 5th,
page-scoped, table row 11).

| System | Trigger | Targets | Mechanism | Status |
|---|---|---|---|---|
| `sv-reveal.js` | `IntersectionObserver` + scroll/resize/raf geometric sweep + hard 4s timeout failsafe | `main > section, .ca-main-transformation > section, body > section` (opts out via `data-no-reveal`/`.no-reveal`, and skips `.hero`/`.ca-hero`/`.sec-hero`/`[data-hero-scale]`) | Adds `.sv-reveal` class (CSS `opacity:0` under `html.js-sv-reveal`), then `.sv-revealed` (`opacity:1`) | **Live, universal (injected).** Root cause of a confirmed production incident — §4. |
| `reveal-failsafe.js` | `IntersectionObserver` + scroll-throttled sweep + a `forceVisibleStuck()` pass on `main section, main article, [class*="-section"], [class*="-article"]` | `.stripe-reveal`, `.sf17-reveal`, `[class*="reveal"]`, plus a `.hero-product .hero-visual`/`.product-mockup-widget` rescue | Adds `.in-view`/`.is-revealed`, clears stuck inline `opacity`/`visibility`; last-resort branch calls `gsap.killTweensOf(el)` then writes `opacity:1 !important` | **Live, 5 pages.** Written explicitly to catch GSAP ScrollTrigger going stale and IO misses — i.e. it exists *because* the systems below it are unreliable. |
| `section-motion-choreography.js` | GSAP `ScrollTrigger` (`start:'top 80%', once:true`) | `.reveal, [data-stagger]` sections' `.ca-eyebrow`/`h2`/`p`/`.btn,.sv-btn` children | `gsap.from({opacity:0,y:20})` per child, staggered by a fixed 0.1s/0.2s/0.3s delay table | **Live, the same 5 pages as `reveal-failsafe.js`.** `gsap.from()` sets the hidden state at call time (`immediateRender:true` is GSAP's default) — if the ScrollTrigger never fires, the child is permanently at `opacity:0`. This is exactly the failure class `reveal-failsafe.js` was built to catch, and both load on the same 5 pages: **direct collision by design**, not accident — one module deliberately papers over the other's known failure mode instead of the failure mode being fixed at the source. |
| `sticky-storytelling.js` | GSAP ScrollTrigger pin+scrub | `.story-visual-wrap`/`.story-step` | N/A | **Dead** (§2). Self-guarded even before removal. |
| `section-parallax.js` | (unread trigger, dead) | `.parallax-orb`/`[data-parallax-speed]`/`.section-parallax-bg` | N/A | **Dead** (§2). |
| `hero-parallax.js` | `mousemove` on `.hero` (not scroll) | `.hero` only, writes `--mouse-x`/`--mouse-y` | rAF-throttled custom-property write, read by CSS `translate3d` on `.hero-glow::before/::after` | **Live, universal (injected).** No IO, no GSAP — pure cursor tracking. Lowest collision risk of the group because its target class (`.hero`) is explicitly excluded by `sv-reveal.js`'s own filter (`sv-reveal.js:109-110`). |
| `magnetic-pull.js` | `mousemove` on `[data-magnetic]` | Elements explicitly opted in via `[data-magnetic]` | Inline `transform` write via rAF | **Live, 7 pages.** Writes `el.style.transform` directly — if the *same* element were ever also a GSAP tween target (not observed on current markup, since `[data-magnetic]` and `.sv-btn-premium`/`.sv-btn` are different attributes/classes in the pages checked), the two would stomp each other's inline `transform`. |
| `motion-system.js` | (unread trigger, dead) | `.ms-reveal`/`.ms-scene-step`/`[data-ms-scene]`/`.ms-parallax-soft`/`.ms-demo video` | N/A, exposed `window.caMotion` | **Dead** (§2). Was loaded directly (not injected) on 17 pages before removal. |
| `sovereign-v2.js` scroll-reveal + parallax + magnetic (not named in the task, but live and overlapping) | GSAP `ScrollTrigger` (`scrollReveals()`, `start:'top 98%'`) for reveal; `ScrollTrigger` scrub for `setupHeroParallax()`; `mousemove` for `setupMagneticButtons()` and `mouseGlows()` | Reveal: `.ca-card, .sv-block, .ca-method-item, .ca-trust-item, .ca-bento-item`. Parallax: `.ca-hero .ca-container`. Magnetic: `.sv-btn-premium, .sv-btn:not(.ptab)`. Glow: `.ca-card, .ca-bento-item` (re-queried on every mousemove, uncached, unthrottled) | See §4 for the reveal half's own documented incident | **Live, all 33 legacy pages.** Its reveal target list (`.ca-card` etc.) **overlaps `reveal-failsafe.js`'s `FORCE_SEL`** (`main section, main article, [class*="-section"]...` — broad enough to catch `.ca-card`-bearing sections) on the 5 pages where both load. Its magnetic-button target (`.sv-btn-premium`,`.sv-btn`) is conceptually the same idea as `magnetic-pull.js`'s `[data-magnetic]` (independent reimplementation, not sharing code) and as `hero-parallax.js`'s cursor tracking — **three separately-written cursor-follow effects exist in this codebase.** |
| `nebula-home.js` (not named in the task, but live and independent) | `IntersectionObserver`, threshold 0.12 | `.nb-reveal, .reveal` | Adds `.in` class; failsafe at 1500ms + 300ms-after-load + on `visibilitychange` | **Live, 9 nebula pages.** Runs *alongside* `sv-reveal.js` (also injected there) — different target granularity (`.nb-reveal`/`.reveal` are typically children within a section, `sv-reveal.js` targets the section itself) keeps direct class collision unlikely, but it means every nebula page runs two independent `IntersectionObserver`s and two independent failsafe-timer sets simultaneously for what is, conceptually, the same "fade up on scroll" job. |
| `roadmap-reveal.js` (not named in the task) | unread in full, 820 B, page-scoped | roadmap milestones | Small dedicated reveal | **Live, `roadmap.html` only** — a 5th distinct hand-rolled implementation of the same idea, on a page that *also* loads `sv-reveal.js` (injected), `reveal-failsafe.js`, and `section-motion-choreography.js` (static). `roadmap.html` is the single page in the whole site running the most concurrent reveal systems: 4. |

**GSAP + ScrollTrigger vendor**: loaded on all 33 "legacy" pages (never on the 9
nebula pages or `homepage-claude-v1.html`), consumed by `sovereign-v2.js`,
`section-motion-choreography.js` (only 5 of the 34), `sticky-storytelling.js` (dead),
and referenced defensively by `nav-inject.js` (`hookScrollTrigger()`,
`nav-inject.js:37-46`) purely to keep `scrollRestoration` pinned to `'manual'` against
a GSAP-caused race — not for animation.

---

## 4. The known incident: `sv-reveal.js` on `homepage-claude-v1.html`, and why it happened despite the module's own failsafe

`js/modules/sv-reveal.js` already carries a hardened failsafe (added 2026-06-15,
"P0-001 whole-site blank-section bug", `sv-reveal.js:15-27`): a geometric scroll sweep
plus a hard 4-second `revealAll()` timeout. That hardening was **not sufficient** on
its own — proven by a second, later incident on `homepage-claude-v1.html`, recorded in
commit `c0fd0736` ("fix(home): most of the page was rendering blank, and the cause was
a sitewide reveal", 2026-08-01):

> "js/modules/sv-reveal.js is injected on every page by the navigation. It adds
> `.sv-reveal` to every `main > section` and hides it behind `html.js-sv-reveal` until
> its own observer fires. On this page it found all nine sections and revealed two.
> Measured, at 1024x1366:
>
> ```
>   no scroll, wait 8s                 0 of 9 hidden
>   SCROLL THROUGH THE WHOLE PAGE      4 of 9 hidden
>   full-page capture                  7 of 9 hidden
> ```
>
> The middle row is the one that matters: scrolling, the normal way a person reads a
> page, left four sections permanently invisible."

**Why the module's own belt-and-suspenders still failed**: the commit doesn't give a
line-level root cause for the observer miss itself (no stack trace, no reproduction
script in the repo), only the measured before/after. Reading the module's logic
(`sv-reveal.js:73-96`), the `IntersectionObserver`'s `threshold:0.01` and 120px
`rootMargin` mean a section has to cross a fairly generous trigger band; on a page
with 9 large, varied-height sections (`homepage-claude-v1.html` sections range from a
hero to a multi-row bento grid, each hundreds to thousands of pixels tall — see
`homepage-claude-v1.html:1245,1736,2395,3111,3774,4015,4865,5556`), fast or
non-linear scroll (trackpad flings, `scroll-behavior:smooth` anchor jumps) can carry a
section's bounding box past the observer's trigger band between two animation frames,
and the geometric `sweep()` only runs on `scroll`/`resize` events + four fixed
`setTimeout`s (200/600/1200/2500ms) — none of which reliably fire *during* a fast,
continuous scroll gesture on every browser. The 4-second hard failsafe in the current
file (`sv-reveal.js:141-146`) should have caught it eventually regardless, but the
commit measured the state **immediately after the scroll**, and the fix that was
actually applied did not wait for or rely on that failsafe.

**The fix applied** (visible in the current file): all 8 `<section>` elements on
`homepage-claude-v1.html` now carry `data-no-reveal`
(`homepage-claude-v1.html:1245,1736,2395,3111,3774,4015,4865,5556` — 8 sections
currently, not the 9 the commit measured against; the section count evidently changed
between the incident and now, not investigated further). `sv-reveal.js`'s own filter
(`sv-reveal.js:104-113`) skips any element with `data-no-reveal` **before** adding the
`.sv-reveal` class at all, so the CSS `opacity:0` rule (which only applies via
`html.js-sv-reveal .sv-reveal`, confirmed in `Assets/css/nav-global-fix-2026-05-27.css`
at the position matched by grep offset 27592-27780 in that minified file) never
applies to these sections — a complete, structural opt-out, not a specificity fight.

**The second layer the same commit found**: each section on this page has its *own*
bespoke reveal (there are at least 8 separate inline `IntersectionObserver`
instantiations in `homepage-claude-v1.html` — lines 1911, 2606, 3303, 3964, 3997,
5498, 5620, 5684, 5859 — driving different component groups: stat cells, the
both-sides split, the device rail, etc.), and *each of those* gates on an
`IntersectionObserver` too, which is "right for a reader who scrolls and wrong for
everything else: a full-page capture, an anchor jump, a restored scroll position, or a
printed page never fires it." (`homepage-claude-v1.html:5639-5642`.) The fix for that
layer is a single shared, page-level failsafe (`homepage-claude-v1.html:5653-5669`):

```js
(function revealFailsafe() {
  'use strict';
  var GROUPS = [
    ['.sb-cell', 'is-in'],
    ['.sb-gridwrap', 'is-in'],
    ['.bs-row', 'is-in'],
    ['.sb-field', 'is-live'],
    ['.dv-stage', 'is-live']
  ];
  function force() {
    GROUPS.forEach(function (g) {
      document.querySelectorAll(g[0]).forEach(function (el) { el.classList.add(g[1]); });
    });
  }
  window.addEventListener('load', function () { setTimeout(force, 3000); });
  setTimeout(force, 7000);
})();
```

Deliberately **not** included in that force-list: the two rails' `.is-near` dimming
and the reasoning engine's pending steps, "at reduced opacity BY DESIGN" — forcing
those would destroy the thing they communicate. This is the one piece of nuance an
Astro reveal system must preserve: a guaranteed-visible failsafe cannot be a single
global "reveal everything" call; it has to be scoped to elements whose hidden state is
genuinely a loading/animation artifact, not to elements whose reduced-opacity state
*is* the content (e.g. "pending" indicators, disabled states, `.is-near` proximity
dimming on a carousel rail).

**This was not a one-off.** A structurally identical incident is separately
documented, older, and on completely different pages: `sovereign-v2.js`'s
`scrollReveals()` (`js/modules/compiled/sovereign-transformation-v2.js:190-218`) has
its own inline post-mortem, dated 2026-07-29:

> "Reproduced live before changing anything: 20 of 20 cards stuck at opacity:0 on
> crowmark.html, the flagship product page, plus 13 of 13 on about.html and 9 of 9 on
> contact.html... THE BUG. `gsap.from()` has `immediateRender:true` by default, so
> every matched element was set to `opacity:0` the moment the tween was created,
> before any scrolling. Revealing them then depended entirely on the ScrollTrigger
> firing."

Same root pattern (a system that hides content up front and depends entirely on a
scroll-triggered observer/ScrollTrigger to reveal it, with no non-scroll-path
guarantee), same three-part fix (respect `prefers-reduced-motion`, stop hiding by
default — switch `gsap.from()` to `gsap.set()`+`gsap.to()` with `once:true` and no
reverse action — and add a failsafe sweep), independently discovered and independently
fixed 3 days before the homepage incident, in a different file, by a different code
path. **Two unrelated implementations of "fade up on scroll" independently produced
the exact same class of permanently-invisible-content bug**, which is the strongest
evidence in this repo that the bug is inherent to the pattern (hide first, reveal on
observer) and not to either specific implementation.

### What this means for the Astro motion system

1. **Never hide content by default and rely solely on a scroll-triggered
   observer/ScrollTrigger to reveal it.** Both confirmed incidents follow exactly this
   shape. If a "hidden until revealed" state is used at all, it must ship with an
   unconditional, time-based (not scroll-based) guarantee that fires regardless of
   whether the user ever scrolls, resizes, or the observer ever intersects — covering
   full-page screenshots, anchor jumps, restored scroll positions, printed pages, and
   background/hidden-tab throttling (`nebula-home.js`'s `visibilitychange` listener,
   `nebula-home.js:39`, is the one existing implementation that explicitly covers the
   backgrounded-tab case; none of the others do).
2. **A single opt-out attribute (`data-no-reveal`) is a legitimate, cheap fix at the
   page/section level**, and is exactly what shipped for the homepage. Astro's
   primitive should support the same per-instance opt-out, not just a global on/off.
3. **A "reveal everything" failsafe must be scoped, not global**, per the
   `homepage-claude-v1.html` `GROUPS` array excluding `.is-near`/pending-state
   elements. The Astro primitive needs a way to mark an element as "intentionally
   reduced opacity, do not force" distinct from "hidden pending reveal."
4. **Do not run multiple independent reveal implementations on the same page.**
   `roadmap.html` currently runs 4 (injected `sv-reveal.js`, static
   `reveal-failsafe.js`, static `section-motion-choreography.js`, static
   `roadmap-reveal.js`); the 9 nebula pages run 2 (`sv-reveal.js` + `nebula-home.js`).
   None of these are coordinated with each other — each has its own observer, its own
   timing constants, its own failsafe schedule. One primitive, one observer, one
   failsafe schedule, applied consistently, removes the entire class of bug rather
   than papering over it with a second failsafe module (which is what
   `reveal-failsafe.js` currently is: a failsafe for other code's failures, not a
   failsafe for its own).

---

## 5. Recommended consolidation: 6 motion primitives

| # | Primitive | Replaces | Notes |
|---|---|---|---|
| 1 | **Reveal-on-scroll** (fade/translate-in when an element nears the viewport) | `sv-reveal.js`, `nebula-home.js`, `reveal-failsafe.js`, `section-motion-choreography.js`, `roadmap-reveal.js`, `sovereign-v2.js`'s `scrollReveals()` — 6 of the current ~11 live/dead systems collapse into this one | **Needs a guaranteed-visible fallback**, non-negotiable per §4: a global, unconditional timer (not scroll/resize-driven) that force-reveals anything still hidden after a fixed delay, scoped so "intentionally dim" states (pending/proximity) are excluded via an explicit opt-out class or attribute, and content must never be `opacity:0` in the *absence* of JS (CSS must default to visible, matching `no-js-content-fallback.css`'s current role, and matching `homepage-claude-v1.html:331`'s comment "VISIBLE BY DEFAULT... used to be opacity:0 until an IntersectionObserver added .active"). |
| 2 | **Cursor-follow drift** (small, bounded translate toward the pointer) | `magnetic-pull.js` (`[data-magnetic]`), `sovereign-v2.js`'s `setupMagneticButtons()` (`.sv-btn-premium`/`.sv-btn`), `hero-parallax.js` (`.hero`, writes CSS vars instead of transform — same underlying idea, different implementation) | No fallback needed — a hover/pointer enhancement with zero content impact if it never runs; already correctly gated behind `(hover:none)`/`prefers-reduced-motion` in the files that check it (`hero-parallax.js` and `magnetic-pull.js` both do; `sovereign-v2.js`'s version checks `isTouch` but not `prefers-reduced-motion` — a real gap to fix in the consolidation, not carry forward). |
| 3 | **Scroll-scrubbed parallax** (transform/opacity tied continuously to scroll position, not a one-shot trigger) | `sovereign-v2.js`'s `setupHeroParallax()` (`.ca-hero .ca-container`, GSAP scrub), `section-parallax.js` (dead) | **Needs a guaranteed-visible fallback** only in the sense that the *end state* (scale 0.99, opacity 0.9, y 60) must never be the resting state if the trigger element is off-screen or the library fails to load — since it moves opacity as well as position, a broken load path could strand a hero at 0.9 opacity. Low risk currently (only ever nudges opacity to 0.9, not 0) but worth hardening in the primitive rather than trusting each future call site to remember. |
| 4 | **Autoplay/step carousel** (crossfade or step-advance with dot/tab controls, pause on hover/focus) | `product-carousel-2026-05-26.js`, `draft-demo.js`, `demo-autoplayer.js` (dead), `nebula-showcase.js` (dead) | No fallback needed for visibility (content is visible by default, autoplay is additive), but reduced-motion must disable the *auto*-advance while keeping manual tab/dot controls usable — verify this is true of `product-carousel-2026-05-26.js` and `draft-demo.js` (both self-describe as reduced-motion-safe) and make it a primitive-level guarantee rather than a per-file convention. |
| 5 | **Kinetic entrance / hero timeline** (one-shot staged entrance on page load, not scroll-gated) | `sovereign-v2.js`'s `heroEntrance()` and `setupKineticTypography()` — **currently entirely dead code, see §6** — this primitive is a rebuild-from-intent, not a port of working code | **Needs a guaranteed-visible fallback**: because this is a `DOMContentLoaded`-time animation with no scroll gate, the main risk is a JS load failure (blocked script, error earlier in the page) leaving the hero elements at whatever GSAP would have set as the "from" state. If rebuilt, default the CSS to the "to" state and have JS *subtract* the entrance, not add it — same principle as primitive #1. |
| 6 | **Sticky/pinned scroll-scrub sequence** (pin an element, scrub through steps as the user scrolls past) | `sticky-storytelling.js` (dead) | Currently has zero live usage anywhere in the repo (`.story-shell` matches nothing). Keep as a primitive only if there's a concrete near-term use case; otherwise this is the one system that can be dropped from the consolidation target entirely rather than rebuilt, since nothing today exercises it. |

`view-transitions.js`'s safe-wrapper pattern (guard `document.startViewTransition`
behind a feature check, §2) is worth keeping as infrastructure underneath all 6
primitives rather than as a primitive itself.

---

## 6. Dead JS: files, and functions within live files

### Dead files (0 live references; each independently confirmed both by direct grep
against the current tree and by `scripts/build-dist.js`'s own reachability-prune deny
list, `scripts/build-dist.js:208-244`)

| File | Size | Why dead |
|---|---:|---|
| `js/modules/nav-shrink.js` | 2,376 B | Toggled a class no loaded stylesheet reacts to |
| `js/modules/sticky-storytelling.js` | 4,832 B | Zero `.story-shell` targets anywhere |
| `js/modules/logo-shimmer.js` | 1,569 B | Targets `.ca-logo`, actual markup is `.logo.logo-lockup` |
| `js/modules/section-parallax.js` | 1,101 B | Zero `.parallax-orb`/`[data-parallax-speed]` targets |
| `js/modules/demo-autoplayer.js` | 2,024 B | Zero `.demo-screen`/`.demo-section` targets |
| `js/modules/blog-reading-time.js` | 3,779 B | Zero `.article-card` targets |
| `js/modules/motion-system.js` | 7,713 B | Zero `.ms-*` targets on all 17 pages that used to load it; `window.caMotion` unreferenced |
| `js/modules/ca-form-validation.js` | 6,815 B | `window.CAFormValidation` never called |
| `js/nebula-livepanels.js` | 9,036 B | Zero `[data-nbl]` targets outside comments |
| `js/nebula-showcase.js` | 7,416 B | Drove a carousel removed 2026-07-30 |

Combined: 46,661 B (~45.6 KB) of dead JS across 10 files.

### Dead functions inside live files

Both found in `js/modules/compiled/sovereign-transformation-v2.js`, which loads on
all 33 legacy pages and is therefore parsed and executed on every one of them, dead
code included:

1. **`heroEntrance()`** (`sovereign-transformation-v2.js:136-171`) — a full GSAP
   timeline (eyebrow fade-in, kinetic char-split title reveal, description/button
   stagger, product-showcase reveal) is defined but **never called**. `init()`
   (`:17-48`) calls `setupKineticTypography`, `setupMagneticButtons`, `scrollReveals`,
   conditionally `mouseGlows`/`setupSlabInteraction`, and `setupHeroParallax` — not
   `heroEntrance`. No event listener elsewhere in the file references it either.
2. **`splitElement()`** (`:83-131`) — a 49-line recursive DOM-splitting function
   (breaks heading text into `.word`/`.char` spans for the kinetic-typography effect)
   is defined and *is* wired into `setupKineticTypography()`'s `headings.forEach(h =>
   splitElement(h))` (`:133`) — but `headings` is declared as `const headings = [];`
   at `:81` and **is never populated** before that `forEach`. The loop always runs
   over an empty array, so `splitElement()` is reachable but never actually invoked
   with a real argument on any page. `setupKineticTypography()` itself *is* called
   from `init()`, so this isn't a "function never called" case like `heroEntrance()` —
   it's a "function called every time, does nothing every time" case, which is worse
   to find by reading call sites alone (it looks live) and only shows up by reading
   the body.

Both are inside the same 299-line file, both silently no-op (no console error, no
visible symptom — this is exactly the kind of failure the file's own `scrollReveals()`
incident writeup at `:191-218` warns about: "Nothing threw. There was no console error
to find."). Not carried forward into any of the 6 recommended primitives above; if
kinetic typography or a staged hero entrance is wanted in Astro, it should be rebuilt
against real markup rather than ported, since neither has executed against real
content at any point this audit could find evidence of.

`js/tool-teaser.js` is the one file this audit did **not** find independent dead-code
evidence for, and `build-dist.js:232-234` explicitly kept it on the stated basis that
`CAToolTeaser`/`CrowAgentTeaser` "is called by 3 other files" — that claim wasn't
independently re-traced here (out of scope: the referenced files may be per-tool
engine scripts like `tool-engine-ppn-002-calculator.js`, of which this repo snapshot
only contains one of what the filename pattern suggests were several).

---

## 7. Files list (all 38, for reference)

```
js/analytics-init.js                              10,121 B   live, injected (universal)
js/cookie-banner.js                                24,165 B   live, injected (universal)
js/nav-inject.js                                  120,485 B   live, static (universal)
js/nebula-home.js                                   1,780 B   live, static (9 nebula pages)
js/nebula-livepanels.js                             9,036 B   DEAD
js/nebula-showcase.js                               7,416 B   DEAD
js/partners-form.js                                10,476 B   live, static (partners.html)
js/tool-engine-ppn-002-calculator.js               11,716 B   live, static (1 tool page)
js/tool-teaser.js                                   6,346 B   live, static (tool pages)
js/modules/blog-reading-time.js                     3,779 B   DEAD
js/modules/ca-form-validation.js                    6,815 B   DEAD
js/modules/compiled/sovereign-transformation-v2.js 12,722 B   live, static (33 legacy pages) — 2 dead functions inside, §6
js/modules/d-batch-runtime.js                       6,382 B   live, injected (universal)
js/modules/demo-autoplayer.js                       2,024 B   DEAD
js/modules/draft-demo.js                           11,228 B   live, static (index.html)
js/modules/e-batch-runtime.js                       3,766 B   live, injected (universal)
js/modules/faq-search.js                            3,691 B   live, static (faq.html)
js/modules/hero-parallax.js                         2,574 B   live, injected (universal)
js/modules/logo-shimmer.js                          1,569 B   DEAD
js/modules/magnetic-pull.js                         2,267 B   live, static (7 pages)
js/modules/motion-system.js                         7,713 B   DEAD
js/modules/nav-shrink.js                            2,376 B   DEAD
js/modules/page-features.js                        16,057 B   live, dynamically loaded (~20 pages)
js/modules/pricing-billing-toggle.js                5,999 B   live, static (pricing.html)
js/modules/pricing-tabs-indicator.js                6,552 B   live, injected (pricing.html only)
js/modules/pricing-tabs-panel.js                    4,840 B   live, static (pricing.html)
js/modules/product-carousel-2026-05-26.js          10,480 B   live, static (crowmark.html)
js/modules/reveal-failsafe.js                       8,740 B   live, static (5 pages)
js/modules/roadmap-reveal.js                          820 B   live, static (roadmap.html)
js/modules/section-motion-choreography.js           2,003 B   live, static (5 pages)
js/modules/section-parallax.js                      1,101 B   DEAD
js/modules/sf21-back-to-top.js                      7,838 B   live, injected (universal)
js/modules/share-system.js                          2,969 B   live, static (8 blog pages)
js/modules/sticky-storytelling.js                   4,832 B   DEAD
js/modules/sv-reveal.js                             6,736 B   live, injected (universal)
js/modules/view-transitions.js                      3,665 B   live, injected (universal)
js/vendor/gsap.min.js                              72,225 B   live, static (33 legacy pages)
js/vendor/ScrollTrigger.min.js                     43,391 B   live, static (33 legacy pages)
```

Total: ~502 KB across 38 files. Dead: 10 files, ~45.6 KB (~9% by size, ~26% by file
count) — a smaller proportion than the CSS side (~16% by size), but the JS dead files
are more numerous relative to the total and, per §6, at least one live file
(`sovereign-transformation-v2.js`) additionally executes ~10 KB of no-op code on every
one of 33 pages, which raw file-liveness counts miss entirely.
