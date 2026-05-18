# Image Audit Report — Task 7.4

Generated 2026-05-16 by Playwright probe across 14 key pages (homepage, 6 product pages, about/contact/partners, blog index + sample article, pricing, tools index).

## Summary

- **0 truly broken images.** All images load successfully and have appropriate alt text or are explicitly marked decorative (`alt=""` + `aria-hidden="true"`).
- **40 Unsplash stock images** already flagged in `blog/*.html` via `<!-- REVIEW: stock-image -->` comments from Task 3.3 — replace with proprietary photography when budget permits.
- **0 raster images upscaled >50%** (would cause visible blur).
- **SVG mockups** (e.g. `crowcyber.html` cyber-readiness-gauge.svg) intentionally scale beyond their declared `width=600 height=338` because they are vector and infinitely scalable. No action needed.

## Aspect-ratio "mismatches" — by design

Blog cards force a 220px-tall hero with `object-fit: cover`, so the underlying 600x338 (1.78) Unsplash JPG renders at 1.50 aspect. This is the intended crop and matches publication-style blog templates. No action.

Blog article hero: `images.unsplash.com/photo-1486406146926-c627a92ad1ab` renders at 1.74 vs natural 1.50. Same `object-fit: cover` pattern. No action.

## Decorative images (correctly aliased)

- `pricing.html` `/Assets/photos/pricing-savings-value.jpg` — wrapped in `<figure aria-hidden="true">` with `alt=""`. Correct decorative-image pattern.

## Items previously flagged in Wave 3 (Task 3.3)

All blog Unsplash references carry `<!-- REVIEW: stock-image (Unsplash). Replace with proprietary photography. -->` HTML comments so the user can find them when commissioning real photography.

## Recommended follow-ups (user discretion)

1. **Photography commission.** 40 Unsplash images across blog could be swapped for proprietary photography. Budget: ~£1.5–3K for a single-day shoot at a UK commercial property.
2. **AVIF pre-build verification.** `pricing.html` AVIF source is declared but not loaded by Chromium in this test. Run `npm run build:avif:check` after any image swap.
3. **Programmatic OG image regen** if any hero image changes — `npm run build:og`.
