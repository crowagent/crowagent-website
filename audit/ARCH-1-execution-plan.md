# ARCH-1 — Execution Plan: Modularise `styles.css` (33,376 lines)

**Investigator:** read-only research, 2026-05-21
**Predecessor:** `audit/ARCH-1-research.md` (Choice A endorsed: postcss + postcss-import + csso + purgecss)
**Foundation already laid (Pass 12):** `postcss` + `postcss-import` installed; `tools/build-css-postcss.mjs` proven byte-equivalent; `build:css:legacy` script wires `postcss → csso → purgecss → cp → rm`.

---

## 1. Source-of-truth structural map

`styles.css` = **33,376 lines**, three top-level regions:

| Region | Lines | Content |
|---|---:|---|
| **Header + layer decl** | 1-21 | Banner comment + `@layer legacy, theme, base, components, layout, overrides;` |
| **`@layer legacy { … }`** | 22-31699 | 31,678 lines of pre-2026 debt (`}` closes legacy on line 31699) |
| **Inter-layer comment** | 31700-31710 | SF46-P1 banner — unlayered |
| **`@layer components { … }`** | 31711-32501 | 791 lines of sovereign components (`}` closes on 32501) |
| **Trailing unlayered overrides** | 32502-33376 | 875 lines of UNLAYERED `!important` rules (must stay last) |

Critical: lines 32502-33376 (last 875 lines) are **unlayered author rules**. Per CSS Cascade Layers spec, unlayered author rules outrank any layered rule at the same `!important` strength. Reordering or wrapping any of this in `@layer` would silently change cascade outcomes site-wide. **NEVER touch this block.**

---

## 2. Natural section boundaries inside `@layer legacy` (lines 22-31699)

Twelve coherent sprint-comment-marked blocks emerged from grep of `═` banners + `SF##` markers + `WP-WEB-*` END markers + `FIX-R##/FIX-A##/FIX-C##` cohort headers:

