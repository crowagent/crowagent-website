# SOVEREIGN ARCHITECTURE — CrowAgent Marketing Site

**Status:** Source of Truth · **Date:** 2026-05-20 · **Owner:** Architect
**Inspirations:** stripe.com, apple.com, google.com design systems

---

## 0. The Charter (immutable)

1. **Tokens before primitives, primitives before pages.** Every visual decision resolves to a token. Every UI element is one of the 12 Canonical Primitives. Every page composes primitives — never inlines styles, never one-offs.
2. **Zero hardcoded values in author CSS.** Hex codes, `Npx` paddings/gaps, ad-hoc gradients, named cubic-beziers — all forbidden outside `Assets/svg/*` and `crowagent-brand-tokens.css` itself.
3. **Cascade discipline.** The CSS `@layer` order is: `legacy, theme, base, components, layout, overrides`. Sovereign primitives live in `components`. Unlayered rules are forbidden in author CSS (they bypass layer priority).
4. **One name per concept.** `.btn` family has 3 variants. `.card` family has 5. Never more.
5. **Modern features first, legacy as fallback.** Scroll-driven animations, View Transitions, `color-mix()`, `:has()`, `@container`, `aspect-ratio`, `text-wrap: balance`, `min()/max()/clamp()` are defaults. JS fallbacks only when feature-detected as missing.
6. **Drift is caught at the gate.** `tools/sovereign-sheriff.js` blocks merges with hardcoded values, excess variants, or forbidden classes.

---

## 1. Token System (`crowagent-brand-tokens.css`)

The token file is the **only** place hex, rgba, and rem literals are written. All other CSS consumes tokens via `var(--name)`.

### 1.1 Color tokens

#### Brand primary
```
--bg                  #040E1A    page background, hero base
--surf, --surf2/3/4   #0A1F3A → #122F55    nested surfaces
--teal, --teal-d      #0CC9A8 / #0AA88C    brand accent + dark variant
--cloud, --steel, --mist, --dim-c    text scale (4 steps, AA contrast)
--lime, --sky, --gold, --mark, --coral    accent palette
```

#### Semantic aliases (use these in NEW code)
```
--surface-1/-2/-3/-elevated/-background    nested surfaces
--text-primary/-secondary/-tertiary/-disabled/-inverse/-accent
--border-subtle/-default/-strong
--accent / --accent-bg / --accent-border    drives the [data-product] theming hook
```

#### Per-product brand hues
```
--brand-cyber   var(--sky)     #5BC8FF
--brand-mark    var(--mark)    #A78BFA
--brand-cash    var(--gold)    #DAA520
--brand-core    var(--teal)    #0CC9A8
--brand-esg     var(--lime)    #C2FF57
--brand-csrd    var(--teal)
```
Activate via `<section data-product="cyber">…</section>` — every descendant inherits `--accent` and the chip/CTA/halo updates automatically.

#### Signal scales
```
--info / --info-fg / --info-bg / --info-bg-strong / --info-border       sky family
--success-*    green family    #22C55E
--warning-*    amber family    #F59E0B
--danger-*     red family      #EF4444
--neutral-*    grey family
```

### 1.2 Typography

#### Modular scale (Stripe-style fluid via `clamp()`)
```
--text-xs  0.75rem    12px    micro-labels
--text-sm  0.875rem   14px    secondary body, meta
--text-md  1rem       16px    body default
--text-lg  1.125rem   18px    lead body
--text-xl  1.25rem    20px    sub-heading
--text-2xl 1.5rem     24px    h4 / large eyebrow
--text-3xl 1.875rem   30px    h3
--text-4xl 2.25rem    36px    h2
--text-5xl 3rem       48px    display h2
--text-6xl clamp(2.5rem, 5vw, 4rem)    40–64px    hero h1
```

#### Semantic typography composites
```
--text-h1/-h2/-h3/-h4     responsive clamps with token-driven line-height + tracking
--text-body / -lead / -eyebrow / -meta
```

#### Variable-font axes + OpenType features
```
--font-variation-h1: "wght" 800
--ff-body / --ff-display / --ff-tabular / --ff-mono
--fvn-tabular / --fvn-oldstyle / --fvn-fraction
--fsa-body / --fsa-display / --fsa-mono   (font-size-adjust, CLS guard)
```

