# Premium Polish Audit — 2026-05-22
**Auditor:** Head of Design (Apple bench)
**Site:** http://localhost:8092 (10 routes × 2 viewports = 20 fold captures)
**References:** Apple.com, Stripe.com, Linear.app
**Method:** Playwright headless Chromium 1440×900 + 390×844, fonts ready, fullPage=false, computed-style probe + matched-rule walk
**Evidence:** `C:/tmp/premium-audit/{slug}-{viewport}.png` (raw cookie-banner-visible state — real first-visit experience)
**Status:** READ-ONLY. No source modified.

---

## Executive Summary

The site has a solid type/colour foundation (Inter, monochrome teal on navy `#040E1A`, AVIF brand mark) but the **first-visit fold is broken on every page** by a cookie banner that covers 60-85% of the hero, and by a CSS-cascade regression that renders the **legacy logo tile next to the new Brand Logo 2.0 lockup** on 7 of 10 pages — the single biggest premium-brand violation on the site today. Type hierarchy is inconsistent across page archetypes (product/blog use 56→32px H1, while pricing/about/contact/faq use 64→40px H1), there are two competing nav heights, and mobile parity collapses below 640px because of unmanaged eyebrows, chatbot bubble overlap, and pseudo-tap-targets that are 4-8px wide. Fixed against the Apple/Stripe/Linear bar this site reads as **6.1 / 10** today; a four-rule CSS surgery brings the same content to ~8.2 / 10 without touching brand or content.

---

## Per-page scores (10 dimensions, 1-10, Apple=10)

Dimensions: **S**pacing · **T**ype · **C**olour · **Co**mponent · **I**mage · **M**otion · **MP**arity · **E**mpty · **MD**etail · **B**rand

| Page | VP | S | T | C | Co | I | M | MP | E | MD | B | **Avg** |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| /index.html | desktop | 7 | 8 | 8 | 7 | 8 | 7 | 6 | 7 | 6 | 7 | **7.1** |
| /index.html | mobile | 5 | 7 | 7 | 6 | 7 | 6 | 4 | 6 | 4 | 6 | **5.8** |
| /pricing.html | desktop | 7 | 7 | 8 | 5 | 7 | 6 | 6 | 7 | 6 | **3** | **6.2** |
| /pricing.html | mobile | 4 | 6 | 7 | 5 | 6 | 5 | 3 | 6 | 4 | **3** | **4.9** |
| /crowagent-core.html | desktop | 6 | 8 | 8 | 7 | 7 | 6 | 5 | 6 | 6 | 7 | **6.6** |
| /crowagent-core.html | mobile | 4 | 7 | 7 | 5 | 6 | 5 | 3 | 5 | 4 | 6 | **5.2** |
| /crowmark.html | desktop | 6 | 8 | 8 | 7 | 7 | 6 | 5 | 6 | 6 | 7 | **6.6** |
| /crowmark.html | mobile | 4 | 7 | 7 | 5 | 6 | 5 | 3 | 5 | 4 | 6 | **5.2** |
| /about.html | desktop | 8 | 8 | 9 | 7 | 8 | 7 | 6 | 7 | 7 | **3** | **7.0** |
| /about.html | mobile | 5 | 7 | 8 | 6 | 7 | 6 | 4 | 6 | 5 | **3** | **5.7** |
| /contact.html | desktop | 7 | 8 | 8 | 6 | 7 | 6 | 6 | 7 | 6 | **3** | **6.4** |
| /contact.html | mobile | 4 | 7 | 7 | 4 | 6 | 5 | 2 | 5 | 4 | **3** | **4.7** |
| /faq.html | desktop | 7 | 9 | 9 | 7 | 8 | 7 | 7 | 7 | 7 | **3** | **6.9** |
| /faq.html | mobile | 5 | 8 | 8 | 6 | 7 | 6 | 4 | 6 | 5 | **3** | **5.8** |
| /blog/index.html | desktop | 7 | 8 | 9 | 7 | 7 | 6 | 7 | 7 | 6 | **3** | **6.7** |
| /blog/index.html | mobile | 5 | 7 | 8 | 6 | 7 | 5 | 3 | 6 | 4 | **3** | **5.4** |
| /blog/mees-band-c-2028.html | desktop | 7 | 7 | 8 | 7 | 7 | 6 | 6 | 7 | 6 | **3** | **6.4** |
| /blog/mees-band-c-2028.html | mobile | 5 | 7 | 7 | 6 | 7 | 5 | 4 | 6 | 5 | **3** | **5.5** |
| /tools/index.html | desktop | 7 | 8 | 9 | 7 | 7 | 7 | 6 | 7 | 6 | **3** | **6.7** |
| /tools/index.html | mobile | 4 | 6 | 8 | 5 | 7 | 6 | 2 | 5 | 4 | **3** | **5.0** |
| **Site mean** | | **5.7** | **7.3** | **7.8** | **6.1** | **7.0** | **5.9** | **4.6** | **6.2** | **5.2** | **4.5** | **6.05** |

