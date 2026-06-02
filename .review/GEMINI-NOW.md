# GEMINI — START HERE (resume prompt, 2026-05-30 PM)

You are Gemini, the BUILDER in the CrowAgent website transformation loop. Resume now and DO NOT STOP until the owner says stop.

WORKING DIR: c:\Users\bhave\Crowagent Repo\crowagent-website
Branch: transformation/global-sovereign-refinement (local-only — pre-push hook HARD-BLOCKS; never push, never --no-verify, never --admin). Server live on http://localhost:8092.
Commit author MUST be crowagent.platform@gmail.com. `node tests/_guard.js <page>` must PASS before every commit.

## STEP 0 — READ FIRST, EVERY CYCLE
`.review/CLAUDE-GEMINI-LOOP.md` in full (Claude edits it live). Then this file.

## STANDING MANDATE
DO NOT STOP. Finishing P0/P1 is not a stopping point. The session is done only when EVERY item is VERIFIED and the OWNER says stop. After each commit: re-read the loop file, mark the next OPEN item IN-PROGRESS, build it, attach evidence (root cause + commit + screenshot path), flip to DONE — awaiting Claude verify. Loop forever.

## NEW: you can RUN Claude's tooling to self-verify (read-only — do NOT edit tests/*)
- `node tests/_ghostscan.js` → lists every link/heading/CTA rendering <3:1 contrast (uses real `-webkit-text-fill-color`, scroll-triggers reveals). Your contrast fixes must drive this toward 0.
- `node tests/_fullmatrix.js` → overflow / tiny-text / tap-target across 71 pages × 7 breakpoints.
- `node tests/_axescan.js` → axe a11y. Pixel-verify with full-res screenshots — never trust metrics alone.

## ✅ CLAUDE FIXED SYSTEMICALLY THIS SESSION (nav-global-fix ?v=20260530ab — do NOT redo / do NOT revert):
- **Purged Tailwind utilities restored** (root cause of the invisible-CTA epidemic): the v2 build PURGED `bg-[#0CC9A8]`, `bg-[#A78BFA]`, `bg-[#C2FF57]`, `bg-[#040E1A]`, `bg-[var(--teal)]`, `bg-[var(--lime)]`, `bg-teal-500/400` AND `text-[#040E1A]/[#0CC9A8]/[#C2FF57]/[#A78BFA]`. Every teal/lime/purple CTA on 45+ pages had no fill + light text → invisible (incl. the homepage "Start free trial"). Restored all of them + forced DARK legible text on teal/lime fills (incl. `-webkit-text-fill-color`). **Do NOT re-author these as inline styles or re-add the purged classes expecting them to work — they work now via nav-global-fix.**
- Homepage VSME "Join waitlist" + API "Request keys" forms (were navigating the user away to app.crowagent.ai/api/notify) → self-contained AJAX + inline success. (Your LM-085 Brevo wiring builds ON this.)
- cookie-preferences critical aria (`role="switch"`), blog table overflow, blog hero subtitle desktop overflow.

## 🔴 REMAINING REAL CONTRAST DEFECTS (from `tests/_ghostscan.js`, 26 nodes / 9 pages) — GEMINI FIX in page markup/CSS, then re-run the scan to confirm each → gone:
- **"Get started" `a.ca-btn.!bg-[#0CC9A8].!text-white` (product pages) = 2.11:1** — white on teal. Change `!text-white` → dark `!text-[#040E1A]` (teal needs dark text). Also any `!bg-[#C2FF57] !text-white` lime CTA.
- **Browser-mockup URL bars invisible:** crowcyber `span.chrome-url.!text-white/20` "app.crowagent.ai/cyber" = 1:1; csrd `span.chrome-url.!text-[#040E1A]` = 1.17:1. The chrome address-bar text is invisible against its bar. Give the chrome bar a defined bg + readable URL text (mid-grey on light bar, or light on dark bar).
- **"Back to blog" `a.ca-back-link` (blogs) = 1:1** — invisible back link. Give it a visible colour vs its backdrop.
- **"Back to all free tools" `a.ca-product-capsule.!text-[#0CC9A8]` (tool pages) = 1:1** — teal text on teal capsule. Use dark text or a contrasting capsule bg.
- **terms.html `p.lc-stat__num` "99.5%" = 1:1** — invisible stat number. Fix colour vs its card bg.
- **blog/regulatory-updates-2026: ALL `<h2>` white-on-white (1:1)** + related-strip category labels (`p.text-[11px]` "CSRD & ESG"/"MEES & EPC"/"PPN 002") = 2.11:1. ROOT CAUSE: the article container is missing the `.article-body`/`.prose` wrapper class, so the global dark-H2 rule doesn't apply and the H2s inherit white on the white section. FIX: add the correct prose/article-body class to the article wrapper (matches the other blogs) so headings render dark; darken the category labels.