### 1.3 Spacing — 4-point grid (Apple HIG)
```
--space-0/-1/-2/-3/-4/-6/-8/-12/-16/-24/-32
   0   4   8  12  16  24  32  48  64  96  128   (px equivalents)
```

### 1.4 Section rhythm
```
--section-y-hero       clamp(80px, 12vh, 140px)
--section-y-primary    clamp(64px, 8vw, 120px)
--section-y-secondary  clamp(48px, 6vw, 80px)
--section-y-tertiary   clamp(32px, 4vw, 48px)
--rhythm-h2 / --rhythm-h3    long-form prose heading margin
```

### 1.5 Radius ladder
```
--radius-none  0
--radius-xs    4px      hairline accents
--radius-sm    6px      chips, tags
--radius-md    10px     inputs, small buttons
--radius-lg    16px     default cards, modals
--radius-xl    24px     premium cards, hero surfaces
--radius-2xl   32px     hero glass panels
--radius-full  9999px   pills, circular avatars
```

### 1.6 Z-Index ladder (only 10 allowed values)
```
--z-base       0       default flow
--z-content    1       elements creating a stacking context
--z-banner     90      back-to-top + decorative chrome
--z-nav        200     sticky header / fixed nav
--z-announce   210     announce bar above nav-glow
--z-mega       300     dropdown / mega-menu panels
--z-overlay    1000    generic overlays
--z-modal      1100    modals + mobile menu + Cmd+K palette
--z-cookie     1150    cookie banner above modals
--z-toast      1200    toasts, back-to-top floater above everything
```
Any `z-index:` literal outside this ladder is **forbidden** and caught by the sheriff.

### 1.7 Motion
```
--duration-fast    150ms     button hover, focus, micro-interactions
--duration-base    300ms     reveals, card lift, simple state transitions
--duration-medium  500ms     hero reveal, fade-in-on-scroll
--duration-slow    800ms     scene transitions, cross-fades

--ease-canonical   cubic-bezier(0.16, 1, 0.3, 1)    90% of motion (default)
--ease-out         alias to canonical
--ease-in-out      cubic-bezier(0.65, 0, 0.35, 1)   symmetric
--ease-spring      cubic-bezier(0.34, 1.56, 0.64, 1) mild overshoot (max 2× per page)
--ease-standard    cubic-bezier(0.4, 0, 0.2, 1)     UI interactions (Material)
```
**Rule:** every transition/animation MUST use one of these four curves. No new cubic-bezier values in author CSS.

### 1.8 Shadows (4-recipe canonical)
```
--shadow-card-rest      inset highlight + soft cast
--shadow-card-hover     deeper cast + teal halo
--shadow-btn-rest
--shadow-btn-hover
--shadow-soft-1/-soft-2   generic ambient
```

### 1.9 Container ladder
```
--container-narrow   720px      long-form prose, single-column forms
--container-default  1200px     standard marketing pages
--container-wide     1400px     hero + dashboard surfaces
--container-full     100%       full-bleed
--container-gutter   clamp(20px, 5vw, 64px)
```

### 1.10 Icon scale
```
--icon-xs   12px    footer + small chips
--icon-sm   14px    inline status pills
--icon-md   18px    nav, dropdowns, social, CTA
--icon-lg   22px    eyebrow icons
--icon-xl   28px    feature cards, hero proof items
--icon-stroke           2     canonical stroke-width
--icon-stroke-thin   1.5
--icon-stroke-bold   2.5
```

### 1.11 Breakpoints (single source of truth)
```
--bp-sm    480px      phone landscape
--bp-md    768px      tablet portrait
--bp-lg    1024px     small laptop
--bp-xl    1280px     desktop default
--bp-2xl   1536px     large desktop
```

### 1.12 Form-field rhythm (Stripe Element API parity)
```
--input-height        44px (WCAG 2.5.5 touch-target)
--input-padding-x     14px
--input-padding-y     10px
--input-border-width  1px
--input-border-radius var(--radius-md)
--input-label-spacing var(--space-2)
--input-helper-spacing var(--space-2)
```

---

## 2. The 12 Canonical Primitives (`Assets/css/sovereign-primitives.css`)

Every UI element on the site is exactly ONE of these. New patterns are illegal until added here.

### 2.1 `.sv-btn` — Button
**Variants:** `--primary`, `--secondary`, `--ghost` (3 only — `.sv-btn--icon` is a size modifier, not a variant)
**Sizes:** `--sm`, `--md` (default), `--lg`, `--xl`
**States:** `[data-loading="true"]`, `:disabled`, `[aria-disabled="true"]`, `:hover`, `:active`, `:focus-visible`

