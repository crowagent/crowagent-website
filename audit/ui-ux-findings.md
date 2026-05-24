# UI/UX Findings — 2026-05-21

## Methodology

Read-only forensic visual audit of the static site rooted at `C:/Users/bhave/Crowagent Repo/crowagent-website` (served at `localhost:8092`). Inspected ~35 representative PNGs across all surface clusters in `C:/tmp/hp-screens/audit/`: homepage (`index-01/02`), all six product pages (`crowagent-core`, `crowcyber`, `crowcash`, `crowmark`, `crowesg`, `csrd`), products hub, pricing, about, contact, partners, FAQ, resources, roadmap, changelog, security, privacy, terms, cookies, cookie-preferences, 404, four blog posts (`mees-band-c-2028`, `epc-register-explained`, `ppn-002-social-value-explained`, `index`), three glossary pages (`index`, `csrd`, `epc-rating`), two trackers (`cyber-essentials-tracker`, `mees-tracker`), tools index + one tool detail + two methodology pages, and matching `-02-footer` shots. Cross-referenced findings against the HTML/CSS source: grep over `class=` declarations (669 raw `card` uses, 150 `sv-btn`, 176 raw `btn`, 107 `sv-card`, 30 `card--cyber/cash/mark/...` sub-themed cards) and inspection of `Assets/css/nav-footer-sf21.css`, `Assets/css/page-archetype-unify.css`, `Assets/css/sovereign-primitives.css`, and the per-product `.css` files. No code was changed.

## Issues found

### UI-01 — Footer column headers collide across every page
**Severity:** CRITICAL
**Pages:** every page that injects the global footer (verified: `index`, `crowcyber`, `crowmark`, `crowcash`, `crowagent-core`, `crowesg`, `csrd`, `pricing`, `products/`, `blog/index`, `blog/mees-band-c-2028`, `glossary/csrd`, `tools-late-payment-calculator-methodology`, `about`, `contact`, `faq`).
**Observed:** The four footer column headings render as overlapping glyphs — "PRODUCTS / FREE TOOLS / RESOURCES / COMPANY" become `PRODUCT**SREE TOOL**S**RESOURCE**S**COMPANY`. The H-tags physically run into each other because each heading's rendered width exceeds the column gap.
**Expected:** Four discrete uppercase column headings, each constrained inside its grid cell, with a comfortable column-gap.
**Root cause:** `Assets/css/nav-footer-sf21.css` lines 336-349 force `grid-template-columns: 2fr 1fr 1fr 1fr 1fr !important` with `column-gap: clamp(1.5rem, 2.4vw, 2.5rem) !important`. The four narrow 1fr columns at common laptop widths give each heading ~140 px while the heading text (`uppercase` + `letter-spacing: 0.16em` per line 195/497) overflows the cell. There is no `overflow: visible` containment, no `min-width: 0`, and no font-size cap on the heading. Heading text bleeds horizontally into the next column.
**Recommendation:** Either reduce heading letter-spacing/size, raise the column-gap, or change to `grid-template-columns: 1.6fr repeat(4, minmax(8rem, 1fr))` so each link column has a guaranteed minimum width. This is a near-100%-page defect and should be P0.

### UI-02 — Trust-badge row has two contradictory layouts (vertical list vs. horizontal pill row)
**Severity:** HIGH
**Pages:** `index-02-footer`, `crowcyber-02-footer`, `crowmark-02-footer`, `crowagent-core-02-footer`, `pricing-02-footer`, `about-02-footer`, `blog/mees-band-c-2028-02-footer`, `tools-late-payment-calculator-methodology-02-footer`.
**Observed:** On `index`/`crowcyber`/`crowmark` the trust line ("AES-256 at rest", "TLS 1.3 in transit", "GDPR compliant", "UK + EU data residency", "ISO 27001 aligned") is a vertical stack flush-left near 25% width. On `pricing`/`about`/`products`/`blog/...`/`glossary`/`tools-...-methodology` the same items appear as a horizontal pill row across the full width above the footer grid.
**Expected:** A single canonical trust-row component used identically site-wide.
**Root cause:** Two parallel implementations of the same module — likely one rendered server-side in the per-page HTML and another injected by `js/nav-inject.js`. Class-collision between `.trust-row` and a legacy stacked equivalent.
**Recommendation:** Pick one (the horizontal pill row reads as the more "premium" Stripe/Apple variant) and delete the other. Audit nav-inject.js to make sure only one footer markup is rendered per page.