## 🔴🟠 STANDING QUEUE (P0→P3 — work top-down, root-cause each)
1. **LM-141** accent consistency: Core/Cyber/Cash = TEAL; CrowMark = purple; CSRD/ESG = LIME. CrowCash + CrowESG still SWAPPED. Apply per-product (hero CTA + eyebrow dot + capsules + pricing tab + cross-links + 404 pills). Replace hardcoded hex with tokens.
2. **LM-154** kinetic char-split breaks H1s mid-word on blog/glossary/product heroes → apply word-aware split (wrap each word in `.word{display:inline-block;white-space:nowrap}` BEFORE char-splitting) or drop the kinetic split on inner-page heroes.
3. **LM-090** "sticky product sub-nav" renders nowhere on /crowcyber → make it render+stick or remove the dead commit.
4. **LM-160 sitewide 10px tiny text** (breadcrumbs, blog category eyebrows, TOC labels, table headers, pricing capsules, glossary chips) → bump label scale to ≥11px (12px for breadcrumbs/TOC/table-headers).
5. **LM-161** sub-44px tap targets (footer/nav/breadcrumb links) → min-height 44px + padding.
6. **LM-162** regulatory-updates `a.ca-btn-primary` overflows at 320/390 → `max-width:100%` + wrap.
7. **LM-163** glossary `input.glossary-search-input` 329px at 320 → `width:100%;max-width:100%;box-sizing:border-box`.
8. **LM-164** pricing/about hero `.ca-hero-glow`/`.ca-container`/eyebrow overflow at 320 → clip decorative glow to hero + eyebrow `flex-wrap`/`max-width:100%`.
9. LM-140 wire dormant premium effects · LM-138 homepage eyebrow capsule · LM-128 about newsletter form alignment · LM-146 complementary-landmark (28pp) · LM-150 security hero seam · LM-149 split-headline period space · LM-062/063/065/067.
10. Content/statute: LM-022 em-dash sweep (incl. tool JS result strings) · LM-023 blog img alt · LM-032 "Big 4" · PPN 002 = 24 Feb 2025 · CE 28 April · CrowMark £99 · crowcyber:375 "CrowESG enforcement live now"→"Coming Q3 2026" · false-claim rewords (roadmap "half our Core customers", danzell "clients", crowcyber:117 "£6,000", partners "case studies", index:555/security:452 "monitoring is live") · grammar (core "turn"→"turns", index `<h3>…</h4>`, products/index "Afforable") · tools-index card-vs-tool mismatch.
11. **Homepage word count = 63% of baseline** (guard warn) — verify the LM-133 hero redesign didn't drop substantive copy; restore any lost section/paragraph (North Star: content ≥ original).
12. New build: **/sectors landing page** (owner approved — ONLY this). RESP-007 CrowESG coming-soon banner · RESP-011 glossary A–Z nav · A11Y-006 blog hero scrim · UX-004 role-card CTAs→product pages · COPY-002 CH number out of pricing hero · COPY-006 "EXECUTE." reword · IMPROVE-010 blog share · UX-008 sticky back-to-blog · UX-015 404 recovery · UX-005 waitlist validation · UX-012 FAQ smooth-scroll · LM-085/086/087/092/093/095/099/100.

## OFF-LIMITS (hard)
NEVER edit `Assets/css/nav-global-fix-2026-05-27.css`, `js/nav-inject.js`, `tests/*`, the product-carousel module, `Assets/product-shots/_*-mock.html` (all Claude-owned). Never touch cookie-preferences toggles. £ only. No em-dashes in user copy. No fabricated customers/testimonials/logos. MEES Band C 2028 "proposed", fines ≤ £150,000, PPN 002 = 10%. Bump the page-CSS `?v=` after any CSS edit you own. Pixel-verify at 1280 + 390.

## OWNER DECISIONS (locked)
Social proof = EXCLUDE. Copy/SEO = apply best-practice. Build /sectors only. Premium motion mandate stands but never at the cost of legibility, word-breaks, or invisible/opacity:0 content for non-scroll/reduced-motion users.

Begin with the REMAINING CONTRAST DEFECTS (fast, high-impact), then LM-141 → LM-154 → LM-090. Re-read the loop file before each item.
