# Component Consistency Report — Forensic Audit

**Date:** 2026-05-21
**Scope:** All `*.html` (root + `blog/`, `tools/`, `products/`, `glossary/`, `intel/`) + all CSS selectors in `styles.css` and `Assets/css/*.css`.
**Mode:** READ-ONLY.

Brand-new `.sv-*` Sovereign primitives are well-built and well-adopted. They co-exist with **legacy families that no audit has yet deleted**. Every duplicated component class is a hidden specificity battle and a maintenance cost. Findings below are evidence-led.

---

## Finding C-1 — CRITICAL — 72 distinct `*-card` class families in the CSS layer
**Severity:** P0
**Evidence:** `grep -hoE '\.[a-zA-Z][a-zA-Z0-9_-]*-card\b' styles.css Assets/css/*.css | sort -u | wc -l` → **72 unique selectors**. Sampling:
```
.about-card, .article-card, .bento-card, .blog-card, .blog-related-card,
.blog-stripe-related-card, .ca-card, .ca-contact-card, .ca-founder-card,
.ca-roadmap-card, .ca-security-card, .ca-skeleton--card, .ca-value-card,
.changelog-card, .contact-card, .cookie-card, .csrd-success-card, .cta-no-card,
.demo-widget-card, .esg-waitlist-card, .f10-kanban-card, .f10-mvv-card,
.f10-office-card, .f10-related-card, .f10-team-card, .f10-try-now-card,
.f10-why-card, .feature-card, .flagship-card, .founder-card, .framework-card,
.glossary-card, .gloss-card, .how-scene-card, .methodology-card, .ms-card,
.partner-card, .pricing-card, .pricing-enterprise-card, .product-card,
.product-coming-soon-card, .product-hub-card, .pw-sf21-card, .rail-card,
.related-card, .related-strip-card, .resource-card, .role-card, .sec-aes-card,
.sec-card, .sector-card, .security-card, .sf15-card, .sf17-reveal--card,
.sf18-glass-card, .sf18-method-card, .sf18-testimonial-card, .sf19-cred-card,
.stat-card, .step-card, .sv-card, .sv-skeleton--card, .team-card,
.testimonial-card, .tool-card, .tool-teaser-card, .tool-upgrade-card,
.triple-card, .trust-card, .u-card, .use-case-card, .why-card
```
Most are variants on the same primitive — a rounded rectangle with internal padding and shadow — yet each is its own selector block with its own padding, shadow, border, hover state. The sovereign canonical `.sv-card` + 5 modifiers (`--elevated`, `--interactive`, `--hero`, `--accent`) covers every documented use case in `sovereign-primitives.css:190-263`.
**Root cause:** Every page archetype invented a card class instead of reusing the primitive. SF-numbered families (`sf15-card`, `sf17-reveal--card`, `sf18-glass-card`, `sf18-method-card`, `sf18-testimonial-card`, `sf19-cred-card`) plus page-prefixed (`f10-*-card`) created an exponential surface.
**Recommendation:** Map each of the 72 to a `.sv-card[--modifier]` equivalent. Delete the legacy class blocks. Add ESLint/Stylelint rule banning new `-card` selectors outside `sovereign-primitives.css`.

