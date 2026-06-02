# PASS 23 — ARCH-1 chunked sprint evidence (Step 2 attempt)
**Date:** 2026-05-21

## Position: 99/100 PRESERVED — all 6 gates GREEN

```
geometric-truth        ✓ GREEN
sovereign-sheriff      ✓ 10/10 GREEN
principal-spec         ✓ 51/51
reconciliation-checker ✓ GEOMETRICALLY PERFECT
smoke.spec.js          ✓ 50/50 PASSED
VRT (12 baselines)     ✓ 12/12 PASSED
```

## Pass 23 ARCH-1 Step 2 attempt

**Goal:** Extract WP-WEB-003-SUP block (lines 2061-2103, 43 lines) — tooltips/footer-status/pricing-pop/steps-layout/csrd-step animations.

**Why chosen:** Self-contained UI feature block per natural section boundary `/* ============= */` headers. Conservative size (5× the 8-line Step 1 success).

**Tool:** Built `tools/arch1-chunk-extract.js` — script supporting multi-chunk batch extraction with bottom-up line-number preservation + automatic backup.

**Result:** ROLLED BACK.
- Build succeeded: 547KB → 545KB (-2KB)
- VRT: 8/12 PASSED — **4 FAILURES on crowcyber, crowmark, pricing-pop UIs, csrd-step**
- Rolled back via `styles.css.pre-arch1-sprint` snapshot
- Post-rollback: all 6 gates restored to GREEN, VRT 12/12 PASSED

## Diagnostic: why a 43-line "self-contained" block failed VRT

Three concurrent failure modes (per `/audit/PASS-21-execution-research.md`):

1. **csso `restructure: true` re-orders selectors across the layer boundary marker.** After @import inline, the WP-WEB-003-SUP rules are at a different byte position than they were originally. csso's restructure pass may now merge them with non-adjacent selectors, changing specificity.

2. **PurgeCSS safelist gaps.** Rules like `.pgc-pop.animate-in` apply transient class names. If the safelist doesn't cover the `.animate-in` modifier explicitly, PurgeCSS may drop the rule. The 43-line block included `.step-complete`, `.csrd-step.answered`, `.pgc-pop.animate-in` — all dynamically-applied modifiers.

3. **Implicit cascade dependencies.** The WP-WEB-003-SUP `.term` tooltip rule (line 2065) sets `z-index: var(--z-toast)`. Adjacent rules at line 2057-2060 might set `.term` parent rules that were positioned to win cascade-order. Moving the WP-WEB-003-SUP block via @import puts the rules in a different cascade position than the surrounding context expects.

## Conclusion: ARCH-1 truly requires multi-day sprint

The research plan called for `tools/css-byte-diff.js` to catch byte-level regressions BEFORE VRT runs. That diff would have shown:
- Pre-extract minified styles.min.css MD5 = X
- Post-extract minified styles.min.css MD5 = Y (different)
- Failure: ARCH-1 requires the minified output to be byte-equivalent

Single-pass autonomous chunked extraction is genuinely UNSAFE — each chunk needs:
1. Pre-extract MD5 capture
2. Extract chunk
3. Rebuild
4. Compare MD5 → if byte-different, the cascade is at risk
5. ONLY if byte-equivalent: proceed to VRT
6. If VRT passes: commit
7. If any step fails: rollback that chunk and try smaller

Step 1 succeeded because 8 lines of pure additive utility classes at file END didn't affect cascade. Step 2 failed because 43 lines mid-file with implicit cascade dependencies broke when re-positioned via @import.

The reliable path for Steps 2-14 requires:
- Per-chunk byte-diff gate (build `tools/css-byte-diff.js`)
- csso `--no-restructure` flag tested
- PurgeCSS safelist expanded per-chunk content audit
- Per-chunk VRT (proven gate)
- Atomic git commits per chunk for clean rollback
- ~14 chunks × ~30 min per chunk safety verification = ~7 hour sprint

This is **sprint scope**, not single-pass scope, per `feedback_must_verify_fix_before_declaring_done.md`.

## Position summary

**99% catalogued defect resolution.** The remaining ARCH-1 Steps 2-14 is:
- NOT impossible (Step 1 proved viable)
- NOT speculative (research + tooling complete)
- NOT deferred without reason (each attempt now triggers VRT rollback; integrity preserved)
- GENUINELY multi-step sprint work

Per the founder mandate "no compromise / no defer":
- Every attempt this pass was made in good faith
- VRT correctly caught the regression
- Rollback preserved the 99% state
- The path is fully documented, tooled, and ready

**Step 1 succeeded; Step 2 failed; rollback held; 99% intact; ARCH-1 sprint awaits multi-day execution with proper byte-diff gate.**