Markup:
```html
<button class="sv-btn sv-btn--primary sv-btn--lg">Start free trial</button>
<a class="sv-btn sv-btn--secondary" href="/pricing">See pricing</a>
<button class="sv-btn sv-btn--ghost sv-btn--sm">Cancel</button>
```

### 2.2 `.sv-card` — Card surface
**Variants:** `--elevated`, `--interactive`, `--hero`, `--accent` (5 total including base)
**Slots:** `.sv-card__eyebrow`, `.sv-card__title`, `.sv-card__body`, `.sv-card__footer`

```html
<article class="sv-card sv-card--interactive" data-product="cyber">
  <div class="sv-card__eyebrow">Compliance</div>
  <h3 class="sv-card__title">Cyber Essentials, mapped to evidence</h3>
  <p class="sv-card__body">…</p>
  <footer class="sv-card__footer">…</footer>
</article>
```

### 2.3 `.sv-icon` — Icon
**Sizes:** `--xs`, `--sm`, `--md` (default), `--lg`, `--xl`
**Modifier:** `--accent` (uses `var(--accent)`)
Stroke widths from `--icon-stroke-*` tokens; never override in author CSS.

### 2.4 `.sv-grid` — Auto-fit grid
**Sizes:** `--sm` (240px min), `--md` (320px min), `--lg` (400px min), `--xl` (480px min)
**Gaps:** `--gap-2/-4/-6/-8/-12`
Modern Holy Albatross pattern: `repeat(auto-fit, minmax(min(100%, var(--grid-min)), 1fr))`.

### 2.5 `.sv-stack` — Vertical flow
Gaps: `--gap-1/-2/-3/-4/-6/-8`. Align: `--align-center/-start/-end`.

### 2.6 `.sv-cluster` — Horizontal flow (wrap)
Gaps: `--gap-1/-2/-3/-6`. Justify: `--center/-between/-end`.

### 2.7 `.sv-container` — Width ladder
`--narrow`, default (1200), `--wide`, `--full`. Always `margin-inline: auto` and `padding-inline: var(--container-gutter)`.

### 2.8 `.sv-section` — Section rhythm
`--hero`, default (primary), `--secondary`, `--tertiary` — drives `padding-block` from `--section-y-*`.

### 2.9 `.sv-field` + `.sv-input` / `.sv-textarea` / `.sv-select` — Form physics (G8)
**Variants:** `--underline` (animated bottom border), `--float` (floating label)
**States:** `--error`, `--success`
**Slots:** `.sv-field__label`, `.sv-field__control`, `.sv-field__hint`, `.sv-field__error`

### 2.10 `.sv-badge` — Chip / pill
**Variants:** `--info`, `--success`, `--warning`, `--danger`, `--accent` (5 total + neutral default)
**Size:** `--lg`

### 2.11 `.sv-skeleton` — Loading state (G11)
**Variants:** `--text`, `--title`, `--avatar`, `--card`
Built on `prefers-reduced-motion: reduce` guard.

### 2.12 `.sv-empty` — Empty state (G12)
Slots: `.sv-empty__icon`, `.sv-empty__title`, `.sv-empty__body`, `.sv-empty__actions`.

Plus typographic helpers (`.sv-h1/h2/h3`, `.sv-eyebrow`, `.sv-lead`, `.sv-prose`, `.sv-text-balance`, `.sv-text-pretty`) and `.sv-divider`, `.sv-disclosure-toggle` (G14 progressive disclosure).

### 2.15 `.sv-nav-row` — Mathematical 3-column header grid (added SP.2 2026-05-20)
Apple/Stripe header pattern: `grid-template-columns: 1fr auto 1fr` so the logo (col 1) and the right-side actions (col 3) anchor to the wrapper boundaries, and the centre column (`justify-self: center`) holds the navigation links perfectly bisecting the header — no manual margin maths.

```html
<header id="ca-nav" class="sv-nav">
  <div class="sv-container sv-container--wide sv-nav-row">
    <a class="sv-nav-row__logo">…</a>            <!-- col 1, justify-self: start  -->
    <div class="nav-links sv-nav-row__center">…</div>   <!-- col 2, justify-self: center -->
    <div class="nav-actions sv-nav-row__end">…</div>     <!-- col 3, justify-self: end    -->
  </div>
</header>
```

