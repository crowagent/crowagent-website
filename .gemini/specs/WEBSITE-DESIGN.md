# Website Design Specification: Cinematic Transformation
**Scope:** `crowagent-website` ONLY
**Date:** 2026-05-14

## 1. Visual Language
- **Tokens:** Strictly adhere to the CSS variables in `crowagent-brand-tokens.css` (e.g., `--bg: #040E1A`, `--teal: #0CC9A8`).
- **Typography:** Display/Headers in Plus Jakarta Sans (`var(--font-display)`); Body in Inter (`var(--font-body)`).
- **Glassmorphism 2.0:** Elevated surfaces use high-blur backdrops, 3D tilts (5 degrees), and spot-glows.

## 2. Component Design
### The Bento Grid (`.products-bento`)
- **Structure:** Irregular CSS Grid. Max uniform height constraint applied globally to prevent ragged rows.
- **Hover State:** Transform `translateY(-8px)`, scale image by `1.02`, pulse border color to `--teal`.

### The Story Shell (`.story-shell`)
- **Structure:** Two-column split. Right column is `position: sticky` or pinned via GSAP ScrollTrigger.
- **Transition:** 800ms scrub crossfade between SVGs matching the currently active scroll step.

### Product Carousel Chrome
- **Design:** All product screenshots (`crowmark`, `crowcyber`, etc.) are wrapped in a 4px premium border (macOS/Linear style chrome) with traffic-light window controls.

## 3. Page-Level Layout Changes
- **Pricing:** Addition of columns for Cyber/Cash. A banner or distinct section for the 15% Bundle Discount.
- **Navigation:** `nav-inject.js` dropdowns must match the 6-product canonical list perfectly.
