# Design System Violations — Forensic Audit

**Date:** 2026-05-21
**Scope:** `crowagent-website/styles.css` (33,027 lines), `Assets/css/*.css` (32 files, ~13,582 lines), `crowagent-brand-tokens.css` (939 lines)
**Mode:** READ-ONLY. No code changes.
**Auditor stance:** No compromise. Findings are evidence-led.

The Sovereign Design System (`crowagent-brand-tokens.css` + `Assets/css/sovereign-primitives.css`) is technically present and rigorously defined: 50+ named typography, spacing, colour, motion and z-index tokens; @layer cascade; modular scale. Adoption inside HTML is good. But the underlying CSS is contaminated by legacy code that **violates the system silently**, plus a single bug class that is so large it must be treated as the #1 defect of the entire CSS layer.

---

## Finding D-1 — CRITICAL — 749 broken CSS custom-property references (`var(----…)`, four hyphens)
**Category:** Token Usage
**Severity:** P0
**Evidence:** `grep -hE "var\(----" styles.css | wc -l` → **749** occurrences. Distinct broken names:
`var(----font-size-2xl|2xs|4xl|base|base-plus|body-tight|lg|md|md-plus|sm|xl|xs`. Sample at `styles.css:88`, `:246`, `:247`, `:249`, `:311`, `:324`, `:325`, `:329`, `:334`, …
The CSS custom-property syntax is `var(--name)`. `var(----name)` references a property literally named `--name` with a leading double hyphen, which is **never defined anywhere in the codebase** (search `grep "\-\-\-\-font-size"` against `crowagent-brand-tokens.css` and `styles.css` returns zero definitions; only the broken usages).
Outcome: 749 `font-size` declarations evaluate to `unset` and inherit from the parent at runtime. Most of `.ab-text`, `.ab-cta`, `.ab-close`, `.nav-links a`, `.nav-mega-item strong`, `.nav-mega-desc`, `.nav-price-hint`, navigation, dropdowns, footer copy, and every page archetype that loads `styles.css` is currently sized by parent inheritance — not by the declared scale. Brand size discipline is in name only.
**Root cause:** Mass find/replace miscount during one of the SF46 tokenisation sweeps. Token NAMES were preserved as comments (`/* Mirrors --font-size-* */`) but the CALL sites were rewritten with an extra `--` prefix, probably from a regex that wrapped `--font-size-x` inside `var(--…)` twice.
**Recommendation:** Single-pass fix `var(----font-size-` → `var(--font-size-` in `styles.css`. Re-screenshot the entire site afterwards — visual deltas will be substantial.

## Finding D-2 — HIGH — Typography scale drift: 39 distinct hardcoded `font-size:` values
**Category:** Typography Scale
**Severity:** P1
**Evidence:** `grep -hoE 'font-size:\s*[0-9.]+(rem|px|em)' styles.css Assets/css/*.css | sort -u | wc -l` → **39 distinct literal values**. Examples include `0.55em`, `0.65em`, `0.6875rem`, `0.7rem`, `0.85rem`, `0.88em`, `0.92em`, `0.95rem`, `0.98rem`, `0.9em`, `1.05em`, `1.05rem`, `1.0625rem`, `1.15rem`, `1.35rem`, `1.6rem`, `1.75rem`, `2.4rem`, `2.8rem`, etc.
The canonical scale in `crowagent-brand-tokens.css:152-161` defines a 10-step ladder (`--text-xs` 12px → `--text-6xl` clamp 40-64). `styles.css:81` also defines a parallel `--font-size-*` ladder (xs 0.6875 → 5xl clamp 2.5-4rem). Despite both being declared, **397 hardcoded `font-size:` literals exist across `Assets/css/*.css`** and another **74 in `styles.css` outside the broken `var(----)` set**. Designers therefore have ≥3 competing scales: `--text-*`, `--font-size-*`, and ad-hoc literals.
**Root cause:** Two token ladders were introduced in parallel (likely SF44 and SF46) without a deprecation sweep; sprint-scoped CSS files (`Assets/css/*-sf**.css`) keep adding new literals.
**Recommendation:** Pick ONE ladder (`--text-*` is the more modern + has clamp() entries). Codemod every `font-size: <literal>` and `font-size: var(--font-size-*)` to the equivalent `var(--text-*)`. Snap odd values (0.92em, 1.15rem, 2.4rem, 2.8rem) to the nearest scale step.

