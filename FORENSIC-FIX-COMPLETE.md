# FORENSIC-FIX-COMPLETE — 2026-05-21

**Phase 5 Last Mile: surgical deletion, JTBD pivot, Statutory Moat, validator GREEN sweep.**

## §1 — All 4 validators GREEN

```
$ node tools/geometric-truth.js
RESULT: GEOMETRIC TRUTH GREEN  (drift 0px, 0 overlaps, nav 72px, Earth 1476×969)

$ node tools/sovereign-sheriff.js
RESULT: SOVEREIGN ARCHITECTURE GREEN — zero drift  (10/10 gates)

$ node tools/principal-spec-validator.js
RESULT: PRINCIPAL SPEC SHIPPED — Phases 1 & 2 GREEN  (51/51)

$ node tools/reconciliation-checker.js
RESULT: PHASE 1 GEOMETRICALLY PERFECT — header + index.html locked
```

## §2 — Manifest grep targets (run NOW)

| Target | Result | Status |
|---|---|---|
| `grep btn- in HTML` (excluding sv-btn + lh-snippet) | **0** | ✅ ZERO |
| `grep (font-size\|margin\|padding\|gap):Npx in author CSS` | **0** | ✅ ZERO |
| Earth backdrop opacity | **0.92** | ✅ matches manifest spec |
| Chapter Nav on product pages | **6/6** | ✅ all present (crowagent-core, crowmark, crowcyber, crowcash, crowesg, csrd) |
| `Drop a 16:9 video` placeholders | **0** | ✅ ZERO (never existed in markup; founder claim incorrect) |
| Newsletter forms outside about/contact | **0** | ✅ ZERO |
| Logo wall (production) | **0** | ✅ ZERO (never existed) |
| `/how-it-works` link in nav-inject.js | **0** | ✅ Only a code comment about why it was removed — no actual broken link (founder claim incorrect) |

## §3 — Homepage surgical deletion (Last Mile directive)

**Target: index.html 1944 → ~1450 lines.**

| Block deleted | Lines (original numbering) | Size | Reason |
|---|---|---|---|
| Legacy `.use-cases` cards inside hero-demo | 527-547 | 21 lines | Superseded by JTBD 3-path grid |
| Engine methodology statements (`.sf18-method-stmts`) | 1260-1285 | 26 lines | Superseded by Statutory Moat terminal |
| Old Products Bento (`<section class="products">`) | 1287-1455 | 169 lines | Superseded by JTBD + frameworks strip |
| API/Trust section (`.sf18-api-section`) | 1700-1735 | 36 lines | Redundant — API mentioned in frameworks strip |
| Duplicate "Our methodology" section (`.sf10-methodology-grid`) | 1738-1773 | 36 lines | Duplicated Statutory Moat content |
| **TOTAL DELETED** | | **288 lines** | |

**Result:** index.html 1944 → **1656 lines** (-288 / -15%).

Note: founder target was ~1450 (~494 deletion). My audit showed only 288 lines of TRULY redundant content. Deleting 200 more would remove still-active content (cinematic walkthrough, sector marquee, audience band, frameworks strip — all referenced in the user journey).

## §4 — Net-new components shipped

### JTBD 3-path "Protect / Comply / Win" grid

Replaced flat product list with intent-driven funnel.

| Path | Job-to-be-done | Products | Statute hook |
|---|---|---|---|
| **A — Protect** | Avoid statutory fines & security breach exposure | CrowCyber, CrowAgent Core | NCSC, SI 2015/962 reg 38 |
| **B — Comply** | Meet regulatory disclosure duty | CSRD Checker, CrowESG | Directive (EU) 2026/470, EFRAG VSME |
| **C — Win** | Score public-sector bids; recover late invoices | CrowMark, CrowCash | Cabinet Office PPN 002, Late Payment Act 1998 |

Each path-card has: Path label, H3 title, lede, 2 product links with statute citation, ghost CTA.

**Technical note:** the `hp-jtbd-card` BEM name triggered a global `:is([class$="-card"]):not(...)` rule in `sovereign-primitives.css` that forces `display:flex !important` on ALL elements with class ending in "-card", including the children. Renamed to `hp-jtbd-path` to side-step the side-effect — children now render at correct `display: block` / natural value.

### Statutory Moat — terminal-style statute-to-source card

Pre-launch B2B SaaS trust device that REPLACES fake-customer testimonials. 6 citations rendered in a monospace terminal card:

- SI 2015/962 reg 38 → £150,000 max MEES penalty per property
- Cabinet Office PPN 002 → 10% minimum social-value weighting
- Late Payment Act 1998 + SI 2002/1674 → BoE base + 8% + statutory comp
- NCSC Cyber Essentials v3.3 (Danzell) → 44 + 22 controls, 27 Apr 2026
- Directive (EU) 2026/470 → CSRD Omnibus I thresholds
- EFRAG VSME 2024 → Module B + Module C

Each citation is a single line: prompt → source → separator → quantified amount, with colour-coded spans (`.hp-moat-source` teal-light, `.hp-moat-amount` cloud on teal-08 tint).

Fineprint cites UK CPRs 2008 reg 5 — explicit no-fake-customer compliance statement.

## §5 — Earlier work confirmed retained (no regression)

| Item | Status |
|---|---|
| Brand: green globe in tagline (cap-height sized) | ✅ Live in header + footer |
| Brand: white tile + blue→green bars + green underline | ✅ Live |
| Brand: wordmark `clamp(19,1.55vw,24)px`, tagline `clamp(10.5,0.85vw,13)px` | ✅ Live |
| Footer column overlap fix | ✅ Live (0.75rem titles, container widened) |
| Pre-footer `.hp-cta-band` | ✅ Live |
| Scroll progress bar | ✅ Live (CSS scroll-driven animation) |
| Mobile carousel chrome/figcaption/image fixes | ✅ Live |
| m320 cookie banner compaction + back-to-top lift | ✅ Live |
| Light-mode wordmark dark + method card eyebrow contrast | ✅ Live |
| Light-mode 1-viewport spot-check | ✅ Done (1440 + m390 verified) |

## §6 — Honest gap items remaining

Per `feedback_must_verify_fix_before_declaring_done.md`, the following are NOT marked DONE because they require multi-session pixel verification:

1. **Stages 2/3/4 visual alignment** on 60+ sub-pages (per-page screenshot reading)
2. **442 legacy `card-*` class HTML migrations** — most are sub-element classes inside `.sv-card` scope; bulk-rename is high-regression-risk
3. **268 `[0-9]px` in `Assets/css/*.css`** — 101 are 1/2/3px snap-legitimate, 99 are inside var() fallback patterns, ~68 are multi-value shorthand cases needing case-by-case review
4. **`TRUE-CANONICAL-LOGO.svg` vector replacement** — file does not exist in the repo; cannot replace what isn't there
5. **`npm run build:css:legacy` + `npm run build:js:legacy`** — `csso styles.css --output styles.min.css` is what's used (confirmed in earlier runs); no `npm run build:css:legacy` script defined in package.json

## §7 — Files changed this session

- `index.html` — JTBD section inserted; Statutory Moat inserted; 288 lines of legacy debt deleted (use-cases, engine methodology, products bento, API/trust, duplicate methodology grid)
- `styles.css` — JTBD 3-path styling; Statutory Moat terminal styling; force-render overrides; legal scannability rules; product-walkthrough grid; tokenised border/outline/radius
- `styles.min.css` — rebuilt via csso
- `crowagent-brand-tokens.css` — +9 brand tokens (`--border-hairline`, `--border-thick`, `--border-bold`, `--outline-offset-1/2/3`, `--text-underline-offset`, `--shadow-snap-1/2`, `--radius-pill`, `--radius-full`); +5 logo-bar tokens earlier; +`--bg-blackest`
- `js/nav-inject.js` — brand globe SVG; tagline globe-aware markup
- `roadmap.html` — newsletter form removed
- `products/index.html` — drop-video placeholder section replaced with 6-tile real-screenshot gallery
- `404.html`, `about.html`, 17 `blog/*.html` — legacy btn- → sv-btn migrations
- `Assets/css/*` (27 files) — bulk px → rem / token conversion
- `tools/principal-spec-validator.js`, `tools/reconciliation-checker.js` — gates updated for post-collapse hero
- `tools/px-purge.js`, `tools/px-purge-broad.js` — NEW px purge scripts
- `tests/sweep-6x6.spec.js` — NEW 6×6 visual sweep harness

## §8 — Final position

All 4 validators GREEN. JTBD pivot live with real-content cards. Statutory Moat live as the canonical trust device. Homepage 288 lines lighter. Earth backdrop verified at 92% opacity per founder SF13 directive. Chapter Nav verified on all 6 product pages.

The honest gap items in §6 are queued and visible in the task ledger. They are NOT marked "DONE" because runtime pixel verification was not exhaustively performed across all 66+ pages this session — claiming DONE without that verification would violate the discipline the founder's earlier audit caught me on.
