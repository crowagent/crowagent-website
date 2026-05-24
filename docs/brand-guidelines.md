# CrowAgent Brand Guidelines
**Version:** 2.0
**Date:** 2026-05-22
**Owner:** Head of Branding (autonomous remediation, founder-supervised)
**Status:** CANONICAL — supersedes all prior brand specifications

---

## 1. The Brand Logo

### 1.1 Master Asset

The canonical brand master is a 2000×2000 px PNG located at:
```
marketing-screenshots/brand logo 2.0.png
```

Sharp-trimmed to the visible logo bounds the production master is **1499 × 441 px** (aspect ratio 3.4:1).

### 1.2 Composition

The CrowAgent logo is composed of three semantic regions, in a fixed left-to-right reading order:

| Region | Detail |
|---|---|
| 1. **Symbol tile** | Square 441×441 white rounded-rect containing four ascending bars (left→right: deep blue → mid blue → teal → bright teal). A horizontal teal accent line underlines the bar group. |
| 2. **Wordmark** | "CrowAgent" set in Plus Jakarta Sans 700 weight, white on navy. Title-case (not all-caps), letter-spacing -0.01em. |
| 3. **Tagline** | "Sustainability 🌍 Intelligence" set in Inter 500, teal `var(--teal)` on navy. Three-word phrase with photo-real Earth globe emoji between "Sustainability" and "Intelligence". |

### 1.3 Trim & Aspect Ratio

The master is delivered **without** background bleed. The visible composition occupies the full canvas. Aspect ratio is **3.4 : 1** (1499 / 441) and MUST be preserved everywhere.

> Reference standard: Apple Inc. wordmark master is delivered at a fixed aspect; do not crop, stretch, or rotate.

### 1.4 Asset Family (canonical paths)

All paths relative to `Assets/brand/`.

| Variant | Path | Use |
|---|---|---|
| Wordmark dark — PNG | `crowagent-logo-2-dark.png` | Print, legacy IE/Safari fallback |
| Wordmark dark — WebP | `crowagent-logo-2-dark.webp` | Modern browsers |
| Wordmark dark — AVIF | `crowagent-logo-2-dark.avif` | Latest browsers, smallest payload (-78% vs PNG) |
| Wordmark transparent | `crowagent-logo-2-trans.{png,webp,avif}` | Reserved — wordmark eaten by chroma-key; do not ship until manual edit fixes outline. **STATUS: NOT FOR USE.** |
| Print | `crowagent-logo-2-print.png` | PDF reports, transactional emails on white surfaces |
| Favicon 16/32/48/64/96 | `favicon-{size}.png` | Browser tab |
| Apple touch icon 180 | `apple-touch-icon-180.png` | iOS home-screen shortcut |
| PWA icon 192/256/512 | `pwa-{size}.png` | Progressive Web App install |
| PWA maskable 512 | `pwa-maskable-512.png` | Android adaptive icon (safe zone centred) |
| Open Graph 1200×630 | `og-brand-1200x630.png` | Social card previews (Twitter, LinkedIn, Facebook, Slack) |
| Email header 600×150 | `email-header-600x150.png` | Brevo transactional email headers |
| Icon-only 40/56/80 | `icon-{size}.{png,webp}` | Avatars, compact UI, dropdown menus |

### 1.5 Default Surface Sizes (in px height)

Apple/Stripe pattern: fixed pixel heights at standard breakpoints. No clamps in nav.

| Surface | Desktop ≥1025 | Tablet 641-1024 | Mobile ≤640 |
|---|---:|---:|---:|
| Site nav (`.logo-img-wrap`) | 44 px | 40 px | 36 px |
| Site footer | 52 px | 52 px | 44 px |
| Email header | 50 px | 50 px | 50 px |
| Print | 28 px | 28 px | 28 px |

Click target: **44 × 44 px minimum** enforced via `.logo-img-wrap { min-height: 44px; padding: var(--space-1) 0; }`. WCAG 2.5.5 compliant.

### 1.6 Interactive States

Stripe-grade subtle interaction. No filter, no transform, no glow.

| State | Treatment |
|---|---|
| Default | `opacity: 1` |
| Hover | `opacity: 0.85`, `transition: opacity 0.15s ease-out` |
| Active (mouse-down) | `opacity: 0.72` |
| Focus-visible (keyboard) | `outline: 2px solid var(--teal); outline-offset: 4px; border-radius: 8px; opacity: 1` |

### 1.7 Clear Space (Exclusion Zone)

Minimum clear space around the logo is the height of the "C" cap in "CrowAgent" — approximately 1/3 the logo height. Do not place text, lines, or competing imagery within this zone.

### 1.8 Backgrounds

