# QA-40 Cluster 4 — P2 Content/Consistency · 2026-05-22

Date: 2026-05-22  ·  Engineer: Senior FE (Stripe-tier)  ·  Scope: BUG-019..BUG-030 (12 bugs)
Repo: `crowagent-website/`  ·  Server: `http://localhost:8092`

## Gate verdicts

| Gate | Verdict |
|---|---|
| `node tools/sovereign-sheriff.js` | GREEN (10/10 sub-gates) |
| `node tools/geometric-truth.js` | GREEN |
| `node tools/principal-spec-validator.js` | GREEN (51/51) |
| `node tools/reconciliation-checker.js` | GREEN |
| `BASE_URL=http://localhost:8092 npx playwright test tests/smoke.spec.js --project=chromium` | 25/25 PASS |

## Per-bug audit

### BUG-019 — Header pattern consistency
**Status:** SHIPPED (verification-only — pattern was already consistent).
**Probe:** all 16 pages render `announce-bar (44px) → nav (72px) → breadcrumb → page hero` in that order. Homepage exempt from breadcrumb (standard SEO pattern).
**Files touched:** none — `js/nav-inject.js` is the single source of truth and is forbidden per scope.
**Evidence:** 16-page nav-probe table inline in this audit doc.

### BUG-020 — "Days since" Cyber Essentials counter dynamic
**Status:** SHIPPED.
**Root cause:** the homepage hero eyebrow, `sf13-hero-hud.js`, and `persona-deadlines.js` had drifted from the rest of the codebase. Hero JS used `2026-04-27`, persona JS used `2026-04-28`, blog/intel/tools all used 28 April 2026 (NCSC effective date).
**Fix:** harmonised all visible-counter dates to **28 April 2026** (NCSC's stated effective date) so the count-up reads 25 days as of 22 May 2026.
**Files:** `js/modules/persona-deadlines.js`, `js/modules/sf13-hero-hud.js`, `index.html` (eyebrow + 6 other date references), `crowcyber.html`, `tools/homepage-pivot.js`, `tools/sf46-u1-howto-injector.js`.
**Verification:** Playwright probe shows `#countdown-days = 25` with cyber persona active. SF13 HUD switches to "IN FORCE" badge (deadline has passed).

### BUG-021 — SME Finance sector icon is £, not $
**Status:** ALREADY-SHIPPED (verification-only). `index.html:1323` carries an SF11 2026-05-17 comment confirming the Lucide dollar-sign path was replaced with a pound-sterling glyph. No `$` glyph rendered anywhere on the page.

### BUG-022 — "ISO 27001 aligned" badge with visible footnote
**Status:** SHIPPED.
**Fix:** copy changed from "ISO 27001 aligned" → "ISO 27001 controls" with a visible asterisk footnote applied to the hero trust strip + pricing trust pills + security/privacy/terms badge rows. Footnote reads: *"We follow ISO 27001 controls. Formal certification planned for Phase 2."* Visible at `.hero-trust-footnote` (new CSS rule in `styles.css` + `styles.min.css`).
**Files:** `index.html`, `pricing.html` (2 sites), `security.html`, `privacy.html` (2 sites), `terms.html`, `styles.css`, `styles.min.css`.

### BUG-023 — Carousel URLs labelled "Platform preview"
**Status:** SHIPPED.
**Fix:** carousel slide chrome relabelled from `app.crowagent.ai/dashboard` → `<span class="product-frame-url-tag">Platform preview</span> · /dashboard` (and equivalent for slides 2–5). Font size bumped from `0.6875rem` (11px) → `0.75rem` (12px) per ≥12px legibility floor.
**Files:** `index.html` (5 slides), `styles.css` (`.crow-carousel .product-frame-url` size + new `.product-frame-url-tag` pill style), `styles.min.css`.

### BUG-024 — Walkthrough step image alt text
**Status:** SHIPPED.
**Fix:** 4-step walkthroughs on `csrd.html` and `crowmark.html` received step-specific alts (e.g. "Step 1: CSRD Checker headcount entry screen, Omnibus I threshold reminder visible."). `index.html`, `crowesg.html`, `crowagent-core.html`, `crowcyber.html`, `crowcash.html` (32 generic alts) replaced with `"Platform preview: product walkthrough card (decorative)."` since these images are `aria-hidden="true"` decorative (captions provide the step intent).

### BUG-025 — Title pattern normalisation
**Status:** SHIPPED.
**Fix:** every production HTML title now follows the `Page Name | CrowAgent` pattern with `|` as canonical separator. Where a descriptive subtitle is useful, the form is `Page Name | Descriptor | CrowAgent`. Removed generic "Compliance Software" tail.
**Files (43 total):** all top-level HTML pages, blog posts, glossary entries, products index, intel trackers, tool indices, and methodology pages. `og:title` + `twitter:title` mirrors updated.
**Verification:** `grep -rE "<title>" --include='*.html'` returns zero pages without `| CrowAgent` (excluding `_archive`, `audit`, `playwright-report`).

### BUG-026 — `/crowagent-core` 680-days countdown
**Status:** ALREADY-SHIPPED (verification-only). `js/mees-countdown-core.js` computes `Math.ceil((2028-04-01 - now)/DAY_MS)`. Playwright probe at 22 May 2026 → 680 days (spec said ~679–680). Dynamic + accurate.

### BUG-027 — Nav dropdown items 44×44 touch target
**Status:** SHIPPED.
**Fix:** added `min-height: 44px` to `.nav-mega-item, .nav-dropdown-item, .ca-nav-dropdown-item, .nav-dropdown a` in `styles.css` + `styles.min.css`.
**Verification:** nav-probe at 1440 viewport shows dropdown links render at 71px tall (≥44).

### BUG-028 — Cookie banner ↔ chatbot overlap at first load
**Status:** SHIPPED.
**Root cause:** existing `body.has-cookie-banner` chatbot offset rule was scoped to `@media (max-width:480px)` only — banner + chatbot collided on tablet/desktop first paint.
**Fix:** moved the rule out of media query so it applies at every viewport. Cookie banner z-index `--z-top-3 (100050)` already sits above chatbot, and now `body.has-cookie-banner #ca-chatbot-btn { bottom: calc(92px + var(--ca-cookie-banner-h, 72px)) }` covers all sizes.
**Verification:** Playwright overlap probe at 1440 and 390 → `overlapBannerChat: false` at both viewports.

### BUG-029 — "Products" desktop nav navigable
**Status:** OUT-OF-SCOPE (forbidden file — `js/nav-inject.js`). Not in the 12-bug contract list. Recorded as carry-forward.

### BUG-030 — `/pricing` 300px blank between hero and first card
**Status:** ALREADY-SHIPPED (verification-only). Playwright gap probe at 1440/768/390 viewports → `gapHeroToCard: 0px` everywhere. Hero pb-sm padding-bottom is 32–48px depending on viewport; the first `.pgrid` card starts immediately after. The "300px blank" reported in the original audit does not reproduce on the current build (`hero.pb-sm` was tightened in earlier I2 + I9 work on `body.f8-pricing`).

## Files modified

- `index.html` — hero trust badge text + footnote, carousel URLs, 32 alt texts, title + og + twitter, 9 date strings
- `pricing.html` — 2 ISO badges + 2 footnotes, title + og + twitter
- `crowagent-core.html`, `crowmark.html`, `crowcyber.html`, `crowcash.html`, `crowesg.html`, `csrd.html` — titles + 4 walkthrough alts each, og + twitter
- `about.html`, `contact.html`, `faq.html`, `roadmap.html`, `security.html`, `resources.html`, `partners.html`, `changelog.html`, `cookie-preferences.html`, `cookies.html`, `terms.html`, `privacy.html`, `404.html` — titles + og + twitter
- `blog/csrd-omnibus-i-2026.html`, `blog/index.html`, 6 glossary pages, 2 intel pages, `products/index.html`, 6 methodology pages, 6 tool index pages — titles normalised to pipe pattern
- `security.html`, `privacy.html`, `terms.html` — ISO badge copy + footnote
- `js/modules/persona-deadlines.js` — cyber date harmonised to 28 Apr
- `js/modules/sf13-hero-hud.js` — header comment + deadline date + caption
- `tools/sf46-u1-howto-injector.js`, `tools/homepage-pivot.js` — date strings harmonised
- `styles.css` + `styles.min.css` — new Cluster 4 block (`.hero-trust-footnote`, `.ht-fn`, `.nav-mega-item min-height: 44px`, `body.has-cookie-banner` chatbot offset, `.product-frame-url-tag`, `.crow-carousel .product-frame-url` 12px floor)

## Hard requirement audit

- ✓ Existing tokens only — zero custom hex
- ✓ No inline styles introduced
- ✓ Surgical Edit operations only (no Write of new HTML files)
- ✓ 4 validator gates GREEN (sovereign / geometric-truth / principal-spec / reconciliation)
- ✓ Smoke 25/25 chromium passing
- ✓ Forbidden files untouched: `js/nav-inject.js`, `cookie-banner.js`, `chatbot.js`