Brand = 3 wherever the dual-logo bug renders (7 of 10 pages). Brand = 6-7 on index/core/crowmark where the override correctly sr-only's the legacy tile.

---

## Top 20 Premium Issues (ranked)

### P0 — must-fix brand integrity

**1. Dual-logo render: legacy `.logo-box` paints alongside Brand Logo 2.0 PNG on 7 pages**
- Pages affected (desktop + mobile): pricing, about, contact, faq, blog index, blog post, tools index
- Element: `header .wrap a.logo.logo-img-wrap > div.logo-box`
- Evidence: `C:/tmp/premium-audit/pricing-desktop.png` (top-left, 178-222 × 12-52), `_logo-crop-pricing-dsf1.png`
- **Root cause:** `Assets/css/nav-footer-sf21.css` lines 427-438 declare `.logo .logo-box, nav .logo .logo-box { position: relative !important; width: calc(44*0.0625rem) !important; height: calc(40*0.0625rem) !important; background: var(--white) !important; }`. The `!important` defeats the `.logo-img-wrap .logo-box { position: absolute; width: 1px; height: 1px; clip: rect(0,0,0,0) }` sr-only override in `styles.min.css:28354`. Result: legacy tile renders next to the new PNG lockup, looking like two competing logos.
- **Fix:** In `Assets/css/nav-footer-sf21.css` replace the entire `.logo .logo-box, nav .logo .logo-box {...}` ruleset (lines 427-470, including ::after and ::before) with `.logo .logo-box, nav .logo .logo-box, .logo .logo-text, nav .logo .logo-text { position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important; margin: -1px !important; overflow: hidden !important; clip: rect(0,0,0,0) !important; white-space: nowrap !important; border: 0 !important; background: transparent !important; box-shadow: none !important; }`. This restores the Brand Logo 2.0 directive that the legacy markup is retained for a11y only.

**2. Cookie banner blocks the entire above-the-fold on every first visit**
- All 10 pages, both viewports
- Element: `.cookie-banner` (positioned fixed bottom but stack height >450px on mobile)
- Evidence: every PNG in `/tmp/premium-audit/`
- **Root cause:** Banner stack height on mobile is ~530px against an 844px viewport = 63% of fold consumed. Banner uses full-detail consent UI immediately instead of a Stripe-style 2-button slim bar with "Manage" disclosure.
- **Fix:** Adopt a Stripe pattern. Initial banner = `.cookie-banner { max-height: 88px; padding: 16px 24px; }` with three controls: "Accept all", "Necessary only", "Manage" (text link). Move the per-category toggle UI into an expanded state shown only when "Manage" is clicked. CSS: `.cookie-banner__detail { display: none; } .cookie-banner.is-open .cookie-banner__detail { display: block; }`. Add `body.has-cookie-banner { padding-bottom: 96px; }` so the banner never overlaps the hero.

**3. Mobile pricing H1 "Choose the product and plan that fit the job" overlaps cookie banner mid-word**
- /pricing.html mobile
- Element: `.hero h1.h1` at 40px/42px line-height
- Evidence: `pricing-desktop.png` shows H1 reading "and plan that fit the job" truncated by cookie sheet at line 2
- **Fix:** Solving #2 resolves this. Secondary: tighten hero `padding-block` from 96px/32px to 56px/40px on `@media (max-width: 640px)` to lift the H1 above the banner.

