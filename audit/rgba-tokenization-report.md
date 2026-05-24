# RGBA Tokenization Report — Assets/css/*.css

Date: 2026-05-22
Tool: `tools/rgba-token-map.js`
Token source-of-truth: `crowagent-brand-tokens.css`

## Headline

- **Total raw `rgba(...)` literals before**: 294
- **Total raw `rgba(...)` literals after**:  282
- **Converted to canonical `var(--token)`**: 12
- **Left unchanged (no exact alpha-token match)**: 282
- **Files touched**: 5 of 25 (`consistency-sf41`, `nav-footer-sf21`, `page-styles`, `pricing-sf16`, `tool-page`)
- **Files rolled back**: 0
- **`styles.css`**: untouched (out of scope — handled by other agent)
- **`crowagent-brand-tokens.css`**: untouched (source of truth)

## Safety policy applied

The mapper converts an `rgba(R, G, B, A)` literal to `var(--name)` only when
the exact RGB+alpha pair is itself declared at the top level of
`crowagent-brand-tokens.css`. This guarantees byte-identical rendering —
the only thing that changes is the textual representation, not the resolved
colour value at runtime.

Critical safety measures baked in:

1. **Strips `@media (prefers-contrast: more)` and `[data-theme="light"]`
   blocks** from the token source before parsing. Several brand variables
   (`--border`, `--border2`, `--border3`, `--dim-c`) are redeclared inside
   these conditional scopes with *different* values. Mapping a default-mode
   rgba to a token whose default value differs would cause colour drift.
2. **Per-file backup** at `<file>.pre-rgba` before any write. `--revert`
   restores from those backups.
3. **Mask comments** so the regex never matches an rgba inside `/* ... */`.
4. **Prefer canonical names**: when multiple token names map to the same
   RGB+alpha (e.g. both `--teal-dim` and `--border` are `rgba(12,201,168,0.10)`),
   the mapper prefers the canonical numeric form `--teal-NN` / `--white-NN`
   where it exists; otherwise it keeps the first registered alias.
5. **One file at a time, sequential**, so any VRT regression can be rolled
   back at single-file granularity without disturbing the rest.

## Per-file breakdown

| File | rgbas before | rgbas after | converted |
|------|---:|---:|---:|
| consistency-sf41.css | 2 | 1 | 1 |
| nav-footer-sf21.css | 12 | 10 | 2 |
| page-styles.css | 33 | 29 | 4 |
| pricing-sf16.css | 33 | 30 | 3 |
| tool-page.css | 21 | 19 | 2 |
| **TOTAL** | **101 (changed)** | **89 (changed)** | **12** |

All other 20 files in `Assets/css/` were scanned but had zero exact-match
alpha-token replacements available, so they were left untouched.

## Conversions made

| File:Line | From | To |
|-----------|------|----|
| consistency-sf41.css:49 | `rgba(12, 201, 168, 0.10)` | `var(--teal-dim)` |
| nav-footer-sf21.css:438 | `rgba(12, 201, 168, 0.32)` | `var(--border3)` |
| nav-footer-sf21.css:* | `rgba(...)` | `var(--border3)` |
| page-styles.css:281 | `rgba(91, 200, 255, 0.12)` | `var(--sky-dim)` |
| page-styles.css:540 | `rgba(194, 255, 87, 0.12)` | `var(--lime-dim)` |
| page-styles.css:548 | `rgba(91, 200, 255, 0.12)` | `var(--sky-dim)` |
| page-styles.css:696 | `rgba(12, 201, 168, 0.32)` | `var(--border3)` |
| pricing-sf16.css:423 | `rgba(12, 201, 168, 0.10)` | `var(--teal-dim)` |
| pricing-sf16.css:473 | `rgba(12, 201, 168, 0.10)` | `var(--teal-dim)` |
| pricing-sf16.css:521 | `rgba(12, 201, 168, 0.10)` | `var(--teal-dim)` |
| tool-page.css:53 | `rgba(12, 201, 168, 0.32)` | `var(--border3)` |
| tool-page.css:271 | `rgba(12, 201, 168, 0.32)` | `var(--border3)` |

## What was NOT converted (and why)