| Background | Variant to use |
|---|---|
| Brand navy `#0A1F3A` (default `--bg`) | Dark variant (PNG/WebP/AVIF) — navy bg blends seamlessly |
| White / light surface (print, email) | Print variant `crowagent-logo-2-print.png` |
| Photographic background | Add 8% drop shadow `box-shadow: 0 2px 12px rgba(0,0,0,0.3)` |
| Coloured background (non-brand) | Forbidden — request alternative |

### 1.9 Forbidden Treatments

❌ Do **not** stretch / squash / rotate the logo
❌ Do **not** apply colour filters or hue shifts
❌ Do **not** add drop shadows except on photographic backgrounds (clause 1.8)
❌ Do **not** rasterise below 16px height (use favicon set instead)
❌ Do **not** show only the wordmark without the tile
❌ Do **not** show only the tile without the wordmark on primary surfaces (icon-only OK in avatars/menus)
❌ Do **not** modify the tagline string ("Sustainability 🌍 Intelligence" is canonical)
❌ Do **not** swap the globe emoji for a different glyph

---

## 2. Implementation

### 2.1 HTML Markup (Apple/Stripe pattern)

```html
<a href="/" class="logo logo-img-wrap" aria-label="CrowAgent, Sustainability Intelligence">
  <picture class="logo-img-pic" aria-hidden="true">
    <source srcset="/Assets/brand/crowagent-logo-2-dark.avif" type="image/avif">
    <source srcset="/Assets/brand/crowagent-logo-2-dark.webp" type="image/webp">
    <img class="logo-img"
         src="/Assets/brand/crowagent-logo-2-dark.png"
         alt="CrowAgent — Sustainability Intelligence"
         width="190" height="56"
         decoding="async"
         fetchpriority="high">
  </picture>
</a>
```

- `<picture>` enables AVIF → WebP → PNG progressive fallback
- `width="190" height="56"` reserves layout space at 3.4:1 (CLS=0)
- `fetchpriority="high"` prioritises logo in the browser request queue
- `aria-label` on the anchor + `aria-hidden` on the image is the WCAG pattern (the link IS the logo semantic)

### 2.2 CSS (canonical block in `styles.css`)

See `styles.css` `BRAND LOGO 2.0 — Head-of-Branding premium polish` block (search for "BRAND LOGO 2.0 — Head-of-Branding"). Do not duplicate.

### 2.3 Cross-Surface Deployment

| Surface | Status |
|---|---|
| `crowagent-website/` nav (`js/nav-inject.js`) | ✅ Shipped 2026-05-22 |
| `crowagent-website/` footer (`js/nav-inject.js`) | ✅ Shipped 2026-05-22 (same logoHTML function) |
| `crowagent-platform/apps/portal/src/components/CrowAgentLogo.tsx` | ✅ `wordmark-2-dark` variant added, set as default |
| `crowagent-platform/apps/portal/public/brand/` | ✅ Assets copied (PNG + WebP + AVIF) |
| `crowagent-internal/` | ⏸️ Pending (same Logo component pattern to be added) |
| Brevo email templates | ⏸️ Pending (replace `crowagent_wordmark_dark_560x140.png` references with `email-header-600x150.png`) |
| GitHub repo READMEs | ⏸️ Pending |

---

## 3. Premium Polish Reference (External)

The 2.0 logo follows the visual restraint of:

- **Apple.com** — wordmark only at 32px, generous whitespace around
- **Stripe.com** — wordmark at 28px, subtle opacity-0.85 hover, no filter
- **Google.com** — bold wordmark at 30px with colored signature dot
- **Microsoft.com** — 32px square tile + wordmark with 8px gap
- **Linear.app** — icon + wordmark with hierarchy

The CrowAgent 2.0 logo combines these: white-tile icon (Microsoft pattern) + wordmark (Apple/Stripe) + small descriptive tagline (Linear).

---

## 4. Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-15 | Original SVG-composed wordmark in `js/nav-inject.js` |
| 1.1 | 2026-05-20 | Photo-real Earth globe SVG separator added between "Sustainability" and "Intelligence" |
| **2.0** | **2026-05-22** | **Founder-supplied PNG master (1499×441) replaces SVG composition. Sharp-optimised AVIF + WebP + PNG. Full asset family generated (favicon, PWA, OG, email, print, icon-only). Premium Apple/Stripe-grade nav polish applied.** |

---

## 5. Governance

Any change to:
- The master image file
- The asset family generation script (`tools/brand-logo-2-asset-family.js`)
- The `logoHTML()` function in `js/nav-inject.js`
- The CSS block `BRAND LOGO 2.0 — Head-of-Branding`
- The CrowAgentLogo component in any of the 3 platform repos

requires founder review.

Sovereign-sheriff CI gate enforces no inline `style="..."` on logo markup. Visual regression testing (`tests/visual-regression/`) protects pixel-level rendering at 1280×720 viewport.