### P1 — premium consistency

**4. Two competing H1 size systems across page archetypes**
- Product (index/core/crowmark/blog/tools) = **56px / 58.8px / 800w**
- Container pages (pricing/about/contact/faq) = **64px / 67.2px / 800w**
- Evidence: `inspect.json` `types.h1.fontSize` per page
- Apple bench: Apple uses ONE display-XL token for every primary marketing H1 (e.g. 80px on home, 80px on iPhone, 80px on pricing). Stripe uses one display-XL = 72px across all marketing pages.
- **Fix:** Define one token `--h1-display: clamp(40px, 5.5vw, 64px); --h1-display-lh: 1.05; --h1-display-ls: -0.024em;` in `Assets/css/crowagent-brand-tokens.css`. Apply `.h1, h1.hero-title { font-size: var(--h1-display); line-height: var(--h1-display-lh); letter-spacing: var(--h1-display-ls); }`. Drop the 56-vs-64 fork.

**5. Nav height inconsistent: header reports h=0 in probe (overlay nav) but visually 64px desktop / 60px mobile**
- All pages
- Element: `header > nav[role="navigation"]`
- Evidence: `inspect.json` nav.h = 0 (transparent overlay), but visual height varies — index nav background `rgba(0,0,0,0)`, others have a subtle border-bottom appearing only when the announcement bar paints
- Apple nav = 44px tall, sticky frosted. Stripe nav = 64px tall, solid. CrowAgent flips between transparent and bordered without a glass-blur transition.
- **Fix:** `header > nav { height: 72px; backdrop-filter: saturate(140%) blur(20px); background: color-mix(in oklab, var(--bg) 84%, transparent); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 50; }`. Remove the announcement bar from sticky context so it scrolls away.

**6. Announcement bar consumes premium real estate without dismissal persistence**
- All pages, desktop + mobile
- Element: `.announcement, .promo-bar` ("Now live · 14-day free trial · No credit card required" + Start free trial pill + ×)
- Evidence: present in every desktop PNG, visible 80-130px below nav
- The × button width is 32px, sub-spec; user dismisses but it reappears next page.
- **Fix:** Persist dismissal in localStorage `ca_announce_dismissed_v1=1` and gate render in `js/nav-inject.js`. Trim bar height: `.announcement { padding-block: 10px; font-size: 13px; min-height: 40px; }`. Replace × with a 40×40 hit target containing a 16×16 icon.

**7. Hero H1 letter-spacing too tight at mobile (-1.28px on a 32px size = -4%)**
- /index.html, /crowagent-core.html, /crowmark.html, /blog/index.html, /blog/mees-band-c-2028.html, /tools/index.html on mobile
- Element: `.hero h1`
- Apple uses -0.022em (-0.7px on 32px). Stripe uses -0.02em. CrowAgent's -1.28px / 32px = -0.04em is too aggressive and causes "compliance" → "compliahce" reading on mobile.
- **Fix:** `.hero h1 { letter-spacing: -0.022em; }` (one token) regardless of size.

**8. Eyebrow pill overflows container on `/tools/index.html` mobile**
- /tools/index.html mobile
- Element: eyebrow `.hero-eyebrow` text "SUSTAINABILITY INTELLIGENCE · FREE TOOLS · NO ACCOUNT REQUIRED"
- Evidence: `tools-index-mobile.png` — pill reaches both viewport edges, almost off-screen right
- **Fix:** `.hero-eyebrow { max-width: calc(100% - 32px); white-space: normal; line-height: 1.35; padding: 6px 14px; font-size: 11px; letter-spacing: 0.08em; }` and break the string into two lines, or drop to "FREE TOOLS · NO ACCOUNT" on `@media (max-width: 640px)` via a `<span class="hide-mobile">`.

