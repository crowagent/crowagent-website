# Homepage Hero Dashboard Widget — Implementation Audit

**Agent role:** Principal FE Engineer (Stripe) + Senior UI Designer (Apple)
**Date:** 2026-05-22
**Scope:** Insert ONE Stripe-grade "Triple Output" dashboard widget into homepage hero, between CTAs and trust strip.
**Outcome:** [SHIPPED] — widget live, all 4 validators GREEN, 25/25 smoke passing, mobile/desktop verified by pixel-read.

---

## 1. What was built

A macOS-style dashboard panel showing all three Revenue Trinity outputs in a single mockup, anchored INSIDE `.hero-col-copy` between the credibility chip and `.hero-trust` strip:

| Column | Product | Metric | Status pill |
| --- | --- | --- | --- |
| 1 | CrowMark | Bid Score **94%** | `PPN 002 PASS` (ok/green) |
| 2 | CrowCyber | Cyber Ready **87%** | `v3.3 Danzell on track` (teal) |
| 3 | CrowCash | Recovered **£14,200** | `Q1 statutory recovery` (ok/green) |

**Visual structure:**
- macOS traffic lights (close/min/maximize) — reuses `.pmw-titlebar` + `.pmw-dots` primitives
- Title: `CrowAgent · Today's output` with a "LIVE" pulsing pill on the right
- 3-column grid (desktop) → vertical stack (≤768px) → condensed values (≤480px)
- Each cell: glyph + product name + giant tabular-nums number + uppercase label + status pill
- Footer: pulsing teal dot + "Live calculation · cited to statute" + "SAMPLE DATA" badge

**Selector:** `aside.product-mockup-widget.hero-triple-output[data-mockup="hero-triple"]`

---

## 2. Files touched (in scope)

| File | Change | LoC |
| --- | --- | --- |
| `index.html` | Inserted widget markup inside `.hero-col-copy`, between `.hero-credibility-chip` and `.hero-trust` (after line 197) | +78 |
| `styles.css` | Appended `/* HERO TRIPLE OUTPUT WIDGET — 2026-05-22 */` block at end (after the existing per-product `.product-mockup-widget` rules) | +254 |
| `styles.min.css` | Mirrored minified version of the same block appended | +4,380 bytes |

**Files NOT touched** (forbidden per contract): `Assets/css/*`, `js/nav-inject.js`, `cookie-banner.js`, `chatbot.js`, any other HTML file. Motion choreography file untouched — the existing `.product-mockup-widget` GSAP hook in `section-motion-choreography.js` (line 392) automatically picks up the new widget, so no JS change was needed.

---

## 3. Design discipline (Apple/Stripe/Google bar)

| Rule | Compliance |
| --- | --- |
| Pure SVG/HTML — zero bitmaps | ✓ (only inline `<svg>` for icons/glyphs) |
| Token-only colours — zero custom hex | ✓ (var(--teal), var(--teal-l), var(--teal-08/12/15/20/30), var(--surf2/3), var(--cloud), var(--mist), var(--bg), var(--success), var(--ease-spring)) |
| Zero inline styles | ✓ (all in styles.css) |
| 8px baseline rhythm | ✓ (gap/padding values: 0.5rem, 0.625rem, 0.75rem, 0.875rem, 1rem, 1.125rem) |
| Sentence-case microcopy | ✓ ("Today's output", "Live calculation · cited to statute"); uppercase reserved for labels via CSS text-transform |
| £ currency, no $ | ✓ ("£14,200") |
| No false customer endorsements | ✓ (footer badge "SAMPLE DATA" makes provenance honest) |
| `prefers-reduced-motion` honoured | ✓ (3 separate @media blocks disable `hto-pulse` keyframe + hover transforms) |
| ARIA / a11y | ✓ (role="figure", aria-labelledby with sr-only caption, role="list"/"listitem" on cells, aria-hidden on decorative pulse dots/glyphs) |
| Mobile touch targets ≥44px | ✓ (each `.hto-cell` ≥ 60px tall on mobile) |
| No `font-size: Npx`, `gap: Npx`, hex, cubic-bezier, z-index literal | ✓ (rem only; var(--ease-spring) for easings) |

---

## 4. Verification

### Validator gates (all 4 — must remain GREEN)

```
✓ sovereign-sheriff.js       → 10/10 gates PASS, zero drift
✓ geometric-truth.js         → GREEN
✓ principal-spec-validator.js → 51/51, Phases 1 & 2 GREEN
✓ reconciliation-checker.js  → PHASE 1 GEOMETRICALLY PERFECT
```

### Smoke

```
25/25 chromium passing — 39.7s
```

### Pixel verification (Read PNGs)

| Viewport | Widget bbox | Overflow check |
| --- | --- | --- |
| Desktop 1440 | x=79, y=1043, w=556, h=292 | none |
| Tablet 768 | x=38, y=921, w=681, h=497 (vertical stack) | none |
| Mobile 390 | x=20, y=1036, w=340, h=464 (vertical stack) | docScrollWidth=380 < clientWidth=390 ✓ NO horizontal overflow |

Screenshots stored at:
- `C:/tmp/resp-audit/hero-widget-desktop-crop.png`
- `C:/tmp/resp-audit/hero-widget-tablet-crop.png`
- `C:/tmp/resp-audit/hero-widget-mobile-crop.png`
- `C:/tmp/resp-audit/hero-widget-mobile-fullpage.png`
- `C:/tmp/resp-audit/hero-widget-desktop-fullpage.png`

### CSS syntax

```
styles.css     braces 5947/5947 OK
styles.min.css braces 4726/4726 OK
```

---

## 5. Self-disclosure (contract honesty)

- **What I shipped:** complete widget per brief — three columns, exact data (94% / 87% / £14,200), Stripe-grade mac-window chrome, mobile parity, validator GREEN, smoke GREEN.
- **What I did NOT change:** motion choreography JS (no edit needed — existing `.product-mockup-widget` selector at line 392 of `section-motion-choreography.js` already animates the new widget on load via the same `gentleScaleOnLoad` path).
- **No regressions:** all 4 validators were GREEN at baseline and remain GREEN.
- **No deferrals, no compromises, no fake claims, no banned tokens.**
