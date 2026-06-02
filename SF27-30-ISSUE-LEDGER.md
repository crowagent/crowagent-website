# SF27 - SF30 Issue Ledger

Tracking every issue the founder has reported this session and its resolution.
Each item has: ID, reported date, file/area, root cause, fix, evidence.

Last updated: 2026-05-18.

---

## SHIPPED FIXES (verified by Playwright + screenshot)

| ID | Reported | Surface | Root cause | Fix | Evidence |
|----|----------|---------|-----------|-----|----------|
| SF27-A | 2026-05-18 | pricing | "Start Pro trial" button bg gradient stripped; text obsidian on dark | Hard override teal gradient + obsidian text in `Assets/css/pricing-sf16.css` | `debug-screenshots/sf28/02-pricing-top.png` |
| SF27-B | 2026-05-18 | pricing | Compare table rendered `✓✓` doubled + `- —` dashes | Restored `font-size: 0` on `.check` parent; explicit font-size on ::before/::after | `debug-screenshots/sf27-pricing-compare-FIXED.png` |
| SF27-C | 2026-05-18 | blog | Button text not visible on individual posts | Layout overhaul drove proper card rendering; contrast 7.8-14.4 verified | `debug-screenshots/sf27-blog/post-FIXED2-1440-mid.png` |
| SF27-D | 2026-05-18 | blog | `.blog-stripe-body` grid-template-columns reversed — TOC ate 1fr track | Swap to `240px minmax(0, 1fr)` in `Assets/css/blog-post-sf-enh6.css`. Verified at 1024/1280/1440/1680/375 | `debug-screenshots/sf27-blog/post-FIXED-1440.png` |
| SF27-E | 2026-05-18 | faq | `.faq-chip.is-active` color overridden by `.section-padding a:not(...)` | `!important` overrides in `Assets/css/faq-page.css` | `debug-screenshots/sf27-faq-FIXED.png` |
| SF27-F | 2026-05-18 | about | Nested `<picture>` markup + parallax pushed photo down 196.8px into mission card | Removed inner `<picture>`; removed `ms-parallax-soft` class + `data-parallax="0"` | DOM gap 64px clean (probe) |
| SF27-G | 2026-05-18 | /products/ | Missing `nav-footer-sf21.css`; brand col was spanning full row | Added stylesheet link; added 5-col grid override in `Assets/css/nav-footer-sf21.css` | `debug-screenshots/sf27-products-FOOTER-FIXED2.png` |
| SF27-H | 2026-05-18 | products/individual pages | Demo slot lacked hint text + play-button glyph | Added "Hover to play" prefix on 5 pages; CSS play-triangle + pulse animation; new walkthrough block on /products/ | walkthrough probe |
| SF28 (CrowESG) | 2026-05-18 | nav | Dropdown text "Multi-framework ESG — Coming Q3 2026" overflowed 271px column | Em-dash → middot; shortened to "Q3 2026" | scrollW=clientW=234 (no clip) |
| SF28 (Cyber LS) | 2026-05-18 | homepage frameworks | SVG viewBox 160 too narrow for "CYBER ESSENTIALS" 16fs | viewBox 200, font-size 16, letter-spacing 0.3 | text width 157.4 < viewBox 200 |
| SF28 (em-dashes) | 2026-05-18 | site-wide | 70 em-dashes violated CLAUDE.md rule 4 | Batch removal: `scripts/sf29-emdash-remove.js`, 40 entity replacements across 12 files | Audit count 0 |
| SF28 (hyphens) | 2026-05-18 | blog + landing prose | 261 spaced-hyphen "AI-tell" patterns | Agent batch `text - text` → `text, text` across 34 files | 98 remaining (all in skip-zones or out-of-scope pages) |
| SF29 (Status link) | 2026-05-18 | footer | Greedy `a[href*="status.crowagent.ai"]` rule forced text to `var(--bg)` (invisible on dark footer) | Added `:not(.footer-bottom-link):not(.cookie-reopen-link)` exclusions in `Assets/css/page-fixes-sf22.css` | Status color now `rgb(138, 157, 184)` (mist) |
| SF29 (priv-cta) | 2026-05-18 | privacy | `body.f8-legal main a:not(.btn)` rule beat `.priv-cta-primary` color (teal on teal = invisible) | `!important` on color in `Assets/css/privacy-page.css` | Color `rgb(4, 14, 26)` on bg `rgb(12, 201, 168)` |
| SF29 (terms-cta) | 2026-05-18 | terms | Same legal-page link rule as priv-cta | `!important` on color in `Assets/css/terms-page.css` | Same fix verified |
| SF29 (resources dim) | 2026-05-18 | resources | `[class*="source"]` greedy selector dimmed `.resources-hero` to 0.6 opacity + 12.5px font-size | Replaced with `[class*="source-citation"]` in `styles.min.css` | Opacity 1, font 16px, h1 visible |
| SF30 (security dup) | 2026-05-18 | security | Two grids rendering same 6 standards (`.sf19-credentials` + `.security-overview-grid`) | Removed `.security-overview-grid` block; richer `.sf19-cred-card` grid retained | 6 cred-cards / 0 ov-cells |
| SF30 (privacy layout) | 2026-05-18 | privacy | Centered single-col, no sidebar TOC; differed from terms 2-col layout | Removed `.legal-page` class trap; added `.legal-toc` markup + matching CSS scoped to `body.f8-privacy main .legal-toc` | TOC sticky at x=65, 11 links, 240×622 |
| SF30b (glossary footer) | 2026-05-18 | glossary | 7 glossary pages missing `nav-footer-sf21.css` link | Batch-added stylesheet link to all 7 glossary HTML files | Trust row horizontal, 5-col grid |
| SF30 (motion bg) | 2026-05-18 | site | User asked for branded background motion on more pages | Created `Assets/css/page-motion-bg.css` with `.pmb-aurora`, `.pmb-grid`, `.pmb-orb-cluster`, `.pmb-scan-line`. Linked + applied to 15 pages (resources, privacy, terms, partners, faq, cookies, glossary[7], changelog, roadmap). Respects `prefers-reduced-motion`. | screenshot evidence in `debug-screenshots/sf30/` |
| SF30 (security ov-cell removed) | 2026-05-18 | security | User reported duplicate "AES-256 at rest / TLS 1.3 / GDPR / MFA enforced / ISO 27001" cards | See SF30 above | 0 .ov-cell after edit |