### UI-03 — Wordmark/logo uses two completely different visual treatments
**Severity:** HIGH
**Pages:** lowercase Title-case ("CrowAgent / Sustainability • Intelligence"): `index`, `crowcyber`, `crowmark`, `crowcash`, `crowagent-core`, `csrd`, `blog/*`, `glossary/*`, `faq`, `contact`, `security`, `privacy`, `terms`, `roadmap`. Uppercase ("CROWAGENT / SUSTAINABILITY • INTELLIGENCE"): `pricing`, `products/`, `about`, `crowesg`, `partners`, `resources`, `changelog`, `cookies`, `cookie-preferences`, `intel/*`, `tools/*`, `tools-...-methodology` family.
**Expected:** A single wordmark spec applied via the injected `<header id="ca-nav">` component.
**Root cause:** Some pages still ship a legacy inline header (uppercase variant from an earlier SF wave) while the post-SF21 pages defer to `js/nav-inject.js` (Title-case variant). Likely two `.logo-wordmark` rules in `nav-footer-sf21.css` vs the page's own per-page CSS.
**Recommendation:** Strip all hard-coded `<header>` markup from page bodies; rely solely on the injected nav. Audit `Assets/css/about-sf18.css`, `pricing-sf16.css`, `resources-sf21.css` for stale wordmark styles.

