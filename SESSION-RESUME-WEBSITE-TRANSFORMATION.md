# SESSION RESUME — Website Transformation

**Trigger:** CTO types **"website transformation"** → read THIS file first, then
`TRANSFORMATION-SPEC.md`, then `AUDIT-LEDGER-2026-05-24.md`. Then resume execution.
**Last saved:** 2026-05-25 (checkpoint #2 — before CTO's detailed transformation actions).
**Working dir:** `C:\Users\bhave\Crowagent Repo\crowagent-website`.

---

## ★★ LATEST STATE — 2026-05-26/27 (REAL-PRODUCT CAROUSELS + DUMMY-DATA SEED) — READ FIRST
**Strategy (CTO):** PRIMARY products = **CrowCyber, CrowCash, CrowMark**; SECONDARY = CrowAgent Core, CrowESG. Carousels must use REAL app.crowagent.ai screens. To avoid privacy leaks (real addresses like "10 Downing Street" couldn't be reliably blurred), CTO directed: **delete/overwrite real data with safe DUMMY data, then capture** (no redaction needed). CrowESG is future/unbuilt → OK to create a designed SAMPLE/made-up screen.

**DB seeding DONE (prod Supabase `gujtuecjzfiqsdnzgyvo`, test org `4b0bffc2-efe2-425c-afb8-84369e7f6517`, user `5c2c168e...`):**
- `assets` (11): real addresses → dummy ("Northgate Plaza…Demo City", DM postcodes). `reports.asset_address` (15) → dummy. `crowmark_contracts` (3): real councils → "Demo City/Borough Council, Demo Government Department" + generic contract names.
- `cash_invoices` (7, £91,250) + `cash_debtors` (3: Northwind/Acme/Summit Trading, .example emails) seeded across ageing buckets (was £0).
- `cyber_assessments` e825976f → overall_score=86; `cyber_answers` = **44 CE answers with VALID bank question_ids** (fw-001..pm-008), 38 compliant → 86%; 6 `cyber_gaps` (4 major + 2 minor). NOTE: readiness lib matches question_id against the embedded CE bank in `crowagent-platform/web/lib/crowcyber/questions.ts` — invalid ids (the earlier 'fw-101') score 0%.
- **CLEANUP NOTE:** dummy rows on the test org — deletable later (cash_invoices/cash_debtors org=test; cyber_answers/cyber_gaps assessment_id=e825976f). Keep for screenshots.

**Carousel system:** `Assets/css/product-carousel-2026-05-26.css` + `js/modules/product-carousel-2026-05-26.js` (`[data-pcar]`: browser-chrome frame, crossfade, dot tabs, prev/next, pause hover/off-screen, reduced-motion, a11y). Single-image variant `.pcar--single`.
**Capture pipeline:** `tests/_realcap10.js` — Playwright login (creds in [[project_e2e_test_user_state]]) → set localStorage `ca:onboarding-checklist-hidden-v1=1` (kills Getting-Started widget) → wait-for-content marker → JS-remove driver-tour/NPS/banners + onboarding aside (NO clicks) → 404-guard → clip {0,0,1440,824}. **VERIFY EVERY shot by READING the PNG.**
**✅ DONE (committed 44cadac, local-only, NO push):**
- CrowCyber 0%→**86%** fixed (re-seed above). Homepage carousel = 4 REAL slides Cyber-first (cyber 86% / cash £91,250 / mark £6.7M / core-properties "Demo City").
- crowcyber.html + crowcash.html framed real screens added; crowagent-core.html → core-properties (clean, no empty EPC chart); crowmark.html refreshed.
- crowesg.html: honest **design-preview** mockup (`Assets/product-shots/_crowesg-mock.html` → esg-sample.png, re-render via `tests/_esgmock.js`), labelled "not live data" (CrowESG unlaunched Q3 2026).
- All 6 shots verified by READING PNGs + localhost:8092 render.
**NEXT:** broader cinematic/motion/composition pass across remaining pages; final 4-viewport certification. Branch `transform/site-premium-2026-05-26`, NO push until `APPROVED FOR PUSH — main`.

## ★ LATEST STATE — 2026-05-25 checkpoint #2 (READ FIRST)
**Git:** branch `main`, **62 commits ahead of origin, 0 PUSHED** (local-only; CTO has NOT given `APPROVED FOR PUSH — main`). Working tree clean. Disk: 18.5 GB free.
**CTO is about to provide DETAILED transformation actions — await them, then execute root-cause + pixel-verify, local-only.**

**This session (2026-05-25 #2) — fixed at ROOT CAUSE, all verified (commits 03801e1→f8395b4 + cleanup + consistency):**
- O-18 contact footnote-behind-cards (`.sf20-panel{height:100%}` overflowed grid row 58px → removed).
- O-22 contact card-link underline (global `.section-padding a:not()` chain beat base → added `:not(.sf20-panel)`).
- O-20 hero centring: terms + cookies + faq → ALL info-page heroes now match privacy (hero spans full-width above TOC; cookies content track→1fr; terms lead centred via nested `@layer overrides` source fix in consistency-sf41 FIX 4b).
- O-23 footer headers 32px→11px. ROOT: footer titles are `<h3>`; `@layer components h3{!important}` (sovereign-primitives:914) beat the UNLAYERED footer rule (layered !important wins). Fix re-asserted footer label size INSIDE @layer components.
- O-24 nav spacing inconsistent home-vs-rest. ROOT: (a) nav container content-box → 1328px overflow; (b) `nav-footer-sf21.css` (SF36 nav-padding-zero) loaded on only 14/27 pages. Fix: unified both nav-container rules (border-box + 64px pad + max-width 1200) + moved nav-padding-zero into always-loaded sovereign-primitives.css. Pixel-identical all page types desktop+mobile.
- Consistency: `consistency-sf41.css` added to home + 6 product pages (was missing) → primary CTAs uniform 46px sitewide (were 44/62).
- O-3/O-4/O-8/O-21 verified FIXED. O-13/14/15/19 = NOT-REPRODUCED (overlap probes clean 1536→768; only the fixed cookie banner overlaps content = expected; stale cache, INV-1).
- Cleanup: removed ~528 MB scratch (debug-screenshots/, audit-screenshots-final/, audit-results/ via git rm — recoverable from history; tests/_shots untracked). Kept node_modules, Assets, tests/visual-regression.

**Two UNIVERSAL root causes — permanently resolved:**
1. Per-page CSS-include divergence on the GLOBAL injected nav+footer → essential rules now in always-loaded `sovereign-primitives.css` (verified identical across info/product/tool-methodology/utility, desktop+mobile).
2. `@layer` precedence: order is already explicitly + identically declared (`reset,brand,sf-fixes,components,utilities,overrides`) in styles.min.css + crowagent-brand-tokens.css → deterministic. Per-rule fixes applied IN the correct layer.

**PENDING (queue):**
1. Push — awaiting CTO `APPROVED FOR PUSH — main` (DO NOT push before).
2. `.git` 1 GB bloat (old committed screenshots in history) — reclaim ONLY via history rewrite + force-push → needs explicit CTO approval; not done.
3. O-13/14/15/19 — need CTO browser width + zoom % IF still seen after hard-refresh; else closed (stale cache).
4. Final 4-viewport certification sweep (1920/1440/768/390).
5. **CTO's forthcoming DETAILED transformation actions — top priority once given.**

**Verify-tooling note:** scratch Playwright helpers live in `tests/_*.js` (untracked) — `_batch.js` `_overlap.js` `_shot.js` etc. Use the pattern: launch chromium, reducedMotion:'reduce', measure rects / read PNG. Always pixel-verify; never trust metrics alone.

---

## 0. HOW TO RESUME (do this first)
1. Start/verify server: `npx http-server . -p 8092 -c-1 --cors` (background); `curl -s -o /dev/null -w "%{http_code}" http://localhost:8092/` must be `200`. NEVER kill it.
2. `git status` — should be clean on `main`. If `chatbot.js`/`styles.css` show as modified, `git checkout --` them (recurring external drift, NOT our work). Remove untracked `audit-report.json` / `audit-screenshots/` / `tests/*-probe.spec.js` scratch (a background process regenerates them).
3. Read `TRANSFORMATION-SPEC.md` (the plan) + `AUDIT-LEDGER-2026-05-24.md` (every tracked defect + state).
4. Continue at **§4 NEXT** below.

## 1. THE MANDATE (how the CTO wants this done — do not deviate)
- **Full transformation to top-1% (Apple/Stripe/Google grade). No patching. No excuses. No exceptions.**
- **Spec-driven, page-by-page, root-cause.** NOT reactive fixing of individually-reported issues. Every page maps to an archetype in `TRANSFORMATION-SPEC.md`; rewrite each page's layout to its archetype + the global design system.
- **VERIFY VISUALLY — Read the actual PNG, every page, at 1280 + 390.** Do not rely on code/computed-style probes alone (the CTO called this out hard). Probes are a hint; the screenshot is the truth.
- Content review alongside: remove duplicate/redundant sections, merge where one section serves the job, tighten copy to startup-truth value prop.
- Add world-class motion/animation/automation (honest only — dynamic ≠ fabricated). Rotators, live statutory countdowns (real dates), brand mesh-gradient, scroll reveals. Respect reduced-motion.
- Hard laws: £ only; **no individual names** (CrowAgent Ltd, Companies House 17076461 only); no fake customers/data/dashboards; royalty-free images only; tagline = **"Sustainability Intelligence"** (decided 2026-05-25).
- **Local-only.** No push/PR/merge until exact phrase `APPROVED FOR PUSH — main`. Commit author `crowagent.platform@gmail.com`.

## 2. AUTHORITATIVE DOCS
- `TRANSFORMATION-SPEC.md` — global design system (one content column, card-grid 5→4+1, type/icon/motion standards), section-pattern library, 12 page archetypes + page→archetype map, Apple/Google/Stripe principles, implementation order, per-page workflow.
- `AUDIT-LEDGER-2026-05-24.md` — every CTO-reported + measured defect, state-tagged (OPEN/VERIFY/DECISION/DONE), with progress logs.
- `crowagent-branding/BRANDING-SPEC.md` — logo/brand canonical (separate repo).

## 3. WHAT'S DONE THIS SESSION (root-cause fixes, committed on `main`, ~35 commits)
- **Content-visibility (BIG): `ea2bee7`** — legal/company-page content was `opacity:0` (GSAP autoAlpha stuck; failsafe was home/product-only). Broadened `reveal-failsafe.js` to content containers + loaded it on all 58 pages. Privacy content now renders.
- **Hero centring `23e687f`/`06fc376`** — killed the 2-col-grid empty-right "split" (home + products).
- **Nav CTA clip `23e687f`** — widened nav 960→1200 (the new logo overflowed it).
- **List markers `08d267f`** — removed `display:flex` from global `ul/ol` rule (it suppressed bullets sitewide).
- **Hero gradient `9da8545` + crowesg `59750ed` + product heroes `15e263a`** — earth/photo backdrops → animated brand mesh-gradient (fixes AST-01 "20s broken-asset").
- **Hero de-dup `32db10d`** — removed fabricated triple-output widget + duplicated trust blocks.
- **Cache-busters `31fe0d8`** — 1,084 fragmented `?v=` → one `?v=20260524` (root cause of CTO's stale-cache "phantoms").
- **Logo rebuild + branding spec; tagline resolved; rhythm; Q-2 hygiene; batch-2 micro-fixes (G-002, roadmap date, security strokes, glossary px, termsDays hint); HUB-1 jitter.**
- **Reconciled:** D1/D2/D4/D8 + crowesg-peppers + about-founders were stale-cache/already-fixed; INV-3 JSON-LD already satisfied (66/66 prod pages); INT-01 resolved by back-to-top rebuild.

## 3b. SESSION 2026-05-25 (CONTINUED) — full-transform + iterative defect-hunt (13 commits, 8643818→0e1fb34, all LOCAL)
**LIVE LEDGER = `OPEN-ISSUES.md` (read it first — it's the source of truth; nothing is dropped).**
Mandate this session: CTO authorised full autonomous transformation + continuous fix loop; pixel-verify every claim; rebalance narrative to the FOUR enforcement products (CrowCyber/CrowMark/CrowCash/CrowESG); Core=foundation, CSRD=free tool. **NO push to prod.**

Done + verified:
- **Animated product showcases** (new `Assets/css/product-showcase-2026-05-25.css` + `js/modules/product-showcase-2026-05-25.js`): gauge sweep + metric bars + counter tweens, reduced-motion safe, message-matched. Replaced static/mismatched carousels on all 6 product pages + a homepage suite showcase. Removed empty zero-state hero screenshots (HERO-2).
- **`box-sizing:border-box` ROOT FIX** in `sovereign-primitives.css` engine card rule — the cards were `content-box`, so padding overflowed the grid row track → card overlaps + clipped "View full pricing" button site-wide. Fixed; related grids 0 overlaps on all 6 product pages.
- **Nav mega-dropdown**: was vertical on touch laptops + items flowed horizontally → 2-col panel, vertical stacked, reordered to storyline (Compliance products: Cyber/Mark/Cash/ESG · Foundation: Core/CSRD).
- **Homepage narrative rebalance** to the four enforcement products; removed duplicate command-centre SVG demo.
- **GLOBAL hero centring** (`page-archetype-unify.css`): security/about/roadmap/changelog/contact/glossary/privacy/faq + products/tools hubs now centred.
- **Pricing**: Pro CTA was transparent+dark (looked black) → teal-visible; compare-table double ticks/dashes → single; duplicate "Most Popular" badge removed.
- **Tools**: "Back to all free tools" link added to 6 subpages; breadcrumb "Home /// Free Tools ///" → single "/".
- **Partners**: invisible "Become a partner" buttons → teal; broken consent row → fixed; partner-type select label overlap → fixed.
- **Security** "Operational standards" all-caps heading → sentence case. Marquee heading centred.
- **CACHE-BUSTER bumped site-wide `?v=20260524`→`20260525`** (1047 refs, 63 files) — KEY: the CTO was seeing STALE cached CSS (edits were live but pages referenced the old `?v`), which masked many fixes. After this bump a normal refresh fetches the new CSS.

## 4. NEXT — continuous fix loop (resume here). READ `OPEN-ISSUES.md` FIRST.
**Still OPEN (per `OPEN-ISSUES.md`):**
- **cookies hero** not centred (width quirk) · **terms hero** left (TOC-beside-hero = needs structural pass: move TOC below a full-width hero like privacy).
- **NOT REPRODUCED at any width 1536→768 in fresh Playwright** (likely was stale cache — re-verify after the cache bump + a CTO hard-refresh): O-13 privacy statement/bullet overlap (Gemini/Sentry), O-14 privacy uneven spacing, O-18 contact "trust line hidden behind cards", O-15 security AES card, O-19 about "card sizes + multiple overlaps". **If still reported, GET THE CTO's exact browser width + zoom %** — these manifest at a specific viewport/zoom I can't guess.
Workflow: pick an OPEN item → reproduce via Playwright (try widths 1536/1440/1366/1280/1100/1024/390 + note zoom) → fix at root cause → verify (Read PNG or measure) → mark FIXED in `OPEN-ISSUES.md` only when verified → commit (author crowagent.platform@gmail.com) → next. NO push.

## 4b. (original page-by-page plan, mostly superseded by the above)
Per `TRANSFORMATION-SPEC.md` §4: A-CONTENT → A-COMPANY → A-FAQ/A-HUB → A-HOME → A-PRODUCT ×6 → tools/blog/glossary → motion layer → final 4-viewport sweep.

## 5. KNOWN-OPEN (from ledger, not yet done)
G-001 container step-drift (the spec's one-column system fixes this) · G-004/PE-1 nav escape CTAs (methodology/glossary) · PE-2 CTA de-dup · PE-3 video-placeholder guard · GP-FAQ1 `<details>` smooth height · GP-RES1 breadcrumb modifier · GP-LEG1 legal H3/H4 rhythm · GP-BLOG1 back-affordance · HUB-2 44px methodology target · INV-2 type-token orphans · ARC-01 `@layer`/!important refactor · AUTO-1/2/3 rotators+countdown+proof · remaining `color-scheme: dark light` pages (only roadmap+security fixed) · methodology 5→4+1 grid · sector-marquee "looks left" (CTO) — verify VISUALLY at the CTO's exact width/zoom.

## 6. CAVEAT — cache vs real
Several CTO reports were stale browser cache (already-fixed in B) AND several were 100% real (hero split, nav clip, list markers, content-invisible). Do NOT argue cache — the CTO insists same version. **Just verify visually and fix what's genuinely there.** If a reported issue truly isn't reproducible in fresh Playwright at the stated width, note it honestly with the screenshot, then move on — don't loop.
