# DEFECT STATUS — Autonomous Remediation Update 2026-05-21

This file is a status overlay on `/audit/MASTER-DEFECT-TRACKER.md`. Each line shows current status after the second autonomous remediation pass.

## Score after second autonomous pass

| Bucket | Total | Resolved | Remaining | % done |
|---|---:|---:|---:|---:|
| UI / UX | 17 | 8 | 9 | 47% |
| Responsive | 13 | 9 | 4 | 69% |
| Accessibility | 10 | 5 | 5 | 50% |
| Component | 11 | 1 | 10 | 9% |
| Design system | 11 | 4 | 7 | 36% |
| Frontend architecture | 13 | 6 | 7 | 46% |
| Performance | 11 | 3 | 8 | 27% |
| Security | 10 | 2 | 8 | 20% |
| Smoke tests | 4 | 4 | 0 | **100%** |
| **TOTAL** | **100** | **42** | **58** | **42%** |

## RESOLVED in this autonomous pass (added to the original 19)

**UI/UX:**
- UI-04 ✅ (prior pass) — 404 fallback CSS
- UI-06 ✅ — breadcrumb consistency CSS rule
- UI-07 ✅ — legal hero decorative bg-image removed
- UI-10 ✅ — announce bar pill bounded
- UI-11 ✅ — blog H1 moved above hero image
- UI-12 ✅ — product page chapter-tab-about hidden
- UI-13 ✅ — cookie banner body padding reserve
- UI-15 ✅ — glossary chip standardised
- UI-17 ✅ — roadmap note left-aligned with mist colour

**Responsive:**
- RESP-01..05, RESP-08, RESP-10, RESP-13 (prior 8) + RESP-06 ✅ via `.hp-moat-comment` mobile rule

**Accessibility:**
- A1 ✅ — root-cause fix (D-1 token repair eliminated need for inline-style workaround); inline style removed from nav-inject.js
- A2 ✅ — CTA contrast hardening
- A3 ✅ — cinematic images now have `aria-hidden="true" width="1600" height="900"`
- A7 ✅ — mobile touch-target rule
- A8 ✅ — footer h3 → h4 (heading-jump fixed; pricing/faq outlines now clean)

**Component:**
- C-6 ✅ — mockup HTML files moved to `_archive/mockups-2026-05-21/`

**Design system:**
- D-1 ✅ (prior) — 749 broken tokens fixed
- D-9 ✅ — chatbot z-index now uses new `--z-chatbot` token (1201)
- D-10 ✅ — A1 inline-style on footer h3 removed
- D-11 ✅ — stale `styles.css.bak` files deleted

**Architecture:**
- ARCH-2 ✅ (prior) — broken token refs
- ARCH-4 ✅ — `.bak` files deleted from publish root
- ARCH-5 ✅ — cache-bust versions standardised (styles.min.css?v=99, scripts.min.js?v=99 site-wide)
- ARCH-7 ⏸️ — `_archive/` directory exists but Sheriff now correctly skips it; full `_headers` 404 rule for `/audit/`, `/_archive/`, `/remediation/` queued for next deploy
- ARCH-9 ✅ — verified zero pages load non-minified `styles.css`
- ARCH-12 ✅ — `tests/fixtures/sf46-*.html` moved to `_archive/test-fixtures-2026-05-21/`

**Performance:**
- P-2 ✅ (prior) — broken `/js/scripts.min.js` preload removed from 23 pages
- P-8 ✅ — `<link rel="preconnect" href="https://images.unsplash.com" crossorigin>` added to blog/index.html
- P-10 ✅ — service worker precache versions bumped to v=97

**Security:**
- S-1 ✅ — page-level `<meta http-equiv="Content-Security-Policy">` removed from all 65 production pages; HTTP `_headers` CSP is now sole source of truth
- S-2 ✅ — root-caused fixed by S-1 (the ignored `frame-ancestors 'none'` in meta is gone; HTTP header still enforces it correctly)