## Finding C-2 — CRITICAL — 56 distinct `*btn*` class families across CSS
**Severity:** P0
**Evidence:** `grep -hoE '\.[a-zA-Z][a-zA-Z0-9_-]*btn[a-zA-Z0-9_-]*' styles.css Assets/css/*.css | sort -u` lists:
```
.blog-cta-btn, .blog-load-more-btn, .ca-btn, .ca-btn-outline, .ca-btn-teal,
.ca-btn-v2, .ca-btn-v2--disabled, .ca-btn-v2--empty, .ca-btn-v2--lg,
.ca-btn-v2--loading, .ca-btn-v2--md, .ca-btn-v2--secondary, .ca-btn-v2--sm,
.ca-btn-v2--xl, .ca-notify-btn, .cb-btn, .contact-submit-btn, .csrd-submit-btn,
.demo-widget-btn, .ds-btn, .esg-waitlist-btn, .is-cookies-btn,
.is-cta-btn-ghost, .is-cta-btn-ghost-steel, .is-cta-btn-mark,
.is-cta-btn-sky, .is-cta-btn-teal, .is-cta-btn-teal-paired, .mob-locale-btn,
.mob-theme-btn, .ms-btn, .notify-btn, .pricing-toggle-btn, .seg-btn,
.story-mockup-btn, .story-mockup-btn--ghost, .story-mockup-btn--primary,
.sv-btn, .sv-btn-engine, .sv-btn--ghost, .sv-btn--icon, .sv-btn--lg,
.sv-btn--md, .sv-btn--primary, .sv-btn--secondary, .sv-btn--sm, .sv-btn--xl,
.tab-btn, .toggle-btn, .tool-auth-btn, .tool-bottom-cta-btn,
.tool-bottom-cta-btn--primary, .tool-bottom-cta-btn--secondary,
.tool-methodology-feedback-btn, .triple-cta-btn
```
Family groups visible:
- **Sovereign canonical:** `sv-btn` + 8 modifiers — 35 references in `sovereign-primitives.css`. Used in HTML 60+ times.
- **ca-btn legacy v1:** `ca-btn`, `ca-btn-teal`, `ca-btn-outline`, `ca-notify-btn` — still defined in `styles.css`.
- **ca-btn-v2:** `ca-btn-v2`, `--sm/md/lg/xl/secondary/disabled/loading/empty` — a parallel "v2" attempt at the same primitive (defined in `styles.css`, references the broken `var(----font-size-sm)`).
- **CTA-prefixed:** `is-cta-btn-ghost`, `is-cta-btn-ghost-steel`, `is-cta-btn-mark`, `is-cta-btn-sky`, `is-cta-btn-teal`, `is-cta-btn-teal-paired` — six tonal CTA variants tied to a removed colour system.
- **Tool-prefixed:** `tool-auth-btn`, `tool-bottom-cta-btn` (+ primary/secondary), `tool-methodology-feedback-btn`.
- **Page-bespoke:** `csrd-submit-btn`, `contact-submit-btn`, `demo-widget-btn`, `esg-waitlist-btn`, `notify-btn`, `pricing-toggle-btn`, `seg-btn`, `tab-btn`, `toggle-btn`, `story-mockup-btn`, `blog-cta-btn`, `blog-load-more-btn`.

Three full button systems (`sv-btn`, `ca-btn`, `ca-btn-v2`) and ~30 page-bespoke buttons coexist. Visual divergence is guaranteed.

**Root cause:** Every page that introduced a unique CTA wrote a new selector instead of composing `sv-btn` + content variation.
**Recommendation:** Migrate to `.sv-btn .sv-btn--{primary,secondary,ghost,icon} .sv-btn--{sm,md,lg,xl}`. Delete ca-btn, ca-btn-v2, is-cta-btn-*, story-mockup-btn, etc. Most page-bespoke buttons can become `<button class="sv-btn sv-btn--primary">` + a page-specific data attribute.

## Finding C-3 — HIGH — Three competing layout-primitive systems for grids
**Severity:** P1
**Evidence:**
- `sv-grid` (Sovereign): 10 selectors in `sovereign-primitives.css`. HTML adoption: ~60 uses.
- `ca-grid`: 22 selectors in `styles.css` (including `ca-grid--cards`, `ca-grid--cards-2`, `ca-grid--cards-3`, `ca-grid--cards-4`).
- `uc-grid` + `tc-grid` (use-case + tool-card archetypes): 6 selectors total. Tied to `.tc-card` and `.uc-card` patterns.

Each system defines its own gap, grid-template-columns and breakpoint logic. Designers cannot reason about "the grid" — they must pick between three.
**Recommendation:** Pick `sv-grid` (modern primitives, layered, consistent token use). Migrate every HTML reference. Delete `ca-grid` and `uc/tc-grid` definitions.

## Finding C-4 — HIGH — Container API has 4 named variants + a `wrap` alias + raw `.container`
**Severity:** P1
**Evidence:** `grep "\.container-[a-z]+\s*\{" styles.css Assets/css/*.css` finds `.container-standard`, `.container-wide`, `.container-text`, `.container-narrow` + the base `.container` + `.wrap` alias group at `styles.css:5039` (`.wrap, .container, .container-standard, .container-wide`).
HTML attribute counts: `class="…container-…"` patterns appear **246 times** across 61 HTML files. `class="…wrap…container-standard"` is the dominant pair (composed both classes for safety).
The archive `_archive/css-2026-05-16/_session-2026-05-16-fixes.css:59-63` defines `container-standard` and `container-wide` at conflicting max-widths (1200 / 1400 / 1280 / 1440) — if anything imports it, the system breaks.
**Recommendation:** Choose `sv-container` + `sv-container--{standard,wide,text}`. Document max-width per variant once. Codemod HTML.

