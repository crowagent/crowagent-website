# Phase 2 Gate 2 v2 — Compromise Audit

Per founder directive: *"make sure nothing compromised"*. This document scans every Phase 1 + Phase 2 batch + extension for any silent skip, weakened test, undocumented deferral, or quality compromise.

## TL;DR

**Zero silent compromises found.** All decisions documented + traceable. 2 minor items flagged as honest acknowledgements (not compromises):
1. **P2-H visual motion cuts** explicitly deferred to founder homepage-finishing pass (technical a11y fix shipped)
2. **4 image-manifest entries** flagged PENDING_VERIFICATION for founder reverse-image-search (manifest tracking complete)

## Test fleet integrity

| Audit | Finding | Verdict |
|---|---|---|
| Unconditional `test.skip()` calls | 10 found across step12/14/15 specs — ALL conditional (`if (!element) test.skip(...)`) — they only skip when targeted element isn't on that page | ✓ legitimate conditional |
| Tests reported as "skipped" in regression | 2 (locale-dropdown on `/`, scroll-progress on `/`) — both because homepage doesn't render those elements | ✓ legitimate |
| Weakened expect() thresholds | Audited every probe — only P2-E touch-target uses a per-page ≤5 threshold (WCAG 2.5.5 has inline-link + equivalent-control exceptions). Actual count after final fixes: **2 total** across 10 pages, well under threshold | ✓ legitimate, not weakened |
| `@ts-ignore` / `eslint-disable` introduced | Zero | ✓ |
| Empty `catch {}` blocks introduced | Zero | ✓ |

## Touch-target violation real-count audit

After P2-E + P2-E v2 fixes, the surviving 2 violations across 10 archetype pages:
1. `status.crowagent.ai` (inline in `<span class="trust-note">`) — WCAG 2.5.5 inline-text exception applies
2. `hello@crowagent.ai` (inline mailto in flow `<div>`) — WCAG 2.5.5 inline-text exception applies

**Real WCAG 2.5.5 compliance progressed from ~80 violations → 2 inline-link exceptions.** No fake fix; no test loosening.

## Documented deferrals — every item has a phase home

### Phase 3 (Polish) — was previously Phase 4 / SF47, dissolved per D-3

| ID | Item | Was | Now |
|---|---|---|---|
| P3-A | Cinematic reveal (`.sf17-reveal` blur+scale+translate) | P3 | P3 |
| P3-B | Multi-layer edge-light specular borders | P3 | P3 |
| P3-C | `@property` declarations for animatable customs | P3 | P3 |
| P3-D | CSS `@layer base, overrides;` adoption | P4 | **P3** (D-3 promotion) |
| P3-E | Retire 7 rescue files → 0 | P4 | **P3** (D-3 promotion) |
| P3-F | Visual regression baselines (Percy/Argos) | P4 | **P3** (D-3 promotion) |
| P3-G | Cross-browser tests (Firefox + WebKit) | SF47 | **P3** (D-3 promotion) |
| P3-H | Critical-CSS extraction | SF47 | **P3** (D-3 promotion) |
| P3-I | `brand-tokens.css` minification | SF47 | **P3** (D-3 promotion) |

**Phase 4 = empty. SF47 = empty.** Per D-3, no parking lots remain.

### Phase 2 — every gap closed in this session

| Batch | Status |
|---|---|
| P2-A typography modular scale | ✓ shipped + probe 7/7 |
| P2-B sentence case audit | ✓ shipped + probe 5/5 |
| P2-C canonical components rollout | ✓ shipped + probe 5/5 |
| P2-D image provenance audit | ✓ shipped + probe 3/3 |
| P2-E reduced-motion + touch-target | ✓ shipped + probe 20/20 |
| P2-F font preload + self-hosted WOFF2 | ✓ shipped + probe 19/19 |
| P2-G `:root` radius consolidation | ✓ shipped |
| **R1** Container max-width ladder | ✓ shipped + probe 5/5 (added in Phase 2 v2 extension) |
| **R2** Prose `measure` (70ch) | ✓ shipped + probe 2/2 |
| **R3** `scroll-margin-top` anchor token | ✓ shipped + probe 3/3 — **fixed a shipped a11y bug** |
| **R4** Form-field rhythm tokens | ✓ shipped + probe 3/3 |
| **R5** M3 typography role coverage | ✓ shipped + probe 6/6 |
| **R6** font-variation + smoothing baseline | ✓ shipped + probe 3/3 |
| **R7** Figure + aspect-ratio rhythm | ✓ shipped + probe 2/2 |
| **P2-H** Hero a11y matchMedia gate | ✓ shipped + probe 3/3 — **fixed a shipped a11y bug** |

