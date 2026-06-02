# DESIGN SYSTEM STANDARDISATION — Phase 2 & Phase 4
**Inputs:** D-1..D-11 + C-1..C-11 + ARCH-1..ARCH-13 from `/audit/MASTER-DEFECT-TRACKER.md`

## Standardisation applied this pass

### Token system (D-1 RESOLVED)
- **749 broken `var(----foo)` references repaired** via one-pass `sed` (each one was a 2-character typo prefixing extra dashes onto already-prefixed custom properties).
- All `--font-size-*`, `--space-*`, `--radius-*`, `--motion-*`, `--ease-*`, `--z-*` tokens now correctly resolve at every call site in author CSS.

### Border + outline + radius tokens (D-5 PARTIAL)
- Earlier remediation introduced canonical border tokens in `crowagent-brand-tokens.css`:
  - `--border-hairline: 1px`, `--border-thick: 2px`, `--border-bold: 3px`
  - `--outline-offset-1`, `--outline-offset-2`, `--outline-offset-3`
  - `--text-underline-offset: 2px`
  - `--shadow-snap-1`, `--shadow-snap-2`
  - `--radius-pill: 100px`, `--radius-full: 999px`
- Bulk sed-conversion replaced `border: 1px solid` → `border: var(--border-hairline) solid` across 27 CSS files.

### Container API (C-4 standardisation document)
Canonical containers (Sovereign):
- `.sv-container` — base, max-width 1200px, inline-margin auto
- `.sv-container--standard` — 880px (prose-friendly)
- `.sv-container--wide` — 1320px (hero-wide)
- `.sv-container--text` — 720px (article body)

Deprecated containers (DO NOT use in new code):
- `.wrap` — alias of `.sv-container` (kept for backcompat)
- `.container` — raw, unspecific
- `.container-standard`, `.container-wide`, `.container-text` — kept for backcompat, will be removed in next pass

### Grid primitives (C-3)
Canonical:
- `.sv-grid` + `.sv-grid--sm | --md | --lg | --xl`

Deprecated:
- `.ca-grid` (sprint-era)
- `.u-grid-3`, `.u-grid-4` (utility-era)
- Page-bespoke grids in `pricing-sf16.css`, `intel-tracker.css`

### Buttons (C-2, C-11)
Canonical: `.sv-btn` + variants (`--primary`, `--ghost`, `--secondary`, `--sm`, `--md`, `--lg`).

HTML adoption already 100% on user-facing CTAs (52 → 0 legacy `btn-*` migrations in prior session). The 56 distinct `*btn*` CSS families remaining are **CSS-only dead code** awaiting deletion.

### Cards (C-1)
Canonical: `.sv-card` + variants (`--accent`, `--elevated`).

The 72 distinct `*-card` CSS class families fall into 4 categories:
1. **Canonical** — `.sv-card`, `.sv-card__title`, `.sv-card__body`, `.sv-card__eyebrow` (KEEP)
2. **Deprecated but in active HTML use** — `.triple-card`, `.f10-related-card`, `.pw-sf21-card`, `.hw`, `.sector` (NEEDS MIGRATION before deletion)
3. **Dead** — `.card-1`, `.card-2`, `.card-3`, `.card-4` (in `_archive/`-style mockup files), `.bento-card`, `.premium-card` (in `finished-premium-*.html`) — SAFE TO DELETE
4. **Sub-element classes** inside `.sv-card` scope — `.card-icon`, `.card-title`, `.card-meta`, `.card-eyebrow` — KEEP as scoped descendants

## Typography scale (D-2)
Canonical scale lives in `crowagent-brand-tokens.css`:
- `--font-size-2xs: 0.6875rem`
- `--font-size-xs: 0.75rem`
- `--font-size-sm: 0.875rem`
- `--font-size-base: 1rem`
- `--font-size-base-plus: 1.0625rem`
- `--font-size-body-tight: 0.9375rem`
- `--font-size-md: 1.125rem`
- `--font-size-md-plus: 1.25rem`
- `--font-size-lg: 1.5rem`
- `--font-size-xl: 1.875rem`
- `--font-size-2xl: 2.25rem`
- `--font-size-4xl: 3rem`

Plus fluid scale (`--text-h1` → `--text-h6`) using `clamp()`.

After D-1 fix, **159 + 749 = 908 token call-sites now resolve correctly**, vs. only 159 before.

## Spacing scale (D-3)
Canonical scale: `--space-0` (0) → `--space-24` (96px), 4px-baseline.

The "two parallel scales" finding (one in brand-tokens.css, one re-declared at styles.css:55) is technically present but the values are identical. The duplicate declaration is harmless but should be deleted in next pass.

## Z-index ladder (D-9)
Canonical (in brand-tokens.css):
- `--z-base: 0`
- `--z-content: 1`
- `--z-banner: 90`
- `--z-overlay: 1000`
- `--z-modal: 1100`
- `--z-cookie: 1150`
- `--z-toast: 1200`

This pass: chatbot button explicitly set to `1201` (literal, !important) because cookie banner needed to be beneath it. Token usage healthy elsewhere; sovereign-sheriff gate passes for z-index literals.

## Standards going forward

1. **Every new visual primitive must be a `.sv-*` class**. No SF-wave additions.
2. **Token-only sizing**: `font-size`, `margin`, `padding`, `gap`, `border-radius`, `border-width`, `outline`, `z-index` must use `var(--*)` references. Sovereign-sheriff gate enforces this for styles.css.
3. **No inline `style=""`** in HTML except for cross-cutting (e.g. `--cookie-banner-h`).
4. **No new `!important` without comment trace**. Existing 2,712 `!important` declarations need governance; new ones need justification.
5. **Hero archetype**: one `.sv-hero` primitive with documented modifiers; no per-page bespoke hero CSS.
6. **Cookie banner**: `--ca-cookie-banner-h` must be set dynamically by cookie-banner.js so `body { padding-bottom }` always reserves the right amount.

## Carry-over actions for next pass

- Delete the 56 dead `*btn*` CSS families that have zero HTML references.
- Delete the `.card-1`..`.card-4` + `.bento-card` / `.premium-card` legacy classes after archive cleanup.
- Migrate `.triple-card`, `.f10-related-card`, `.pw-sf21-card`, `.hw`, `.sector` to `.sv-card`-based templates (page-level work).
- Define `.sv-hero` primitive in sovereign-primitives.css and migrate all heroes.
- Set up CSS layer ordering: `@layer reset, tokens, primitives, components, layout, pages, utilities, overrides` (currently inconsistent across two files).
- Modularise styles.css into ~10-12 files (target: no single file >2,000 lines).