## Finding D-3 — HIGH — Two parallel spacing systems with 11 + 10 token names
**Category:** Spacing Scale
**Severity:** P1
**Evidence:** `crowagent-brand-tokens.css` defines `--space-0` … `--space-32` plus an addendum `--space-5/7/9/10/14/15/20/30/40` (lines 229-239, 774-782). `styles.css:55` *redefines* `--space-1` through `--space-24` inline. Two definitions for the same names = unpredictable winner depending on import order.
Hardcoded `padding:`/`margin:`/`gap:` literal counts: **128 occurrences across CSS files** (`grep -hoE "padding:\s*[0-9.]+(rem|px)|margin:|gap:" | wc -l`). `var(--space-` is used **2712 times** — adoption is high but legacy literals still bleed through (especially `styles.css`, 83 raw `padding: Xrem` occurrences).
**Root cause:** SF46 P2 added a denser ladder (`--space-5/7/9/10/14/15…`) without consolidating with the original 4pt-baseline ladder in lines 229-239. Same names re-declared inside `styles.css :root`.
**Recommendation:** Move ALL spacing tokens into `crowagent-brand-tokens.css`; delete the `--space-*` redeclaration block in `styles.css:55`. Document a single ladder. Codemod remaining literals.

## Finding D-4 — HIGH — 1,005 raw `rgba(…)` literals despite 50+ semantic colour tokens
**Category:** Colour Tokens
**Severity:** P1
**Evidence:** `grep -hE "rgba\([0-9]" styles.css Assets/css/*.css | wc -l` → **1,005**. Sample at `styles.css:65-70` (`--shadow-xs:0 1px 2px rgba(0,0,0,0.3)` etc.) and `:47-51` (`--teal-dim:rgba(12,201,168,.10)`). Brand-tokens defines semantic colour aliases (`--teal-06`, `--teal-25`, `--white-04`, `--surface-1`, `--accent`, …) but the **shadows + dim variants are still expressed as rgba tuples** rather than `color-mix(in srgb, var(--teal) 10%, transparent)` or pre-tokenised aliases.
**Root cause:** Tokenisation pass covered `color:`, `background:` and `border-color:` but skipped rgba components of `box-shadow`, `linear-gradient`, and `--*-dim` derivatives.
**Recommendation:** Introduce a second token tier — `--shadow-color-*`, `--overlay-*` — and refactor all 1,005 rgba sites. Use `color-mix()` where alpha is the only varying axis; this is now supported in every browser the site targets.

## Finding D-5 — MEDIUM — 36 distinct hardcoded `border-radius:` literals; canonical radius ladder under-used
**Category:** Radius Scale
**Severity:** P2
**Evidence:** `grep -hoE "border-radius:\s*[0-9.]+(rem|px|em|%)" styles.css Assets/css/*.css | sort -u | wc -l` → **36** distinct values. Examples: `0.1875rem`, `0.3125rem`, `0.4375rem`, `0.5625rem`, `0.875rem`, `1.125rem`, `2px`, `3px`, `50%`. Tokens `--radius-md`, `--radius-xl` exist but only `8` and `16` are referenced.
**Recommendation:** Define `--radius-xs/sm/md/lg/xl/pill/circle` and replace literals. Disallow ad-hoc px/rem.

## Finding D-6 — MEDIUM — 18 distinct sprint-labelled CSS blocks in styles.css (`SF10` … `SF46`)
**Category:** Sprint Accretion / Tech Debt Signal
**Severity:** P2
**Evidence:** `grep -oE 'SF[0-9]+' styles.css | sort -u` → SF10, SF11, SF12, SF13, SF14, SF15, SF16, SF17, SF18, SF19, SF20, SF21, SF24, SF25, SF35, SF42, SF43, SF46. **18 sprint boundaries** visible as inline comments inside a single file. `^/\*\s*=` heading-bars: 212 matches. This is a linear historical record, not a designed system — every sprint accreted a new section instead of refactoring the existing one.
**Recommendation:** Treat each `SF*` block as a refactor candidate; reabsorb into the layered architecture, delete its sprint label.

