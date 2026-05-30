# SESSION RESUME — Website Transformation (saved 2026-05-28 pre-restart)
**Resume trigger:** owner says `website transformation` → read THIS file first, THEN the two trackers below.

---
# 🟢 MOST RECENT — 2026-05-30 (READ THIS FIRST; supersedes older blocks)

## State
- Branch `transformation/global-sovereign-refinement`. **An auto-commit process (the Gemini loop) commits the working tree automatically** — my edits show as already committed (HEAD moves on its own; `git diff` is often empty even right after I edit). HEAD was `fa28c98` at save. **LOCAL-ONLY — nothing pushed** (push needs exact phrase `APPROVED FOR PUSH — <branch>`). Commit author must be `crowagent.platform@gmail.com`.
- Server: `npx http-server . -p 8092 -c-1 --cors` (keep alive). Verify: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8092/index.html` = 200.
- **Canonical CSS cache version is `?v=20260530w`** in `js/nav-inject.js` (loads `Assets/css/nav-global-fix-2026-05-27.css`). **BUMP THE LETTER ON EVERY CSS EDIT** or the owner sees stale CSS. Same for `sf21-back-to-top.js?v=98`.

## TWO TRACKERS = source of truth (read both on resume)
1. **`.review/CHROME-AUDIT-2026-05-30.md`** — owner pasted 2 big Chrome QA audits (~70+ items each) + a mobile-responsiveness directive. This file has EVERY item triaged (stale-false / done / real-fix / needs-owner-decision) + completion logs for Claude batches 1–3 + the full MOBILE batch. ~18 audit items were STALE (Chrome tested an old cache): desktop nav, broken images, blank sections, cookie banner, social links, monthly/annual toggle all already work.
2. **`.review/CLAUDE-GEMINI-LOOP.md`** — shared Claude↔Gemini tracker (~130 LM items). Bottom has a `FROM CLAUDE 2026-05-30` block + the **Gemini prompt** (its open queue). Gemini keeps falsely claiming "all done" — always verify (memory: never trust Gemini/sub-agent reports; pixel-verify).

## OWNER DECISIONS LOCKED (2026-05-30)
- Social proof = **EXCLUDE** (no fabricated testimonials/customer logos — pre-launch, zero customers; honest signals only: statute citations, Companies House 17076461, framework names).
- Copy/SEO = **apply best-practice now**. Build **/sectors landing page** (only that — NOT global search, sticky header, or blog SSR pagination).
- CrowMark Starter £99. PPN 002 date 24 Feb 2025. £ only, UK spelling, no em-dashes, no AI-buzzwords. Keep "Intelligence by engineers." on About.
- Back-to-top stays **bottom-left** (chatbot owns bottom-right) — do NOT move it right.

## ✅ DONE + VERIFIED this session (Claude lane — all in shared CSS/JS, do NOT let Gemini touch these files)
**Owner-reported urgent:**
- P0: hero carousel showed an "Unable to load CrowCyber" **error-screen mockup** → rebuilt `Assets/product-shots/_crowcyber-mock.html` → regenerated `cyber-overview.png` (clean dashboard, 86% readiness). Audited all 8 product shots; only that one was broken.
- P1: `$` showed on CrowCyber/CrowESG screens (Credit-control nav icon was a `$`) → swapped to `£` in `_crowcyber-mock.html` + `_crowesg-mock.html`, regenerated `cyber-overview.png` + `esg-sample.png`. Cache-bust on refs.
- /faq "Book a call" invisible (teal text on teal) → forced dark text on `a.bg-teal-*`/`a.bg-white` CTAs (sitewide). FAQ search box straddled the dark/light seam → moved into hero.
**SEO/social foundation:** OG+Twitter on 33 pages; JSON-LD Organization+WebSite sitewide (nav-inject), FAQPage (16 Q&As), BlogPosting on 20 articles; optimised home+FAQ titles. sitemap.xml+robots already exist.
**Sitewide a11y (nav-inject + nav-global-fix):** mobile-menu focus trap, external-links→new-tab, universal :focus-visible ring, global reduced-motion guard, 44px carousel dots, carousel role=region.
**Structural:** `/products/{crowcyber,crowmark,crowcash,crowagent-core,csrd,crowesg}/` redirect stubs (no vercel.json edits — forbidden on non-main); API code-block overflow; back-to-top hides at footer.
**🔴 MOBILE RESPONSIVENESS (owner: "every page fails on mobile") — root cause + verified:**
- Root cause: `.ca-container`/hero visual cols/legal-shell were flex items with `min-width:auto` → grew to content min-content width, overflowed, body `overflow-x:clip` hid scrollbar but CLIPPED text. Fix: `width:100%`+`min-width:0`+`minmax(0,1fr)`.
- Result: **0 horizontal overflow on all 26 pages at 390px; 0 desktop-1280 regressions** (all mobile rules are `@media (max-width:767/1023px)`).
- Pricing switcher (a `div:has(>.ptabs)` rule forced parent flex-row, cramming tabs to 118px vertical) → parent flex-column on mobile + .ptabs full-width. Solve/Prove/Profit sticky overlap → disable `.sticky.top-40` <1024. "Base+8%" clip → counter clamp. Carousel caption fixed-h-6 overflow onto watermark → height auto. Section padding py-60/40/32/24 trimmed on mobile. Hero min-height:100vh trimmed on mobile. Announce-bar mid-phrase wrap fixed. cookies legal-shell grid blowout fixed. Back-to-top hidden on mobile.

## 🔧 REMAINING (resume here)
- **Gemini lane** (in the LOOP.md prompt): LM-090 sticky product sub-nav is a FALSE claim (renders nowhere) — reopened; + RESP-007 CrowESG coming-soon banner, RESP-011 glossary gaps+A–Z nav, UI-003 Pro-card prominence, A11Y-006 blog hero scrim, UX-004 role-card CTAs→product pages, COPY-002/006, IMPROVE-011 glossary search, UX-008 back-to-blog, UX-015 404 recovery, blog share buttons, **/sectors page**, LM-146/150/149/060/062/063/022/023/032.
- **Claude P2 polish (mobile):** cookies table scroll-hint, glossary tablet 2-col + trailing void, cookie-preferences toggle right-align, 404 product-card colour consistency, partners form field spacing.
- **LM-021 real app recordings** (Gemini only — needs app.crowagent.ai login; never commit creds). When capturing real screens, AVOID transient error/loading states (that produced the P0 above).

## Test harness (scratch, in tests/, gitignored)
`tests/_moball.js` (overflow all pages @390), `tests/_regress.js` (390/768/1280), `tests/_deepmob.js` (overflow+tiny-text+tap-targets), `tests/_chromeaudit.js`, `tests/_inject-og.js`, `tests/_inject-jsonld.js`, `tests/_capcyber.js`/`_cap2.js` (regenerate product-shot PNGs from the `_*-mock.html` templates). Mock templates: `Assets/product-shots/_crowcyber-mock.html`, `_crowesg-mock.html`.

## HARD RULES (do not relearn)
- BUMP CSS `?v=` every edit. VERIFY by READING full-res PNGs, not metrics. NEVER trust Gemini/agent "done" — pixel-verify. Don't edit `vercel.json` on non-main. Don't fabricate customers. Claude owns `js/nav-inject.js` + `Assets/css/nav-global-fix-2026-05-27.css` + the carousel module + product-shot mocks — Gemini must not touch them.

---
# (Older context below — 2026-05-28)

## ⏸️ 2026-05-28 PM PAUSE — RESUME TOMORROW (read this block first)
- **Owner paused Claude** because **Gemini is actively editing the site** in the owner's terminal. **Claude made ZERO edits this session** — read-only review + screenshots only. The only new file is `tests/_openshot.js` (gitignored scratch screenshot helper). Nothing committed, nothing pushed.
- HEAD still `3f0a1c6`, branch `transformation/global-sovereign-refinement` unchanged. Guard re-run = **PASS (65 pages, content preserved)**. Working tree had ~202 modified files (Gemini churn — benign per guard).
- **Coordination with Gemini = filesystem only** (`.review/FROM-CLAUDE.md`, `GEMINI-NOW.md`). No live channel between Claude and the Gemini process. On resume, check what Gemini changed before re-planning (it may have already fixed some open items).
- **🔑 KEY FINDING that changes the plan for issue #1:** `security.html` ALREADY renders as a clean, premium DARK page — its `sec-*` styling works fine (verified full-res 1280). Its ONLY real defect is the legacy CSS stack (`styles.min.css`, `crowagent-brand-tokens.css`, `cluster-beta-visual-fix`, `nav-footer-sf21`, `security-sf19`, etc.) causing the **cookie-banner inconsistency**. → **DECOUPLE, don't rebuild:** strip the legacy/cookie-related CSS links and verify `sec-*` tokens still resolve under v2 — do NOT force it into a white-prose `legal-doc` rebuild (would regress a good design). **Verify-render-FIRST applies to faq/resources/roadmap too** — screenshot each, only rebuild what's actually broken.
- **NEXT COMMAND when paused** (do this first on resume): find what styles the v2 cookie banner (`nav-global-fix-2026-05-27.css` injected by nav-inject? `sovereign-core-v2.compiled.css`? inline in `js/cookie-banner.js`?) → confirm that removing `styles.min.css` makes the banner CONSISTENT, not broken. That single fact determines the whole legacy-page decoupling approach.
- `terms.html` = gold A-CONTENT reference (loads ONLY v2 CSS + `legal-content.css`; dark hero + dark glance grid + WHITE `legal-doc` prose body). Task list (6 open issues) seeded in harness; all reset to pending.

## STATE AT SAVE
- Branch: `transformation/global-sovereign-refinement` · HEAD: `08de0f9`
- **LOCAL-ONLY.** Server: `npx http-server . -p 8092 -c-1 --cors`. Pre-push hook HARD-BLOCKS all pushes (exit 1) until owner says exactly `APPROVED FOR PUSH — main`. Gemini's process can't run git. NOTHING is pushed.
- Commit author MUST be `crowagent.platform@gmail.com`.
- ~90 tracked files modified in working tree (mostly Gemini's in-flight injections; my fixes are COMMITTED — 16 commits this session).
- **Gemini runs in parallel (owner's terminal), edit-only (its bg process crashes on git/node). I (Claude) review + commit. Gemini's global head-injector keeps re-touching files — it does NOT gut content (guard stays 65/65) but churns the tree + occasionally re-breaks heads.**

## 🔴 TWO HARD LESSONS — DO NOT RELEARN (these caused false "fixed" claims this session)
1. **BUMP THE CSS CACHE VERSION ON EVERY EDIT.** `nav-global-fix-2026-05-27.css` is loaded by `js/nav-inject.js` line ~24 with `?v=YYYYMMDDx`. Currently `?v=20260527l`. If you edit the CSS but DON'T bump the query string, browsers serve STALE cached CSS and the owner sees NONE of your fixes (this is why "all my claims were false" — my headless QA used fresh contexts, the owner's browser was cached). After ANY CSS edit: bump the `?v=` letter in nav-inject.js. Tell owner to hard-refresh (Ctrl+Shift+R) once.
2. **VERIFY BY READING FULL-RESOLUTION SCREENSHOTS, NEVER metrics/thumbnails.** Metric checks (overflow=0, opacity=1, display!=none) passed while pages were visually BROKEN (hero letters spread, hamburger an empty circle, CTAs invisible). Always `Read` the actual PNG at full res before claiming a fix.

## ROOT-CAUSE THEME: the v2 Tailwind build (`Assets/css/sovereign-core-v2.compiled.css`) PURGED critical utilities
- `prose` plugin → ABSENT (blogs rendered as unstyled walls of 16px text).
- `col-span-9` / `col-span-3` → ABSENT (legal pages collapsed to 48px columns). (col-span-8/4 survived.)
- Fix pattern used: self-contained CSS that does NOT depend on the purged utilities:
  - `Assets/css/legal-content.css` (`.legal-doc` etc.) — loaded on terms/privacy/cookies.
  - `Assets/css/nav-global-fix-2026-05-27.css` (Claude-owned, injected site-wide by nav-inject) now also holds: hero-visibility failsafe, hamburger bars, mobile-bar declutter, cookie label dedup, trust-card styling, AND `.prose/.blog-stripe-prose/.article-body` typography (fixes all 20 blogs).

## ✅ DONE + COMMITTED THIS SESSION (16 commits, verified full-res)
- SEO canonicals on 8 core pages + index footer links (/status external, drop /careers) — `c47fac9`
- 4 UI defects: product-card arrows, `#sectors` anchor, free-tools breadcrumb dedupe (`b895517`), canonical back-to-top identical site-wide (`42376c6`), cookie-banner contrast.
- terms/privacy/cookies → v2 + built `legal-content.css` (`25249f3`, `f0928b1`).
- ALL legacy blogs migrated + 4 thin blogs restored to 97-103% + ALL 20 blogs given real prose typography (`e658873`, `b925ae5`, `bb95ea4`, `08de0f9`).
- Product pages crowcyber/crowcash/crowagent-core body content restored (140/91/101%, +SECR) — `88ef935`.
- Hero fixes (full-res verified): title letter-spread (per-char `margin-right:9.92px` zeroed), hamburger empty-circle → 3 bars, mobile bar declutter, 44px hamburger, hero CTA buttons revealed (`.ca-hero-btns` was opacity:0) — `a54bd3f`, `c04d3d5`, `d85664a`, `09ca661`.
- Homepage: products bento → 4 EQUAL cards with consistent capsules; "Operational standards" 6 items → aligned 3×2 cards (`db13c49`).

