# ARCH-3 — `!important` Safe Demotion Plan

**Date:** 2026-05-21
**Mode:** READ-ONLY research. Recommendations only — no code modified.
**Scope:** every project `.css` file under repo root (excludes `node_modules/`, `coverage/`, `_archive/`).

---

## 0. Headline Numbers (corrected)

The frontend-architecture-review.md `Finding A-3` cites **2,712 `!important`**. That figure is **stale** — it inflates by counting `styles.css.bak`, `styles.css.pre-sovereign.bak`, `_archive/cinematic.css.removed-2026-05-17` (173), and double-counts `styles.min.css` + `styles.purged.css` against `styles.css`.

Live, source-of-truth count today (`grep -roE "!important" --include="*.css" .` minus `node_modules|_archive|coverage|styles.min.css|styles.purged.css`):

| Layer                     | Count |
| ------------------------- | ----- |
| `Assets/css/*.css` (32)   | 666   |
| `styles.css`              | 167   |
| `print.css`               | 18    |
| `crowagent-brand-tokens.css` | 5  |
| **TOTAL (source)**        | **838** |
| `styles.min.css` / `styles.purged.css` (build artefacts) | 143 ea |

So the realistic target is **838**, and "30% demote" = **~252 declarations**. The audit-doc 2,712 figure should be corrected in a follow-up commit.

---

## 1. Categorisation by Cause

Counts derived from selector/file-context grep across the 838 declarations:

| Cat | Cause                             | Est. count | % of 838 | Demote-safe? |
| --- | --------------------------------- | ---------- | -------- | ------------ |
| A   | **Layer-cascade workaround** — `styles.min.css` loads BEFORE the page-specific CSS, so SF21/22/41 files use `!important` to outrank `@layer legacy` rules already on the page | ~310 | 37 % | YES — move file into `@layer overrides`, drop `!important` |
| B   | **Specificity workaround** — competing selectors of higher specificity in legacy block (e.g. `nav .logo .logo-tag` vs `.logo-tag`) | ~165 | 20 % | YES — rewrite competing selector at lower specificity, or use `:where()` wrap |
| C   | **Sovereign-primitive token enforcement** — `sv-h1/h2/h3/p`, `.sv-btn-*` need to win over legacy h1/h2 rules. `Assets/css/sovereign-primitives.css` admits this in its docstring (line 24, 87-88). | ~120 | 14 % | PARTIAL — keep on canonical wrappers (`.wrap`, `sv-h*`), drop on duplicates |
| D   | **Print stylesheet** — `print.css` (18) is conventional and recommended by MDN | ~18 | 2 % | NO — keep |
| E   | **Reduced-motion guard** — `@media (prefers-reduced-motion: reduce) { ... transition:none !important }` | ~25 | 3 % | NO — keep (a11y) |
| F   | **`:where()` specificity-zero rules** — Sovereign primitives use `:where()` (0,0,0) so even a single class beats them; `!important` is the documented escape | ~40 | 5 % | NO — keep (documented pattern) |
| G   | **Inline-style override** — element ships with `style="..."` from CMS/legacy HTML | ~15 | 2 % | NO — keep, but ideally remove the inline style |
| H   | **SF-wave layering accretion / dead code** — selectors targeting classes on the dead-CSS list (`.btn-primary-v2`, `.btn-hero`, `.bento-card`, `.ms-*`, `.f10-*`) | ~145 | 17 % | YES — **delete the rule wholesale**, not just the `!important` |

Buckets A + B + H = **~620 declarations**, **74 % of total**, are mechanically demote-or-delete-safe with the postcss-import + layered architecture now in place.

---

## 2. Top 20 Highest-Density Selectors

From the AWK pass `last-selector-before-{ then count !important inside the block`:

| # | Selector (file)                                                          | !imps |
| - | ------------------------------------------------------------------------ | ----: |
| 1 | `body.f8-faq .sh .section-label`                                         | 16 |
| 2 | `body.blog-index-page main .section-label`                               | 15 |
| 3 | `.coming-soon-chip:not(.footer-link-coming-soon .coming-soon-chip)`      | 15 |
| 4 | `.hero-split-active .hero-split-h1`                                      | 13 |
| 5 | `.ca-footer .foot-social a`                                              | 12 |
| 6 | `.ca-footer .footer-trust-row`                                           | 12 |
| 7 | `button[class*="btn"]:not([class*="lottie"])`                            | 11 |
| 8 | `nav .logo .logo-tag`                                                    | 10 |
| 9 | `body.f8-pricing .toggle-row .ttrack .tthumb`                            | 10 |
| 10 | `body.f8-pricing .toggle-row .ttrack`                                   | 10 |
| 11 | `body.f8-faq .photo-inline .photo-frame img`                            | 10 |
| 12 | `:is([class$="-card"]):not([class*="-card-"]):not(.sv-card__*)`         | 10 |
| 13 | `.ca-footer .footer-bottom`                                             | 10 |
| 14 | `nav .logo .logo-box::before` / `::after`                               | 9+9 |
| 15 | `footer.ca-footer .footer-col-title`                                    | 9 |
| 16 | `:where([class*="-card"], [class*="card-"], .pgc, .uc)`                 | 9 |
| 17 | `.sf18-method-card`                                                     | 9 |
| 18 | `nav .nav-links`                                                        | 8 |
| 19 | `nav .logo .logo-tag .logo-tag-sep`                                     | 8 |
| 20 | `body.f8-roadmap main .hero a.btn-secondary`                            | 8 |

