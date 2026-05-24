# CrowAgent Website — Transformation Spec (layout + wireframes)

**Goal:** rewrite every page's layout to a single, enforced design system so the whole
site reads as one premium, symmetric, top-1% product (Stripe / Apple / Google bar).
Spec-first → implement page-by-page, section-by-section → pixel-verify each → commit.
**No patching. No per-page guesswork.** Pages map to archetypes; archetypes carry the rules.

Companion docs: `BRANDING-SPEC.md` (logo/brand), `AUDIT-LEDGER-2026-05-24.md` (defects).
Local-only until `APPROVED FOR PUSH — main`.

---

## 1. GLOBAL DESIGN SYSTEM (enforced on every page)

### 1.1 Layout grid (THE rule for symmetry)
- **One content column, centred:** `--container: min(100% - 2*gutter, 1120px); margin-inline:auto`.
  Every section's inner content uses this SAME column → content shares one left/right edge
  down the whole page (fixes the "everything so left" / step-drift).
- **Gutter:** `--gutter: clamp(20px, 4vw, 48px)` (single value site-wide).
- **Full-bleed ONLY for:** hero gradient backdrop, sector/logo marquees, edge-to-edge
  CTA bands. Their *inner text/content* still sits in `--container`, centred.
- **Section vertical rhythm:** `padding-block: clamp(64px, 8vh, 112px)` (one token, symmetric top=bottom). Compact variant `clamp(40px,5vh,72px)` for dense bands.
- **Default content alignment: CENTRED** (heading + intro + grid). Left-align ONLY for
  long-form prose (legal/blog body) and editorial 2-col splits that have real content in BOTH columns.

### 1.2 Grid for cards (no orphans)
- Card grids use `repeat(auto-fit, minmax(260px, 1fr))` OR explicit responsive cols.
- **N-card balancing:** 3→3, 4→4, **5→4+1 with the lone card centred** (`grid-column:1/-1; max-width: 1-card; margin-inline:auto`), 6→3×2. Never a left-orphaned trailing card.
- Equal heights: `align-items:stretch` + card `height:100%`; CTA pinned bottom (`margin-top:auto`).
- Breakpoints: desktop ≥1024 full cols; 768–1023 → 2 col; <768 → 1 col.

### 1.3 Typography scale (no px orphans)
- Display `clamp(2.6rem,1.4rem+4vw,4.2rem)` · H1 `clamp(2rem,1.2rem+2.5vw,3rem)` · H2 `clamp(1.6rem,1rem+1.6vw,2.25rem)` · H3 `1.25rem` · body `1rem/1.6` · small `0.875rem` · eyebrow `0.75rem`/600/uppercase/`0.08em`.
- Inputs **≥16px** (no iOS zoom). Display font = Plus Jakarta; body = Inter. Mixed case (sentence case), never ALL-CAPS except eyebrows.

### 1.4 Spacing, color, icons
- Spacing: `--space-1..12` (4px base). Use tokens only.
- Color: dark-only — `--bg #040E1A`, `--surf #0A1F3A`, `--teal #0CC9A8`, `--cloud #E8F0FA`; accents lime/sky/mark for product hues. `color-scheme: dark` on every page.
- **Icons:** one library, `1.25rem` (20px) inline / `1.5rem` (24px) feature, **stroke-width 1.75–2 (pick 2, everywhere)**, `currentColor` or `--teal`. No mismatched/odd icons.

### 1.5 Motion / automation (premium, honest, restrained)
- Animated brand mesh-gradient hero backdrop (GPU, pauses off-screen).
- Kinetic typography: H1 verb/word rotator; rotating proof line of REAL statute facts.
- Live statutory countdowns (real deadlines). Scroll-driven section reveals (subtle fade-up, ≤500ms). Card hover lift `-2px`. All honour `prefers-reduced-motion`.
- **Never fabricated data/dashboards/customers.** Dynamic ≠ fake.

### 1.6 Nav + footer
- Single injected component (`nav-inject.js`). Nav max-width 1200, fits content at all widths; hamburger ≤1024. Footer identical on every page (5-col + trust + Companies House line). No per-page footer overrides.

---

## 2. SECTION PATTERN LIBRARY (reusable, centred)
- **S-HERO:** eyebrow (live countdown) → H1 (rotator) → sub → 2 CTAs → no-card line → 1 honest dynamic proof element. Single centred column ≤820px. Gradient backdrop.
- **S-FEATURE-GRID:** centred eyebrow+H2+intro → balanced card grid (§1.2).
- **S-SPLIT:** 2-col ONLY when both columns have real content (copy + product visual). Else use S-HERO/S-FEATURE.
- **S-MARQUEE:** full-bleed; centred heading; row of pills/logos auto-scroll, masked edges, enough items to fill (duplicate set for seamless loop so it never looks left-bunched).
- **S-CTA-BAND:** full-bleed gradient; centred H2 + sub + dual CTA + fineprint.
- **S-PROSE (legal/blog body):** single centred column ≤720ch-measure; left-aligned text; proper `<ul>/<ol>` markers; H2/H3 rhythm tokens; clause numbering aligned.
- **S-FAQ:** centred; `<details>` accordion with smooth height (`interpolate-size`), no footer snap.

