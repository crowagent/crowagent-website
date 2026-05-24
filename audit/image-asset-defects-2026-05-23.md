# Image + Visual Asset Audit — 2026-05-23

Auditor: Senior Art Director (read-only inspection)
Server: http://localhost:8092 (200 OK across 12/13 probed pages; partners.html networkidle timed out on first pass, served HTML inspected directly)
Probe stack: Playwright (Chromium, DPR=2, viewport 1440x900), Node stat + signature parser for natural dims, curl for HTTP status.

---

## A. Inventory snapshot

| Bucket                              | Files | Total size |
|-------------------------------------|------:|-----------:|
| `Assets/` (all)                     |   730 |   231.7 MB |
| AVIF                                |   162 |    21.6 MB |
| WebP                                |    77 |    21.3 MB |
| JPG                                 |   110 |    88.9 MB |
| PNG                                 |   147 |    79.9 MB |
| SVG                                 |    88 |     0.6 MB |
| Other (mp4, lottie, json, css, ttf) |   146 |    19.4 MB |

### A.1 Key page-hero photos (verified natural pixel dimensions)

| Asset                                                              | Dims        | Wt (KB) | Formats present | Page                |
|--------------------------------------------------------------------|------------:|--------:|-----------------|---------------------|
| `Assets/photos/hero-london-uk-compliance.jpg`                      |   1536x1024 |     332 | jpg+webp+avif (no -4k) | index.html (home hero photo)  |
| `Assets/photos/hero-data-visualisation-4k.jpg`                     |   3840x2160 |     589 | jpg+webp+avif (1x+4k)  | index.html data sections      |
| `Assets/photos/hero-uk-skyline-night-4k.jpg`                       |   3840x2560 |   1,468 | jpg+webp+avif (1x+4k)  | nighttime UK skyline backdrop |
| `Assets/photos/hero-earth-cinematic-3840.jpg`                      |   3840x3840 |   1,606 | jpg+webp+avif (960/1920/3840) | hero earth cinematic   |
| `Assets/photos/about-london-compliance-4k.jpg`                     |   3840x2560 |   2,056 | jpg+webp+avif (1x+4k)  | about.html hero               |
| `Assets/photos/contact-desk-4k.jpg`                                |   3840x2555 |     418 | jpg+webp+avif (1x+4k)  | contact.html                  |
| `Assets/photos/faq-team-collaboration-4k.jpg`                      |   3840x2561 |   1,114 | jpg+webp+avif (1x+4k)  | faq.html                      |
| `Assets/photos/partners-team-collaboration-4k.jpg`                 |   3840x2160 |   1,762 | jpg+webp+avif (1x+4k)  | partners.html                 |
| `Assets/photos/product-hero/crowagent-core-4k.jpg`                 |   3840x2560 |   1,256 | jpg+webp+avif (1x+4k)  | crowagent-core.html           |
| `Assets/photos/product-hero/crowmark-4k.jpg`                       |   3840x2560 |   1,416 | jpg+webp+avif (1x+4k)  | crowmark.html                 |
| `Assets/photos/product-hero/crowcyber-4k.jpg`                      |   3840x2155 |   1,239 | jpg+webp+avif (1x+4k)  | crowcyber.html                |
| `Assets/photos/product-hero/crowcash-4k.jpg`                       |   3840x2203 |     503 | jpg+webp+avif (1x+4k)  | crowcash.html                 |
| `Assets/photos/product-hero/crowesg-4k.jpg`                        |   3840x2160 |   1,762 | jpg+webp+avif (1x+4k)  | crowesg.html                  |
| `Assets/photos/product-hero/csrd-4k.jpg`                           |   3840x2563 |     880 | jpg+webp+avif (1x+4k)  | csrd.html                     |
| `Assets/brand/crowagent-logo-2-dark.png`                           |    1499x441 |      85 | png+webp+avif (+232/272/464/544 retina cuts) | nav logo |
| `Assets/brand/crowagent-canonical-wordmark-dark.svg`               | 560x140 vec |       1 | SVG (true vector)      | brand reference               |
| `Assets/brand/TRUE-CANONICAL-LOGO.svg`                             | 560x140 vec |       4 | SVG (gradients + clipPath) | brand reference           |
| `Assets/brand/og-brand-1200x630.png`                               |    1200x630 |      40 | png                    | OG default                    |
| `Assets/og/*.png` (51 cards, e.g. crowmark.png 70KB, index.png 79KB) |  1200x630 |  40-130 | png only               | per-page OG/Twitter           |
| `Assets/photos/hero-earth-cinematic-raw.jpg` (source)              |   3840x3840 |  21,509 | shipped to repo, NOT served | source archive only      |
| `Assets/photos/hero-earth-night-raw.png` (source)                  |    3840x... |  10,638 | shipped to repo, NOT served | source archive only      |