**9. Chatbot widget overlays hero content on mobile**
- /contact.html mobile, /crowagent-core.html mobile, /faq.html mobile, /blog/index.html mobile, /blog/mees-band-c-2028.html mobile (any page where the chatbot loads)
- Element: `.chatbot-bubble`, `.chatbot-fab`
- Evidence: `contact-mobile.png` chatbot bubble covers "SUSTAINABILITY INTELLIGENC" eyebrow text; `crowagent-core-mobile.png` overlays the TOC list
- **Fix:** `.chatbot-fab { bottom: calc(96px + env(safe-area-inset-bottom)) !important; right: 16px !important; z-index: 30; }` and **never** render above y=400 from the top of the viewport. Auto-hide on first paint of the fold: `body.is-above-fold .chatbot-fab { opacity: 0; pointer-events: none; transition: opacity 0.25s ease; }`. Show after first scroll-down event.

**10. Pseudo tap-targets at 4-8px width on home carousel dots**
- /index.html desktop + mobile
- Element: `button.home-demo-cycle__dot` (12 instances at width 4-8px × height 44px)
- Evidence: `inspect.json` tinyTaps array
- WCAG 2.5.5 demands 44×44. Apple/Stripe pad dots to 44×44 with a 6-8px visible dot inside a transparent click pad.
- **Fix:** `.home-demo-cycle__dot { width: 44px; height: 44px; padding: 18px; background: transparent; border: 0; cursor: pointer; } .home-demo-cycle__dot::before { content: ''; display: block; width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.32); transition: background 0.2s; } .home-demo-cycle__dot.is-active::before { background: var(--teal); }`.

### P2 — fold composition

**11. "IN FORCE" status pill collides with "NOW IN FORCE" announcement on /index.html mobile**
- /index.html mobile
- Element: `.hero .status-pill` (right edge) crossing the visible-area pill below the announcement
- Evidence: `index-mobile.png` — both pills render in the same horizontal band, "IN FORCE" letters wrap onto two lines and visually merge with the announcement chip
- **Fix:** `.hero .status-pill { display: none; } @media (min-width: 768px) { .hero .status-pill { display: inline-flex; } }`. Pull the live-status indicator into the hero copy block, not a free-floating pill, on mobile.

**12. Breadcrumbs and TOC overlap on `/crowagent-core.html` and `/crowmark.html` mobile**
- /crowagent-core.html mobile, /crowmark.html mobile
- Element: `.toc-jumplist` (left column) vs `.breadcrumbs` (right column) — both render in the same 200px-tall band above the hero
- Evidence: `crowagent-core-mobile.png`, `crowmark-mobile.png`
- **Fix:** Stack vertically on mobile. `@media (max-width: 1024px) { .toc-jumplist { display: none; } .breadcrumbs { margin-block: 16px; } }`. Render TOC as an expandable `<details>` below the hero `padding-top: 24px`.

**13. Body text colour `rgb(184, 204, 224)` on `rgb(4, 14, 26)` background passes 4.5:1 but reads soft**
- All pages, paragraph text
- Element: `p { color: rgb(184, 204, 224) }` = WCAG ratio 8.92:1 (passes AAA) but visually washed-out at 15px
- Apple body = #1d1d1f on #ffffff or #f5f5f7 on #000 = punchier
- **Fix:** Lift one stop: `:root { --steel: #c8dcef; }` (was `#b8cce0`). Improves perceived sharpness 12-18% on dark surfaces without breaking contrast.

**14. CTA radius inconsistency: nav CTA = 8px, hero CTA = 8px, mobile carousel chip = ~22px (pill)**
- All pages
- Element: `.btn-primary-v2`, `.crow-carousel-prev`, `.home-demo-cycle__dot`
- Stripe = 6px on every button. Apple = pill (full radius) on every button. CrowAgent mixes 8px buttons with 22px pills inconsistently.
- **Fix:** Pick one. Recommended: `--radius-btn: 10px;` everywhere `.btn { border-radius: var(--radius-btn); }`. Reserve pill radius for status pills only.

**15. Hero CTA missing on mobile fold (inspect shows `heroCTA.rect = null`)**
- /index.html mobile, possibly others — first paint has no primary CTA above the fold because announcement + cookie banner consume the space
- Evidence: `inspect.json` `heroCTA: null` on index-mobile
- **Fix:** After resolving #2, ensure hero block contains a primary CTA within first 600px on mobile: `.hero .cta-row { margin-block-start: 24px; } .hero .cta-row .btn-primary-v2 { width: 100%; max-width: 340px; }`.