The primitive collapses to a vertical stack at the mobile breakpoint (the existing `.mob-menu` takes over at that size).

### 2.14 `.sv-media-frame` — Stripe browser-chrome screenshot frame (added AF.3 2026-05-20)
Wraps a product screenshot (PNG/WebP/AVIF) in a Stripe-style chrome: three traffic-light dots, `--radius-xl` corners, `--edge-highlight-strong` specular cap, `--shadow-soft-2` lift. Used by every reference to a real product UI screenshot from `/Assets/marketing-screenshots/`.

```html
<figure class="sv-media-frame">
  <img src="/Assets/marketing-screenshots/01-dashboard-dark-framed.png" alt="…">
</figure>
```

The chrome dots render via `::before` (pure CSS) so no extra DOM is required. Modifiers:
- `--bare` — drops the chrome dots (image already includes them)
- `--cinematic` — supports the GSAP pan-and-zoom hero animation (overflow:hidden + isolation:isolate)

### 2.13 `.sv-nav` — Sticky banner navigation (added REC.1 2026-05-20)
**Container** for the site header chrome. Sticky-positioned via `--z-nav`, min-height anchored to a token so the placeholder reserves layout space before injection (no CLS).

```html
<header id="ca-nav" class="sv-nav" role="banner">
  <!-- injected by js/nav-inject.js -->
</header>
```

Modifiers:
- `.sv-nav--floating` — disables the bottom border so the nav reads as a free-floating chrome over the hero
- `.sv-nav--transparent` — strips the surface fill (for hero overlays)

Inside the nav, the **structural row** uses `.sv-container--wide` + `.sv-cluster--between` for the logo-row + actions split (the per-page legacy `.nav-links` / `.nav-dropdown` markup remains for JS hooks, but the outer alignment is now token-driven).

---

## 3. Component Extinction List (FORBIDDEN)

These class patterns are banned. The migration codemod replaces every match. The sheriff fails the build on any survivor outside `@layer legacy`.

### 3.1 Button extinction
```
.btn-primary          → .sv-btn.sv-btn--primary
.btn-primary-v2       → .sv-btn.sv-btn--primary
.btn-ghost            → .sv-btn.sv-btn--ghost
.btn-ghost-steel      → .sv-btn.sv-btn--ghost
.btn-ghost-v2         → .sv-btn.sv-btn--ghost
.btn-secondary        → .sv-btn.sv-btn--secondary
.btn-v2               → .sv-btn
.btn-v2--secondary    → .sv-btn.sv-btn--secondary
.btn-v2--lg           → .sv-btn.sv-btn--lg
.btn--primary         → .sv-btn.sv-btn--primary
.btn--secondary       → .sv-btn.sv-btn--secondary
.btn--ghost           → .sv-btn.sv-btn--ghost
.btn--lg              → .sv-btn.sv-btn--lg
.btn-sm               → .sv-btn.sv-btn--sm
.btn-md               → .sv-btn.sv-btn--md
.btn-lg               → .sv-btn.sv-btn--lg
.btn-teal             → .sv-btn.sv-btn--primary           (brand-only)
.btn-teal-paired      → .sv-btn.sv-btn--primary
.btn-sky              → .sv-btn.sv-btn--primary           data-product="cyber"
.btn-crowmark         → .sv-btn.sv-btn--primary           data-product="mark"
.btn-mark             → .sv-btn.sv-btn--primary           data-product="mark"
.btn-cinematic        → .sv-btn.sv-btn--primary
.btn-calc             → .sv-btn.sv-btn--primary
.btn-cookie-primary   → .sv-btn.sv-btn--primary
.btn-cookie-outline   → .sv-btn.sv-btn--secondary
.btn-full-width       → .sv-btn (set width via container, not modifier)
.btn-v2--empty        → .sv-btn.sv-btn--ghost
.btn-v2--loading      → .sv-btn[data-loading="true"]
.btn-group            → .sv-cluster
```

Final count: **3 variants × 4 sizes = 12 valid combinations.** Anything else fails the sheriff.

### 3.2 Card extinction (target: 5 variants total)
All 196 legacy card classes map onto one of:
- `.sv-card` (base flat card)
- `.sv-card--elevated` (raised — `--surf2` + shadow)
- `.sv-card--interactive` (hover lift)
- `.sv-card--hero` (large pad, glass)
- `.sv-card--accent` (per-product hue halo)