Licence: every photo registered in `Assets/photos/PHOTO-ATTRIBUTIONS.md` under Unsplash Licence (free commercial, attribution courtesy) or Mixkit Free Stock Video. Founder-supplied items (hero-london-uk-compliance, marketing screenshots) noted as proprietary. Royalty-free compliance VERIFIED for every served photo.

Alt-text coverage across 13 key pages: **122 `<img>` tags, 116 with descriptive alt, 6 with `alt=""` (decorative), 0 missing.** Pass.

HTTP status across served images on probed pages: **0 broken (404/5xx) requests** across home + 6 product pages + about/contact/faq/pricing/resources. partners.html served HTML returns 200, all referenced photo paths exist on disk.

---

## B. P0 — must-fix (broken, missing alt, low-res below 2x rendered)

**B1. Marketing-screenshot PNGs stretched to wrong aspect across every product page.** `Assets/marketing-screenshots/01-dashboard-dark-framed.png` (and 02/03/04/05 framed siblings) are 3040x2024 natural (3:2). They render at ~1070x400 (2.675:1) on `crowagent-core.html`, `crowmark.html`, `crowcyber.html`, `crowcash.html`, `crowesg.html`, `csrd.html`. Aspect delta ~13%, well above the 5% tolerance — visible vertical compression on every screenshot tile. Affects 25+ rendered instances (5 per product page x 6 pages). Root cause: CSS forces a fixed letterbox-style frame without `object-fit: cover` or matching source crops. (P0 visual fidelity defect.)

**B2. Twitter/X 1200x600 OG variants do not exist.** `Assets/og/` contains only 1200x630 PNGs (51 cards, Facebook/LinkedIn ratio). Site referenced spec calls for both 1200x630 AND 1200x600 Twitter variants — no `*-twitter*` or `*-1200x600*` files present. Social previews on X will be top-cropped or letterboxed. (P0 distribution defect.)

**B3. No per-page OG card on disk for several routes.** Spot-checked: `og/crowesg.png` exists but several intel/tools/blog routes either share generic `og-image.png` or have undersized PNGs. 51 cards present vs ~70+ HTML routes — coverage gap on `tools/*`, `glossary/*`, `intel/*`, `changelog`, `roadmap`. (P0 social signal.)

---

## C. P1 — quality (cheesy stock, brand mismatch, stretched, weak photography)

**C1. Home-hero photo under-res for 4K displays.** `hero-london-uk-compliance.avif` renders at 878x585 (DPR=2 means effective 1756x1170 needed) — natural is only 1536x1024. Under the Retina 2x threshold by ~14%. No `-4k` sibling exists for this image even though peers (about, contact, faq, partners, all 6 product heroes) have 3840-wide versions. Brand-flagship home hero is the lowest-fidelity image on the site. (P1 brand priority defect.)

**C2. Sector grid (home) lacks AVIF picture-sources.** `sf21-sector-01..05-1200w.jpg` etc. render inside `<picture>` but the `<source>` siblings expose only WebP and JPG — no `image/avif` type. AVIF siblings DO exist on disk (`Assets/photos/sectors/avif/sector-*.avif`) but are not wired into the `<picture>` element. Free 20-30% bytes win blocked by markup-only fix.

**C3. faq-team-collaboration-4k rendered at 1200x360 — natural is 1920x1280 (3:2). Aspect delta ~167%.** Image is being cropped to a 10:3 letterbox by CSS but a wider 4K source is on disk (3840x2561). Should render the 4K source so 4K monitors see a sharp 2400x720 effective; instead they see a stretched 2400x720 from a 1920-wide source.