## 🔧 OPEN ISSUES — owner-reported 2026-05-28 (RESUME HERE, fix + full-res verify each)
1. **faq.html STILL legacy (not transformed).** Plus resources.html, roadmap.html, security.html also still load legacy `styles.css`/`styles.min.css`. These 4 are the LAST legacy pages. Migrate to v2 (faq=A-FAQ; resources/roadmap=A-COMPANY; security=A-CONTENT → reuse legal-content.css like terms). **This also fixes the COOKIE-BANNER INCONSISTENCY** the owner reported (legacy styles.css styles the cookie banner differently from v2 pages — only these 4 differ).
2. **Pricing page (`pricing.html`) bugs:**
   - **Product switcher BROKEN** — clicking the Core/Mark/Cyber/Cash/ESG tabs does NOT switch panels (verified: click Mark → core panel stays visible, mark stays hidden). Panels are `#core-p`/`#mark-p`/… (`.pricing-panel`, display:none/hidden). `js/modules/pricing-tabs-indicator.js` only animates the indicator pill — the actual panel-toggle JS is NOT wired on the v2 page. Wire it (tab click → show matching panel, hide others, set aria-selected).
   - **White pricing card has WHITE text (invisible)** — confirmed `.ca-card !bg-white` with text color rgb(255,255,255). Force dark text (#040E1A) on heading/price/desc inside white cards (keep the teal CTA's !text-white).
   - **"Common Questions" section looks odd** — needs a better/cleaner style.
   - **Text too small / not visible** in places.
3. **Free Tools pages (tools/*/index.html — 6 pages) poorly formatted** — headers + sections not premium ("not 1% top"). Likely same purged-utility/prose issue + weak structure. Audit + rebuild to premium bar. Also intel/* (2 pages).
4. **Footer trust badges misaligned with their icons** (global footer, injected by nav-inject): AES-256 at rest · TLS 1.3 in transit · GDPR compliant · UK & EU data residency · ISO 27001 controls* · ICO registered · Companies House 17076461. Fix icon/text vertical alignment in nav-global-fix.
5. **Product→standard capsule mappings the owner supplied** (use as the canonical capsules on product cards / pricing):
   - Core: `SI 2015/962` & `MHCLG EPC Register`
   - Mark: `PPN 002` & `Oxford SVB TOMs`
   - Cyber: `NCSC v3.3 Danzell` & `PPN 014/21`
   - Cash: `Late Payment Act 1998`
   - Checker: `Omnibus I (Directive 2026/470)`
   - ESG: `GRI, TCFD, ISSB, UK SDR`

## 🧪 axe-core SYSTEMATIC SCAN (tools/_AXE-REPORT.md, 63 pages, 2026-05-27)
Run: `node tests/_axescan.js` (uses @axe-core/playwright; MUST use `browser.newContext()` not newPage — already fixed). Top violations:
- `color-contrast` serious — 63 pages, 810 nodes (MANY are false-positives from alpha bg/gradient the scanner can't read; pixel-verify before "fixing" — measured real hero chips at 16.88:1. But some are REAL, e.g. legacy pages.)
- `heading-order` moderate — 41 pages, 80 nodes (h1→h3 skips — REAL a11y; fix heading levels).
- `landmark-contentinfo-is-top-level` moderate — 50 pages (footer landmark nested; real).
- `listitem` serious — 12 pages, 49 nodes (bare `<li>` not inside `<ul>/<ol>` — the product-page hero trust rows use `<li>` directly in a `<div role=group>`; wrap in `<ul>`).
- `landmark-complementary-is-top-level` 26 pages; `aria-allowed-attr` critical 7 pages/19 nodes; `link-in-text-block`; `aria-progressbar-name`.

## 🛠 TOOLING (all in tests/, gitignored)
- `tests/_axescan.js` → `tests/_AXE-REPORT.md` (a11y, FIXED to use newContext).
- `tests/_fullaudit.js` → `tests/_FULLAUDIT.md` (overflow/console/broken-img across 63 pages × 15 breakpoints; 0 overflow, 0 broken-img confirmed).
- `tests/_a11y.js` → contrast scan (over-reports on alpha bg — treat as hints, pixel-verify).
- `tests/_guard.js` (pre-commit content/truth gate; PASS = content preserved). `.review/FROM-CLAUDE.md` = lane notes to Gemini.
- Screenshots in `tests/_qa-shots/`.

## RESUME PLAN (in order)
1. Restart http-server on 8092. Confirm HEAD `08de0f9`.
2. faq + resources + roadmap + security → v2 (fixes faq + cookie inconsistency). legal-content.css for security; v2 shell for faq/resources/roadmap.
3. Pricing: wire switcher JS + fix white-card text + restyle Common Questions + size/contrast. Apply owner's capsule mappings.
4. Free-tools (6) + intel (2): premium formatting pass (headers, sections, prose).
5. Footer trust-badge icon alignment (nav-global-fix) + bump cache `?v=`.
6. axe: fix heading-order + listitem (wrap bare `<li>`) + landmark nesting; re-run `_axescan.js`.
7. After EVERY CSS edit: bump nav-inject `?v=` letter. After EVERY fix: Read the full-res screenshot. Then re-run `_axescan.js` + `_fullaudit.js` to confirm.