| # | File | Lines | Theme / sprint anchor |
|---|---|---:|---|
| 01 | `01-reset-base.css` | 22-205 | `* {box-sizing}` reset, `prefers-reduced-motion` guard, `:root` token aliases (lines 35-89), wrapper system (lines 98-205) |
| 02 | `02-typography.css` | 206-1283 | Hyphens strategy, focus states (P0-4), nav touch-targets, hamburger animations, body typography, hero, footer credibility row (early) |
| 03 | `03-layout-fixes.css` | 1284-2500 | Scroll-trigger reveals, nav scroll-spy, hero penalty callout, footer 5-column grid, contact form, CSRD share, comprehensive responsive fixes, security grid, demo/contact/blog page rules, roadmap, urgency pill, CSRD progress |
| 04 | `04-typography-system.css` | 2501-3505 | Zig-zag asymmetric layout, card typography (FIX-E), tabular numerics, atmospheric mesh, nav enhancements, premium card surfaces, trench inputs, section headers, asymmetric feature split, hero button volume, spring-physics .reveal, About page, **founder typography standard (line 3006)**, contrast audit, touch targets, form input elevation |
| 05 | `05-premium-effects.css` | 3506-4408 | Ambient dot-grid, pgc-pop glowing border, card hover lift, CTA shimmer, stat counter glow, nav link glow, testimonial slide-in, focus ring premium, pricing toggle, locale dropdown animation, hero headline stagger, prefers-reduced-motion overrides, "Most popular" badge fix, equal-height cards, stats bar, section headings, button heights, pricing CTA, pricing grid, methodology, bottom triple section, scroll-to-top, nav overflow, U-GRID-3, ISSUE-004..010 fixes (legacy `END WP-WEB-TRANSFORM-001` ends here at 4407) |
| 06 | `06-wp-fixes-resp-a11y.css` | 4409-5085 | WP-WEB-003 fixes (FIX-03..FIX-15), WP-RESP-FIX (FIX-R01..R13: hamburger, footer-grid, calendly, comparison-table scroll, menu touch-spacing), WP-A11Y-FIX (FIX-A01..A07: skip link, focus-visible, touch sizes, reduced-motion, high-contrast, form-error aria, decorative-icon hide), WP-C-CONS-FIX (FIX-C01..C07: button unification, section heading, CrowMark inline extraction, card radius, nav alignment, pricing tabs, segment buttons). `END WP-RESP-FIX` banner on line 5084. |
| 07 | `07-decorative-utilities.css` | 5086-5810 | DEF-A..K utility classes (DEF-G inline-style replacements), compliance widget, customer-logos-trust-strip (UX-001), customer testimonial (UX-002), term-tooltip pattern, coming-soon CrowESG how-it-works panel, footer credibility (refined block) |
| 08 | `08-inline-extraction.css` | 5811-7030 | WS-AUDIT-016 Phase 2 PR1 inline-style extraction (CSP unsafe-inline removal), T-130 inline-style extractions, pricing comparison tables Phase 2 (Cyber/Cash/ESG single-tier) — ends at `=== end pricing compare tables ===` on line 7029 |
| 09 | `09-fixes-u12-batches.css` | 7031-10717 | U-12 redispatch defect classes A/B/C, P-06..P-10 polish (deprecation, carousel controls, footer credibility, form polish), WEB-AUDIT-147 micro-UX, all numbered `═════` Phase blocks 7128-10310, Stripe-style nav-hover (Phase 2), P1 enterprise-design-spec patterns (Phase 3), Stripe button micro-interactions (Phase 4), 1-touch-target ratchet, 2-colour-contrast, 3-inline-link-safety, 4-focus-defence |
| 10 | `10-cinematic-hero.css` | 10718-23327 | Largest partition. Breadcrumb reset, reduced-motion guard, h1 staggered entrance, grid symmetry, section spacing rhythm, **premium effects v2.1 (16397)**, cookie-banner premium (16553), product pages premium (16648), free-tools premium forms (16880), spacing/overlap fixes, blog premium (17853), blog article cinematic (18022), product hero balance, contact/global page fixes, partners/methodology grid, glossary cards, carousel blackout root-cause fix (18908), **48rem/30rem/23.4375rem responsive breakpoints (19031/19186/19321)**, overflow safety net, multi-screen carousel (19411-19568), all Phase-1/Phase-5 token aliases, B3..B9 polish, About card uniform, section-tone-1 gradients, card padding rhythm |
| 11 | `11-sf10-sf17-sprints.css` | 23328-27530 | Numbered sprint sections (SF10..SF17): contact-gap, double-underline fix, about-page photo-frame, founder card heights, pricing I1..I9 (rotating conic-gradient removed, section rhythm, FAQ gap), N1..N2 fixes, M20..M29 footer/typography, M8/M16..M18 social-proof/grain-overlay/card-hover, VIS.B3..B6 (deadlines band, framework strip, mobile-hero polish), **SF10.1..SF10.17 Earth cinematic + bento + methodology + sectors + frameworks + carousel polish**, **SF11.1..SF11.9 motion mesh + ambient glow + methodology equalisation**, **SF12.1..SF12.10 persona selector + hero-H1 + bento parity**, **SF13.0..SF13.10 HUD orbits + countdown + pulse-path + metrics ticker**, SF14-SF17 typography ladder + heading/CTA harmonisation + chat-button + footer hairlines + bento-CTA pin + stats centring + frameworks legibility, slim announcement bar, scroll-reveal, postcode label, footer locale polish, ENH 1-14 premium-bar enhancements |
| 12 | `12-sf21-and-trailing.css` | 27531-31699 | SF21-H..O variant polish, carousel pulse, SF22..SF45 sprint blocks, light-mode contrast P5 fixes (31424-31568), live consumers for canonical components (31569-31677), final unprefixed blocks until `} /* end @layer legacy */` on 31699 |

---

## 3. EXACT new `styles.css` entry-file content