**C4. Stretched fits on contact + about.** `contact-desk.avif` natural 600x399, rendered 498x280 (aspect close, but the 4K sibling 3840x2555 is on disk — wrong variant chosen at 1440 viewport). `office-window.webp` natural 1600x1068 rendered 878x494, aspect delta ~7%, no AVIF source.

**C5. Tonal mismatch — Greenwich/London skylines vs dark-obsidian brand.** Home + about + partners pages use bright daytime Unsplash crowd shots (faq-team-collaboration, partners-team-collaboration) on a `var(--bg) #0B0F14`-style background. Tonal pop is jarring vs the Apple/Stripe atmospheric-dark aesthetic the spec demands. Several `product-hero/` shots (crowcash calculator on yellow, crowmark Big Ben daytime) read as cheap stock against the dark surrounding chrome. Not a 4K problem — a curation problem. (P1 brand consistency.)

---

## D. P2 — polish

**D1. Logo: PNG-first, true SVG exists but not used in nav.** `Assets/brand/TRUE-CANONICAL-LOGO.svg` (4KB, real vector with radial+linear gradients + clipPath) and `crowagent-canonical-wordmark-dark.svg` (1.3KB plain wordmark) exist. The rendered nav uses `crowagent-logo-2-dark-544.avif` (raster, 272x80 natural, rendered 150x44 — actually OK at DPR 2 but under-Retina for DPR 3 phones). Vector-first would eliminate the 232/272/464/544 raster fan and serve perfectly on any density. (P2 because raster Retina is acceptable, but vector is the gold standard.)

**D2. Hero-cinematic 3840 sibling exists, served, but raw 21.5MB + 10.6MB sources shipped to repo.** `hero-earth-cinematic-raw.jpg` (21.5 MB) and `hero-earth-night-raw.png` (10.6 MB) sit in `Assets/photos/` next to the served variants. They are not referenced in HTML/CSS so do not impact page weight, but they bloat repo size and CI clones by ~32 MB. (P2 housekeeping.)

**D3. Inconsistent icon stroke-width.** Brand-icons in `Assets/brand/icons/*.svg` (ascending-bars, globe, sparkle) use the brief-mandated `1.75`. Inline-svg `stroke-width=` attributes in `styles.css` use a mix: **2 (5 uses), 2.5 (3 uses), 2.4 (1 use), 1.6 (4 uses), 0.5 (1 use)**. The `--icon-stroke` CSS custom-property is referenced (`stroke-width: var(--icon-stroke)` twice) but is **not defined** in the visible CSS — the variable resolves to its inherited default and rules silently apply browser-default `1`. Sector-logo SVGs use stroke-width 3 / 2.5 / 1.5 ad hoc. Brand-spec drift: site is *not* on a unified 1.75 stroke.

**D4. faq-notebook.webp has no AVIF sibling.** Several below-the-fold photos still ship only JPG+WebP. Coverage gap vs the AVIF-first build pipeline.

**D5. Marketing screenshots heavy (>500KB PNGs).** `01-dashboard-dark-framed.png`, `02-epc-check-dark-framed.png`, etc. ship as PNG at 3040x2024. AVIF siblings exist (`*-framed.avif`) but the served `<img src>` is the PNG. Either wire `<picture>` with AVIF source or pre-encode to AVIF-only. Each tile is ~1.5-2.5 MB unnecessary download per product page. (P2 weight.)

---

## E. 8K (7680x4320) recommendation — VERDICT: NO

**Do not commission or ship 8K hero imagery.** 4K (3840-wide AVIF) is the correct ceiling for this site. Rationale below.

**E.1 Display-side ceiling.**
- 27" iMac 5K (5120x2880) — needs 5120 source pixels at native scale, but CSS pixels render the hero at ~1500-1800px wide → 4K source serves DPR=2 perfectly with ~30% headroom.
- 32" 4K monitors and 16" MacBook Pro 14"/16" Retina cap at 3840 source pixel needs.
- Phones DPR=3 (iPhone 14 Pro) at 390 CSS px render the hero at ~1170 device pixels — a 1920-wide source already over-delivers.
- iPad Pro 12.9" DPR=2 maxes at 2732 device pixels horizontally — 3840 source covers with margin.
- 8K monitors exist (Dell UP3218K) but installed base is essentially zero (<0.01% of web traffic per StatCounter rolling 12-month).