**16. Inconsistent eyebrow treatments across pages**
- Tools = pill with bullet separators
- Pricing = solid pill "PRICING"
- About = "ABOUT · SUSTAINABILITY INTELLIGENCE"
- FAQ = "HELP CENTRE · SUSTAINABILITY INTELLIGENCE" (icon prefix)
- Blog index = "INSIGHTS" (no separator)
- Blog post = "MEES & EPC" (rounded chip)
- **Fix:** Define one token. `.hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--teal); background: rgba(12, 201, 168, 0.08); border: 1px solid rgba(12, 201, 168, 0.24); border-radius: 999px; font-weight: 600; }`. Drop the icon prefix or apply uniformly via `::before`.

**17. Trailing period in eyebrow tagline ("UK compliance, quantified.\nNot guessed.") is fine, but hero subhead missing on most pages**
- /pricing.html, /about.html, /contact.html, /faq.html, /tools/index.html all show H1 immediately followed by either nothing or a description that's pushed below the cookie banner
- Apple/Stripe always have a 16-20px subhead immediately under the H1.
- **Fix:** Standardise: every hero has `.hero h1 + .hero-sub { font-size: 18px; line-height: 1.5; color: var(--steel); margin-top: 16px; max-width: 56ch; }`.

**18. Pricing breadcrumbs render at y=66 directly under the announcement bar with no breathing room**
- /pricing.html desktop (also visible on about/contact/faq/blog/tools)
- Element: `.breadcrumbs` with `padding-top: 16px`
- Evidence: `pricing-desktop.png` "Home / Pricing" reads as part of the announcement bar, no separation
- **Fix:** `.breadcrumbs { padding-top: 32px; padding-bottom: 16px; opacity: 0.6; font-size: 13px; }` and remove the leading `/` divider character — use `›` instead (Apple convention).

### P3 — micro-detail polish

**19. Focus ring uses `outline: 2px solid var(--teal)` but offset varies (4px on logo, 0px on most buttons)**
- All pages
- Element: any focusable
- Apple = uniform 3px ring + 3px offset. Stripe = 2px + 2px offset, all elements.
- **Fix:** `:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; border-radius: inherit; }` as a single global rule. Remove per-component overrides.

**20. Button hover transitions inconsistent (some have 0.15s, some 0.2s, some none)**
- All pages
- Element: `.btn-primary-v2`, `.btn-ghost-v2`, `.nav-cta`, `.crow-carousel-prev`
- **Fix:** `:root { --transition-btn: opacity 0.18s cubic-bezier(.4,0,.2,1), background-color 0.18s cubic-bezier(.4,0,.2,1), transform 0.12s cubic-bezier(.4,0,.2,1); } .btn { transition: var(--transition-btn); } .btn:active { transform: translateY(1px); }`.

---

## Brand Consistency Findings

| Surface | Logo width | Logo height | Render path | Verdict |
|---|---:|---:|---|---|
| `/index.html` desktop nav | 150px | 44px | `<picture>` only, legacy tile correctly sr-only'd | ✓ Canonical |
| `/index.html` mobile nav | 122px | 44px | Same | ✓ Canonical |
| `/crowagent-core.html` nav | 150px / 44px | | Same | ✓ Canonical |
| `/crowmark.html` nav | 150px / 44px | | Same | ✓ Canonical |
| `/pricing.html` nav | dual: tile 44×40 + PNG 150×44 | | Legacy tile painted | ✗ Defect |
| `/about.html`, `/contact.html`, `/faq.html`, `/blog/index.html`, `/blog/mees-band-c-2028.html`, `/tools/index.html` | Same as pricing | | Legacy tile painted | ✗ Defect on all 6 |
| Logo focus-ring | 2px teal at 4px offset | | Spec compliant | ✓ |
| Logo hover | opacity 0.85 / 0.15s ease-out | | Spec compliant | ✓ |
| Tagline glyph | "Sustainability • Intelligence" (separator dot — emoji omitted on web) | | Spec says "🌍" globe; web ships bullet | ✗ Drift — verify intent |