Pattern: 8 of the top 20 are in `nav-footer-sf21.css` (190 total `!important` — 23 % of the project). One file is the demotion sprint's prime target.

---

## 3. Per-Category Demotion Approach

**A — Layer-cascade workaround (mechanical fix).** Now that `tools/build-css-postcss.mjs` inlines `@import` and the cascade order is `legacy, theme, base, components, layout, overrides` (`styles.css:20`), wrap each SF21/22/41 file body in `@layer overrides { ... }`. Because layered rules beat unlayered legacy regardless of `!important`, **every `!important` inside an `@layer overrides` block can be deleted**.

```bash
# Migration command (per file — preview only):
node -e "const fs=require('fs');const f=process.argv[1];let c=fs.readFileSync(f,'utf8');c='@layer overrides {\n'+c.replace(/\s*!important/g,'')+'\n}';fs.writeFileSync(f+'.demoted',c);" Assets/css/nav-footer-sf21.css
```

Then run VRT (Playwright `test:visual`) and diff the `*.demoted` against the original. Iterate selector-by-selector if regressions surface.

**B — Specificity workaround (rewrite required).** For each pair `(strong selector) { ... !important }` find the competing weak selector in `@layer legacy` (`styles.css`) and lower its specificity by wrapping in `:where()`:

```css
/* before */
nav .logo .logo-tag { font-size: 12px; }      /* 0,3,0 */
.logo-tag           { font-size: 14px !important; }  /* 0,1,0 + !important */
/* after */
:where(nav .logo) .logo-tag { font-size: 12px; }   /* 0,1,0 */
.logo-tag                   { font-size: 14px; }   /* 0,1,0 — wins by source order */
```

**C — Sovereign-primitive token enforcement.** Audit `Assets/css/sovereign-primitives.css` `:where()` wraps. Where a primitive already targets `:where(h1, .sv-h1)`, the `!important` is redundant once the legacy h1 rule is moved into `@layer legacy` (which it already is). Drop `!important` from `sv-h1..sv-h3, sv-p` (60 declarations). Keep it on `.cinematic-scene` and `prefers-reduced-motion` blocks.

**D, E, F, G — keep, but annotate.** Add a single-line comment `/* IMP-KEEP: print | rmotion | where0 | inline-override */` so a future CI check can ignore them.

**H — Dead-code deletion (not demotion).** The 100 safe-prefix dead classes in `audit/dead-css-broad-scan.txt` carry an estimated ~145 `!important`s. Delete the rules wholesale — Pass 15 already removed 13 `.btn-primary-v2` rules; the remaining 87 dead classes still ship `!important`.

---

## 4. `tools/important-audit.js` — Spec

```js
// tools/important-audit.js — READ-ONLY auditor.
// Usage: node tools/important-audit.js [--csv out.csv] [--threshold N]
//
// Walks every *.css file under repo root (excludes node_modules/_archive/coverage),
// parses with postcss, and for each declaration where decl.important === true emits a row:
//   file, line, layer, selector, property, value, category, dead_class_match, suggested_action
//
// Category derivation (priority order):
//   1. layer === "overrides"        -> "A-layer-cascade"   (demote-safe)
//   2. property starts with "transition|animation|transform" inside @media (prefers-reduced-motion: reduce) -> "E-rmotion" (KEEP)
//   3. selector matches dead-class list (audit/dead-css-broad-scan.txt safe-prefix block) -> "H-dead" (DELETE)
//   4. selector contains ":where("  -> "F-where0"         (KEEP)
//   5. file === "print.css"         -> "D-print"           (KEEP)
//   6. selector specificity (0,a,b,c) of declaring rule > specificity of nearest competing rule in styles.css legacy block -> "B-specificity" (rewrite)
//   7. property in {font-size, line-height, letter-spacing} and selector matches /sv-(h[1-6]|p|btn)/ -> "C-sovereign"
//   8. fallback                     -> "Z-uncategorised"   (manual review)
//
// Outputs (default ./audit/important-audit.csv):
//   columns above + a summary block at the foot
//   "TOTAL: 838 | A:310 B:165 C:120 D:18 E:25 F:40 G:15 H:145 Z:0"
//
// CI mode (--threshold 600):
//   exit code 1 if (A+B+H) count > threshold — gates against !important regressions.

import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import postcssSafe from 'postcss-safe-parser';
import { globSync } from 'glob';

const DEAD = fs.readFileSync('audit/dead-css-broad-scan.txt', 'utf8')
  .split('\n').filter(l => l.startsWith('.')).map(l => l.split(' ')[0]);
const FILES = globSync('{styles.css,print.css,crowagent-brand-tokens.css,Assets/css/*.css}',
  { ignore: ['**/node_modules/**', '_archive/**', 'coverage/**'] });

const rows = [];
for (const file of FILES) {
  const css = fs.readFileSync(file, 'utf8');
  const root = postcss.parse(css, { parser: postcssSafe, from: file });
  root.walkDecls(decl => {
    if (!decl.important) return;
    const rule = decl.parent;
    const atrule = rule.parent && rule.parent.type === 'atrule' ? rule.parent : null;
    const layer = atrule && atrule.name === 'layer' ? atrule.params : 'unlayered';
    const sel = rule.selector || '';
    const category = classify(file, layer, sel, decl, DEAD);
    rows.push({ file, line: decl.source.start.line, layer, selector: sel,
                property: decl.prop, value: decl.value, category });
  });
}
// CSV emit + summary table
// (full implementation ≈ 90 LOC)
```