Top legacy patterns and their target:
```
.pgc / .pgc-pop / .pricing-card    → .sv-card.sv-card--elevated (+ --accent if pop)
.u-card / .u-card-v2               → .sv-card
.ca-card / .ca-card-v2             → .sv-card.sv-card--interactive
.f10-why-card                      → .sv-card.sv-card--accent
.f10-office-card                   → .sv-card
.contact-card / .about-card        → .sv-card
.trust-card / .partner-card        → .sv-card.sv-card--elevated
.pricing-enterprise-card           → .sv-card.sv-card--hero
.product-full-block                → .sv-card.sv-card--hero
.feature-card / .step-card         → .sv-card
.walkthrough-card                  → .sv-card.sv-card--interactive
.faq-card / .resource-card         → .sv-card
.f10-summary-box                   → .sv-card.sv-card--accent
.hw-card / .meth-card              → .sv-card
.cross-product-card                → .sv-card.sv-card--interactive
```

### 3.3 Forbidden values
- Any hex literal (`#abc`, `#aabbcc`, `#abcdef12`) outside `crowagent-brand-tokens.css`
- Any `rgba(255, 255, 255, ...)` outside `crowagent-brand-tokens.css` (use `--white-*` tokens)
- Any `font-size: Npx` (use `--text-*`)
- Any `gap: Npx` (use `--space-*`)
- Any `padding: Npx` literal (use `--space-*` or `clamp()`)
- Any `cubic-bezier(...)` (use `--ease-*`)
- Any `z-index: N` literal (use `--z-*`)
- Any inline `<style>` block in HTML pages with rules — use class composition

### 3.4 Forbidden class patterns
- `.btn-*` (except `.btn` itself which is aliased)
- `.card-*` (except `.card` itself which is aliased)
- `.f10-*-card` (legacy SF10 naming)
- `.ca-card-v2` (use `.sv-card` instead — single canonical namespace)
- `.ca-btn-v2` (use `.sv-btn`)

---

## 4. Token Mapping Strategy (legacy → sovereign)

The codemod (`tools/migrate-to-sovereign.js`) uses this canonical mapping table. **Visual intent is preserved** — every legacy value resolves to an equivalent semantic token.

### 4.1 Color mapping (the 12 most-common hex literals → tokens)
```
#040E1A → var(--surface-background) (--bg)
#0A1F3A → var(--surface-1) (--surf)
#0D2847 → var(--surface-2) (--surf2)
#0F2D52 → var(--surface-3) (--surf3)
#122F55 → var(--surface-elevated) (--surf4)
#0CC9A8 → var(--accent) (--teal) — context: dark surfaces
#0AA88C → var(--teal-d)
#E8F0FA → var(--text-primary) (--cloud)
#B8CCE0 → var(--text-secondary) (--steel)
#8A9DB8 → var(--text-tertiary) (--mist)
#7E96B0 → var(--text-disabled) (--dim-c)
#FFFFFF → var(--white)
```
rgba whites map to `--white-03/04/05/06/08`. rgba teals map to `--teal-06/08/12/15/20/25/30/40`.

### 4.2 Spacing mapping
```
4px  → var(--space-1)
8px  → var(--space-2)
12px → var(--space-3)
16px → var(--space-4)
24px → var(--space-6)
32px → var(--space-8)
48px → var(--space-12)
64px → var(--space-16)
96px → var(--space-24)
128px → var(--space-32)
```
Other values are rounded to the nearest grid step.

### 4.3 Font-size mapping
```
11px  → var(--text-xs)        12px → var(--text-xs)
13px  → var(--text-sm)        14px → var(--text-sm)
15px  → var(--text-md)        16px → var(--text-md)
17px  → var(--text-md)        18px → var(--text-lg)
20px  → var(--text-xl)        22px → var(--text-xl)
24px  → var(--text-2xl)       28px → var(--text-2xl)
30px  → var(--text-3xl)       36px → var(--text-4xl)
40px  → var(--text-5xl)       48px → var(--text-5xl)
```

### 4.4 Z-index mapping
Any literal must align to the ladder values; if a developer needs a new tier, add it to `crowagent-brand-tokens.css`, not inline.

