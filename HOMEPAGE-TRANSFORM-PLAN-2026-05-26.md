# Homepage Premium Transformation — Plan & Root-Cause Analysis (2026-05-26)

**Mandate:** creative-director / principal-architect transformation to top-0.1% (Apple/Stripe/Linear/Arc/Vercel/Awwwards). Root-cause only, no patches. Preserve business + legal + statutory truth. **Local-only on branch `transform/site-premium-2026-05-26`; `main` is the rollback checkpoint. NO push until CTO `APPROVED FOR PUSH — main`.**

Companion: `TRANSFORMATION-SPEC.md` (design system), `OPEN-ISSUES.md`, `AUDIT-LEDGER-2026-05-24.md`.

---

## 1. BASELINE (measured 2026-05-26)
- Homepage = **17,547px / 19.5 viewports** desktop · **36,481px / 40.5 vh** mobile.
- **19 top-level sections.** Premium benchmark: ~8–10 focused sections, ~8–10 viewports.
- Hero itself is good (724px, one message, statute eyebrow, clean dual CTA) — KEEP + refine.

## 2. ROOT-CAUSE ANALYSIS (why it feels "engineer-built, under-directed")
| # | Root cause | Evidence | Systemic origin |
|---|---|---|---|
| RC-1 | **Fabricated product theatre** | `.hero-demo-section` (1322px): fake dashboard "84%", CrowCyber 92%/Mark 88%/Cash 78%/Core 73% | decorative analytics added to look "SaaS"; violates truth rule + dilutes real statutory authority |
| RC-2 | **Section sprawl / no narrative arc** | 19 sections; redundant: 2 sector blocks (#2+#14), 3 closing CTAs (#17+#18+#19), 2 generic `.reveal` blocks (#6,#11) | sections accreted over time; never art-directed into one progression |
| RC-3 | **Above-fold overload** | 4 stacked sections / 2766px before first value prop (hero→sectorcloud→audience→demo) | conversion noise stacked at entry |
| RC-4 | **Flat emotional pacing** | uniform dark cards, even spacing, no tension/silence/release rhythm | engineer spacing, not directed composition |
| RC-5 | **Mobile = desktop shrunk** | 40.5 viewports on mobile; sectors block alone 6214px | no mobile-first density/collapse strategy |

## 3. TARGET NARRATIVE (one directed experience — ~9 sections, ~9–10 vh)
A scroll-choreographed arc: **Hook → Stakes → Proof-of-authority → What it is → How → Products → Trust → Close.**
1. **HERO** (keep, refine motion) — one message + statute eyebrow + dual CTA + honest live-countdown (real deadline). NO fake widget.
2. **SECTOR AUTHORITY** — merge #2 sector-cloud + #14 sectors into ONE marquee/grid.
3. **STAKES** — audience-band (#3): real per-segment statutory penalties (MEES £150k, CE v3.3 MFA, Late Payment Act 8%+, VSME). This is the emotional "cost of inaction" beat — keep, art-direct.
4. ~~hero-demo fake dashboard (#4, 1322px)~~ → **REMOVE.** Replace with nothing (hero flows to stakes) or an honest "what CrowAgent does" mechanic (statute → action), no fabricated data.
5. **PRODUCTS** (#13) — 4 enforcement products (Cyber/Mark/Cash/ESG) + foundation (Core/CSRD). Refine to balanced grid.
6. **HOW IT WORKS** (#12) — tighten to 3 clear steps.
7. **FRAMEWORKS / STATUTORY COVERAGE** — merge #7 frameworks-strip + #8 reg-strip into one authority band.
8. **TRUST** (#15) — real: data residency, ICO, Companies House, statute citations. No fake logos/testimonials.
9. **FINAL CTA** — merge #17 triple-cta + #18 contact + #19 cta-band into ONE decisive close.

Audit for removal/merge: #5 jtbd, #6/#11 generic reveals, #10 stats (verify no fabricated numbers), #16 sf18-api → fold into the above or cut.

## 4. EXECUTION ORDER (root-cause, verify each at 1440+390, commit each)
- **T1. Remove fake dashboard** (RC-1) — delete `.hero-demo-section`; verify hero flows cleanly to next beat. [biggest trust + bloat win]
- **T2. Consolidate sectors** (RC-2) — merge the two sector blocks into one.
- **T3. Consolidate closings** (RC-2) — three CTA endings → one.
- **T4. Audit + cut/merge** stats, jtbd, generic reveals, sf18-api (verify truth on any numbers).
- **T5. Above-fold rhythm** (RC-3) — tighten hero→stakes entry.
- **T6. Compositional grid + spacing rhythm** (RC-4) — one column, one rhythm (ties to TRANSFORMATION-SPEC §1).
- **T7. Motion choreography** (RC-4) — scroll-reveal discipline, hero kinetic, honest live-countdown.
- **T8. Mobile-first pass** (RC-5).
- **T9. Propagate to product + tools pages** (site coherence).
- **T10. Final 4-viewport certification (1920/1440/768/390).**

## 4b. PRODUCT-VISUAL / SCREENSHOT WORKSTREAM (CTO directive 2026-05-26)
CTO: "you already have lots of screenshots of app.crowagent.ai … you can take screenshots by your own using test users … if needed you must create and capture real." → show the REAL product; do NOT leave sections without product visuals; do NOT fabricate.

**Assets confirmed:**
- 62 real shots in `Assets/marketing-screenshots/` incl. premium dark framed `01-dashboard`/`02-epc`/`03-crowmark`/`04-csrd`/`05-analytics` (+light/avif) and raw `app.crowagent.ai_*` per-product captures (core analytics/property/reports, crowcash cashflow/collection, crowcyber assessment, dashboard1-3, etc.).
- Cleanup check: the deleted `debug-screenshots/` + `audit-screenshots-final/` were WEBSITE audit captures (blog/home/pricing), NOT product shots — no product assets lost.
- **Fresh capture VIABLE:** test user `support.crowagent@gmail.com` / pw `<REDACTED — sandbox credential; shared via handover, never in repo>` (MFA off, owner of "CrowAgent Test Account") — login verified 2026-05-26 (access_token returned via Supabase auth). Can drive app.crowagent.ai via Playwright (UI login or session inject) and capture the neutral "CrowAgent Test User · 5 properties" data.

**HONESTY FINDING (critical):** `01-dashboard-dark-framed` embeds "Platform average (89 properties) · 14.4% above platform average" — implies a customer base the pre-launch product lacks → using it as-is would propagate a fabricated-scale claim. So: prefer FRESH neutral-test-account captures (or select screens without embedded scale/comparison claims), dark theme, no "TEST MODE" badge in frame where avoidable.

**Plan:** (P-1) capture fresh dark-theme product shots via test user — dashboard/core, crowcyber, crowmark, crowcash, analytics, reports — neutral data, framed in browser-chrome device. (P-2) integrate honest product visuals: homepage "see it in action" + each product-page hero (the empty zero-state heroes removed earlier → replace with REAL per-product UI). (P-3) caption clearly as product interface. NO fabricated metrics.

## 4c. PRODUCT-PAGE TRANSFORMATION (started 2026-05-26)
Every product page carries the SAME fabricated-dashboard pattern as the homepage T1
(ca-gauge/ca-bars/product-mockup-widget with invented %s, "Live preview", "Sample data").
Treatment (the CrowCyber template): remove fabricated metrics → replace with REAL
statutory/scope content (honest framework card + factual capability panel) + token CSS;
reserve product-visual slots for genuine app screenshots once prod is healthy. KEEP all
real content. Verify each @1440 + 390, PNG-confirmed, commit per page.
- ✅ **ALL 6 product pages DONE** (committed, each PNG-verified, no fabricated metrics, no overflow):
  - **crowcyber**: fake 87% readiness radial/gauge → framework card (28 Apr 2026 + scope) + "five NCSC controls" panel.
  - **crowmark**: fake 94%/88% bid-score + "12.3/10" + per-theme scores → "10% PPN 002" card + "five National TOMs themes" panel.
  - **crowcash**: fake 78% recovery + ageing %s + "£71,500 recovered" → "BoE+8% / £40-70-100" card + "statutory entitlement" panel.
  - **crowesg**: fake materiality matrix + scores + "95% disclosure coverage at launch" (unlaunched product!) → "Q3 2026 multi-framework" card + "every major ESG framework" panel.
  - **crowagent-core**: fake £125k/£45k/EPC-E "Example House" + 73% on-track + workstream %s → "£150,000 max MEES penalty" card + "EPC→defensible MEES position" panel.
  - **csrd**: fake impact table (9 ESRS topics/3 risk/Medium) → kept honest applicability verdict + real thresholds; page already uses a REAL screenshot (04-csrd-checker-dark-framed).
  - Shared generic `.pfw-*` framework-card + themes-grid CSS added to product-hero-sf18.css (systemic, reused across all pages). Real product screenshots to slot into the reserved slots once prod app.crowagent.ai is healthy.

## 4d. REAL-PRODUCT CAROUSELS (CTO directive 2026-05-26 — "create high quality carousels, stop patching")
Correction: removing the fabricated showcases and dropping in static cards was patching.
The right move = premium carousels of the REAL product (captured via the test account).
- **Capture pipeline SOLVED:** Playwright login → wait-for-content → JS-remove driver-tour
  + NPS dialog + hide CRITICAL/2FA/BETA bars (no clicks → no destabilising) → clip → clean
  shots in `Assets/product-shots/`. Neutral "CrowAgent Test User" data, no fabricated metrics.
- **Carousel component built (shared):** `product-carousel-2026-05-26.css` + `.js` — browser-chrome
  device frame, cinematic crossfade, dot tabs + prev/next, pause on hover/off-screen, reduced-motion
  safe, accessible. Reusable `[data-pcar]` markup.
- ✅ **Homepage "See it in action" carousel LIVE** (commit): 5 real slides (Core analytics £175k/91%,
  properties, reports; CrowMark overview, contracts). PNG-verified.
- ⏳ **NEXT: roll carousels to product pages** (replace the static .pfw panels): crowagent-core
  (core-analytics/properties/reports — shots ready), crowmark (mark-overview/contracts — ready).
  crowcyber + crowcash show 0%/£0 (empty test data) → SEED neutral data, then capture + carousel.
  Each product-page carousel scoped to that product's screens. Load carousel CSS/JS per page.

## 5. PROGRESS LOG
- 2026-05-26: branch `transform/site-premium-2026-05-26` created off main (rollback). Baseline measured + captured. Plan written.
- ✅ **T1 DONE** (commit): removed fabricated "Live portfolio status" dashboard (84% gauge + invented per-product %). Kept real statute-grounded use-cases, re-framed "Who it's for". 17547→16908px. PNG-verified.
- ✅ **T3 DONE** (commit): three closing CTAs → one decisive Stripe-style pre-footer band. "Ask a question" preserved in fineprint. Sections 19→17, 16908→15925px. PNG-verified.
- **Cumulative: 17547→15925px (−1622px / −9%), 19→17 sections, all fabricated homepage metrics removed.**
- 🔶 **T2 sectors PARTIAL (honest):** root cause of one bloat source found + fixed = a DUPLICATE `.sectors-grid .sector-stat{padding-top:var(--space-7)!important}` (styles.css:27708) overriding the base — forced ~48px dead gap. Reduced to --space-5. Result: stat 98→70px, card 596→568px, section 2085→2001px desktop / 6214→5878px mobile. Cards verified still premium (PNG). **NOT fully resolved:** cards still tall (568px) — `h3` is 115px (needs rhythm investigation) and mobile is still 1-col×12 (needs density strategy: 2-col compact or shorter cards). KEEP all 12 cards + photos + sector-context stats (market/regulatory facts, not fabricated product metrics). Carry to next pass.
- ✅ **Screenshot capability CONFIRMED 2026-05-26:** app.crowagent.ai/login reachable (#signin-email + password + "Sign in"); test-user auth verified. Fresh real product capture via Playwright login flow is viable. See §4b.
- ✅ **T2 sectors COMPLETE 2026-05-26:** desktop card 596→568px (stat-padding root fix on the winning duplicate rule); mobile 2-col density (root: @479 1fr!important → repeat(2,1fr)), section 5878→4532px (−23%), padding/h3/p trimmed + overflow-wrap so long headings wrap without clipping. All 12 cards/photos/stats kept. PNG-verified 390/360. styles.css+min in sync.
- ✅ **Truth-audit PASS:** homepage `stats` ("What we cover" = 6 statute facts w/ citations) + "Why this work matters" (3 figures w/ source labels: UK GBC, HM Treasury, EU Commission) are honest sourced facts — KEEP. No fabricated metrics remain (only the T1 dashboard was fake).
- 🚧 **Screenshot capture BLOCKED by live prod outage:** NPS modal dismissal solved ("Remind me in 14 days"). BUT app.crowagent.ai is currently degraded — persistent red "CRITICAL: services temporarily unavailable" banner on every screen + dashboard metrics show "–" (API Down). Analytics/properties DO render real neutral data (CrowAgent Test User · 11 properties · £175k fine exposure · 91% compliant — honest, no scale claims). Decision: DEFER product-visual integration until prod API recovers; retry capture later. Do NOT ship marketing shots captured during an outage.
- **NEXT: T2 sectors.** Two blocks: (a) #2 `.sector-cloud-band` = compact 12-sector marquee strip (authority signal, 247px — KEEP, it's the Stripe sector-strip pattern); (b) #14 `.sectors` rich grid = 2085px desktop / **6214px mobile** (biggest single block) with photos + per-sector `.sector-stat` (e.g. "£22K average overdue per small business" — **VERIFY this stat is real/sourced or remove per truth rule**) + product-fit. Plan: tighten the grid (mobile-first density, fewer/balanced cards), truth-check every `data-target` counter, ensure it does NOT merely repeat the marquee. Then T4 (audit stats/jtbd/reveals/sf18-api), T5 above-fold rhythm, T6 grid, T7 motion, T8 mobile, T9 propagate, T10 certify.