The script depends on `postcss`, `postcss-safe-parser`, `glob` — already in `package.json` devDeps (postcss/postcss-import present, two small additions). It is read-only; output is one CSV + console summary table.

---

## 5. Sprint Plan — 3× 1-hour passes for ≥30 % demote (≥252 declarations)

| Pass | Target                              | Approach                                                                                                                                  | Expected drop |
| ---- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| **P1: Layer-Cascade Wrap** (1 h) | `nav-footer-sf21.css` (190), `page-fixes-sf22.css` (52), `consistency-sf41.css` (46), `pricing-sf16.css` (59) | Wrap each file body in `@layer overrides { ... }`; sed-strip ` !important`. Re-run `npm run build:css` (postcss-import inlines correctly). VRT compare. | ~310 |
| **P2: Dead-Class Sweep** (1 h)   | `styles.css` legacy block + Assets/css for the 87 safe-prefix dead classes (Pass-15 style)                  | Use `audit/dead-css-broad-scan.txt`. Delete rule blocks (not just the `!important`). One commit per prefix group: `btn-*`, `sf18-*`, `f10-*`, `ms-*`. | ~145 |
| **P3: Specificity Lower** (1 h)  | Top 20 selectors from §2 (nav-link, footer, logo, section-label)                                            | Wrap competing legacy selectors in `:where()` (specificity 0,0,0). Drop `!important` from the SF-overrides side. VRT at 1440/768/390. | ~80 |

**Cumulative drop:** 535 declarations = **64 % demotion** vs starting 838. (Headroom — buckets D/E/F/G remain intentionally untouched.)

---

## 6. Risk Mitigation & Regression Sweep

A demotion is **safe** only when proven by pixel-equivalent VRT, not by tsc alone.

**Per-pass gate:**

1. `node tools/important-audit.js` BEFORE + AFTER, diff the CSV. Every row that drops out is annotated with a `git blame` reason.
2. `npm run build:css` must succeed (postcss-import + csso + purgecss).
3. `npm run test:visual` (Playwright) must show zero new diffs at viewports 1440 / 768 / 390 against the 6 hero pages (`/`, `/crowagent-core`, `/crowmark`, `/csrd`, `/pricing`, `/blog`).
4. Manual checklist on `tools/full-page-audit.js` output:
   - Hero font sizes match Sovereign tokens (`var(--text-h1)` rendered).
   - Nav-inject result: `.foot-social a` 36×36 px, no flow break.
   - Mobile sticky CTA still shows on `/crowmark` 390 px.
   - Print preview (Chromium `--print-to-pdf` of `/crowagent-core`): single column, no colour bleed (`print.css` untouched).
5. Browser DevTools "Computed Styles" spot-check on 5 random selectors per pass — confirm no rule moved to a different cascade layer than intended.

**Regression-rollback:** Each pass lives on a separate branch (`arch-3-pass-1` etc.). If VRT diff > 0 px on any anchor, `git revert` that pass and re-scope. Never bundle the 3 passes into one commit.

**CI hard-stop:** Add `node tools/important-audit.js --threshold 600` to `npm run build` so the count cannot regress upward after the sprint.

**Sentinel selectors that must NEVER be demoted (annotate as `IMP-KEEP`):**

- `.wrap, .container, .container-wide, .ca-container, .priv-wrap` (`styles.css:106-114` — founder canonical-wrapper mandate per code comment).
- `@media (prefers-reduced-motion: reduce)` blocks anywhere.
- All rules inside `print.css`.
- `Assets/css/sovereign-primitives.css:156` `color: transparent !important` (TINT primitive — required to override Webkit inherited `color`).

(~1,180 words)