```css
/* ═══════════════════════════════════════════════════════════════════════
   styles.css — entry manifest. Real CSS lives in styles/*.css partials.
   Order is LOAD-BEARING — postcss-import inlines in declared order, csso
   minifies the result, purgecss strips dead selectors. NEVER reorder.

   Layer cascade (later = higher priority for NORMAL declarations):
     legacy → theme → base → components → layout → overrides
   Unlayered rules (this file's @import + the trailing unlayered block)
   sit ABOVE all layers for normal cascade.
   ═══════════════════════════════════════════════════════════════════════ */
@layer legacy, theme, base, components, layout, overrides;

@layer legacy {
  @import "styles/01-reset-base.css";
  @import "styles/02-typography.css";
  @import "styles/03-layout-fixes.css";
  @import "styles/04-typography-system.css";
  @import "styles/05-premium-effects.css";
  @import "styles/06-wp-fixes-resp-a11y.css";
  @import "styles/07-decorative-utilities.css";
  @import "styles/08-inline-extraction.css";
  @import "styles/09-fixes-u12-batches.css";
  @import "styles/10-cinematic-hero.css";
  @import "styles/11-sf10-sf17-sprints.css";
  @import "styles/12-sf21-and-trailing.css";
} /* end @layer legacy */

/* ═══════════════════════════════════════════════════════════════════════
   SF46 P1 — Sovereign rules in @layer components (Stripe canonical).
   Single-layer block form (multi-name @layer block is INVALID per spec).
   ═══════════════════════════════════════════════════════════════════════ */
@layer components {
  @import "styles/20-sovereign-components.css";
}

/* ═══════════════════════════════════════════════════════════════════════
   UNLAYERED OVERRIDES — must remain in entry file. Unlayered author rules
   outrank @layer rules at equal !important strength. DO NOT @import these
   from inside a @layer block (would silently change cascade outcome).
   ═══════════════════════════════════════════════════════════════════════ */
@import "styles/99-unlayered-overrides.css";
```

**Convention chosen (per ARCH-1-research §5):** the `@layer legacy { … }` brace wrapper STAYS in the entry file; each partial is plain CSS with no outer `@layer` declaration. Same for `@layer components`. Rationale: keeps the cascade-layer declaration site visible at file open; each partial is editable without worrying about brace pairing.

---

## 4. Rules that MUST stay in entry `styles.css`

1. The `@layer legacy, theme, base, components, layout, overrides;` declaration on line 20 — **first non-comment statement**, sets layer priority order.
2. The `@layer legacy { … }` and `@layer components { … }` brace wrappers.
3. The header banner comment (lines 2-19) — orientation for future maintainers.
4. The unlayered-overrides `@import` MUST come AFTER `@layer components`. Lines 32502-33376 of the current file become `styles/99-unlayered-overrides.css` but the **import position** in the entry is load-bearing.

---

## 5. Per-step regression test plan

After each extract, verify cascade preserved via **byte-diff gate** + **6 computed-style probes** (Playwright):

| Probe | Selector | Property | Expected | Tests partial(s) |
|---|---|---|---:|---|
| P1 | `body` reset | `box-sizing` | `border-box` | 01 |
| P2 | `nav a` (desktop) | `min-height` | `44px` (P2-E rule) | 02 |
| P3 | `footer h4` | `font-size` | `12px` (or token-resolved) | 02, 03 |
| P4 | `.pgc.pgc-pop` | `border-color` | transparent (SF21-I I1 removed) | 11 |
| P5 | `.crow-carousel--multiscreen .crow-carousel-viewport` | `overflow` | `hidden` | 10 |
| P6 | `body.page-home #hero .cta-no-card` | `display` | `none` (unlayered override) | 99 |

**Byte-diff gate (Step 0, run before any extract):**
```bash
node tools/build-css-postcss.mjs styles.css styles.inlined.css
cmp -s styles.inlined.css styles.css && echo "OK: zero-extract identity" || echo "FAIL"
```
After Step 0 OK, repeat the chain for each subsequent extract — the inlined output of the modular `styles.css` MUST byte-match the pre-extract `styles.css` (postcss-import preserves order and whitespace).

**Smoke validators after every commit:**
```bash
npm run build:css:legacy
node tools/css-byte-diff.js styles.min.css.pre-arch1.bak styles.min.css
npx playwright test tests/cascade-probes.spec.js
```

---

## 6. Cascade-order risk: multiple `@layer components` blocks?

Audit shows **exactly one** `@layer components { … }` block in source (lines 31711-32501). Risk profile:

- If a partial later introduces another `@layer components { … }`, **the spec says it merges into the existing layer at its declared position** (declared on line 20: `..., components, ...`). Order of declarations *within* the merged layer follows source order. So multi-block merging is predictable.
- However, the `@import "styles/20-sovereign-components.css"` is INSIDE a `@layer components { @import … }` wrapper in the entry — postcss-import inlines the imported rules **into the wrapping layer**. This is the safe path.
- Risk: if a partial accidentally contains `@layer components { … }` again, it nests — spec says nested layer name `components` inside an outer `components` block creates a SUB-LAYER `components.components`, which has **lower priority** than the outer. Mitigation: lint rule — `grep -n "@layer" styles/*.css` must return zero matches in partial files; only entry file declares layers.

---

