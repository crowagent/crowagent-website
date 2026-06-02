# Full-Site Premium Transformation Initiative

**Adopted:** 2026-05-26 · **Branch:** `transform/site-premium-2026-05-26` · **Checkpoint:** tag `pre-transform-2026-05-26` @ `a2c11bd`
**Mandate:** CTO "FULL WEBSITE TRANSFORMATION & ARCHITECTURE ENFORCEMENT PROTOCOL" (verbatim contract; pasted 2026-05-26).
**Local-only.** No push/PR/merge until exact phrase `APPROVED FOR PUSH — main`.

## Non-negotiables (from the contract)
- Full-SITE, not homepage-only. One unified premium ecosystem across homepage → product → free tools → nav/footer → responsive → micro-interactions → performance.
- **Root-cause, foundational fixes only.** No cosmetic repaint, no isolated patches, no stacked overrides on broken foundations, no arbitrary `!important`, no hardcoded compensation (`margin-left:13px`).
- **Single design language:** unified spacing rhythm, type scale, container philosophy, motion language, elevation, colour, geometry, breakpoints.
- **Truth/authenticity:** NO fake testimonials, customer logos, trust bands, metrics, dashboards, reviews, awards, regulatory claims. Preserve real statutory authority + educational substance. Limited honest showcase artifacts permitted (clearly labelled, e.g. CrowESG "design preview") only where they genuinely improve the showcase — never misrepresented as live/customer data.
- Premium = precision, typography, interaction quality, restraint. Apple + Stripe + high-end fintech + sovereign compliance. Avoid startup noise, gradient/animation spam, dashboard clutter.
- Capture REAL platform/product screens (test org, sample data — privacy-safe). Do internal + external (reference/competitor) research as needed.

## Mandated pre-work status
- [x] **Safety checkpoint** — tag `pre-transform-2026-05-26` @ a2c11bd; rollback = `git reset --hard pre-transform-2026-05-26`.
- [~] **Deep system analysis** — three parallel architect audits in flight (CSS/design-system, content/conversion/fabrication, motion/JS/responsive).
- [ ] **Root-cause analysis** — synthesised below once audits return.
- [ ] **Foundational design-system** — built only after RCA approved.

## Confirmed root causes (running list — evidence-backed)
- **RC-1 Hero reads flat:** `.hero-mesh-canvas` (the Stripe-style WebGL backdrop) computes to `display:none`; hero falls back to a faint glow. Architectural origin: layered hero CSS across many files (≈8 `.hero-mesh-canvas` defs, ≈6 `.hero-glow` defs) — a later rule hides it. *To root-cause-locate which file/rule + why.*
- **RC-2 Fabricated product energy (FIXED 2026-05-26):** homepage products-bento used 6 animated SVG mockups with invented metrics (readiness 27→100%, DSO 58→34/£71,500, 65→92%, EPC F→B/48-of-48). Replaced with real captured screens (sample data) + honest CrowESG preview. Commit `0a0faaf`.
- **RC-3 Off-token accent colours (FIXED 2026-05-26):** stats used `stat-lime`/`stat-sky` (`--lime`/`--sky` not in approved palette). Unified to teal. Commit (H3).
- **RC-4 CSS fragmentation:** 15+ stylesheets loaded on index.html; key selectors redefined many times (hero layers, buttons, product-card-img defined 2×+). Drives inconsistency + the `[class*="btn"]` collision already hit (carousel arrows, commit `9401119`). *Quantify via audit.*

## Confirmed prior fixes this session (kept)
- Real product carousel (Cyber/Cash/Mark/Core) + framed product-page screens + CrowESG design-preview. Cyber readiness data corrected to 86% (valid CE question bank).
- Carousel control collision fixed (`pcar__nav-btn`→`pcar__arrow`; dot tap-target via `::before`).

## Execution order (contract priority)
1. Homepage (cinematic flagship) — foundational design-system FIRST, then compose.
2. Product pages → 3. Free tools → 4. Global nav/footer → 5. Responsive → 6. Micro-interactions → 7. Performance.

## ROOT-CAUSE ANALYSIS (evidence-based, from 3 architect audits 2026-05-26)

**Reframing:** the site's *content* is NOT the problem. Audit C confirms fabrication is removed (7 fake widgets gone), every regulatory check PASSES (MEES ≤£150k, Band C "proposed", PPN 002 = 10%, Late Payment rates correct), and there are **17 genuine statutory frameworks** cited correctly (SI 2015/962, Late Payment Act 1998, PPN 002, CE v3.3 Danzell, Omnibus I, EFRAG VSME, National TOMs…). That real authority is the asset to PRESERVE + ELEVATE.