## Honest acknowledgements (NOT compromises — documented + traceable)

### A1: P2-H visual motion reduction — deferred to homepage-finishing scope

**What was done in P2-H:**
- A11y bug fix: `prefers-reduced-motion` toggle now dynamically disables earth motion via `gsap.matchMedia()` API (was static one-shot check)
- Audit document: `PHASE2-P2H-HERO-DISCIPLINE-2026-05-19.md` capturing every recommendation

**What was NOT done:**
- Visual cuts to the 9 simultaneous hero motions (descend keyframe, drift loop, orbit badges, SVG pulse, two HUD panels)

**Why deferred — not a compromise:**
- Hero is a paused-pending-founder-finishing surface (`SESSION-RESUME-2026-05-17-FINISHING-HOMEPAGE.md`) with a founder-approved 12-bullet plan that includes its own motion choices.
- Unilaterally reducing the visible hero motion would conflict with founder's homepage-finishing scope and risk regression.
- The technical a11y bug IS fixed. The visual motion-reduction recommendation is captured for founder review during the homepage finishing pass.

**Traceability:** `PHASE2-P2H-HERO-DISCIPLINE-2026-05-19.md` §"For founder review" + `audit-results/SF46-P2-HERO-EARTH-AUDIT-2026-05-19.md` §5.

### A2: 4 image-manifest entries with PENDING_VERIFICATION sentinel

**What was done:**
- All 28 photos in `Assets/photos/` are now in `_manifest.json` (was 8 of 28)
- 18 entries have full Unsplash attribution
- 4 entries (`hero-london-uk-compliance`, `faq-multi-person-team`, `partners-document-review`, `partners-team-collaboration`) carry a `PENDING_VERIFICATION` sentinel + descriptive note
- Hero earth photos (NASA Visible Earth) covered by audit doc as public domain

**Why this is not a compromise:**
- Gap is now 100% TRACKED — every photo has a manifest entry; no orphans
- `PENDING_VERIFICATION` is an explicit founder-action marker, not a silent omission
- P2-D probe (`tests/sf46-p2d-image-manifest.spec.js`) ENFORCES traceability — any future photo added without manifest entry breaks CI

**Traceability:** `Assets/photos/_manifest.json` + `IMAGE-PROVENANCE-AUDIT-2026-05-18.md` + probe spec.

## What "zero compromise" means and how we measured it

| Compromise type | Verified absent |
|---|---|
| Silently skipped tests | ✓ all 2 skips are conditional + documented |
| Tests with loosened expectations | ✓ P2-E threshold = WCAG-compliant exception, real count 2 (under threshold of 5) |
| Removed or weakened assertions | ✓ probe assertions strengthened (P2-D enforces traceability; P2-H asserts matchMedia signature) |
| Undocumented deferrals | ✓ every deferral has a phase ID + audit-doc entry |
| Workarounds parked indefinitely | ✓ Phase 4 + SF47 dissolved per D-3 |
| Visual regressions allowed to pass | ✓ no visual cuts made unilaterally on paused surfaces |
| Pending action items lost | ✓ PENDING_VERIFICATION sentinels surface in audit + CI |

## Final state

- **13 probe spec files** (was 9 before this extension)
- **~153 Playwright tests** total (+35 in Phase 2 v2 extension)
- **0 brace mismatches** across 35 CSS files
- **2 conditional skips** (locale-dropdown / scroll-progress on homepage)
- **0 failures**
- **0 `@ts-ignore` / `eslint-disable` / empty-catch introduced**
- **2 touch-target violations remaining** — both true WCAG 2.5.5 inline-text exceptions

Gate 2 v2 READY. Nothing compromised.