---

## 3. PAGE ARCHETYPES → which pages use them
| Archetype | Sections | Pages |
|---|---|---|
| **A-HOME** | S-HERO · S-MARQUEE · S-FEATURE(jtbd) · S-FEATURE(frameworks) · S-FEATURE(how) · S-FEATURE(products) · S-FEATURE(sectors) · S-CTA-BAND · footer | index |
| **A-PRODUCT** | S-HERO(product) · S-FEATURE(use-cases) · S-FEATURE(features) · pricing · S-CTA-BAND | crowagent-core, crowmark, crowcyber, crowcash, crowesg, csrd |
| **A-CONTENT** | compact hero (eyebrow+H1+sub) · S-PROSE body · S-CTA-BAND | privacy, terms, cookies, security, cookie-preferences |
| **A-COMPANY** | compact hero · S-FEATURE / S-PROSE mix · S-CTA-BAND | about, contact, partners, roadmap, changelog, resources |
| **A-FAQ** | compact hero · S-FAQ · S-CTA-BAND | faq |
| **A-HUB** | compact hero · S-FEATURE(card grid) | tools/index, products/index, glossary/index |
| **A-TOOL** | compact hero · tool panel (centred ≤56rem) · methodology anchor · S-CTA-BAND | tools/* |
| **A-METHODOLOGY** | compact hero · S-PROSE · "Back to tool" CTA | tools-*-methodology |
| **A-BLOG-LIST** | compact hero · filter · post grid | blog/index |
| **A-BLOG-POST** | compact hero · S-PROSE article (≤720 measure) · related · CTA | blog/* |
| **A-GLOSSARY-TERM** | compact hero · S-PROSE definition · related · "Back to glossary" | glossary/* |
| **A-UTILITY** | centred message · CTAs | 404, changelog |

---

## 4. IMPLEMENTATION ORDER (one page/archetype at a time, verified)
1. **Foundation CSS:** add the §1 tokens + the canonical `.page-shell`, `.section`, `.section__inner` (the one content column), `.card-grid` (with 5→4+1), `.prose` primitives to `sovereign-primitives.css`. This is the engine every page adopts.
2. **A-CONTENT** (privacy, terms, cookies, security) — worst-reported; prove S-PROSE + markers + centred compact hero.
3. **A-COMPANY** (about, roadmap, contact, partners, changelog, resources).
4. **A-FAQ** (faq) + **A-HUB** (tools/glossary/products index).
5. **A-HOME** full pass (sector marquee centred/filled, methodology 5→4+1, merge/de-dup redundant sections, S-CTA).
6. **A-PRODUCT** ×6 polish.
7. **A-TOOL / A-METHODOLOGY / A-BLOG / A-GLOSSARY** sweeps.
8. Global motion/automation layer (rotators, countdowns, reveals) tuned per §1.5.
9. Final 4-viewport (1920/1440/1280/390) visual sweep, page-by-page Read-verify.

### Per-page workflow (every page)
spec the sections (against §2/§3) → rewrite markup/CSS to the archetype → screenshot 1280+390 → **Read the PNG** → confirm centred, symmetric, on-rhythm, markers/icons correct → commit. Then next page.

### Content review (per §, done alongside)
Remove duplicate/redundant sections (e.g., homepage trust/proof repeated across hero+sections); merge where one section serves the job; tighten copy to the startup-truth value prop.

---

## 0. BEST-PRACTICE PRINCIPLES (Apple · Google/Material · Stripe)
- **Apple:** one message per section; generous whitespace; large confident type; product/visual as the hero; scroll-bound reveals with restraint; nothing moves without purpose.
- **Stripe:** crisp, concrete copy (no fluff/AI-speak); animations that *explain*; GPU WebGL gradient that pauses off-screen; tactile micro-interactions; dense-but-legible rhythm; trust via specificity (cite the statute).
- **Google/Material:** consistent 8px spacing grid; defined type scale + color roles; motion choreography (enter/exit easing); accessibility first (WCAG 2.2 AA, focus-visible, 44px targets, reduced-motion).
- **Shared engineering bar:** semantic HTML; one container; CLS < 0.1, LCP < 2.5s; responsive 320→1920; no layout shift on reveal; pixel-verify every page at 1280 + 390.