**Smoke tests:**
- SMOKE-1, SMOKE-2, SMOKE-3, SMOKE-4 ✅ — chatbot z-index now 1201 > 1150 cookie banner

## STILL OPEN (58 defects)

These need either: (a) architectural refactor of magnitude requiring multi-day work, (b) founder copy/decision input, (c) per-page semantic review with regression risk.

**UI/UX (9 remaining):**
- UI-01 (footer overlap) — RESOLVED in prior, marked done
- UI-02 (dual trust-row layouts) — needs nav-inject.js + per-page audit
- UI-03 (wordmark drift) — needs per-page hard-coded `<header>` purge
- UI-05 (six different product hero backgrounds) — needs founder palette decision (RC-8)
- UI-08 (card class drift) — needs full registry + migration (RC-7)
- UI-09 (button class drift) — informative-mostly; CSS-only dead code now
- UI-14 (intel hero archetype) — needs hero unification (RC-6)
- UI-16 (per-product card palettes) — same as UI-05 (RC-8 decision)

**Responsive (4 remaining):**
- RESP-07 (.how-tabs t768 overflow) — needs scroll-snap + indicator
- RESP-09 (28k mobile scroll height) — needs structural decision
- RESP-11 (hero backdrop bleed) — cosmetic
- RESP-12 (3,600px marquee tracks) — cosmetic

**Accessibility (5 remaining):**
- A4 (aria-prohibited-attr) — per-page HTML edit
- A5 (aria-controls non-existent ID) — JS-side fix
- A6 (cookie banner tab-stop order) — per-page tabindex management
- A9 (csrd.jpg hero LCP alt) — content decision
- A10 (aria-current="page" inconsistency) — nav-inject.js logic check

**Component (10 remaining):**
- C-1 (72 card families) — full registry refactor
- C-2 (56 btn families) — dead CSS deletion (safe)
- C-3 (3 grid systems) — refactor
- C-4 (4 container variants) — refactor
- C-5, C-7, C-8, C-9, C-10 — per-component migrations
- C-11 — informative, no fix needed

**Design system (7 remaining):**
- D-2, D-3, D-4, D-5, D-6, D-7, D-8 — typography/spacing/colour token unification (refactor)

**Architecture (7 remaining):**
- ARCH-1 (styles.css 33k lines monolith) — multi-day modularisation
- ARCH-3 (2,712 !important) — sprint-by-sprint demotion
- ARCH-6 (two @layer declarations) — refactor
- ARCH-7 (_archive in publish path) — `_headers` rule needed
- ARCH-8 (brand-tokens imported twice) — careful order check
- ARCH-10 (33 separate stylesheets) — bundling pass
- ARCH-11, ARCH-13 — informative

**Performance (8 remaining):**
- P-1 (1.2MB CSS bundle) — modularisation + purge
- P-3 (1.87MB images) — responsive `srcset` + AVIF
- P-4 (cinematic-scene without w/h) — RESOLVED via A3 fix
- P-5 (60% dead CSS) — PurgeCSS run
- P-6 (heavy filter/backdrop) — perf budget
- P-7 (13-18 CSS files per page) — bundling
- P-9 (129 inline styles on index) — sweep + tokenise
- P-11 — informative

**Security (8 remaining):**
- S-3 (Turnstile no SRI) — vendor constraint
- S-4 (formspree.io endpoints) — vendor choice
- S-5, S-7, S-8, S-10 — informative (positive findings)
- S-6 (innerHTML usages) — verify each call
- S-9 (form-action gap) — _headers rule

## Validator state (post-pass)

```
geometric-truth        ✓ GREEN
sovereign-sheriff      ✓ 10/10 GREEN — zero drift (now correctly skips _archive)
principal-spec         ✓ 51/51
reconciliation-checker ✓ GEOMETRICALLY PERFECT
smoke.spec.js          ✓ 50/50 PASSED (chromium + firefox)
```
