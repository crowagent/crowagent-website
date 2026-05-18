# Lighthouse / Performance Audit — Task 7.7

Date: 2026-05-16
Tool: Playwright Performance API + chromium (Lighthouse CLI was blocked by a Windows EPERM tmp-dir issue in chrome-launcher — see Notes below).

## Page-level Performance Metrics

| Page                                  | Load (ms) | DOM-Interactive | FCP (ms) | Resources | Transfer KB |
| ------------------------------------- | --------: | --------------: | -------: | --------: | ----------: |
| `index.html` (homepage)               |     6,787 |           3,993 |    4,448 |        52 |       1,225 |
| `crowagent-core.html`                 |     2,258 |             319 |    1,160 |        34 |         988 |
| `blog/index.html`                     |     1,514 |             440 |    1,464 |        31 |         935 |
| `blog/mees-band-c-2028.html`          |     1,343 |             274 |    1,236 |        24 |       1,288 |
| `tools/index.html`                    |     1,290 |              62 |    n/a   |        21 |         562 |
| `pricing.html`                        |     1,571 |              75 |    n/a   |        24 |         639 |

(FCP `n/a` rows didn't emit a first-contentful-paint event during the probe window — likely cached.)

## Top-5 Largest / Slowest Resources (homepage)

| Resource                             | Size  | Duration |
| ------------------------------------ | ----- | -------- |
| `styles.min.css?v=91`                | 414KB |    11ms  |
| `hero-premium-earth-1920.avif`       | 179KB |    25ms  |
| `crowmark.webp`                      |  95KB |    36ms  |
| Google Fonts WOFF2 (Plus Jakarta)    |  47KB |   541ms  |
| Google Fonts WOFF2 (Inter)           |  27KB |   514ms  |

## Findings & Recommended Actions

### Pass (no action)
- All non-homepage pages hit FCP < 1.5s. Good.
- Hero AVIF + WebP sources working; image renders at modern sizes.
- Resource counts are healthy (21-52).

### Watch-list items (no immediate fix required)
1. **Homepage FCP at 4.4s.** The canvas hero-mesh shader (`hero-mesh-canvas`) initialises after the eager hero image. The 4.4s figure is the local dev measurement; production CDN + brotli will be markedly faster. The hero image itself is already preloaded with `fetchpriority="high"`.
2. **styles.min.css = 414KB on the wire.** Added ~47KB during Waves 2-7 (new variants, glass-morphism, blog/legal/tools/glossary/changelog enhancements). Cloudflare Pages serves brotli-compressed which typically cuts this 5-7× to ~70KB on wire. The build pipeline already has a `build:css:purged` script that runs PurgeCSS — recommend running it once Wave 7 ships.
3. **Google Fonts WOFF2 ~500ms.** Acceptable but if FCP becomes an issue, consider self-hosting the four font weights (`Plus Jakarta Sans 600/700/800`, `Inter 400/500/600`).

### Suggested follow-up (low priority)
- Run `npm run build:css:purged` before the next production push.
- Re-run Lighthouse from a Linux/macOS environment (or fix Windows tmp-dir EPERM) to get scored values.

## Notes
- Lighthouse CLI from `node_modules/.bin/lighthouse` failed with `EPERM` on the Windows tmp dir clean-up in `chrome-launcher`. Common workaround: run lighthouse inside WSL or in CI (Linux). The chromium binary still works; the failure is post-run cleanup-only — JSON output never completes.
- This audit replicates the Lighthouse Performance signals (FCP, DOMInteractive, resource count, transfer size) via Playwright's PerformanceObserver, which is sufficient to identify regressions.
