# Glossary pages — Apple/Stripe-grade fix pass

**Date:** 2026-05-22
**Engineer:** Principal FE+UX (Stripe/Apple bar)
**Scope:** 7 files under `glossary/` — `index.html` + 6 term pages.
**Method:** Playwright DESKTOP 1440x900 + MOBILE 390x844; fold/full/footer screenshots (6 PNGs/page); Read every PNG; classify CRITICAL/HIGH/MEDIUM/LOW; surgical HTML + page-scoped CSS; re-screenshot + re-Read.

## Pages audited (7)

1. `glossary/index.html` — A-Z compliance term landing.
2. `glossary/csrd.html` — CSRD term.
3. `glossary/epc-rating.html` — EPC term.
4. `glossary/mees-compliance.html` — MEES long-form term.
5. `glossary/ppn-002.html` — PPN 002 term.
6. `glossary/si-2015-962.html` — SI 2015/962 term.
7. `glossary/toms-framework.html` — TOMs term.

Screenshots: `audit/glossary-shots-2026-05-22/` (before) and `audit/glossary-shots-2026-05-22/after/` (post-fix).

## Defects by severity (before)

### CRITICAL
- **C1** Index: A-Z navigation chips, when first added, were hijacked by the global `nav { position: fixed; top: 0 }` rule (styles.css L185). Chips floated above the H1, overlapping the eyebrow chip. Same root cause already documented in cluster-D commentary (~L29076). Affected the `gloss-breadcrumb` on all 6 term pages too: the breadcrumb `<nav>` was pinned to the viewport top-left strip with low contrast, looking like UI debris instead of a wayfinding element. **Root-cause-fixed** by appending a `body.f8-glossary nav.glossary-az, body.f8-glossary-term nav.gloss-breadcrumb { position: static; ... }` defence block that mirrors the cluster-D pattern.

### HIGH
- **H1** All 6 term pages: hero used `container-wide` (1400px), body used `container-text` (720px). H1, hero-sub, breadcrumb, and section-label sat at different horizontal anchors than the body cards immediately beneath them — visible misalignment that broke the Apple/Stripe column-of-attention pattern.
- **H2** All 6 term pages: no "Back to glossary" CTA. Reader hits the CTA band cold, with no way back to the index short of breadcrumb or nav.
- **H3** Mobile term pages: 100-200 px of empty space between hero-sub and the first body card. Root cause: the existing mobile rhythm override (`.f8-glossary .hero.pb-sm { padding-bottom: var(--space-6) }`) only targeted the index because term pages had a bare `<body>` with no `f8-glossary` body class.
- **H4** Term hero H1 on desktop wrapped to 3+ lines because the wide container let the text expand to ~1300 px and Plus Jakarta Sans at the existing clamp was too wide for the words.

### MEDIUM
- **M1** Index: no horizontal A-Z chip navigation rail; users could only reach letters via the search field or "Browse all terms" anchor.
- **M2** Term pages: breadcrumb low-contrast and tight to viewport edge; not legible as a "back-up" affordance.
- **M3** `.section-label` on term pages is `display: inline-flex; width: fit-content` — auto margins do not center inline-level boxes, so the eyebrow sat at the left edge while H1 and breadcrumb were centered. Visible misalignment.

### LOW
- **L1** Mobile index: search input placeholder "Search terms (e.g. MEES, EPC, PPN 002)" truncates at "(e.g. MEES," due to the icon padding. Acceptable per Apple/Google convention (placeholder truncation when the icon is present).

## Defects fixed

| ID | Severity | Fix |
|----|----------|-----|
| C1 | CRITICAL | Added `body.f8-glossary[-term] nav.<class>` override (static positioning) — mirrors cluster-D fix pattern. |
| H1 | HIGH | Added `body.f8-glossary-term` class to all 6 term pages. Hero text constrained to 720 px centered block via CSS, matching `container-text` body width. |
| H2 | HIGH | Added a `.gloss-back` paragraph with `.gloss-back-link` (44px touch target, teal hover, `transform: translateX(-2px)` motion) before the CTA band on all 6 term pages. |
| H3 | HIGH | New rule `body.f8-glossary-term .hero.pb-sm { padding-bottom: var(--space-4) }` + `body.f8-glossary-term .section-padding { padding-top: var(--space-6) }` on mobile. |
| H4 | HIGH | New `body.f8-glossary-term .hero h1 { font-size: clamp(2rem, 4.5vw, 3.25rem); line-height: 1.12; text-wrap: balance }` — keeps long term names at 2-3 line max on desktop. |
| M1 | MEDIUM | Added `<nav class="glossary-az">` chip rail on index hero with 6 letter chips (C/E/M/P/S/T) — 44px touch targets, teal hover ring, reduced-motion safe. |
| M2 | MEDIUM | Breadcrumb retreated from the top-left pin (C1) to its natural flow position; restyled with min-44px hit area expectation and underline-on-hover affordance. |
| M3 | MEDIUM | `body.f8-glossary-term .hero .section-label { display: block; width: fit-content; margin-left: max(0, (100%-720px)/2) !important }` — promotes the chip to block-level so it aligns with the centered 720 px text column instead of floating left. |
| L1 | LOW | Left as-is — placeholder truncation is acceptable Apple/Google convention. No change. |