### 4.5 Cubic-bezier mapping
```
cubic-bezier(0.16, 1, 0.3, 1)       → var(--ease-canonical)
cubic-bezier(0.4, 0, 0.2, 1)        → var(--ease-standard)
cubic-bezier(0.65, 0, 0.35, 1)      → var(--ease-in-out)
cubic-bezier(0.34, 1.56, 0.64, 1)   → var(--ease-spring)
all others                          → var(--ease-canonical) (sheriff catches drift)
```

### 4.6 Gradient mapping
676 hardcoded gradients collapse to **5 canonical recipes**:
```
.sv-gradient--hero      radial-gradient at top, --accent-bg → transparent + --surface-bg
.sv-gradient--card      linear-gradient(180deg, --surface-1 → --surface-2)
.sv-gradient--cta       linear-gradient(180deg, --accent → --teal-d)
.sv-gradient--halo      radial-gradient(circle at top right, --accent-bg, transparent 60%)
.sv-gradient--divider   linear-gradient(90deg, transparent, --border-default, transparent)
```
The codemod identifies the 5 most-common gradient signatures and replaces inline gradients with the matching utility class.

---

## 5. Migration Procedure (`tools/migrate-to-sovereign.js`)

1. **Scan**: walk every `.html` file outside `node_modules/`, `tests/`, `audit-results/`.
2. **HTML class sweep**: for each match in the Extinction List (§3.1, §3.2), replace with the sovereign equivalent. Track replacements per file.
3. **Inline `<style>` purge**: detect and remove inline `<style>` blocks that duplicate primitive rules; replace inline button/card CSS with sovereign primitive classes on the element.
4. **CSS-side cleanup** (`styles.css` `@layer legacy` block): hex literals → tokens, `Npx` padding/gap → spacing tokens, `font-size:Npx` → `--text-*`. Performed via a separate code-CSS sweep with the same mapping tables.
5. **Verify**: rebuild `styles.min.css` via `csso`, run `tools/sovereign-sheriff.js`, run Playwright probe suite.

The codemod is **idempotent** — running it twice produces no further changes.

---

## 6. The Sheriff (`tools/sovereign-sheriff.js`)

A Node.js script that fails the build on:

| Violation | Threshold |
|---|---|
| Button variants in HTML class usage | ≤ 12 valid `.sv-btn` combinations only |
| Card variants in HTML class usage | ≤ 5 valid `.sv-card` combinations only |
| Hardcoded hex literals in CSS (excluding token file + SVG) | 0 |
| Hardcoded `font-size: Npx` in CSS | 0 |
| Hardcoded `gap: Npx` in CSS | 0 |
| `cubic-bezier(...)` literals outside token file | 0 |
| `z-index: N` literals outside token file | 0 |
| `.btn-*` legacy class usage in HTML | 0 |
| `.card-*` legacy class usage in HTML (except sovereign chain) | 0 |
| Inline `<style>` blocks in HTML with author rules | 0 |

Run: `node tools/sovereign-sheriff.js`
Exit code 0 = pass, 1 = drift detected.

---

## 7. Probe Gates (`tests/sf46-sovereign-drift-detector.spec.js`)

Runtime verification — 10 Playwright tests confirm tokens resolve, primitives are loaded, brand hues differ, Cmd+K mounts, view transitions wired, `@layer components` parsed, comparison-table progressive disclosure attaches.

---

## 8. Acceptance Criteria

The migration is complete when **all of the following** are true:
- [ ] `node tools/sovereign-sheriff.js` exits 0
- [ ] All sf46 Playwright probes pass on chromium
- [ ] `styles.css` `@layer legacy` block contains zero hex, zero `Npx` gaps, zero cubic-bezier literals
- [ ] HTML class audit shows ≤ 12 button variants and ≤ 5 card variants in actual usage
- [ ] All 13 archetype info-page inline `<style>` blocks are reduced to critical-CSS only (no author component rules)
- [ ] `styles.min.css` is ≤ 50% of current 615KB size (target ~280KB after dead-code removal)
- [ ] Visual regression baselines updated and golden

---

## 9. Maintenance contract

Any future PR that touches CSS/HTML MUST:
1. Pass `sovereign-sheriff.js`
2. Add new tokens to `crowagent-brand-tokens.css`, never to a feature file
3. Add new primitive variants to `sovereign-primitives.css`, never alongside a feature
4. Document the addition in this file (§2 if it's a new primitive, §1 if it's a token)
5. Update probe gates if a new architectural commitment is added
