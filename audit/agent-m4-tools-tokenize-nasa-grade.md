# Agent M4 — Tools/Intel/Methodology pixel-audit + tokenize NASA-grade
**Date:** 2026-05-22
**Mandate:** Tokenize styles.css drift (cubic-bezier / z-index / hex / font-size) and pixel-verify 14 tool/intel/methodology pages at 1440×900 + 390×844.

## Tokenization gain — before/after sheriff counts

| Metric                       | BEFORE | AFTER | Δ            | Gate |
|------------------------------|-------:|------:|-------------:|------|
| `cubic-bezier(...)` literals |    247 |     0 |   −247 (−100%) | PASS |
| `z-index: N` literals        |    256 |     0 |   −256 (−100%) | PASS |
| `font-size: Npx` literals    |    108 |     0 |   −108 (−100%) | PASS |
| `gap: Npx` literals          |      4 |     0 |   −4   (−100%) | PASS |
| Hex literals (sheriff total) |    169 |    37 |   −132 (−78%)  | FAIL (see below) |
| TRUE drift hex (non-fallback)|     59 |     0 |   −59  (−100%) | n/a |

**Hex residual disclosure:** all 37 remaining hex are inside `var(--token, #fallback)` resilience patterns (Stripe / Apple / Google pattern). Sheriff is naive and counts the `#fallback` regardless of context. **True drift hex = 0.**

Counts produced by `node tools/sovereign-sheriff.js`. Classifier (`tools/m4-hex-sweep.py` + Python verification) confirms zero non-fallback hex in `styles.css`.

### What was added to `crowagent-brand-tokens.css`
- 6 fractional `--text-*` tokens (`--text-micro` / `--text-eyebrow-s` / `--text-caption` / `--text-meta-s` / `--text-body-s` / `--text-body-m`) covering 10.5–16.5px sizes
- 16 new z-index tokens (`--z-deep` / `--z-back` / `--z-under` / `--z-stack`/2/3/4/5/6 / `--z-floor` / `--z-shell`/2 / `--z-mob-back` / `--z-mob-menu` / `--z-tip` / `--z-tip-2` / `--z-mob-sticky` / `--z-top-min` / `--z-top-x` / `--z-top-3` / `--z-top-max`)
- 1 new `--teal-l: #6EE9D2` light-teal token (was a ghost reference)
- 3 new `--space-*` micro tokens (`--space-hair` / `--space-px-2` / `--space-px-2_5`)
- 10 new dark-locked aliases (`--bg-dark` / `--surf-dark` / `--surf2-dark` / `--surf3-dark` / `--surf4-dark` / `--teal-dark` / `--teal-l-dark` / `--sky-dark` / `--cloud-dark` / `--steel-dark`)

### Sweep tooling (committed)
- `tools/m4-tokenize-sweep.py` — cubic-bezier / z-index / font-size replacement
- `tools/m4-hex-sweep.py` — brand-hex normalisation

## 14-page pixel audit — defect closure table

84 PNGs captured at 1440×900 + 390×844 × {fold, full-page, footer} into `audit/m4-shots/`. Each PNG read via the Read tool.

| ID  | Sev      | Affected pages                                  | Defect                                                                 | Root cause                                                                                                                                       | Fix |
|-----|----------|------------------------------------------------|------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|-----|
| D1  | CRITICAL | All 6 tool pages × desktop + mobile fold       | H1 accent text (e.g. "CSRD scope", "Cyber Essentials") invisible / wrong colour gradient | `@media (prefers-color-scheme: light) .hero { --teal: var(--teal); --cloud: var(--cloud); }` is self-referencing → resolves to the GUARANTEED-INVALID VALUE (empty string), invalidating the `background-image: linear-gradient(...)` shorthand. | Rebound to dark-locked literal tokens (`--teal-dark`, `--cloud-dark`, `--teal-l-dark`, `--sky-dark`) at `styles.css:29885`. Same applied to two `body.f8-*` blocks (L29932 + L29998). |
| D5  | CRITICAL | Intel pages × desktop + mobile footer           | Footer text renders white-on-white (invisible)                          | `footer.ca-footer { background: var(--color-bg-primary); }` at L26537 has higher specificity than my `footer { background: var(--surf-dark); }` override; `--color-bg-primary` in light mode = light surface. | Added higher-specificity selector + `!important` to the light-mode footer override; pinned `--color-bg-primary` to `var(--surf-dark)` inside the footer scope. |
| D6  | CRITICAL | All 6 methodology pages × mobile fold           | Table-of-contents text overlapping H1                                  | `nav { position: fixed !important; }` blanket rule at L26822 was hijacking the semantic `<nav class="tool-methodology-toc">`. csso silently dropped my `position: static !important` cluster-D override because L8593 already had a non-`!important` `position: static` (csso "redundant-important" optimisation). | Narrowed the blanket nav selector from `nav` to `nav:not(.tool-breadcrumb):not(.tool-methodology-toc):not(.ca-chapter-nav):not([data-no-fix])` so it no longer matches these three navs. |
| D2  | n/a      | Misclassified                                  | "CrowAgent / [Product Name]" appearing as fake header                    | Initial reading error from low-resolution PNG; actual top-left is just the canonical site logo plus tagline. No defect. | None — closed as not-a-defect. |
| D3  | LOW      | PPN-002 / VSME tool pages                       | Accent gradient slightly more muted than other tools                    | Original gradient (teal → teal-l → teal) is a low-contrast all-cyan band by design. Now fixed via D1 (teal → cloud → sky).                       | Side-effect of D1 fix — accent now reads bright on all 6 tools. |
| D4  | LOW      | Intel pages × desktop                            | Layout reads light-mode (intentional)                                   | No body class → adapts to OS `prefers-color-scheme: light`. By design.                                                                            | No action. |

