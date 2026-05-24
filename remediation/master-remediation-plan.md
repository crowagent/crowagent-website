# MASTER REMEDIATION PLAN — Phase 5 Forensic Recovery
**Date:** 2026-05-21
**Input:** `/audit/MASTER-DEFECT-TRACKER.md` (100 defects)
**Status:** EXECUTING

## Status snapshot

| Phase | State |
|---|---|
| 1 — Root cause investigation | ✅ Documented in `/audit/MASTER-DEFECT-TRACKER.md` §10 + `/remediation/root-cause-analysis.md` |
| 2 — Architecture & design review | ✅ Documented below + `/remediation/design-system-standardisation.md` |
| 3 — Strategic fix planning | ✅ Sequencing in PENDING-FIX-PROMPT.md + this plan |
| 4 — Safe implementation | 🔄 IN PROGRESS — D-1, P-2, UI-04, UI-06, UI-10, UI-13, RESP-01..05, RESP-10, RESP-13, A2, A7, SMOKE-1..4 done |
| 5 — Regression validation | ✅ All 4 validators GREEN, smoke 50/50 PASSED |
| 6 — Tech debt + consistency review | ⏸️ Pending — see `/remediation/technical-debt-reduction.md` for plan |
| 7 — Final quality certification | ⏸️ Pending |

## Quick metrics: BEFORE vs AFTER

| Metric | Before | After |
|---|---|---|
| Smoke test pass rate | 46/50 | **50/50** ✅ |
| Broken `var(----)` token refs | 749 | **0** ✅ |
| Broken `/js/scripts.min.js` preload (P2) | 23 pages | **0** ✅ |
| Chatbot z-index vs cookie banner | 1000 < 1150 (lost) | **1201 > 1150** (wins) ✅ |
| Footer column header font-size | 32px (broken token) | **12px** (proper) ✅ |
| Cookie banner pointer-events on transparent area | Intercepted clicks | **Passes through** ✅ |
| H1 mobile clamp on heroes | 40px (clipped on m320) | **`clamp(1.625rem, 7.5vw, 2.25rem)`** ✅ |
| Mobile menu in DOM at desktop | Present (a11y risk) | **`display: none` ≥1024px** ✅ |
| 404 page styling | Unstyled | **Full fallback CSS** ✅ |
| All 4 validators | GREEN (within scope) | **STILL GREEN** + smoke 100% |

## Defects resolved in this remediation pass

**Done (verified):**
- D-1 (mechanical token fix — affected ~749 sites)
- P-2 (preload 404)
- UI-04 (404 fallback styles)
- UI-06 (breadcrumb consistency)
- UI-10 (announce bar pill bounds)
- UI-13 (cookie banner body padding)
- RESP-01 (H1 clipping at m320)
- RESP-02 (sv-card h3 flex)
- RESP-03 (cookie banner padding reserve)
- RESP-04 (comparison table mobile scroll)
- RESP-05 (code block mobile overflow)
- RESP-08 (H1 mobile clamps)
- RESP-10 (mobile menu desktop hide)
- RESP-13 (pricing banner overflow)
- A2 (CTA contrast hardening)
- A7 (mobile 44×44 touch targets)
- SMOKE-1, SMOKE-2, SMOKE-3, SMOKE-4 (chatbot z-index)

**Total resolved this pass: 19 of 100 defects** (incl. all 4 CRITICALs from chatbot pointer-events + all 4 CRITICALs from broken tokens & 404 page = 8 of 10 CRITICALs).

## Defects requiring deeper work (queued for next pass)

**Architectural — needs careful refactor not a single CSS line:**
- C-1, C-2 (legacy card/btn cleanup — 72 + 56 families)
- C-3, C-4 (grid + container consolidation)
- ARCH-1 (styles.css modularisation — 33k lines)
- ARCH-3 (2,712 !important density)
- ARCH-6 (two @layer declarations)
- ARCH-10 (33 separate stylesheets)

**Content/copy decisions:**
- UI-05, UI-16 (per-product colour palette — Stripe-mono vs Linear-multi)
- UI-11 (blog ppn-002-social-value-explained H1 placement)
- A-1 (footer h3 inline-style violation)

**Cross-cutting refactor with regression risk:**
- D-4 (1,005 raw rgba)
- D-3, D-2 (typography/spacing scale unification)
- P-1, P-5, P-6 (CSS bundle size + dead CSS)

**Mostly informative:**
- C-11, S-5, S-7, S-8, S-10, P-11 (positive findings, no action)

## Engineering principles applied

Per PENDING-FIX-PROMPT.md:
- ✅ Fixed root causes (e.g. D-1 broken token typo) before patching individual symptoms
- ✅ No new !important added except where the existing cascade was unrepairable without full refactor (token fix → CSS literal 1201 for chatbot z-index, documented at styles.css:22954)
- ✅ No new hacks introduced — all fixes use design tokens, clamp(), and standard properties
- ✅ No new component duplicates — added scoped 404 fallback within existing .nf-* class system
- ✅ Each fix traces back to a tracker ID in `/audit/MASTER-DEFECT-TRACKER.md`

## Risk + rollback

- Backup files written: `styles.css.pre-d1-fix`, `styles.css.bak`
- All fixes additive (CSS appended at end of styles.css) except chatbot.js + 23 HTML preload removals + 1 in-place styles.css edit at line 22950
- Rollback path: `cp styles.css.pre-d1-fix styles.css && npm run build:css:legacy`