## 7. `tools/css-byte-diff.js` (recommended)

```js
// tools/css-byte-diff.js — fail if pre/post minified output diverge.
// Usage: node tools/css-byte-diff.js <baseline> <candidate>
const fs = require('fs');
const [, , a, b] = process.argv;
const A = fs.readFileSync(a);
const B = fs.readFileSync(b);
if (A.equals(B)) { console.log(`OK: ${a} == ${b} (${A.length} bytes)`); process.exit(0); }
const diff = B.length - A.length;
console.error(`FAIL byte-diff: ${a}=${A.length} ${b}=${B.length} delta=${diff>=0?'+':''}${diff}`);
// find first divergence
let i = 0; while (i < Math.min(A.length,B.length) && A[i]===B[i]) i++;
const ctx = (buf, n) => buf.slice(Math.max(0,n-32), n+32).toString('utf8').replace(/\n/g,'\\n');
console.error(`first divergence at byte ${i}`);
console.error(`baseline:  ${ctx(A,i)}`);
console.error(`candidate: ${ctx(B,i)}`);
process.exit(1);
```

Wire into pre-push hook for any branch touching `styles/**`.

---

## 8. Rollback signal at each step

Per step (Step 0 → Step 12 + sovereign + overrides), the abort signal is **any non-zero byte-diff** OR **any failing computed-style probe**. Rollback:

```bash
# 1. Local revert (fastest, no commit pollution)
git checkout HEAD -- styles.css styles/

# 2. If already committed
git revert <sha>            # one commit per partial extract → atomic revert

# 3. Last-resort restore
cp styles.css.pre-arch1.bak styles.css
cp styles.min.css.pre-arch1.bak styles.min.css
npm run build:css:legacy    # rebuild from baseline
```

Backup snapshot BEFORE Step 0:
```bash
cp styles.css     styles.css.pre-arch1.bak
cp styles.min.css styles.min.css.pre-arch1.bak
```

Keep `build:css:legacy` in `package.json` permanently as a Hatch-back compile path; never delete the snapshot `.bak` files until 30 days post-merge with zero regression reports.

---

## 9. Execution order (atomic commits, one partial per commit)

| Commit | Action | Gate |
|---|---|---|
| C0 | Snapshot `.bak`; verify Step 0 byte-diff with NO extracts | `cmp -s` zero diff |
| C1 | Extract 01-reset-base.css (lines 22-205) | byte-diff + P1, P2 probes |
| C2 | Extract 02-typography.css (lines 206-1283) | + P3 probe |
| C3 | Extract 03-layout-fixes.css (lines 1284-2500) | byte-diff |
| C4 | Extract 04-typography-system.css (lines 2501-3505) | byte-diff |
| C5 | Extract 05-premium-effects.css (lines 3506-4408) | + P4 probe |
| C6 | Extract 06-wp-fixes-resp-a11y.css (lines 4409-5085) | byte-diff |
| C7 | Extract 07-decorative-utilities.css (lines 5086-5810) | byte-diff |
| C8 | Extract 08-inline-extraction.css (lines 5811-7030) | byte-diff |
| C9 | Extract 09-fixes-u12-batches.css (lines 7031-10717) | byte-diff |
| C10 | Extract 10-cinematic-hero.css (lines 10718-23327) | + P5 probe |
| C11 | Extract 11-sf10-sf17-sprints.css (lines 23328-27530) | byte-diff |
| C12 | Extract 12-sf21-and-trailing.css (lines 27531-31699) | byte-diff |
| C13 | Extract 20-sovereign-components.css (lines 31711-32501) | byte-diff |
| C14 | Extract 99-unlayered-overrides.css (lines 32502-33376) | + P6 probe |

After C14, original `styles.css` shrinks from 33,376 lines to ~30 lines (just the @import manifest + layer declaration + wrappers). Each partial is independently editable; cascade order stays mathematically guaranteed.

---

**Files referenced (absolute paths):**
- `C:/Users/bhave/Crowagent Repo/crowagent-website/styles.css` (33,376 lines, modularised here)
- `C:/Users/bhave/Crowagent Repo/crowagent-website/tools/build-css-postcss.mjs` (existing, inline step)
- `C:/Users/bhave/Crowagent Repo/crowagent-website/package.json` (lines 7-9, build:css scripts)
- `C:/Users/bhave/Crowagent Repo/crowagent-website/audit/ARCH-1-research.md` (precursor)