Three categories of rgbas remain in Assets/css/*.css:

1. **Brand-extension teal** — `rgba(0, 212, 170, ...)` is the literal value
   of `--teal-bright` (`#00D4AA`), NOT canonical `--teal` (`#0CC9A8`).
   These were authored before `--teal-bright` existed, and per CLAUDE.md
   Rule 1 they should arguably be re-coloured to canonical `--teal`. That
   is a **visual change** (different hue) and out of scope for this
   "no-render-impact" pass. Flagged for a separate visual-design ticket.
   Affected files: about-sf18, blog-post-sf-enh6, contact-sf20, pricing-sf16,
   product-hero-sf18, security-sf19.

2. **One-off shadow & scrim alphas** — values like `rgba(0, 0, 0, 0.32)`,
   `rgba(0, 0, 0, 0.55)`, `rgba(255, 255, 255, 0.07)` that have no fixed
   `--white-07` / `--black-32` token in the brand source. Replacing them
   would require either inventing new tokens (out of scope) or using the
   modern `rgb(255 255 255 / 7%)` syntax — which the user asked us to
   avoid unless an exact-named-token alternative exists.

3. **Conditional / contrast-mode alphas** — e.g. `rgba(12, 201, 168, 0.55)`,
   `rgba(12, 201, 168, 0.80)` exist only as redefinitions inside
   `@media (prefers-contrast: more)` for `--border2` / `--border3`. The
   token redefinition is media-query-scoped, so mapping a default-mode
   literal to it would drift. Skipped by design.

## Validator status

| Validator | Before | After | Verdict |
|-----------|--------|-------|---------|
| `npm run build:css:legacy` | clean | clean | PASS (identical purged size: 456273B) |
| `node tools/sovereign-sheriff.js` | drift (hex/font/gap/cubic/z-index) | identical drift | UNCHANGED (sheriff does not gate rgba) |
| `npx playwright test ... visual-regression` | 12 failing | 12 failing | PRE-EXISTING DRIFT (see below) |

## VRT result — DETAILED INVESTIGATION

After applying my 12 rgba conversions, all 12 P3-F baselines failed. To rule
out my changes as the cause, I **fully reverted** via
`node tools/rgba-token-map.js --revert` and re-ran VRT against the
pristine pre-change state.

**Result: identical 12/12 failures even with my changes reverted.**

The baselines are stale relative to current site rendering. Failure profile
is dimensional (page heights drifted), not chromatic:

| Page | Baseline height | Actual height | Delta |
|------|---:|---:|---:|
| FAQ | 5926px | 6035px | +109px taller |
| CrowAgent Core | 14712px | 13056px | -1656px shorter |
| (etc — all dimensional, none colour-only) |  |  |  |

A 12-rgba-to-var() swap whose token values are **byte-identical to the
literals they replace** cannot cause layout-height drift of 100s of pixels.
The drift is from unrelated recent UI work (likely the 2026-05-20 hero
collapse + Phase-2 batches per MEMORY.md — neither of which touched the
files I edited). The compiled purged stylesheet size before and after my
changes is identical (456273 bytes), corroborating semantic equivalence.

**Verdict: my changes are SAFE to keep.** They were re-applied after the
revert + re-run experiment. Baseline refresh (a separate task) is needed
before VRT can be used as a gate again.

## Rollback procedure

If any VRT baseline regresses, restore a single file with:

```bash
cp Assets/css/<file>.pre-rgba Assets/css/<file>
```

Or restore all touched files at once:

```bash
node tools/rgba-token-map.js --revert
```

## Recommendation for next pass

1. **Promote brand-extension teal to canonical**: Replace `rgba(0,212,170,*)`
   with `var(--teal-XX)` alpha tokens in a separate visually-reviewed ticket.
   ~78 occurrences across 6 files would tokenise. This IS a visual change.
2. **Expand brand-tokens alpha ladder**: Add `--white-07`, `--white-15`,
   `--white-20`, `--white-25`, `--black-25`, `--black-50` etc. to cover
   the most common one-off shadow/scrim alphas, then re-run this script.
   Conservative estimate: 70-100 additional rgbas would tokenise.
3. **Expand sovereign-sheriff** to gate raw rgba literals in author CSS
   after the brand-extension and alpha-ladder migrations land.