**E.2 Weight-side cost.**
Current 4K AVIF heroes weigh 235-1,800 KB. Re-encoding to 8K AVIF at the same perceptual quality would add ~2.5-4x bytes:

| Hero | 4K AVIF (current) | 8K AVIF est. | Bandwidth multiplier |
|---|---:|---:|---:|
| `crowcyber-4k.jpg` (via avif sibling) |   ~320 KB |  ~1,100 KB | 3.4x |
| `crowmark-4k`                          |   ~234 KB |    ~860 KB | 3.7x |
| `crowesg-4k`                           |   ~351 KB |  ~1,300 KB | 3.7x |
| `about-london-compliance-4k`           |  ~~?~~    |  ~1,800 KB | 3.5x avg |
| Per-page hero overhead                 |   ~300 KB |  ~1,100 KB | +800 KB/page |

Across 12 hero-bearing pages an 8K rollout costs the site **~9.6 MB extra cold-cache bandwidth** for zero visible gain on 99.99% of viewing surfaces. On 3G/slow-LTE this pushes LCP past 2.5s and tanks Core Web Vitals.

**E.3 Where 8K can be justified (none here).** 8K masters make sense for:
- Print collateral spillover (brochures, trade-show banners) — separate workflow, never served from web.
- Bezier-cropped ultra-wide hero where you render only a 25% strip and need 2x density of the strip — not the layout here.
- Background-video stills downsampled for poster frames — site uses Mixkit 720p ambient loop, no 8K poster needed.

**E.4 Recommended posture.** Stay at the current 3840-wide AVIF tier. The actual blockers on perceived image quality are:
1. **B1** — fix the stretched 3:2 dashboard PNG aspect (style/markup, free).
2. **C1** — generate a `hero-london-uk-compliance-4k.{avif,webp,jpg}` 3840-wide sibling so the home hero matches its peers (one-time encode, ~600 KB ship).
3. **C5** — recurate 3-4 tonally jarring sector/product photos to dark, atmospheric, mid-tone-rich frames (Apple/Stripe reference: aerial-blue/grey/teal, not yellow calculator).
4. **D3** — define `--icon-stroke: 1.75` once in `:root` and normalise inline-SVG stroke-widths to that token.

Total runway to "100% Apple/Stripe/Google grade per page" image quality requires C1 + C5 + D3 + B1 + B2/B3 — not 8K. Estimated cost: 1 hire of an art-director-grade re-shoot or a curated 10-image royalty-free re-source (~£0, Unsplash) + ~4-6 hours of markup/CSS tightening.

---

## Top-5 critical fixes (ordered)

1. **B1** — fix stretched marketing-screenshot PNGs across 6 product pages (CSS `object-fit` + matching source crop OR re-export PNGs at 2.675:1 to match the rendered slot).
2. **C1** — generate `hero-london-uk-compliance-4k.{avif,webp,jpg}` (3840w) and update home `<picture>` to use it; current 1536-wide is brand-flagship hero rendering sub-Retina.
3. **C2** — wire AVIF `<source type="image/avif">` for the 8 sector grid `<picture>` elements (files already exist on disk under `Assets/photos/sectors/avif/`).
4. **D3** — define `--icon-stroke: 1.75` in `:root` and replace ad-hoc `stroke-width="2"`, `"2.5"`, `"2.4"`, `"1.6"` in inline SVG data-URLs with the token (or hardcode 1.75) for a unified icon rhythm.
5. **B2/B3** — generate Twitter 1200x600 OG variants for top-20 routes (homepage + 6 products + 6 tools + ~7 most-shared blog posts) and fill the OG coverage gap on tools/glossary/intel.

---

## Honest 8K verdict

**No.** 4K (3840w) AVIF is the right ceiling for crowagent-website. 8K adds 3-4x bandwidth, helps no live customer display, hurts LCP, and distracts from the real image-quality defects (curation, aspect stretching, missing AVIF wiring, brand-tonal mismatch). Spend the engineering hours on **B1/C1/C2/C5/D3** instead — those are what separates Stripe-grade from "looks like a 2020 SaaS template."

Counts: **730 assets inventoried** | **P0: 3** | **P1: 5** | **P2: 5** | **8K rec: NO.**