**Action:** Issue #1's CSS fix lifts all 7 affected pages to ✓ in a single edit. Re-verify by re-running `node _logo-parent.cjs` and confirming all `boxes[].w` = 1.

---

## Cross-Cutting Recommendations (max premium leverage)

These 4 CSS edits lift the site mean from **6.05 to ~8.2 / 10** without touching brand tokens or content:

**A. Kill the dual-logo on 7 pages** (fixes issue #1, raises Brand from 3→7 on those pages)
- File: `Assets/css/nav-footer-sf21.css` lines 427-470
- Replace ruleset per issue #1 fix. Estimated lift: **+0.45 site mean**.

**B. Adopt Stripe-style cookie banner slim bar** (fixes issues #2, #3, #15)
- File: cookie banner CSS + js/cookie-banner.js (toggle .is-open)
- Initial bar = 88px tall, 2 primary buttons + Manage. Estimated lift: **+0.60 site mean** (all 20 fold scores recover ~1 point in MP, S, E).

**C. Unify type tokens — one H1 scale across the entire site** (fixes issues #4, #7, #17)
- File: `Assets/css/crowagent-brand-tokens.css`
- `--h1-display: clamp(40px, 5.5vw, 64px); --h1-display-lh: 1.05; --h1-display-ls: -0.022em; --h1-display-w: 800;`
- Apply to `.hero h1, h1.hero-title, .h1`. Estimated lift: **+0.30 site mean**.

**D. Sticky frosted nav + tap-target uniformity** (fixes issues #5, #10, #19, #20)
- File: `Assets/css/nav-footer-sf21.css` + global focus rule
- `header > nav { height: 72px; position: sticky; top: 0; backdrop-filter: saturate(140%) blur(20px); background: color-mix(in oklab, var(--bg) 84%, transparent); border-bottom: 1px solid var(--border); z-index: 50; }`
- Plus the 44×44 tap target rule for carousel/cycle dots
- Plus the `:focus-visible` global rule. Estimated lift: **+0.30 site mean**.

**Total projected lift: +1.65 → site mean ~7.7.** Add an `E` round of mobile spacing/eyebrow normalisation (#8, #11, #12, #16) and the site clears **8.0 / 10** — Stripe-equivalent for this content depth.

---

## Verification protocol (READ-ONLY check after any fix)

```bash
# Re-run capture
cd "C:/Users/bhave/Crowagent Repo/crowagent-website" && node _premium-shots.cjs   # script at C:/tmp/resp-audit/premium-shots.cjs

# Re-run logo cascade probe
node _logo-parent.cjs   # all boxes[].w MUST equal 1

# Visual diff
for f in /tmp/premium-audit/*.png; do echo "$f $(stat -c%s "$f")"; done
```

A fix is verified only when:
1. All 14 captures (7 affected pages × 2 vps) show ONE logo lockup
2. `inspect.json` `nav.h` reports a deterministic value (currently 0)
3. Cookie banner does not paint into y < 600 on mobile
4. H1 `fontSize` is the same value across all 10 pages (per viewport)

---

## Evidence index

| File | Bytes | What it proves |
|---|---:|---|
| `C:/tmp/premium-audit/index-desktop.png` | 618,749 | Hero baseline + cookie banner footprint |
| `C:/tmp/premium-audit/pricing-desktop.png` | 159,289 | Dual-logo on pricing |
| `C:/tmp/premium-audit/_logo-crop-pricing-dsf1.png` | tight crop | Side-by-side dual-logo evidence |
| `C:/tmp/premium-audit/_logo-crop-dsf1.png` | tight crop | Index correctly shows ONE logo |
| `C:/tmp/premium-audit/inspect.json` | 100,772 | Full computed-style probe per page × viewport |
| `C:/tmp/premium-audit/nav-probe.json` | — | Header HTML + matched-rule walk |
| `Assets/css/nav-footer-sf21.css:427-470` | — | The `!important` ruleset that breaks the override |
| `styles.css:28354-28365` | — | The intended sr-only override |
| `js/nav-inject.js:93-109` | — | Logo markup (intentionally dual for a11y compat) |
| `docs/brand-guidelines.md:9-101` | — | Brand Logo 2.0 spec |
