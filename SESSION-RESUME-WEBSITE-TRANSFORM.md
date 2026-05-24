# SESSION RESUME — Website Transform

**Trigger phrase**: founder says "website transform" → read this file FIRST before responding.
**Last update**: 2026-05-20 late evening (post-resume execution session)
**Working directory**: `C:\Users\bhave\Crowagent Repo\crowagent-website`
**Localhost**: must run `npx http-server . -p 8092 -c-1 --cors` in background (port 8092)
**Scope**: homepage (`index.html`), header (`js/nav-inject.js`), footer (`js/nav-inject.js` FOOTER_HTML)

---

## 0. Hard rules carried into next session (do NOT compromise)

1. **Never claim "GREEN" or "done" without a real screenshot.** Validators check DOM/CSS, not pixels. Every claim must be backed by `Read` on a Playwright PNG. (Founder corrected this twice on 2026-05-20.)
2. **Geometric truth is the only truth.** `tools/geometric-truth.js` outputs four numbers — drift, overlaps, nav-height, earth-size. Run it before AND after every visual change. Quote the numbers.
3. **No legacy injection** — sovereign primitives only. No new CSS classes without adding them to `SOVEREIGN-ARCHITECTURE.md` first.
4. **No fake customer content.** Pre-launch. The anchored value prop: *"Affordable compliance and sustainability intelligence for UK SMEs — cited to statute, built to remove the manual work."*
5. **CrowCyber + CrowCash are FULLY equal live products.** ESG remains the only Q3 2026 waitlist item.
6. **Polish over replace.** If something is good (e.g. animated SVG product mocks, footer grid), keep it.
7. **Visual verification protocol per change**:
   - Edit CSS/HTML
   - `npx csso styles.css --output styles.min.css`
   - Take Playwright screenshot at 1440 / 768 / 390
   - Use `Read` on each PNG, look at the pixels
   - Compare against the spec being claimed fixed
   - Only THEN mark task complete

---

## 1. Current GREEN state (geometric truth — measured, not claimed)

Run `node tools/geometric-truth.js` to reproduce. Last measurement 2026-05-20 late:

```
═══════════════════════════════════════════════════════════════
  GEOMETRIC TRUTH VALIDATOR — Homepage @ 1440×900
═══════════════════════════════════════════════════════════════
A) H1 ↔ CTA horizontal-centre drift:  0 px           ✓  (gate: ≤ 10 px)
   H1   center: x=715, y=386, 750×160
   CTA  center: x=715, y=607, 315×44

B) Card overlap count:               0 overlaps     ✓  (gate: = 0)
   Cards scanned:                   13

C) #ca-nav rendered height:          72 px           ✓  (gate: > 60 px)

D) Earth backdrop renders:           1476×969     ✓  (gate: height > 100 px)
   z-index=-1, position=absolute, opacity=0.92

Hero section: 1430×936 (at top: 172)   ← TRIMMED from 1095 to 936
═══════════════════════════════════════════════════════════════
  RESULT: GEOMETRIC TRUTH GREEN
═══════════════════════════════════════════════════════════════
```

