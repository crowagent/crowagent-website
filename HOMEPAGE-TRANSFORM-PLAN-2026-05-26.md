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

## 5. PROGRESS LOG
- 2026-05-26: branch `transform/site-premium-2026-05-26` created off main (rollback). Baseline measured + captured. Plan written.
- ✅ **T1 DONE** (commit): removed fabricated "Live portfolio status" dashboard (84% gauge + invented per-product %). Kept real statute-grounded use-cases, re-framed "Who it's for". 17547→16908px. PNG-verified.
- ✅ **T3 DONE** (commit): three closing CTAs → one decisive Stripe-style pre-footer band. "Ask a question" preserved in fineprint. Sections 19→17, 16908→15925px. PNG-verified.
- **Cumulative: 17547→15925px (−1622px / −9%), 19→17 sections, all fabricated homepage metrics removed.**
- **NEXT: T2 sectors.** Two blocks: (a) #2 `.sector-cloud-band` = compact 12-sector marquee strip (authority signal, 247px — KEEP, it's the Stripe sector-strip pattern); (b) #14 `.sectors` rich grid = 2085px desktop / **6214px mobile** (biggest single block) with photos + per-sector `.sector-stat` (e.g. "£22K average overdue per small business" — **VERIFY this stat is real/sourced or remove per truth rule**) + product-fit. Plan: tighten the grid (mobile-first density, fewer/balanced cards), truth-check every `data-target` counter, ensure it does NOT merely repeat the marquee. Then T4 (audit stats/jtbd/reveals/sf18-api), T5 above-fold rhythm, T6 grid, T7 motion, T8 mobile, T9 propagate, T10 certify.