**The "poor / compromised / inconsistent" feel is ARCHITECTURAL FRAGMENTATION** — the accreted residue of ~30 stacked iteration passes (sf13/sf17/sf25/sf41/sf43/ca-*/cluster-beta/transform-*/consistency-*) layered on each other and never consolidated. This is precisely the "stacked overrides on broken foundations" the protocol forbids. Concretely:

| ID | Root cause | Evidence | Propagation |
|----|-----------|----------|-------------|
| **RC-A** | **CSS fragmentation.** styles.css = 34,137 lines, ~1,908 `!important`. Key selectors redefined many times: `.hero` 310×, `.hero-glow` 9×, `.hero-mesh-canvas` 5×. | Audit A | Every hero/section edit fights prior rules → inconsistency |
| **RC-B** | **Triple type-scale + competing containers + token redefinition.** `--type-*` vs `--font-size-*` vs `--text-*` all live; `.wrap`/`.container-wide`/`.container-standard` (1400) vs `.sv-container` (1200); `--teal` redefined 3× in styles.css. | Audit A | No single hierarchy → drift across sections/pages |
| **RC-C** | **Motion fragmentation.** 6 reveal classes (`.reveal`,`.fade-in`,`.fade-in-up`,`.sf17-reveal`,`.ms-reveal`,`.s2-reveal`) × 4 JS paths × 3-4 visible-class names (`.visible`/`.is-visible`/`.is-revealed`/`.ms-in`); durations 0.45–0.6s mixed; easings split CSS-token vs hardcoded GSAP; ~30 motion JS modules. | Audit C | "fade-up spam" / inconsistent motion = the opposite of one motion language |
| **RC-D** | **Responsive sprawl.** 41 distinct breakpoints (e.g. 767/768/769, 1023/1024, 1199/1200/1279/1280/1281) vs an intended ~5. | Audit C | Unpredictable responsive behaviour |
| **RC-E** | **Cascade integrity broken.** styles.css is mostly UNLAYERED; rescue/transform files also unlayered → cascade resolves by source-order accident, defended with `!important`. `@layer` order is declared but not enforced. | Audit A | Foundations can't govern; overrides win by accident |
| **RC-F** | **Hero backdrop fallback is flat.** `.hero-mesh-canvas` (WebGL2 mesh) is the intended cinematic backdrop; without WebGL2 it falls back to a faint `.hero-glow`. Many contexts (and headless) lack WebGL2 → flat hero. | Audit C + capture | Flagship first-impression underwhelms for a subset of users |
| RC-G | 55 of 65 SVG mockups orphaned (incl. the now-replaced product-card-mock-*). Cleanup debt, not regulatory. | Audit C | Dead weight |

**Tooling-artifact correction:** earlier "flat hero / blank sections / 14k-px-empty" reads were tainted by headless Chromium defaulting to `prefers-reduced-motion: reduce` (hides mesh + suppresses reveals) AND lacking WebGL2. All future visual verification MUST use `reducedMotion:'no-preference'` and, where the mesh matters, WebGL-enabled launch flags or headed mode.

## FOUNDATIONAL PLAN (systemic, sequenced, each phase visually regression-tested with motion ON)
Priority order per contract: homepage flagship first, then propagate.

- **F1 — Token & primitive consolidation.** One canonical type scale (`--type-*`), one container system, one section-rhythm (`--section-y-*`); stop `--teal` redefinition; map legacy aliases → canonical (no value change = no regression). *Foundation everything else conforms to.*
- **F2 — Motion-system unification.** ONE reveal mechanism (one class, one visible-state, one observer, tokenised duration+easing); retire duplicate reveal classes + redundant JS; replace fade-up spam with restrained, choreographed reveals (a real motion *language*).
- **F3 — Responsive-scale normalisation.** Collapse 41 → ~5 canonical breakpoints; prefer `clamp()`/auto-fit over device-specific rules.
- **F4 — Cascade hygiene.** Rationalise `@layer` usage + retire `!important` hotspots (largest/riskiest; staged carefully because styles.css is mostly unlayered).
- **F5 — Hero (flagship).** Cinematic CSS backdrop that is premium WITHOUT WebGL2 (layered animated gradient fallback) + WebGL mesh on top when available; type/atmosphere/entrance refinement; preserve rotator/countdown/HUD hooks.
- **Propagation:** product pages → free tools → nav/footer → responsive refinement → micro-interactions → performance. Same system everywhere = one ecosystem.

**Cleanup (alongside):** remove the 55 orphaned SVG mockups once confirmed unreferenced (RC-G).

**Execution discipline:** each phase = root-cause fix (no patches), before/after capture at 1440/768/390 with motion ON, brace/200 checks, commit per phase. No push until `APPROVED FOR PUSH — main`.