Other validators (re-run after this session's hero-collapse-aware rewrites):
- `node tools/sovereign-sheriff.js` → **10/10 GREEN** (zero hex/px/cubic-bezier/inline-style drift)
- `node tools/principal-spec-validator.js` → **51/51 GREEN** (Phases 1-3 spec — Phase F gates rewritten to enforce the post-GEO.A single-column centred hero rather than the old sv-grid--lg 2-col)
- `node tools/reconciliation-checker.js` → **GEOMETRICALLY PERFECT** (Phase B gates rewritten same)
- Page docHeight: 21507 → **20365px** (-1142px) via hero + inter-section trim
- Inter-section gaps: audience→cinematic 443→405 · cinematic→carousel 284→284 · carousel→frameworks 465→363

---

## 2. Architecture changes shipped this session

### Hero (index.html ~lines 184-291)
- **WAS**: `.hero-inner sv-grid sv-grid--lg` (2-column split: copy left, dashboard right)
- **NOW**: `.hero-inner sv-stack sv-stack--align-center sv-stack--gap-8` (single centred column)
- `.hero-col-visual` (right dashboard column) **REMOVED** — info preserved in cinematic walkthrough + products bento
- `.hero-col-copy` uses `sv-stack sv-stack--gap-6 sv-stack--align-center`
- Single eyebrow label (was 2 stacked pill chips)
- 2 universal CTAs (Start free trial + Book a demo →) — persona-specific CTAs lifted out

### Persona switcher (index.html ~line 384-432)
- **LIFTED** out of hero
- Now lives in `.hp-audience-band` section after sector marquee
- 6 role tabs (IT/Cyber, Finance/AR, Public Sector, Sustainability/CSRD, Landlord, VSME SME)
- Penalty banners (cyber/landlord/finance/sme) follow tab selection via existing `data-seg` / `data-for` JS

### Framework strip (index.html ~lines 600-665)
- **WAS**: 6 empty `.framework-card` boxes with 695px of dead vertical space each
- **NOW**: `.hp-frameworks-strip` — 6 horizontal rows, each with brand-coloured wordmark + citation + 1-line desc + "Explore X →" CTA. Hairline dividers, no card chrome.

### Products bento (index.html ~lines 1308-1442)
- **RESTORED** the animated SVG mocks per founder feedback ("excellent autoplay screens")
- 6 cards using `/Assets/svg-mockups/product-card-mock-*.svg` (with 21+ `<animate>` elements per file)
- `data-product` attribute on each card drives per-product brand hue accent
- Real product PNGs still showcase in cinematic walkthrough section + individual product pages

### Nav (`js/nav-inject.js` ~line 137-149)
- CrowCyber + CrowCash promoted to "Live compliance engines" column with Core/Mark/CSRD
- ESG remains in waitlist position (Q3 2026)
- `.sv-nav-row` grid `1fr auto 1fr`, `column-gap: var(--space-12)` for Stripe breathing room

### Footer (`js/nav-inject.js` FOOTER_HTML)
- **PRESERVED** as-is — already premium-grade per audit
- 5-column grid (Brand / Products / Free Tools / Resources / Company)
- Trust strip at top, social icons, region selector, Companies House line at bottom

### CSS fixes (styles.css)
- Line 14855: exclusion list for `.hero > *:not(...)` extended to include `.hero-backdrop`, `.hero-bg-earth`, `.hero-bg-vignette`, `.hero-bg-grid`, `.hero-hud-counter`, `.hero-hud-metrics`, `.hero-hud-signal`, `.hero-hud-pulse`, `.hero-orbit-stage` (fixed Earth 0×0 collapse)
- Line 23716: blanket `.hero > * { position: relative }` rule **DELETED**
- Lines 1721-1736: `@media(min-width:1024px)` split-hero grid rules **REMOVED**
- Lines 1744-1747: `@media(min-width:1440px)` `.hero-inner` grid rule **REMOVED**
- Line 27131: glass-card multi-selector rule had `position: relative` **REMOVED** (was overriding `.hero-hud-metrics { position: absolute }` from line 26000, pushing hero 230px right)
- New `.hp-audience-band` + `.hp-frameworks-strip` + mobile-H1 + `--z-hud` token added

---

## 3. Files of record

| File | What changed this session |
|---|---|
| `index.html` | Hero collapsed to single centred stack; persona band added after marquee; framework strip rebuilt; products bento reverted to animated SVG mocks |
| `styles.css` | Exclusion-list extended; blanket .hero > * rule deleted; 2-col hero media queries removed; glass-card position:relative removed; new sections styled |
| `styles.min.css` | Re-minted via `npx csso styles.css --output styles.min.css` |
| `Assets/css/sovereign-primitives.css` | `.sv-nav-row` column-gap up to `--space-12` |
| `js/nav-inject.js` | Product equality (Cyber/Cash to Live column); nav row uses `.sv-nav-row` |
| `tools/geometric-truth.js` | **NEW** — 4-gate Playwright validator |
| `tools/principal-spec-validator.js` | 51 gates across Phases 1-3 |
| `tools/reconciliation-checker.js` | Updated for sv-nav-row architecture |
| `HOMEPAGE-FINDINGS.md` | Single ledger of every defect + resolution |
| `crowagent-brand-tokens.css` | New `--z-hud: 10` token |
| `SOVEREIGN-ARCHITECTURE.md` | §2.15 documents `.sv-nav-row` primitive |

---

## 3c. Defects fixed in 2026-05-21 pass (§4.4 CTA band + §4.1 6×6 sweep + m320 compact)

| ID | Issue | Status | Proof |
|---|---|---|---|
| §4.4 | Pre-footer "Ready to get started?" CTA band missing | ✅ **BUILT** | New `.hp-cta-band` section inserted before `regulatory-footnotes`. Stripe-style radial+linear gradient strip with eyebrow / H2 / sub / dual CTAs / fineprint. Copy anchored to value prop: "Affordable, statute-cited compliance and sustainability intelligence built for UK SMEs. 14-day free trial · no credit card required · cancel any time." Verified d1440 / d1920 / t1024 / t768 / m390 / m320 in sweep-6x6 — desktop side-by-side, mobile stacked full-width. |
| §4.1 | Full visual sweep at 6 viewports × 6 scroll positions | ✅ **DONE** | New `tests/sweep-6x6.spec.js` captures m320 / m390 / t768 / t1024 / d1440 / d1920 across hero / marquee / cinematic / carousel / methodology / prefooter. 36 PNGs read end-to-end. Defects below were extracted from the sweep. |
| §4.1-M320-1 | m320 cookie banner consumed 60% viewport | ✅ **COMPACTED** | `@media (max-width: 360px)` override on `#ca-cookie` shrinks padding to `space-3 / space-4` and intro text to `--font-size-2xs`. WCAG 2.5.5 44×44 button tap targets preserved. |
| §4.1-M320-2 | m320 hero eyebrow wraps to 3 lines | ✅ **FIXED** | Wrapped "27 Apr 2026" in `<span class="hero-eyebrow-suffix">` + CSS hides at ≤360px. Eyebrow now 2 lines: "NOW IN FORCE · CYBER ESSENTIALS V3.3 DANZELL". |
| §4.1-M320-3 | m320 back-to-top stacks under banner buttons | ✅ **LIFTED** | `body.has-cookie-banner #sf21-back-to-top { bottom: calc(24px + var(--ca-cookie-banner-h, 340px) + env(safe-area-inset-bottom)) }` (mobile) with a tablet+ smaller-lift override. |

## 3b. Defects fixed in 2026-05-20 LATER pass (Gemini audit follow-up)

| ID | Issue | Status | Proof |
|---|---|---|---|
| G1 | Scroll progress bar missing 3 days | ✅ FIXED | Added `<div id="scroll-progress" class="scroll-progress">` near top of body + CSS using scroll-driven animation timeline (Chrome 115+/FF 110+) with JS fallback. Verified visible at scroll 1800 in desktop-1440-03-mid screenshot — teal-lime gradient bar at top-left ~10% width matching 1800/19465 page progress. |
| G2 | Nav physical DOM presence | ✅ VERIFIED | `#ca-nav.sv-nav` at 72px height per geometric-truth gate C. Sticky position takes flow space, doesn't clip content. |
| G3 | Nav-to-hero crowded | ✅ FIXED via hero trim | Hero padding-top now `clamp(40px, 4vw, 64px)` !important. Announce-bar 36 + nav 72 + 64 padding + 16 eyebrow gap = ~188px clearance to H1 centre at y=386. |
| G4 | How-it-works 4-step auto-advance | ✅ INFRA VERIFIED | sf25-interactions.js triggers `.how-tab` click() every 5.5s; page-features.js handles the click → panel switch. Whole pipeline wired. IntersectionObserver threshold 0.30 — needs section 30% in viewport to start. |
| G5 | Methodology paragraph not centred under heading | ✅ FIXED | Explicit `section[aria-label="Our methodology"] .u-section-intro { margin-inline: auto; text-align: center; max-width: 720px; }`. Screenshot methodology-1440b.png confirms centred under "OUR METHODOLOGY" eyebrow + H2. |
| G6 | "Start with the workflow" cards trimmed | ✅ FIXED | Removed inflated `flex:1` on `.triple-card p`. All 3 cards now uniform 360px (CSRD / Workflow main / FAQ). Card content fits — middle card "Start free trial" CTA + team link visible below paragraph. |
| G7 | Back-to-top hides behind cookie banner | ✅ VERIFIED | `#sf21-back-to-top` z-index = var(--z-toast) = 1200; `#ca-cookie` z-index = 1150. Live measurement confirms button renders above banner. Visible at bottom-left in scroll-1800 screenshot. |
| G8 | Card heights uniformity + grid alignment | ✅ FIXED | `body.page-home .u-grid-3 / .sf10-methodology-grid / .triple-cta-grid { align-items: stretch }` + child `height: 100%`. All cards in each grid row now match. |
| G9 | Spacing above footer + meta controls | ✅ FIXED | `body.page-home .regulatory-footnotes` padding `clamp(40px, 4vw, 64px) / clamp(32px, 3vw, 48px)`; `#ca-footer` margin-top `clamp(40px, 4vw, 64px)`. |

**Honest non-fixes from Gemini's prompt (claims that were already correct or not applicable):**
- "0px Header Height Failure" — nav was always 72px, not 0. Geometric-truth has gated this. Likely Gemini was looking at a transient render-before-injection state.
- "Demo missing from home page" — inline live-demo widget (#live-demo) exists at lines 654-720 of index.html (EPC postcode checker). Visible in page.
- "509px Drift & 62 Overlaps" — geometric-truth A: 0px drift, B: 0 overlaps. Either Gemini ran a non-geometric measurement or was on a stale snapshot.

## 3a. Defects fixed in 2026-05-20 LATE session (this run)

| ID | Issue | Status | Proof |
|---|---|---|---|
| HUD.1 | INFORCE status card (`hero-hud-counter`) overlaid H1 at mobile/tablet AND desktop (collided with centred H1) | ✅ FIXED | All HUD widgets (`hero-hud-counter`, `-metrics`, `-signal`, `-pulse`, `-orbit-stage`) hidden unconditionally — they were vestigial from the old 2-col hero. Info preserved in `.hero-eyebrow` + `.sf18-trust-bar` + `.hp-frameworks-strip`. |
| H1.1 | Mobile 390 H1 broke mid-word ("quanti / fied") | ✅ FIXED | Removed `&nbsp;` between "compliance," and `<em>quantified</em>`. Now wraps cleanly: "UK compliance, / quantified. / Not guessed." with italic teal "quantified" intact. |
| CAR.1 | Mobile carousel figcaption gradient overlay covered the dashboard image content | ✅ FIXED | At ≤640px, figcaption switches to static below-frame caption (no overlay, no gradient). Desktop overlay treatment preserved. |
| CAR.2 | Mobile carousel chrome URL "app.crowagent.ai/dashboard" wrapped to 3 lines, bloating chrome to ~100px tall and crushing image | ✅ FIXED | URL pill hidden at ≤640px (Apple Safari mobile-mockup convention). Chrome compact, image renders fully. |
| CAR.3 | Mobile carousel image cropped to dark top-nav strip via `object-fit:cover` + `object-position:center top` | ✅ FIXED | Switched to `object-fit:contain` + `object-position:center` at ≤640px. Full dashboard now visible. |
| TRIM.1 | Hero 1095px tall (vs Stripe-grade ~765 target) | ✅ TRIMMED to 936 | Padding `clamp(40px, 4vw, 64px)` + `clamp(28px, 3vw, 48px)` with `!important` (won the 7-rule specificity stack). `.hero-col-copy` `gap-6` → `gap-4`. -159px. |
| SECT.1 | Inter-section gaps 443/284/465px | ✅ TIGHTENED | `.page-home main > section[class*="section-tone"]` etc. padding → `clamp(40px, 4vw, 64px)`. Page shorter by 1142px. Audience→cinematic 405, carousel→frameworks 363. |
| VAL.1 | Validator-spec drift: principal-spec-validator gF + reconciliation-checker gB still checked `sv-grid--lg` / `sv-stack--align-start` (the OLD pre-collapse hero) | ✅ REWRITTEN | Gates updated to enforce the NEW `sv-stack--align-center` single-column centred hero. 51/51 + 17/17 now honest. |

## 4. Open items (next session, in priority order)

### 4.1 Visual sweep at every viewport
Run a comprehensive screenshot capture at:
- Desktop 1920×1080
- Desktop 1440×900 (have)
- Tablet 1024×768
- Tablet 768×1024 (have)
- Mobile 390×844 (have)
- Mobile 320×568

For EACH viewport, take screenshots at 6 scroll positions:
1. Above the fold (hero)
2. Sector marquee + audience band
3. Cinematic walkthrough
4. Stats / frameworks strip
5. Products bento
6. Sectors + trust + final CTA + footer

Use `Read` on each PNG. List every visual issue.

### 4.2 Mobile H1 tightening
Mobile 390 H1 wraps to 5 short lines because "quantified" is wide. Functional (no overflow) but not premium. Options:
- Smaller `clamp()` min on mobile
- Add `<wbr>` or `&shy;` for cleaner break points
- Tighter copy ("UK compliance, quantified.")

### 4.3 Hero height trim — PARTIAL ✅
Hero trimmed 1095 → 936 (-159px) via padding + gap reduction. To reach Stripe ~765 target, another ~170px needed via:
- `.sf18-trust-bar` (statute-mapped to: NCSC / IASME / Cabinet Office / MHCLG / EFRAG / ICO) — could compact into single line
- `.hero-trust` (5 trust icons) — could collapse to 3 + "more" tooltip
- `.cta-no-card` text below buttons — could drop or shorten

### 4.4 Final pre-footer CTA band
Stripe pattern: "Ready to get started?" headline + dual pill CTAs on a gradient strip ABOVE the footer link grid. Currently there's a triple-CTA band + contact section but no single big "Ready to start?" moment. Build as `<section class="sv-cta-band">`.

### 4.5 Sections between products and footer
Long section run (sectors → trust → API → methodology → triple-CTA → contact → reg footnotes). Could trim/merge for tighter scroll story. Per Stripe research: 5-7 sections max before final CTA. Current count is 8+ post-products.

### 4.6 Audit other pages for same regressions
The hero pattern fix (Earth + HUD positioning + single-column centre) applied to homepage only. Product pages (`crowagent-core.html`, `crowcyber.html`, etc.) may have same blanket-rule issue. Run `tools/geometric-truth.js` extended for product pages.

---

## 5. Defects fixed this session — with proof

| ID | Issue | Status | Proof |
|---|---|---|---|
| C1 | Cinematic Earth renders 0×0px | ✅ FIXED | `geometric-truth.js` D: 1486×1139 |
| C2 | HUD orbital bleed | ✅ FIXED | Hero `overflow: clip`; HUD widgets now `position: absolute` |
| C3 | Hero 1859px tall + CTAs below fold | ✅ MITIGATED | Hero now 1095px (was 1859). CTAs visible above 900px fold. |
| C4 | Framework cards empty | ✅ FIXED | Rebuilt as `.hp-frameworks-strip` rows |
| C5 | Mobile chip overflow | ✅ FIXED | Single eyebrow text label wraps cleanly |
| C6 | Tablet hero right-shift | ✅ FIXED | Centred at 768px viewport |
| GEO.A | 258px H1↔CTA drift | ✅ FIXED | `geometric-truth.js` A: 0px drift |
| Autoplay regression | I replaced animated SVGs with static PNGs in products | ✅ REVERTED | All 6 bento cards back to `/Assets/svg-mockups/product-card-mock-*.svg` |

---

## 6. Memory bookmarks (loaded by future agent)

- `feedback_charter_working_style` — quality, cost, prime directive
- `feedback_website_principal_engineer_role` — Apple/Stripe/Google bar for crowagent-website
- `feedback_must_verify_fix_before_declaring_done` — runtime verification required
- `feedback_no_compromise` — no shortcuts, no `--admin` bypass
- `feedback_quality_head` — NFRs P0 equally with functional requirements
- `feedback_session_state_persistence_2026_05_18` — maintain SESSION-STATE.md at repo root

---

## 7. Quick-start protocol for next session

When the founder says **"website transform"**:

1. **Read this file end-to-end first.** Do not respond until you have.
2. Verify localhost is up: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8092/` → must return 200. If not, start it: `npx http-server . -p 8092 -c-1 --cors` (background).
3. Run all four validators and report their numbers:
   ```bash
   node tools/geometric-truth.js
   node tools/sovereign-sheriff.js
   node tools/principal-spec-validator.js
   node tools/reconciliation-checker.js
   ```
4. Take fresh screenshots at 1440 / 768 / 390 and `Read` each one. State what you actually see.
5. Restate the open items from §4 above so the founder knows the priority.
6. Ask the founder which priority to tackle first OR proceed with §4.1 (visual sweep) if no direction given.
7. **Never claim a fix is done without a screenshot + Read verification.**

---

## 8. The seven canonical reproductions (paste into agent if state is lost)

If this file is somehow missing:

```bash
cd "C:/Users/bhave/Crowagent Repo/crowagent-website"
# 1) Start localhost
npx http-server . -p 8092 -c-1 --cors &
# 2) Re-mint CSS
npx csso styles.css --output styles.min.css
# 3) Geometric truth
node tools/geometric-truth.js
# 4) Sovereign sheriff
node tools/sovereign-sheriff.js
# 5) Principal spec
node tools/principal-spec-validator.js
# 6) Reconciliation
node tools/reconciliation-checker.js
# 7) Visual sweep (writes to tests/v*.png)
BASE_URL=http://localhost:8092 npx playwright test debug-hp-shots --project=chromium --reporter=line
```

Then `Read` each `tests/v*.png` and report what's visible.

---

## 9. Founder's last directives (verbatim, in priority order)

1. "Save all the status and state as i will restart machine and we will resume once restart and back, i will say website transform"
2. "Do actual screen home page, header, footer and each and every section of home page must be check and do list all the issues what needs to be fixed"
3. "Geometric recovery" — proven via `tools/geometric-truth.js` — **ALL FOUR GATES GREEN**
4. "Why you have changed our excellent autoplay screen to new one in Our products section" — **REVERTED**, animated SVG mocks back
5. "You must not unnecessary replace anything if something can be polished and make premium grade"
6. "No legacy patch — rebuild strategically"

**End of resume file. Future agent: read §0 hard rules first, then §1 current state, then proceed.**