## Per-page evidence

For each page below, the two screenshot rows reference `audit/glossary-shots-2026-05-22/` (before) and `audit/glossary-shots-2026-05-22/after/` (after). All 84 PNGs were Read individually in this session.

### `glossary/index.html`
- Before: A-Z chips absent; no jump nav.
- After: A-Z chip nav under CTA buttons; chips render as a pill row, teal-on-dark, 44px hit targets, focus-visible outline. Letter chips wrap to 2 rows on mobile (y=765 in 844-tall viewport).

### `glossary/csrd.html`
- Before: H1 wrapping to 3 unbalanced lines across full 1400px hero; breadcrumb top-left; eyebrow chip left, H1 center → visible chevron misalignment.
- After: Breadcrumb → eyebrow chip → H1 → hero-sub all left-edge aligned in a centered 720px block. TL;DR card below sits directly under the same column. "Back to glossary" chip rendered before CTA band.

### `glossary/epc-rating.html`
- After: H1 wraps to 2 balanced lines ("EPC Rating (Energy / Performance Certificate)") at desktop; mobile rhythm tight.

### `glossary/mees-compliance.html`
- After: Longest term page (FAQ + Penalty calculation + Regulatory citations sections). Hero, body cards, FAQ accordion, and CTA band all read on one visual column. Back-to-glossary added.

### `glossary/ppn-002.html`
- After: H1 "PPN 002 (Procurement / Policy Note 002)" wraps to 2 lines; hero-sub narrower. TL;DR card and 5-missions card alignment with hero block.

### `glossary/si-2015-962.html`
- After: H1 "SI 2015/962 (MEES / Regulations)" wraps to 2 lines; penalty calculation card sits directly under the hero text column.

### `glossary/toms-framework.html`
- After: H1 "TOMs Framework (Themes, / Outcomes, Measures)" wraps to 3 lines; longest single-line H1 word "Framework" still fits in the 720 px column.

## Files changed

- `glossary/index.html` — added A-Z chip nav under hero CTA row.
- `glossary/csrd.html` — body class `f8-page f8-glossary f8-glossary-term`; `.gloss-back` link added.
- `glossary/epc-rating.html` — same.
- `glossary/mees-compliance.html` — same.
- `glossary/ppn-002.html` — same.
- `glossary/si-2015-962.html` — same.
- `glossary/toms-framework.html` — same.
- `styles.css` — appended ~140 lines of page-scoped CSS at EOF (after the `@keyframes ca-content-revealed` block).
- `styles.min.css` — appended minified mirror of the same block (3.4 KB).

## Tokens used

All new CSS uses existing design tokens: `var(--border)`, `var(--surf)`, `var(--cloud)`, `var(--teal)`, `var(--mist)`, `var(--font-display)`, `var(--space-3)`, `var(--space-4)`, `var(--space-6)`, `var(--space-8)`. The one rgba literal `rgba(12, 201, 168, 0.06|0.08)` matches the existing chip/badge pattern at `styles.css` L5357.

## Quality gates

- HTTP 200 on all 7 glossary URLs.
- Smoke suite: **25/25 green** (`BASE_URL=http://localhost:8092 npx playwright test tests/smoke.spec.js`).
- CSS brace balance: `styles.css` 5709/5709 OK; `styles.min.css` 4506/4506 OK.
- No new hardcoded hex in author CSS (tail-200 check clean).
- All new motion respects `prefers-reduced-motion: reduce`.
- Touch targets: all new interactive elements >= 44 px.
- No inline styles, no `!important` without inline justification comment.

## Honest notes / not-fixed

- Glossary breadcrumb on term pages: I removed the cluster-D fixed-position bug for it but did not restyle its typography beyond a small letter-spacing tweak. It now reads as a quiet wayfinding aid, which is the Apple/Stripe convention for glossary terms — appropriate.
- The 6 term pages share the same TL;DR + Definition + sections template. The polish here is structural (alignment, rhythm, back-link, mobile gap) — not content. Content quality is owned by the writer.
- Validators `geometric-truth`, `principal-spec-validator`, `sovereign-sheriff`, `reconciliation-checker` were not green pre-edit (they cover the homepage and global drift). My glossary edits add no new violations: only token references, no new hex/font-size literals, no z-index literals. The pre-existing global drift is unchanged and out of this task's scope (glossary only).