### UI-04 — 404 page renders unstyled
**Severity:** CRITICAL
**Pages:** `404-01-top`.
**Observed:** The 404 hero shows the bare wordmark, then a row of plain unstyled text "CrowCyber CrowCash CrowMark CSRD Checker Pricing Blog" jammed against the left edge of the viewport (0 px padding). Below that "404" appears in body-size text, then "PAGE NOT FOUND" eyebrow, then a left-aligned H1 with no horizontal margin. CTAs ("Start at homepage" / "View pricing") sit flush-left. No grid system applied.
**Expected:** Same `.sv-nav` styled header as every other page, a centered `.nf-shell` with eyebrow chip, large numerical ghost "404", title, CTAs, divider and pill row — per `404.html` source.
**Root cause:** `body class="f8-page f8-404"` plus reliance on `pmb-host pmb-aurora` background classes and a `.nf-shell` layout that has no fallback. Likely one of these is true: (a) `js/nav-inject.js` did not inject the nav on this route (CSS variable fallout cascades to no padding); (b) `pmb-aurora` background CSS is missing or fails when the page archetype CSS file isn't preloaded; (c) the `.nf-pill-row` pills are rendering before the pill CSS loads (FOUC). In all three cases the result is plain-DOM no-CSS rendering.
**Recommendation:** Add fallback CSS for `.nf-shell`, `.nf-pill-row`, `.nf-pill`, `.nf-cta-row` inside `styles.min.css` (currently they're scoped to a SF-wave file). Verify nav-inject runs on /404 (Cloudflare 404 handler may not fire deferred scripts).

### UI-05 — Hero background treatment is fragmented across products
**Severity:** HIGH
**Pages:** `crowcyber-01-top`, `crowmark-01-top`, `crowcash-01-top`, `crowagent-core-01-top` (plain dark gradient); `crowesg-01-top` (photographic vegetables/peppers fill); `csrd-01-top` (dark photographic blue-toned background); `index-01-top` (earth-from-space photo).
**Observed:** The six product pages share an otherwise identical hero archetype (left rail nav, breadcrumb top-right, eyebrow chip, two-line H1 with teal accent on key word, subtitle) but four have no hero photo while two have totally different photos with different colour temperatures. The portfolio has no unified background treatment.
**Expected:** A consistent hero background system — either all-photo (each product its own consistent image) or all-gradient with a per-product micro-graphic.
**Root cause:** `crowesg.html` and `csrd.html` set per-page background images on `.sv-hero` while CrowCyber/Mark/Cash/Core opted out. There is no shared product-page hero-bg class governing the choice. Per-product CSS files (`crowesg-page.css`, `consistency-sf41.css`, `product-hero-sf18.css`) each shipped a different decision.
**Recommendation:** Define one product-hero background rule and apply to all six. The 6 sub-themed `.card--cyber/cash/mark/esg/core/csrd` cards (30 grep hits in `crowcash.html`, `crowagent-core.html`, etc.) indicate the same fragmentation pattern at the card layer — pick one neutral surface and let only the eyebrow chip carry the product colour.

### UI-06 — Breadcrumbs misaligned on legal pages (Security / Privacy / Terms / Contact)
**Severity:** MEDIUM
**Pages:** `security-01-top`, `privacy-01-top`, `terms-01-top`, `contact-01-top`.
**Observed:** The "Home / [Page]" breadcrumb sits roughly centered above the hero, but the breadcrumb itself wraps onto two lines ("Home" on row 1, "/ Security" on row 2) and the link colour is identical to the body white so it reads as a stray fragment. The hero H1 below is left-aligned, so the centered/wrapped breadcrumb does not visually parent the heading.
**Expected:** Single-line breadcrumb left-aligned with the H1, secondary text colour, ≤16 px font size.
**Root cause:** `.breadcrumb` flex container has `justify-content: center` (legal-page CSS) while the parent `.section-hero` content uses `text-align: left`. The wrap is caused by an absent `white-space: nowrap` and the centered alignment.
**Recommendation:** Standardise the breadcrumb component on left-alignment, nowrap, and `--mist` colour. Glossary pages use a left-aligned variant ("Glossary / CSRD") at the very top edge (no padding), which is a third variant. Pick one.

### UI-07 — Decorative teal stripe in upper-left corner of legal pages
**Severity:** MEDIUM
**Pages:** `security-01-top`, `privacy-01-top`, `terms-01-top`, `contact-01-top`, `faq-01-top`, `cookie-preferences-01-top`.
**Observed:** A 30-50 px tall diagonal teal sliver runs across the top-left corner just under the cookie banner, with no apparent semantic meaning. It looks like the bottom half of a hexagon background that has been clipped.
**Expected:** Either a full hero background graphic that is intentional and visible, or no graphic at all.
**Root cause:** `Assets/bg-hero.svg` (or a sibling) is set as `background-image` on `.section-hero` with `background-position` placing the visible artwork off-canvas. Only the bottom edge bleeds back into view.
**Recommendation:** Either remove the background or reposition so the SVG is fully visible. Check the `bg-hero.svg`/`bg-products.svg`/`bg-cta.svg` cascade in `page-motion-bg.css` and `page-styles.css`.

### UI-08 — Card class drift: 8+ distinct card components doing the same job
**Severity:** HIGH
**Pages:** site-wide (grep evidence below).
**Observed:** Audit of `class=` attributes reveals 8 different "card" implementations in active use: `.sv-card` / `.sv-card--accent` (107 hits, the canonical primitive), `.pw-sf21-card` (product walkthrough), `.hw ms-card-lift` (CrowCyber/Mark "who-it's-for" rows), `.sector ms-card-lift` (sector strip), `.f10-related-card` / `.f10-related-card--core/--mark` (cross-sell), `.card--cyber / --cash / --mark / --esg / --core / --csrd` (30 hits across product pages), legacy `.card-1` / `.card-2` (in `finished-premium-homepage.html` archive), and bare `.card` from 50+ files (669 raw uses). Each renders with subtly different padding, border radius, shadow, and hover treatment.
**Expected:** One canonical card component (`.sv-card`) with declarative modifiers.
**Root cause:** Successive SF (Sovereign Feature) waves added new card variants without retiring the old. `Assets/css/page-archetype-unify.css` and `consistency-sf41.css` were meant to consolidate but the per-product files and legacy archive HTML still import older systems.
**Recommendation:** Define a card audit ledger; map every `.pw-sf21-card`, `.f10-related-card`, `.hw`, `.sector`, `.card--*` use to its `.sv-card` equivalent; delete the duplicates. Move legacy `finished-premium-*.html` mockups to `_archive/`.

### UI-09 — Button class drift: `.sv-btn`, raw `.btn`, `.seg-btn`, `.demo-widget-btn`
**Severity:** MEDIUM
**Pages:** site-wide.
**Observed:** 150 uses of `.sv-btn` (canonical), 176 uses of raw `.btn` (legacy), plus persona switchers using `.seg-btn` (`index.html` lines 361-366) and one-off `.demo-widget-btn` (`index.html` line 761). Visual rendering is similar but not identical (corner radius, focus ring, internal padding differ between `.sv-btn` and `.btn`).
**Expected:** All clickable CTAs use `.sv-btn` + a modifier.
**Root cause:** Same SF-wave layering as UI-08. Older pages reference `Assets/css/page-styles.css` button rules; newer ones use `sovereign-primitives.css`.
**Recommendation:** Convert remaining `.btn` instances. Document `.seg-btn` as the official tab-pill style if it's intentional, otherwise fold into `.sv-btn--ghost--sm`.

### UI-10 — Persona-switcher tabs and CTA pill bar visually fight on the homepage
**Severity:** MEDIUM
**Pages:** `index-01-top`.
**Observed:** Above the fold, the "Now live · 14-day free trial · No credit card required" announcement bar overlaps with the green CTA pill "Start free trial" on the far right (the pill exits the banner top edge). Below it, the persona seg-btn row would render six tabs in one line but appears not visible above fold; CTA row stacks "Start free trial" + "Book a demo" with adequate spacing but the trust-microcopy below ("No credit card required · 14-day trial · Cancel anytime") clashes vertically with the cookie banner.
**Expected:** Vertical rhythm with clear separation between announcement bar, hero, secondary CTA microcopy, and cookie banner.
**Root cause:** The pill `Start free trial` in the announcement bar uses `position: absolute; top: -8px;` (or similar lift), and the cookie banner z-index sits above the trust microcopy without bottom padding on `<main>`. Both modules ship from independent SF waves.
**Recommendation:** Pin the announcement bar pill inside the bar bounds. Add bottom padding equal to cookie-banner height on `<main>` when the banner is visible (or use `padding-block-end: env(safe-area-inset-bottom)`).

### UI-11 — Blog post `ppn-002-social-value-explained` has no hero H1 above the fold
**Severity:** HIGH
**Pages:** `blog__ppn-002-social-value-explained-01-top`.
**Observed:** Top-of-page screenshot shows: nav, breadcrumb "Blog > PPN 002 Social Value Explained", three meta chips (PPN 002 / 10 April 2026 / 10 min read), an author/read-time line, then a hero image. The article title (H1) is absent above the fold.
**Expected:** Blog post pattern (as seen on `mees-band-c-2028`, `epc-register-explained`) puts the H1 immediately under the breadcrumb.
**Root cause:** The H1 has been moved below the hero image, or the eyebrow chip stack has been reordered above the title on this one post template.
**Recommendation:** Audit `blog/ppn-002-social-value-explained.html` for missing/displaced `<h1>`; ensure consistent post-page archetype.

### UI-12 — Product pages show duplicated nav-tab "About" + sticky in-page rail at the same time
**Severity:** MEDIUM
**Pages:** `crowcyber-01-top`, `crowmark-01-top`, `crowcash-01-top`, `crowagent-core-01-top`.
**Observed:** A redundant "About" link sits directly under the global nav, then a left rail repeats `Overview / Features / How it works / Pricing / FAQ`. Meanwhile the top-right breadcrumb shows `Home / Products / CrowCyber`. Three navigation systems compete in 200 px of vertical space.
**Expected:** Either the rail OR a tab strip — not both. Breadcrumb is OK as a third.
**Root cause:** Product walkthrough SF (`product-walkthrough-sf21.css`) added the rail; an earlier wave already placed the "About" tab; neither was removed.
**Recommendation:** Decide which is the canonical product in-page nav. Keep the left rail (it's standard for product micro-sites) and drop the "About" tab.

### UI-13 — Cookie banner permanently covers footer trust badges on short-viewport pages
**Severity:** MEDIUM
**Pages:** every page (`-02-footer` shots all show the banner overlay).
**Observed:** The `Cookie preferences ... Manage preferences / Reject all / Accept all` banner is fixed bottom-left with no transform on `<main>` when shown. On pages where the footer is short (`crowesg`, `cookie-preferences`, `partners`), the banner permanently overlaps the bottom of the footer, including parts of column links.
**Expected:** Either dismissible-on-scroll, or `<main>` and the footer add bottom padding equal to banner height when the banner is mounted.
**Root cause:** `cookie-banner.js` adds a fixed-position element without adjusting body padding.
**Recommendation:** When the banner mounts, set `document.body.style.paddingBottom = bannerHeight + "px"`. Remove on dismiss.

### UI-14 — Intel/tracker pages use different hero archetype (split two-column) than the rest of the site
**Severity:** MEDIUM
**Pages:** `intel/cyber-essentials-tracker/index-01-top`, `intel/mees-tracker/index-01-top`.
**Observed:** Both tracker pages use a 60/40 split with a teal sidebar card "Get certified faster — CrowCyber walks you through..." on the right and the H1+intro on the left. No other section/page on the site uses this two-column upsell-rail.
**Expected:** Trackers should follow the same hero archetype as resources/changelog/glossary (centered or left-aligned hero, CTA below, then content).
**Root cause:** `intel-tracker.css` is a bespoke layout that never got harmonised with `page-archetype-unify.css`.
**Recommendation:** Refactor intel pages onto the shared archetype, move the upsell card into a "Related products" section below the fold.

### UI-15 — Glossary pages have three different chip/eyebrow styles
**Severity:** LOW
**Pages:** `glossary/index-01-top` ("GLOSSARY · SUSTAINABILITY INTELLIGENCE" centered teal eyebrow), `glossary/csrd-01-top` ("DEFINED TERM · SUSTAINABILITY INTELLIGENCE" left-aligned outlined teal pill), `glossary/epc-rating-01-top` (identical outlined teal pill style).
**Observed:** Index page eyebrow is plain text in teal small-caps; term pages use an outlined rounded-pill chip. The index variant looks like a section eyebrow whereas the term pages look like a tag/category badge. They are not visually parented.
**Expected:** Glossary index and glossary term pages should share one eyebrow component.
**Root cause:** Index page reuses the resources/blog index eyebrow class; term pages adopt a new "defined-term" badge class. Both live in different CSS files.
**Recommendation:** Promote the outlined pill to the index page too, or vice versa.

### UI-16 — Sub-themed product cards (.card--cyber/.card--cash/...) re-introduce six colour palettes
**Severity:** MEDIUM
**Pages:** `index-01-top` (Products grid), `products/index-01-top`, `crowagent-core` / `crowcyber` / `crowcash` / `crowmark` / `crowesg` / `csrd` (cross-sell rails at footer).
**Observed:** Each product card on the cross-sell rail has a slightly different accent stroke/glow (cyan for Cyber, lime for Cash, magenta for Mark, etc.), shipping six different colour palettes that conflict with the site's primary teal accent.
**Expected:** Either single accent (`--teal`) for every product card, or a documented six-product palette applied consistently to all surfaces (chip, button, icon, hero accent) and not just to cards.
**Root cause:** `.card--cyber / .card--cash / .card--mark / .card--esg / .card--core / .card--csrd` were introduced in early-2026 product pages without an ecosystem decision on whether each product gets its own colour.
**Recommendation:** Pick "monochrome teal with per-product icon" (Stripe pattern) or "six-product palette" (Linear pattern) and apply across every chip/badge/card/icon. Currently it's halfway.

### UI-17 — Inconsistent text alignment in mid-page paragraph rhythm on Roadmap
**Severity:** LOW
**Pages:** `roadmap-01-top`.
**Observed:** Roadmap H1 + immediate subtitle are centered (correct). Below them, the second-stanza italic "Future-phase dates are indicative..." paragraph is also centered, but the visual hierarchy reads as a continuation, not a callout. Other archetype pages (changelog, faq) keep secondary content left-aligned for readability.
**Expected:** Centered hero only; supporting/long-form paragraphs left-aligned.
**Root cause:** Section-level CSS uses `text-align: center` on `.section-intro` and there is no override for `.section-intro--secondary`.
**Recommendation:** Cap centered text to ≤200 chars per CrowAgent typography rules; switch the italic paragraph to left alignment with `--mist` colour.

## Patterns / systemic causes

**1. SF-wave layering with no retirement protocol.** Every SF wave (SF16 pricing, SF18 about/product-hero, SF21 nav-footer/resources/tools/breadcrumb, SF27, SF39, SF41 consistency) added a fresh CSS file without deleting predecessors. Result: 33 CSS files in `Assets/css/`, multiple overlapping declarations for `.btn`, `.card`, `.eyebrow`, `.breadcrumb`, `.hero`, `.footer-grid`. The footer-column collision (UI-01) is a direct product of this — the SF27-G rule on line 339 of `nav-footer-sf21.css` forces a column count that the heading text cannot fit into, because no one re-validated against the original heading typography.

**2. Two parallel render paths for shared chrome (nav + footer + trust-row).** Some pages still hard-code `<header>`/`<footer>` in the HTML body; others rely solely on `js/nav-inject.js`. Result: the wordmark drift (UI-03) and the dual trust-row layouts (UI-02). The 404 page (UI-04) is the canary: when the inject script fails, the page rendering collapses because there is no styled fallback.

**3. No card or button component registry.** Eight card variants and four button variants live in the codebase. There is no Storybook-equivalent or design-system index that says "this is the canonical card; everything else is deprecated". Anyone shipping a new section invents a new card.

**4. Per-product colour palette never reached a final ratio.** The six sub-themed cards (UI-16) suggest a palette decision was attempted but never propagated. The product pages themselves don't carry the per-product colour into their hero/chip/button, so the card colour looks accidental.

**5. Globally-fixed cookie banner with no layout reservation.** Causes overlap on every short-viewport footer (UI-13). A two-line fix in `cookie-banner.js`.

**6. Hero archetype not enforced.** Six product pages, six different hero treatments (UI-05). Same for intel trackers (UI-14) and glossary terms (UI-15). The intent of `page-archetype-unify.css` was to enforce one archetype; it does not yet cover product hero backgrounds, intel layouts, or eyebrow style.