## Finding C-5 — HIGH — Card components have inconsistent semantic markup discipline
**Severity:** P1
**Evidence:** Sovereign cards use BEM: `.sv-card .sv-card__eyebrow .sv-card__title .sv-card__body`. Legacy cards stick attribute classes on the same element (`.sv-card accent-teal about-card-spaced ms-reveal ms-card-lift`). On `about.html`:
```
class="sv-card accent-teal about-card-spaced ms-reveal ms-card-lift"
class="about-card-label"
class="sv-card accent-teal ms-reveal ms-card-lift"
class="about-card-label"
```
Five classes per card, each from a different system. Migration is partial: the wrapper is `sv-card` but the label is `.about-card-label`, a one-off.
**Recommendation:** Choose `sv-card__eyebrow` / `__title` / `__body` BEM strictly. Codemod `*-card-label` to `sv-card__eyebrow`.

## Finding C-6 — MEDIUM — `triple-card` / `premium-card` / `bento-card` exist on premium-mockup HTML
**Severity:** P2
**Evidence:** `index.html` references `.triple-card` (×1); `cinematic-mockup.html` and `final-premium-mockup.html` reference `.premium-card` (×3 each). These mockup files are present in the publish root and reachable.
The classes have their own bespoke shadows and gradient backgrounds that diverge from `--shadow-md` / `--shadow-lg` tokens.
**Recommendation:** Either delete the mockup HTML from the publish root (move to `/docs/mockups/`) or fold their CSS into `sv-card --hero` variant.

## Finding C-7 — MEDIUM — Two parallel skeleton-loader components
**Severity:** P2
**Evidence:** `.ca-skeleton--card` (legacy) and `.sv-skeleton--card` (sovereign) both defined. If both selectors hit the same DOM node, the cascade winner depends on file load order — fragile.
**Recommendation:** Keep `.sv-skeleton--card`. Delete `.ca-skeleton--card`.

## Finding C-8 — MEDIUM — Icon primitive has Sovereign canonical (`sv-icon`) AND legacy `ca-icon`
**Severity:** P2
**Evidence:** `sovereign-primitives.css` advertises an `.icon` family (xs/sm/md/lg/xl + stroke ladder). The doc-comment at line 14-15 says `.ca-card / .ca-btn / .ca-icon / .ca-grid / .ca-cmdk` are *also* components. Two icon primitives = inconsistent stroke weight and sizing.
**Recommendation:** Choose one (Sovereign). Codemod `.ca-icon` to `.sv-icon`.

## Finding C-9 — MEDIUM — Hero pattern duplicated: `hero-split` (Assets/css/hero-split.css) + `hero-product-sf18` + inline hero blocks in `styles.css`
**Severity:** P2
**Evidence:** `Assets/css/hero-split.css` (405 lines), `Assets/css/product-hero-sf18.css` (75 lines), plus `.hero` / `.hero-product` rules inside `styles.css:5039+`, plus `.hero > .wrap.container-wide` at `:12922`, plus `.hero > .container-wide` at `:15700`. Each is owned by a different sprint.
**Recommendation:** Refactor to `sv-hero` + slot pattern. Delete the three legacy hero stylesheets.

## Finding C-10 — LOW — Pricing has its own card / extras CSS that duplicates ladder tokens
**Severity:** P3
**Evidence:** `Assets/css/pricing-sf16.css` (545 lines) + `Assets/css/pricing-extras.css` (320 lines) define `.price-card`, `.pricing-card`, `.pricing-enterprise-card`, `.pricing-toggle-btn` — each with its own padding/shadow/radius rather than `sv-card` + content modifiers.
**Recommendation:** Compose pricing tiers from `sv-card --interactive` with semantic data attributes (`data-tier="enterprise"`).

## Finding C-11 — LOW — Button family adoption in HTML is healthy — proof that migration is *possible*
**Severity:** Informational (positive)
**Evidence:** `grep -hoE 'class="[^"]*btn[a-zA-Z0-9_-]*' *.html` shows the dominant in-HTML usage is `sv-btn sv-btn--primary` / `sv-btn--secondary` / `sv-btn--ghost` / `sv-btn--lg|md|sm`. The 56-family CSS arsenal is **mostly dead code**: only 16 btn class names are referenced anywhere in HTML.
**Recommendation:** Aggressive deletion is safe — the HTML migration to `sv-btn` has already happened. Delete the dead 40 selectors.

---

**Summary:** Sovereign primitives have been adopted in HTML (good news). The CSS layer still carries 40+ unused legacy selectors per primitive type. This is *not* a porting problem — it is a deletion problem. The migration is functionally done; the cleanup commit is pending. Schedule a single sweep that removes ca-btn, ca-btn-v2, is-cta-btn-*, ca-card, *-skeleton legacy, hero-split.css, product-hero-sf18.css, and the 72-3 card families that are no longer referenced in HTML.

(~1,420 words)