## Finding D-7 — MEDIUM — Multiple competing Google-Fonts requests across HTML pages
**Category:** Typography System
**Severity:** P2
**Evidence:** `grep -h 'fonts.googleapis.com' *.html | sort -u` → **5 distinct `?family=` query strings**, each requesting a different weight ladder (Inter `400;500;600`, `400;500;600;700`, `400;600;800`, …; Plus Jakarta Sans `700`, `700;800`). The site also ships `Assets/css/fonts-selfhosted.css`. Net result: visitors download both self-hosted *and* Google-CDN fonts on most pages, and the weight set is page-dependent.
**Recommendation:** Choose self-hosted XOR Google CDN. Strip every `fonts.googleapis.com` link. Single canonical `<link>` block in nav-inject.

## Finding D-8 — MEDIUM — 22 distinct `font-family:` declarations (drift across legacy + sovereign)
**Category:** Typography Tokens
**Severity:** P2
**Evidence:** `grep -hoE "font-family:[^;]+" styles.css Assets/css/*.css | sort -u | wc -l` → **22 distinct declarations**. They include `'Inter'`, `"Inter", sans-serif`, `'Inter', sans-serif`, `'Inter', sans-serif !important`, `var(--font-body)`, `var(--font-body) !important`, `var(--font-body, "Inter"), sans-serif`, `var(--font-body), 'Inter', sans-serif`. `Plus Jakarta Sans` ships 6 different stack permutations.
**Root cause:** Some authors used the var, some hand-typed the stack, some added `!important` to fight the cascade.
**Recommendation:** Two tokens only — `--font-body`, `--font-display`. Every other declaration deleted. Add a lint rule.

## Finding D-9 — MEDIUM — Z-index registry is tokenised but the legacy escape hatches survive
**Category:** Z-index System
**Severity:** P2
**Evidence:** Distinct z-index declarations: `var(--z-base|below|content|hud|nav|mega|sticky-nav|overlay|modal|cookie|toast|banner|announce)` — well-defined. But the audit found `z-index: var(--z-toast, 1200)`, `z-index: var(--z-sticky-nav, 90)` — fallback literals embedded in usage sites. There are also `z-index: auto !important` and `z-index: var(--z-below) !important` overrides. Once `!important` enters a z-stack, every higher layer needs a counter-`!important`, which they have.
**Recommendation:** Remove the literal fallbacks (the tokens are guaranteed to exist via the unlayered `:root`). Audit each `z-index … !important` against the registry.

## Finding D-10 — LOW — Inline `style="…"` attributes still in production HTML (73 instances)
**Category:** Token Bypass
**Severity:** P3
**Evidence:** `grep -hoE 'style="[^"]+"' *.html | wc -l` → **73**. Samples: `style="padding: 100px 2rem; display: flex; justify-content: center;"`, `style="margin-bottom: 10px; color: var(--teal);"`. The first example combines a hardcoded 100px padding with hardcoded 2rem margin; the second mixes a literal `10px` with the token `var(--teal)`.
**Recommendation:** Move to utility classes (`.sv-stack--align-center`, `.sv-section`, etc.). Add a HTML-lint rule against `style=` attributes outside of dynamic JS-generated nodes.

## Finding D-11 — LOW — Stale CSS backup files shipped in production tree
**Category:** Hygiene / Bundle Pollution
**Severity:** P3
**Evidence:** `index.html.bak` (157 KB), `styles.css.bak` (1.23 MB), `styles.css.pre-sovereign.bak` (1.18 MB), `styles.min.css.pre-sovereign.bak` — all present at repo root. Plus `_archive/css-2026-05-16/_session-2026-05-16-fixes.css` with its own `container-standard`/`container-wide` definitions that could be loaded if any HTML linked it.
**Recommendation:** Move .bak files to a `_backups/` directory outside the deploy publish root (or add to `.vercelignore`). Verify no HTML link references `_archive/`.

---

**Summary line:** The Sovereign DS is solid on paper. Three things make it not solid in practice: (1) a 749-instance custom-property typo silently disables 82% of `font-size:` tokenisation, (2) typography and spacing each have ≥2 parallel ladders, (3) 1,005 raw rgba values bypass the colour layer entirely. Fix the typo first; everything else gets easier.

(~1,470 words)