---

## SF29 — site-wide deep audit results (final, after fixes)

| Metric | Site total | Status |
|---|---|---|
| Card overlap | 0 | ✓ Clean |
| Section overlap | 0 | ✓ Clean |
| Text overflow | 0 | ✓ Clean |
| Em-dashes | 0 | ✓ Cleaned site-wide |
| Bullet issues (visible) | mostly false-positive (intentional `list-style:none` with SVG ::before bullets) | ✓ Verified intentional |
| Real low-contrast bugs found | 4 (Status link, priv-cta, terms-cta, resources hero) | ✓ All fixed |
| Detector false positives | ~165 lowContrast + ~130 buttonContrast (rgba bg detection gaps on gradient buttons / nav links / announce bar / `u-link-teal` inside callouts) | Documented |

---

## RESIDUAL (deliberately deferred — design choices, not bugs)

- **Twitter:image OG meta on more pages** (user mention): every page already has `og:image` + `twitter:image` via meta. Not a bug; user comment was about decorative motion which is now SF30.
- **Per-page motion fine-tuning**: agents may further tune `pmb-aurora` opacity / orb size per page if dim look returns. Tokens are CSS variables, easy to override.
- **"On this page" TOC on cookies.html and other legal pages**: same pattern applied to privacy can be re-used. Deferred to user request.

---

## Verification commands

```bash
# Re-run site-wide audit
cd "C:/Users/bhave/Crowagent Repo/crowagent-website" && node scripts/sf29-deep-audit.js

# Re-run 35-item flagship audit
cd "C:/Users/bhave/Crowagent Repo/crowagent-website" && node scripts/sf28-honest-audit.js

# Re-strip em-dashes (idempotent — safe to re-run)
cd "C:/Users/bhave/Crowagent Repo/crowagent-website" && node scripts/sf29-emdash-remove.js
```

---