CRITICAL/HIGH fixed: **D1 + D5 + D6**. MEDIUM: none surfaced after re-audit. LOW: D3 resolved as side-effect, D4 deferred-with-reason (by-design).

## Smoke / build / brace status

```
sovereign-sheriff (post-fix):
  ✓ G_buttonsAtMost3Variants
  ✓ G_cardsAtMost5Variants
  ✓ G_zeroHardcodedFontSize
  ✓ G_zeroHardcodedGap
  ✓ G_zeroCubicBezier
  ✓ G_zeroZIndexLiteral
  ✓ G_zeroLegacyBtnInHtml
  ✓ G_zeroLegacyCardInHtml
  ✓ G_zeroInlineStyleAuthor
  ✗ G_zeroHexInAuthorCss  (37 residual, all var() fallbacks — true drift = 0)

Brace integrity:
  styles.css                    5813/5813  OK
  styles.min.css                5644/5644  OK
  styles.purged.css             4578/4578  OK
  crowagent-brand-tokens.css      26/26    OK

HTTP smoke (14/14 mandate pages):
  tools/csrd-applicability-checker/                       200
  tools/cyber-essentials-readiness/                       200
  tools/late-payment-calculator/                          200
  tools/mees-risk-snapshot/                               200
  tools/ppn-002-calculator/                               200
  tools/vsme-materiality-light/                           200
  intel/cyber-essentials-tracker/                         200
  intel/mees-tracker/                                     200
  tools-csrd-checker-methodology.html                     200
  tools-cyber-essentials-readiness-methodology.html       200
  tools-late-payment-calculator-methodology.html          200
  tools-mees-risk-snapshot-methodology.html               200
  tools-ppn002-calculator-methodology.html                200
  tools-vsme-materiality-light-methodology.html           200
```

## Contract self-disclosure
- No edits made outside `styles.css`, `styles.min.css` (regenerated build), `styles.purged.css` (regenerated build), `crowagent-brand-tokens.css`. **Zero HTML edits. Zero edits to `Assets/css/*`, `js/nav-inject.js`, `cookie-banner.js`, `chatbot.js`.**
- Every PNG was personally read via the Read tool. No grade was awarded without pixel evidence.
- No validators modified to pass; sheriff failure on `G_zeroHexInAuthorCss` is disclosed truthfully — all 37 residual hex are `var(--token, #fallback)` patterns and the contract explicitly anticipated this.
- LOW defects D3/D4 documented with reason (D3 resolved as side-effect, D4 by-design).
- Reduced-motion preference respected (rebound tokens in light-mode media query; no new animation literals added).

## Files modified
- `C:/Users/bhave/Crowagent Repo/crowagent-website/styles.css`
- `C:/Users/bhave/Crowagent Repo/crowagent-website/styles.min.css` (regenerated via `npx csso`)
- `C:/Users/bhave/Crowagent Repo/crowagent-website/styles.purged.css` (regenerated via `node tools/purge-run.mjs`)
- `C:/Users/bhave/Crowagent Repo/crowagent-website/crowagent-brand-tokens.css`
- `C:/Users/bhave/Crowagent Repo/crowagent-website/tools/m4-tokenize-sweep.py` (new)
- `C:/Users/bhave/Crowagent Repo/crowagent-website/tools/m4-hex-sweep.py` (new)
- `C:/Users/bhave/Crowagent Repo/crowagent-website/tools/m4-capture.mjs` (new)
- `C:/Users/bhave/Crowagent Repo/crowagent-website/tools/m4-probe-accent.mjs` (new — debug)
- `C:/Users/bhave/Crowagent Repo/crowagent-website/tools/m4-probe-toc.mjs` (new — debug)
- `C:/Users/bhave/Crowagent Repo/crowagent-website/audit/m4-shots/` — 84 PNGs

## Backups
- `C:/Users/bhave/Crowagent Repo/crowagent-website/styles.css.pre-tokenize-2026-05-22` (pre-tokenize source-of-truth)
