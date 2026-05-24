# SESSION RESUME — Website Transformation

**Trigger:** CTO types **"website transformation"** → read THIS file first, then
`TRANSFORMATION-SPEC.md`, then `AUDIT-LEDGER-2026-05-24.md`. Then resume execution.
**Last saved:** 2026-05-25. **Working dir:** `C:\Users\bhave\Crowagent Repo\crowagent-website`.

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

## 4. NEXT — execute the spec page-by-page (resume here)
Per `TRANSFORMATION-SPEC.md` §4 implementation order. **Start: A-CONTENT** (privacy → terms → cookies → security).
For EACH page: read current markup/CSS → rewrite to its archetype (compact centred hero; S-PROSE body with real `<ul>/<ol>` markers, ≤720 measure, H2/H3 rhythm; S-CTA-band) → **screenshot 1280 + 390 and Read the PNGs** → confirm centred/symmetric/on-rhythm/markers+icons correct/content visible → commit one page per logical commit. Then next page.
Then: **A-COMPANY** (about, roadmap, contact, partners, changelog, resources) → **A-FAQ + A-HUB** → **A-HOME** (sector marquee centred/filled, methodology 5→4+1, merge/de-dup redundant sections, S-CTA) → **A-PRODUCT** ×6 → tools/blog/glossary sweeps → global motion/automation layer → final 4-viewport (1920/1440/1280/390) Read-verify sweep.

## 5. KNOWN-OPEN (from ledger, not yet done)
G-001 container step-drift (the spec's one-column system fixes this) · G-004/PE-1 nav escape CTAs (methodology/glossary) · PE-2 CTA de-dup · PE-3 video-placeholder guard · GP-FAQ1 `<details>` smooth height · GP-RES1 breadcrumb modifier · GP-LEG1 legal H3/H4 rhythm · GP-BLOG1 back-affordance · HUB-2 44px methodology target · INV-2 type-token orphans · ARC-01 `@layer`/!important refactor · AUTO-1/2/3 rotators+countdown+proof · remaining `color-scheme: dark light` pages (only roadmap+security fixed) · methodology 5→4+1 grid · sector-marquee "looks left" (CTO) — verify VISUALLY at the CTO's exact width/zoom.

## 6. CAVEAT — cache vs real
Several CTO reports were stale browser cache (already-fixed in B) AND several were 100% real (hero split, nav clip, list markers, content-invisible). Do NOT argue cache — the CTO insists same version. **Just verify visually and fix what's genuinely there.** If a reported issue truly isn't reproducible in fresh Playwright at the stated width, note it honestly with the screenshot, then move on — don't loop.
