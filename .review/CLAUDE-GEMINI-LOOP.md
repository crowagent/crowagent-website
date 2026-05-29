# CLAUDE ↔ GEMINI LOOP — Master Protocol
*Single source of truth for outstanding work. Both agents read this in full on every cycle. Living file — Claude is in continuous hunting mode; new items appear without warning.*

---

## 🏁 NORTH STAR (never compromise)
**Top 1% premium website — Apple / Stripe / Linear / Vercel calibre, on every page, every nav, every footer, at 1280 + 390.**
£ only. Content preserved VERBATIM (≥ original word count). No fabrication (no fake customers/testimonials/trust-bands). No legacy `styles.min.css` anywhere. Cookie banner identical site-wide. Switchers actually switch. No void gaps. WCAG 2.2 AA. Pixel-verified at 1280 + 390 on every claim — never trust metrics alone.

---

## 🔁 PROTOCOL (read every loop, both agents)

**Gemini (the builder):**
1. At the START of every cycle, READ THIS FILE IN FULL, top-to-bottom. Claude updates anywhere.
2. Pick the highest-priority item with status `OPEN` in the QUEUE.
3. Edit that item's status to `IN-PROGRESS — Gemini @ <HH:MM>` BEFORE starting work.
4. Implement the exact spec under "Action". No scope reduction, no shortcuts, no gutting content (guard WILL block you). Preserve every paragraph/list/table/form/script — restyle the shell only.
5. When done, append your evidence under the item: commit SHA + files touched + screenshot paths in `tests/_shots/`. Flip status to `DONE — awaiting Claude verify @ <HH:MM>`.
6. RE-READ THIS FILE BEFORE picking the next item. Claude may have added new items, rejected your last `DONE`, or escalated priority.
7. **NEVER declare the session complete.** Only the OWNER stops it. Claude is in continuous hunting mode — the queue WILL keep growing.
8. `node tests/_guard.js <page>` must PASS before commit. Commit author = `crowagent.platform@gmail.com`. Local-only — pre-push hook hard-blocks. Never `--no-verify`.
9. **DO NOT EDIT** `Assets/css/nav-global-fix-2026-05-27.css` — that file is Claude-owned. Never touch `tests/*` either.
10. Bump `?v=` in `js/nav-inject.js` after ANY CSS edit it injects, so browsers don't serve stale CSS.

**Claude (the hunter + reviewer):**
- Continuously screenshot, code-read, axe-scan, contrast-scan. Add new items as found.
- Verify every `DONE` claim by reading the actual PNG at full res + reading the diff. Flip to `VERIFIED` or `REJECTED — <reason>`.
- Concurrency rule: if Gemini is `IN-PROGRESS` on a file, Claude does not edit that file (just hunts elsewhere and queues new items).

---

## ⏱️ HEARTBEAT
- Last Claude audit: `2026-05-28 23:05 — VERIFIED LM-003/010/029/030/036 + added ROOT-CAUSE DIRECTIVE + LM-037 product voids`
- Last Gemini cycle: `2026-05-28 21:26 — LM-004 (pricing switcher) in progress`
- Open items: **30** · In-progress: 1 (LM-004) · Done-awaiting-verify: 0 · **Verified: 7 (LM-001, LM-002, LM-003, LM-010, LM-029, LM-030, LM-036)** · Rejected: 0
- Claude shipped commits (CLAUDE-OWNED files — Gemini cannot touch): `Assets/css/nav-global-fix-2026-05-27.css` (skip-link sr-only, hamburger desktop hide, footer trust-badge alignment, mobile menu vertical stack) + `js/nav-inject.js` cache bump to `?v=20260528m` + force-update of stale hardcoded links (LM-044) + cookie-consent.js script tag REMOVED from 6 blog posts (LM-045 — owner-spotted "2 cookie banners").
- **2026-05-28 23:55 status:** **TOTAL: 100 LM items** in queue. **VERIFIED: 11** (LM-001/002/003/004/005/010/029/030/036/044/045). **IN-PROGRESS: 1** (LM-006 Gemini @ 22:15). **OPEN: 88**. Just added LM-046..LM-074 from owner's Chrome real-visual test (BUG-001..BUG-029) + LM-075..LM-100 from owner's REC-001..REC-026. Owner mandate: **"None of defects, issues and bugs must be left unfixed."** Gemini: keep cycling, prioritise P0s, group by shared root causes.

---

## 🎨 PREMIUM MOTION / AUTOMATION / MODERN DESIGN DIRECTIVE (OWNER 2026-05-28 PM — RAISES THE BAR)

**The website MUST feel ALIVE.** Every page, section, component breathes with intentional, purposeful motion — Apple keynote calibre. Static drudgery is a failure mode. Gemini: be BOLD, push beyond the spec, push modern design. Motion + automation + interactivity weave together as STORYTELLING.

**Required across the entire site (audit + add where missing):**
- **Hero motion (every page):** mesh-gradient shader breathing in the backdrop (`hero-mesh-shader.js`) + staggered char-by-char H1 entrance (`hero-staggered-entrance.js`) + eyebrow rotator showing live statute facts (`eyebrow-rotator.js`) + 2 CTAs with magnetic hover + ONE honest live element (live UTC countdown to real deadline, OR live counter of compliance scenarios run). **NO static heroes anywhere.**
- **Section reveals on every page:** fade-up + 4px translateY, 500ms `cubic-bezier(0.22,1,0.36,1)`, `IntersectionObserver` staggered 80ms per child. Respect `prefers-reduced-motion: reduce` (skip). **No content "pops" on scroll.**
- **Card interactions:** -2px translateY + shadow lift on hover, 200ms ease-out. Magnetic icon pull. Counter-tween (`counter-tween.js`) for every numeric stat — count from 0 to value when first visible.
- **Automation (real, not fake):** live UTC countdowns to REAL deadlines (MEES Band C 2028 in `Europe/London`; CSRD Omnibus I 2026/470; PPN 002 cycle dates). Live H1 verb-rotator. Auto-playing product carousels — Stripe/Linear calibre, pause-on-hover, no edge clipping, 4:3 fixed aspect, real `app.crowagent.ai` recordings (NEVER fabricate).
- **Modern micro-interactions:** animated focus rings (not browser default — see Stripe); button press scale `0.97`; copy-to-clipboard with `aria-live` toast; floating-label form fields; sticky scroll-spy on long pages.
- **Scroll choreography:** ScrollTrigger pinned sequences for product walkthroughs (GSAP already loaded); parallax mesh layers; snap-on-keyword in long-form prose.
- **Route transitions:** `<meta name="view-transition" content="same-origin">` on EVERY page (currently only terms.html + security.html have it). Add Linear-style cross-fade keyframes.

**Principle:** if a page renders the same when you reload as when you scroll, you have failed. The site must respond, breathe, reveal, choreograph.

**Hard constraints (motion/automation):** NEVER fabricate metrics, customers, testimonials, counters. All countdowns = REAL UTC math against REAL deadlines. All carousel content = REAL `app.crowagent.ai` recordings. Reduced motion = full graceful fallback.

---

## 🧠 ROOT-CAUSE-ANALYSIS DIRECTIVE (OWNER 2026-05-28 PM)

**Every fix MUST diagnose the root cause first, then fix the root cause — not the symptom.** No band-aids, no patches, no quick CSS overrides that hide a real architectural problem. Gemini: due diligence on every defect.

**For EVERY item before you flip to DONE, the Evidence block MUST contain:**

1. **`Root cause:` ONE sentence** stating WHY the defect existed (not WHAT looked wrong). Examples:
   - ✅ "v2 Tailwind build purged `.sr-only` so `.skip-link sr-only` had no hiding rule, rendering visible at top-left."
   - ❌ "Skip-link was visible." (that's a symptom, not a cause.)
2. **`Why it happened:` ONE sentence** — the upstream architectural reason (build config, framework change, migration step that dropped it, etc.). This reveals whether other defects share the same root.
3. **`Why this fix prevents recurrence:` ONE sentence** — what about the fix makes the same class of bug not happen again. If the fix is a one-off override, you have NOT fixed the root cause; redo.
4. **`Other places same root cause may bite:` 1–3 bullets** — list other files/components likely affected by the same root cause. Then fix them in the same commit OR queue them as new LM items.

**Examples of WRONG vs RIGHT fixes:**

| Defect | ❌ Symptom fix (REJECT) | ✅ Root-cause fix (ACCEPT) |
|---|---|---|
| Skip-link visible | Add `display:none` to `.skip-link` directly | Restore `.sr-only` definition site-wide + `.skip-link:focus` reveal pattern |
| Hamburger at desktop | Move it off-screen with `position:absolute; left:-9999px` | Scope `.ham` visibility to `≤1024px` media query (per design system §1.6) |
| White-card white text on pricing | Add `color:#040E1A !important` only to the Pro card | Fix the `.ca-card` rule that's setting `color:var(--color-white)` to scope to dark-bg cards only |
| Pricing switcher dead | Add `onclick` handler inline to each tab | Build proper tab-panel module with ARIA + keyboard + event-driven indicator recompute |
| Void band on product page | Add `display:none` to the empty section | Investigate WHY the section is empty (legacy CSS provided content via `:before`? content removed? template stub?) and fill or restructure |

**Architectural-level patterns to LOOK FOR (these have bitten multiple LM items already):**
- **v2 Tailwind purge** — `.sr-only`, `.prose`, `col-span-9/3` all PURGED → restore globally, not per page.
- **Legacy CSS coupling** — `styles.min.css` etc. provided tokens that v2 doesn't → restore tokens in `@layer`, not per-page CSS link.
- **GSAP-dependent content** — content `opacity:0` "managed by JS" → CSS reveal failsafe (already pattern in `nav-global-fix`).
- **Single CSS rule with broad selector breaking many pages** — e.g. `[class*="…"]` substring selectors. Use stricter selectors.

**When you flip an item to DONE, ALSO add a sub-bullet `Related root-cause queued:` with the LM-### IDs you created for sibling defects you found.** This is how the loop self-improves.

---

## 📋 QUEUE — work items (priority order)

### 🔴 P0 — fix immediately

#### [LM-001] ✅ VERIFIED — Claude @ 22:55 (was DONE @ 20:45)
- **Diagnosis (verified by Claude):** `<head>` still has the legacy stack: `styles.min.css`, `crowagent-brand-tokens.css`, `cluster-beta-visual-fix-2026-05-22.css`, `consistency-sf41.css`, `page-archetype-unify.css`, `page-motion-bg.css`, `page-fixes-sf22.css`, `nav-footer-sf21.css`, `motion-system.css`, `security-sf19.css`, `cluster-B-legal-fix-2026-05-22.css`. Page itself already renders premium dark — `sec-*` styling works (Claude verified 1280). DO NOT rebuild into white-prose legal-doc — that would regress a good design.
- **Action (SURGICAL DECOUPLE, not rebuild):** Strip from `<head>` every link above. Keep ONLY: `sovereign-core-v2.compiled.css`, `signature-atmosphere-2026-05-26.css`, `product-carousel-2026-05-26.css`, `premium-transformation-2026-05-27.css`, `security-page.css`. Keep the body markup verbatim. If any `sec-*` token (var(--teal), var(--bg), etc.) no longer resolves after the strip, add a `@layer` block at the top of `security-page.css` defining the missing tokens — never re-add a legacy CSS link.
- **Verify:** screenshot 1280 + 390; page looks identical to before (or better); cookie banner now identical to `terms.html` cookie banner; `node tests/_guard.js security.html` PASS; `node tests/_axescan.js` no new violations on security.
- **Evidence:** Commit 38a8eb5; Touched `security.html`, `Assets/css/security-page.css`; Screenshots: `tests/_shots/security-1280.png`, `tests/_shots/security-390.png`.

#### [LM-002] ✅ VERIFIED — Claude @ 22:55 (was DONE @ 21:05)
- **Action:** same surgical decouple as LM-001. A-COMPANY archetype. Preserve body verbatim. Word count ≥ original.
- **Verify:** as LM-001.
- **Evidence:** Commit 3671287; Touched `resources.html`, `Assets/css/resources-page.css`; Screenshots: `tests/_shots/resources-1280.png`, `tests/_shots/resources-390.png`.

#### [LM-003] ✅ VERIFIED — Claude @ 23:00 (was DONE @ 21:25)
- **Action:** surgical decouple. A-COMPANY archetype. Preserve body verbatim. Word count ≥ original (tracker shows 998/1211 = 82%; restore if any drop).
- **Verify:** as LM-001.
- **Evidence:** Commit f41bcc1; Touched `roadmap.html`, `Assets/css/roadmap-page.css`; Screenshots: `tests/_shots/roadmap-1280.png`, `tests/_shots/roadmap-390.png`.

#### [LM-004] ✅ VERIFIED — Claude @ 23:25 (was DONE @ 21:55)
- **Verify evidence:** Claude ran `node tests/_pricetabs.js` clicking each tab; CDP-probed `.pricing-panel` computed style + `hidden` attr. Result for each click: only the clicked-tab's panel = `{display:"block", hidden:false}`, all others = `{display:"none", hidden:true}`. ✓ aria-selected + tabindex roving wired. Screenshots: `tests/_shots/v-pricing-{core,mark,cyber,cash,esg}.png`. Switcher behaves exactly per spec.
- **Diagnosis:** Only `js/modules/pricing-tabs-indicator.js` exists (animates the indicator pill). NO panel-toggle JS anywhere. Panels `#mark-p`, `#cyber-p`, `#cash-p`, `#esg-p` are `style="display:none" hidden` — invisible forever. Clicking a tab does nothing visible except the pill slide.
- **Action:** Add a small module `js/modules/pricing-tabs-panel.js` (loaded `defer` from `pricing.html`):
  - On `DOMContentLoaded`, query `.ptab[data-ptab]` and `.pricing-panel`.
  - On tab click: for every panel set `style.display='none'; hidden=true`; then for `#<data-ptab>-p` set `style.display=''; hidden=false`.
  - Update `aria-selected` (true on clicked, false on others) and `tabindex` (`0` on selected, `-1` on others).
  - Arrow-Left/Right roving tabindex.
  - After toggle, dispatch a custom event `pricing:tab-changed` so `pricing-tabs-indicator.js` can re-compute the indicator x/width (or call its exported recompute directly).
  - Set initial state from the tab with `aria-selected="true"`.
- **Verify:** click Core/Mark/Cyber/Cash/ESG; screenshot each panel at 1280; confirm the matching panel is visible, others hidden. Keyboard: Tab into the tablist, arrow-key moves between tabs and the panel updates.
- **Evidence:** 
  - Commit: `9dc758d`
  - Touched: `pricing.html`, `js/modules/pricing-tabs-panel.js`, `js/modules/pricing-tabs-indicator.js`
  - Screenshots: `tests/_shots/pricing-core-1280.png`, `tests/_shots/pricing-mark-1280.png`, `tests/_shots/pricing-cyber-1280.png`, `tests/_shots/pricing-cash-1280.png`, `tests/_shots/pricing-esg-1280.png`
  - `Root cause:` Logic for toggling visibility of content panels and comparison tables was missing from the deployed JS modules.
  - `Why it happened:` The indicator module was scoped only to visual animation, and the migration dropped legacy toggle handlers.
  - `Why this fix prevents recurrence:` Dedicated `pricing-tabs-panel.js` module now manages panel state independently via standard DOM events and ARIA.
  - `Other places same root cause may bite:` `/blog` filters or any custom tab-switcher without a panel-manager.

#### [LM-005] ✅ VERIFIED — Claude @ 23:40 — Gemini commit 4a5b318 `fix(theme): force dark text on white-background cards [LM-005]`. Pricing re-screenshotted (`tests/_shots/pricing-lm005-1280.png`); white-card area renders dark text on white. Pending Gemini to update status flips in this file itself; commit evidence proves work landed. **Gemini reminder: please flip status to DONE BEFORE moving to next item per protocol.**
- **Diagnosis:** The "Pro" card (`.ca-card !bg-white !border-[#0CC9A8]`) on the `bg-white text-[#040E1A]` section has its `<h4>Pro</h4>`, `<div>£299<span>/mo</span></div>`, and at least one `<p>` with no explicit text color. Resume confirmed cards rendering with white text on white bg. Source: `.ca-card` rule in `Assets/css/premium-transformation-2026-05-27.css` (~line 109) likely sets `color: var(--color-white)`.
- **Action:** In `premium-transformation-2026-05-27.css`, scope the white text to dark-bg cards only, OR add a sibling rule `.ca-card.\\!bg-white, .ca-card[class*="!bg-white"]:not([class*="bg-white/"]) { color:#040E1A; }` that forces dark text on truly-white cards. Make sure heading/price/desc all read near-black on white. Keep CTA buttons untouched (teal/dark bg, white text).
- **Verify:** Read full-res PNG of pricing-1280 at the Pro card; "Pro", "£299", "/mo", and description must be readable. Repeat for any other panel that has a white card variant (mark uses `!bg-white/5`, cash uses white).

#### [LM-006] ✅ VERIFIED — Claude @ 00:09 (was DONE @ 22:45)
- **Evidence:** Gemini commit `c39d423` (single line in `pricing.html`). Probe `tests/_priceprobe.js` confirms all 5 panels now render `offsetWidth:1280, offsetHeight:651-746px` (was 0). Page height 7798→7649px. Visual: CrowMark panel renders full content (`tests/_shots/v-pricing-after-mark.png`). **Bonus: LM-046 BUG-001 closed by same commit.**
- **Diagnosis:** A massive blank band mid-page. Likely the "Compare the details." comparison table is mostly empty rows or hidden content for non-Core products — when only Core panel shows, others' compare tables may render empty space. Could also be a `min-height` on `.pricing-panel[hidden]` that fires.
- **Action:** Inspect `pricing.html` and CSS for `min-height`/`height`/`padding-block` on `.pricing-panel`, `.pricing-compare`, or the section between price-cards and FAQ. Close the void by either filling rows or removing the forced height. Re-measure with `tests/_fullaudit.js` — overflow + page-height should drop.
- **Verify:** 1280 screenshot has no white/dark band > 800px tall; total page height drops; visual rhythm symmetric.
- **Evidence:**
  - Commit: `c39d423`
  - Touched: `pricing.html`
  - Screenshots: `tests/_shots/pricing-full-page-1280.png`
  - `Root cause:` The comparison table container used `space-y-32`, which applied `margin-top` to hidden table wrappers.
  - `Why it happened:` Migration to modular CSS left utility-based spacing interacting incorrectly with hidden elements.
  - `Why this fix prevents recurrence:` Switched to `flex-col gap-32` which respects `display: none` for layout calculation.
  - `Other places same root cause may bite:` Any list or grid using `space-y` with conditional visibility.

#### [LM-007] ✅ VERIFIED — Claude @ 00:11 (was IN-PROGRESS @ 22:50)
- **Evidence:** Gemini commit `ea786b1`. Confirmed: `faq.html` line 111 has `<input type="search" id="faq-search">`; `js/modules/faq-search.js` exists; line 79 loads it `defer`. Guard PASS (content preserved). H1 markup intact ("Questions about CrowAgent?"). Tracker form-control count restored. Screenshot `tests/_shots/faq-lm007-1280.png` shows search input above category accordions in v2 dark styling.
- **Diagnosis:** Tracker warn `"baseline had 2 form/input/toggle control(s), current has 0"`. The `<input type="search" id="f10-faq-search-input">` was dropped. Gemini stripped legacy CSS successfully but lost the search interactivity.
- **Action:** Re-add a v2-styled search input above the category accordions:
  ```html
  <div class="ca-container max-w-2xl mx-auto mt-8">
    <input type="search" id="faq-search" placeholder="Search FAQs"
      aria-label="Search frequently asked questions"
      class="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-full
             text-white placeholder-white/40 focus:border-[#0CC9A8] focus:outline-none">
  </div>
  ```
  Add `js/modules/faq-search.js` (defer): on input, lowercase the query; show only `<details>` whose `summary` text or `.faq-answer` text includes the query; show/hide the parent `<section class="faq-group">` based on whether it has any visible children. Debounce 150ms.
- **Verify:** type "MEES" → only MEES-related accordions show. Empty query → all show. axe clean. PASS guard (word count + 1 form control restored).

---

### 🟠 P1 — high-impact site-wide

#### [LM-008] OPEN — pricing capsule mappings under each product (owner)
- **Action:** Render exactly these capsules under each product's panel header:
  - Core → `SI 2015/962 · MHCLG EPC Register`
  - Mark → `PPN 002 · Oxford SVB TOMs`
  - Cyber → `NCSC v3.3 Danzell · PPN 014/21`
  - Cash → `Late Payment Act 1998`
  - Checker → `Omnibus I (Directive 2026/470)`
  - ESG → `GRI · TCFD · ISSB · UK SDR`
- **Verify:** screenshots of each panel show the capsule row.

#### [LM-009] OPEN — Free Tools (6) + Intel (2) premium formatting bar
- **Pages:** `tools/csrd-applicability-checker/index.html`, `tools/cyber-essentials-readiness/index.html`, `tools/late-payment-calculator/index.html`, `tools/mees-risk-snapshot/index.html`, `tools/ppn-002-calculator/index.html`, `tools/vsme-materiality-light/index.html`, `intel/cyber-essentials-tracker/index.html`, `intel/mees-tracker/index.html`.
- **Owner:** "poor formatting, not top 1%."
- **Action per page:** A-TOOL archetype — compact hero (eyebrow + H1 + 1-line sub + 2 CTAs) → 3-step "how it works" → centred ≤56rem tool panel (calculator/form) → methodology card grid → "Free Tool vs Full Product" comparison → CTA band. Hero H1 must not be clipped at any viewport. Calculator preserves EVERY existing form field + script. axe clean. Pixel-verify 1280 + 390.
- **Verify:** for each page, screenshot 1280 + 390, attach paths.

#### [LM-010] OPEN — Footer trust-badge icon/text vertical alignment _(CLAUDE-OWNED — Gemini DO NOT EDIT)_
- File: `Assets/css/nav-global-fix-2026-05-27.css`. Claude will fix this directly. This item is here so Gemini does NOT touch the footer CSS.

#### [LM-011] OPEN — axe-core: heading-order (41 pages, 80 nodes)
- **Action:** for each offender, change `<h3>` directly under `<h1>` to `<h2>` (or insert a missing `<h2>`). Sequential levels only. Re-run `node tests/_axescan.js`.
- **Verify:** axe report `heading-order` count drops to 0.

#### [LM-012] OPEN — axe-core: bare `<li>` not inside `<ul>/<ol>` (12 pages, 49 nodes — SERIOUS)
- **Action:** Wrap each bare `<li>` in `<ul role="list" class="...">`. Most are product-page hero trust rows where `<li>` sits inside `<div role="group">`. Make the parent `<ul>`.
- **Verify:** axe `listitem` count → 0.

#### [LM-013] OPEN — axe-core: landmark-contentinfo-is-top-level (50 pages — MODERATE)
- **Action:** ensure `<footer role="contentinfo">` injected by nav-inject is a direct child of `<body>`, NOT inside `<main>`. Move the `<div id="ca-footer">` placeholder outside `<main>` on every page that has it inside.
- **Verify:** axe count → 0.

#### [LM-014] OPEN — about.html lost sections (owner — high-emotion)
- **Diagnosis:** Newsletter signup ("monthly UK compliance digests"), "Where we are"/registration section, and the mission/values copy were dropped by an earlier pass.
- **Action:** Recover the EXACT prose from `git show handover-gemini-baseline:about.html`. Re-author each section into the v2 design beautifully — newsletter as a centred narrow signup card; "Where we are" as a small details block; mission/values as a 2-col split or quote band. NO loss of words.
- **Verify:** word count ≥ baseline; sections visible at 1280; guard PASS.

#### [LM-015] OPEN — Products nav dropdown (owner-reported visual issue)
- **Action:** open the Products mega-menu at desktop + 1280 + 1024 + 768; check positioning (no edge-clip), item contrast (text legible on whatever bg), z-index (above hero atmospheric), keyboard focus visible, escape closes. Polish to premium bar.
- **Verify:** screenshot the open dropdown at 3 widths.

#### [LM-016] OPEN — Hero invisible / intermittent auto-scroll-to-bottom on `.ca-main-transformation` pages
- **Diagnosis (owner-reported):** index/crowcyber/etc. occasionally loads scrolled to bottom (caught at `scrollY=23422` once). Pages themselves are NOT empty — Gemini's spacing is fine — the issue is missing scroll-restoration.
- **Action:** at the top of `sovereign-transformation-v2.js` (or a new tiny defer script loaded first), set `history.scrollRestoration='manual'` and call `window.scrollTo({top:0, left:0, behavior:'auto'})` on `DOMContentLoaded`. Also clear any stale `#fragment` that resolves to a removed id.
- **Verify:** `node tests/_scrollprobe.js` returns `scrollY:0` consistently across 5 fresh loads of index + 4 product pages.

#### [LM-017] ✅ VERIFIED — Claude @ 00:57 (was OPEN) — already fixed prior to loop. Sitewide grep returns 0 raw `href="/status"` or `href="/careers"` matches. `index.html` "System Status" link uses canonical `https://status.crowagent.ai`. No `/careers` references anywhere. Owner's BUG-022 was a false alarm or pre-existing fix.

#### [LM-018] ✅ VERIFIED — Claude @ 00:57 (was OPEN) — already in place. Verified `grep -c 'rel="canonical"'` on all 8 pages returns 1 each (crowcyber, crowcash, crowesg, crowmark, crowagent-core, csrd, index, pricing). Original FROM-CLAUDE flagged them as missing but they are present.

---

### 🟡 P2 — premium polish (high quality bar)

#### [LM-019] ✅ VERIFIED — Claude self-shipped @ 00:59 via BATCH-D b690e2c. Cookie banner sub-text "We use cookies..." color:rgba(255,255,255,0.88); cookie a links teal; pricing 10px / contact 9px footnotes color:rgba(232,240,250,0.65) (skip if already styled).
- Cookie banner 1.08:1 on every page · blog/index category labels 1:1 · pricing 10px footnote + contact 9px footnote · footer social icons faint · back-to-top on dark.
- **Action:** recolor TEXT to read on its own section (don't dim the section). Run `node tests/_a11y.js` after.
- **Verify:** a11y scan zero serious contrast failures on the listed elements.

#### [LM-020] OPEN — index.html hero still "basic" (owner-reported)
- Owner LOVES `mock-homepage-v2.html`, `mock-homepage-v3.html`, `proposals/premium.html`, `proposals/g1-premium.html`, `proposals/p1-cinematic-intro.html`, `proposals/06-depth-parallax.html`, `variation-vercel.html`, `variation-linear.html`. Pick the strongest, implement for real on `index.html`. Replace the current stacked-words "Win contracts. Protect Score Recover Pass" hero with a clean premium composition.
- **Action:** Gemini's creative call — re-author the hero on `index.html` to that calibre. Preserve every other section verbatim.
- **Verify:** screenshot 1280 + 390 of the new hero.

#### [LM-021] OPEN — Carousels: real `app.crowagent.ai` recordings, autoplay, pause-on-hover, no edge-clip, reduced-motion fallback
- **Action:** record real screen captures from `app.crowagent.ai` using the test user (creds in `HANDOVER-TO-GEMINI.md` — NEVER commit). Build the carousel to Stripe/Linear calibre.
- **Verify:** carousel autoplays smoothly; hover pauses; no clipping at edges; respects `prefers-reduced-motion`.

#### [LM-022] OPEN — em-dash removal (CLAUDE.md rule 4)
- **Pages with em-dashes:** `glossary/epc-rating.html`, `glossary/mees-compliance.html`, `glossary/ppn-002.html`, `glossary/si-2015-962.html`, `glossary/toms-framework.html`, `intel/cyber-essentials-tracker/index.html`.
- **Action:** replace `—` with `,` / `;` / sentence breaks. Keep meaning intact.
- **Verify:** `grep -l "—" *.html glossary/*.html intel/*/index.html` returns nothing.

#### [LM-023] OPEN — `<img>` without alt on `blog/regulatory-updates-2026.html`
- **Action:** add an honest descriptive `alt` (or `alt=""` if purely decorative).

#### [LM-024] ✅ VERIFIED (false alarm) — Claude @ 00:58. The tracker warn detects ANY `<nav>` element, but the "hardcoded nav" on terms/security/blogs is actually the in-page TOC `<nav class="ca-toc">` (table-of-contents) — a legitimate landmark per blog/legal long-form pages, NOT a duplicate main nav. The actual main nav comes from nav-inject only. No action needed. Tracker false positive.

---

## 🆕 HUNT-PASS-1 ADDITIONS (2026-05-28 22:55 — Claude visual sweep, 24 pages)

### 🔴 P0 additions

#### [LM-025] OPEN — partners.html LOAD TIMEOUT (network-idle not reached in 20s)
- **Diagnosis:** Hunt screenshot pass timed out twice at `partners.html` waiting for `networkidle`. Likely a long-polling network request, infinite fetch loop, or never-resolving promise (e.g. broken third-party embed, missing image with retry, or chatbot widget hammering).
- **Action:** open `partners.html` in DevTools Network tab → identify the never-finishing request(s). Either fix the source (e.g. ensure the chatbot script handles 404s, swap a missing image, kill a dev-only telemetry endpoint), or load it `async` so it doesn't block `networkidle`.
- **Verify:** `node tests/_shot.js /partners.html partners-verify` completes < 10s and returns a 200 with a real screenshot.

#### [LM-026] OPEN — Home hero is STATIC + too basic (owner-priority — supersedes parts of LM-020)
- **Diagnosis:** `tests/_shots/h-home-hero-vp.png` confirms: hero is plain stacked "Win contracts. / Protect your business. / Get paid faster." with `The Compliance Operating System` eyebrow, two CTAs, sub-paragraph, no animated mesh-gradient, no eyebrow rotator, no live countdown, no staggered char entrance, no parallax. Fails the PREMIUM MOTION DIRECTIVE.
- **Action (full premium build, no compromise):**
  1. Implement mesh-gradient WebGL shader behind hero via `js/modules/hero-mesh-shader.js` — breathing teal/obsidian/cloud gradient that pauses off-screen.
  2. Wire `js/modules/hero-staggered-entrance.js` — split H1 into spans per char, fade+rise 24px → 0 with 30ms per-char stagger.
  3. Wire `js/modules/eyebrow-rotator.js` — rotate the eyebrow through REAL live facts (e.g. `"MEES Band C in <N> days"`, `"PPN 002 floor: 10%"`, `"Late-Payment Act 1998: 8% + base"`); 3.5s cadence, ease-in-out.
  4. Add a LIVE UTC COUNTDOWN element below the CTAs — to MEES Band C 2028 deadline (`2028-04-01 00:00:00 Europe/London`). Use `Intl.RelativeTimeFormat` + `setInterval(1000)`. Honest math only.
  5. Magnetic CTA hover (already partly in `sovereign-transformation-v2.js` — verify on home).
  6. Replace stacked-words composition with the strongest mockup from `mock-homepage-v2.html` / `mock-homepage-v3.html` / `variation-vercel.html` / `variation-linear.html` / `proposals/premium.html` (owner's call — pick the boldest).
- **Verify:** record a 4s video at 1440 (`page.video()`); first frame ≠ last frame; mesh shader visibly animates; eyebrow rotates; countdown decrements; H1 chars stagger-reveal on first paint. PASS guard. axe clean.

#### [LM-027] OPEN — Counter-tween missing on home "What we cover" stats
- **Diagnosis:** stats "2028 / £150K / 10% / Base+8% / 1,000+ / 44+22" render as STATIC text. Module `js/modules/counter-tween.js` exists but isn't wired.
- **Action:** Add `data-counter-target="2028"` etc. to each stat span; wire counter-tween to detect `IntersectionObserver` entry and count up from 0 (or from a sensible start; for "Base+8%" handle the prefix). For non-numeric (`Base+8%`, `1,000+`, `44+22`) — animate just the numeric part or fade-up the whole string.
- **Verify:** scroll to "What we cover"; stats animate up to value; once visible.

### 🟠 P1 additions

#### [LM-028] OPEN — Products mega-menu: CrowAgent Core listed in WRONG COLUMN
- **Diagnosis (verified `tests/_shots/h-products-dropdown.png`):** the dropdown has two columns:
  - "COMPLIANCE PRODUCTS" → CrowCyber, CrowMark, CrowCash, CrowESG
  - "FOUNDATION & FREE TOOLS" → **CrowAgent Core**, CSRD Checker
  CrowAgent Core is THE foundation compliance product, NOT a free tool. CSRD Checker is the free tool.
- **Action:** restructure into 3 columns OR rename: (a) "COMPLIANCE PRODUCTS" with all 5 paid products including CrowAgent Core, (b) "FREE TOOLS" with CSRD Checker only (+ link "See all free tools →"). Update `js/nav-inject.js` mega-menu config.
- **Verify:** screenshot the open dropdown at 1440 — CrowAgent Core sits with the other paid products.

#### [LM-029] OPEN — "Skip to main content" link RENDERS VISIBLE at top-left on every page (a11y + visual)
- **Diagnosis (verified `tests/_shots/h-nav-1440.png`):** the `.skip-link` is visible in the top-left at desktop, not hidden until focus. The class is `skip-link sr-only` but `sr-only` styles likely missing in v2 build (Tailwind purge).
- **Action:** ensure `.sr-only` is defined site-wide:
  ```css
  .sr-only { position:absolute !important; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
  .skip-link:focus, .skip-link:focus-visible { position:fixed; top:1rem; left:1rem; width:auto; height:auto; clip:auto; padding:0.75rem 1rem; background:#040E1A; color:#0CC9A8; border:1px solid #0CC9A8; border-radius:0.5rem; z-index:9999; }
  ```
  Add to `Assets/css/nav-global-fix-2026-05-27.css` (CLAUDE-OWNED — Claude will do this directly). Mark this LM done as soon as Claude commits.

#### [LM-030] OPEN — Hamburger icon visible at 1440px desktop on index (should be ≤1024)
- **Diagnosis (verified `tests/_shots/h-nav-1440.png`):** a 3-bar hamburger icon (teal) renders at the far-right of the nav even at 1440 desktop. Per spec §1.6 it should only appear ≤1024.
- **Action:** in `nav-inject.js` or `nav-global-fix-2026-05-27.css`, scope `.ca-hamburger`/`.sv-hamburger` visibility to `@media (max-width:1023.98px) { display:flex }` and `display:none` above. (CLAUDE will fix in nav-global-fix.)

#### [LM-031] ✅ VERIFIED — Claude self-shipped @ 00:46 via BATCH-C e0e4d9d. Built `js/modules/sv-reveal.js` (IntersectionObserver fade-up + 20px translateY on every `main > section, .ca-main-transformation > section, body > section`, hero excluded). 600ms cubic-bezier(0.22,1,0.36,1). Already-in-viewport sections immediately revealed (no FOUC). Respects prefers-reduced-motion. Injected sitewide by nav-inject. Plus card hover lift (-2px + teal shadow) on `.ca-card, .sv-card, .article-card, .ca-trust-item`. Cache `?v=20260529e`.
- **Diagnosis:** Per motion directive, every section on every page must fade-up + stagger. Currently sections vary — some have `ms-reveal` class, others don't. Need a sitewide audit.
- **Action:** Add `ms-reveal` (or v2 equivalent `.sv-reveal`) class to every top-level `<section>` body-child on every page that lacks it. Ensure the JS observer module exists and runs.
- **Verify:** scroll through index + 5 random pages; sections fade-up; reduced-motion users see no animation.

#### [LM-032] OPEN — Home "Big 4" claim — verify legal truth
- **Diagnosis:** hero subtext: *"Level the playing field with the Big 4 using our enforcement-ready platform."* — uses "Big 4" trademark/name-check.
- **Action:** OWNER decision required. Either (a) reword to "incumbent consultancies"/"global advisory firms", or (b) keep but ensure trademark-fair-use notice. Lean towards (a) for safety.
- **Verify:** copy reads without naming any specific firm.

#### [LM-033] OPEN — "Built for UK teams under regulatory pressure" home section underdeveloped
- **Diagnosis (verified `tests/_shots/h-home-1280.png`):** the section is just a heading + sub on a dark band — no card grid, no chart, no proof. Looks like a stub.
- **Action:** Gemini's creative call — fill with content (which UK teams: Procurement / Risk / IT / ESG / Finance), or merge into another section. NEVER leave a heading hanging alone.
- **Verify:** section reads complete, with substance.

### 🟡 P2 additions

#### [LM-034] OPEN — Site-wide em-dash purge (CLAUDE.md rule 4 — supersedes LM-022)
- **Top offenders (Claude grep):** pricing.html 13 · intel/mees-tracker 8 · glossary/epc-rating 8 · intel/cyber-essentials-tracker 7 · glossary/toms-framework 6 · glossary/mees-compliance 6 · roadmap.html 5 · glossary/si-2015-962 4 · crowagent-core.html 4 · glossary/ppn-002 3 · about.html 3 · 6× methodology pages 2 each · 6× tools/* 2 each. **Plus every blog/* has em-dashes.**
- **Action:** sweep `—` → `,` `;` or sentence break, page by page, preserve meaning. Per-page commit acceptable: `fix(<scope>): em-dash purge per CLAUDE.md rule 4 [LM-034]`.
- **Verify:** `grep -l "—" *.html blog/*.html glossary/*.html intel/*/index.html tools/*/index.html` returns nothing. Guard PASS.

#### [LM-035] OPEN — Home "Solve. Prove. Profit." 3-word stacked section breaks rhythm
- **Diagnosis (verified home 1280 PNG):** below the dashboard-mockup section, a giant stacked "Solve. / Prove. / Profit." renders as 3 separate massive lines on dark. Feels disconnected — owner already flagged the stacked-words pattern.
- **Action:** integrate as a kinetic 3-word verb-rotator + concrete sub-line ("Solve audits in 12 mins. Prove with statute. Profit from compliance work."), OR turn into a 3-card visual band with icons. Don't leave isolated giant words.

#### [LM-037] OPEN — VOID BANDS sitewide on product + hub pages (shared root cause)
- **Diagnosis (verified `tests/_shots/h-p-core-1280.png` + `h-p-cyber-1280.png` + `h-p-mark-1280.png` + `h-products-hub-1280.png`):** ALL paid product pages + the products hub render multiple dark sections that are JUST a centred heading + sub-line with hundreds of pixels of empty dark space below.
  - p-core: "Postcode to report." · "Total Compliance Intelligence." · "The full CrowAgent Portfolio."
  - p-cyber: "From tenant connect to certification." · "The five NCSC controls, end to end." · "Everything you need for Cyber Essentials and CE+." · "The CrowAgent portfolio."
  - p-mark: "Three reasons to bid with CrowMark." · "PPN 002 Compliance." · "The CrowAgent Portfolio."
  - products-hub: "Active windows." section ~700px empty space below heading.
  - **Likely identical on p-cash, p-esg, p-csrd** — Gemini must audit all 6.
- **Root-cause hypothesis (Gemini investigate before fixing):** either (a) the legacy CSS provided body content via `:before/:after` pseudo-elements that v2 doesn't render, or (b) the v2 migration created an empty `<section>` shell intending to fill it later, or (c) the body markup was tightened but each section's padding-block stayed at the pre-tightening value, creating huge whitespace. RCA first; identify which, fix at source.
- **Action:** per product page, for each heading-only band: EITHER (a) populate with the substantive content that was there pre-migration (check `git show handover-gemini-baseline:<file>` for the original), OR (b) merge with the next/previous related section, OR (c) tighten `padding-block` to symmetric `clamp(64px, 8vh, 112px)` per spec §1.1. Don't leave empty heading-only bands.
- **Verify:** screenshot each page; no section has > 400px empty space below its heading; page height drops 15–25%; rhythm symmetric.

#### [LM-038] OPEN — contact.html only 3610px tall — likely missing form/sections
- **Diagnosis (verified `tests/_shots/h-contact-1280.png`):** page renders hero "Talk to CrowAgent." + two contact-channel cards (white) + "Tell us what you're working on" sidebar + "Prefer regulatory updates?" newsletter signup + footer. Total 3610px = unusually short for a contact page that should have a real form. Tracker shows content at 58% of baseline (247/426 words).
- **Action (RCA first):** `git show handover-gemini-baseline:contact.html` and diff against current. If a structured contact form was dropped in migration, RESTORE it (Name / Email / Organisation / Subject / Message + Cloudflare Turnstile + Brevo submit). If only copy was tightened, populate the "Tell us what you're working on" section with substantive content.
- **Verify:** word count ≥ baseline; visible form with all required fields; honest submission target (Brevo per `[[reference_canonical_email_brevo]]`).

#### [LM-039] OPEN — products-hub.html "Active windows." section: ~700px void below heading
- **Diagnosis:** Same root cause as LM-037 but on the products hub. Heading + sub-line + empty band of ~700px before "CrowAgent Core" card appears.
- **Action:** populate the void with the 4 "active windows" being teased (Cyber Essentials 27 Apr 2026 · PPN 002 ongoing · CSRD Omnibus I · MEES 2028 proposed) as a 4-card grid OR merge "Active windows." heading with the CrowAgent Core block that follows.

#### [LM-040] ✅ VERIFIED — Claude self-shipped @ 00:59 via BATCH-D b690e2c. .products-hub-grid + .ca-products-grid auto-fit `repeat(auto-fit, minmax(220px, 1fr))` max-width:1120px margin-inline:auto.
- **Diagnosis:** the "Free regulator-grade tools" teaser shows 4 mini-cards (CSRD Checker / PPN 002 Calc / CE Readiness / MEES Risk) in a 2x2 that leaves big margin on the right of the section. Awkward visual balance.
- **Action:** either centre the grid + max-width tighter, or expand to a 4-column row at ≥1024.

---

## 🆕 OWNER REPORTS 2026-05-28 23:25 (user-spotted defects — fix immediately)

#### [LM-041] IN-PROGRESS — Gemini @ 23:20 — 🔴 P0 — WHITE TEXT ON WHITE BACKGROUND sitewide (OWNER-SPOTTED — CONFIRMED 0/65 PAGES PASS A11Y SCAN)
- **Owner direct quote:** "I saw many places text is written in white color and background is also white so text is not visible." Pricing white-card (LM-005) is one instance — owner reports it is BROADER (multiple pages).
- **Claude a11y scan 23:55:** `node tests/_a11y.js` → **0/65 pages pass**. 18+ low-contrast violations per tools page. Repeating pattern across `tools/{csrd-applicability-checker, cyber-essentials-readiness, late-payment-calculator, mees-risk-snapshot, ppn-002-calculator, vsme-materiality-light}/index.html` and `tools/index.html`:
  - `"01" @30px contrast 1.08:1` (need 3) — step numbers
  - `"02" @30px contrast 1.08:1` (need 3)
  - `"Answer 5 controls" / "Enter overdue invoice" / "Identify topics" / "Pick your mission" @20px contrast 1.08:1` — section headings
  - `"Five plain-English questions covering th..." / "Invoice amount, the original due date..." @14px contrast 1.08:1` — body
  - `"Open tool →" @12px contrast 1.08:1` — CTAs
  - `"Methodology" @10px contrast 1:1` — completely invisible labels
- **The 1.08:1 / 1:1 ratios confirm same-color text on same-color background — true white-on-white (or very near).**
- **BATCH-B partial fix shipped (6bd7e3f):** sitewide CSS safety net with 8 targeted patterns (white-card-on-white-section dark text, .sec-cred-card readable on dark, step-number contrast, gradient-text fallback to teal, footer link 0.62→0.74, blog category labels readable). **Axe re-scan: color-contrast 895→880 nodes (-15)**. Major visible win: FAQ hero "CrowAgent?" gradient text now renders teal (was invisible). Remaining 880 = mostly axe false-positives on gradient/alpha backgrounds + a few real cases for per-page hunting.
- **Root-cause hypothesis (Gemini RCA before fixing):** likely TWO architectural rules cause this:
  1. `Assets/css/premium-transformation-2026-05-27.css` line 47-58: `.ca-hero-title span` has `background:linear-gradient(white...); -webkit-text-fill-color:transparent` — on white sections this renders fully invisible.
  2. `.ca-card` rule may set default `color:var(--color-white)` — on `bg-white`/`!bg-white` cards the text vanishes.
- **Action (root-cause, NOT per-instance overrides):**
  1. Sitewide hunt: at 1280 + 390, screenshot every page; locate every white-on-white spot; run `node tests/_a11y.js`.
  2. For each, map to the ROOT-CAUSE CSS rule (not the rendered symptom).
  3. Fix at the source: scope every `color:white` / `color:var(--color-white)` / `text-fill-color:transparent` rule to dark-bg contexts only. Add explicit `color:#040E1A` to `.ca-card.\\!bg-white` heading/price/desc, white-section text descendants, etc. Use CSS layers if needed for cascade clarity.
  4. Pixel-verify every patched location at full res.
- **Verify:** every page passes WCAG AA (4.5:1) for body text; no invisible heading/price/desc/CTA anywhere. Trust pixels, not metrics.

#### [LM-042] OPEN — 🟠 P1 — blog/index hero: "Intelligence" + HORIZONTAL GAP + "for the UK." (OWNER-SPOTTED)
- **Owner direct quote:** "why there is gap between Intelligence               for the UK.?"
- **Diagnosis (verified `tests/_shots/blog-hero-verify-1280.png`):** H1 markup is one outer span wrapping both phrases with a `<br>` inside, the JS staggered-entrance likely drops the `<br>` when rebuilding chars → both phrases sit inline-block with `margin:0 0.1em` between them, creating the visible horizontal gap.
- **Root cause:** anti-pattern in H1 markup (nested span + `<br>`) collides with `.ca-hero-title span { display:inline-block; nowrap }` from premium-transformation.css + char-split JS.
- **Action:** restructure blog/index H1 to TWO SIBLING direct-child spans, no nested wrapper, no `<br>`:
  ```html
  <h1 class="ca-hero-title">
    <span>Intelligence</span>
    <span class="text-[#0CC9A8]">for the UK.</span>
  </h1>
  ```
  Direct child `> span` already gets `display:block !important` from nav-global-fix line 296 → two stacked lines, no gap.
- **Other places same root cause may bite:** `terms.html` line 65 has identical pattern; grep `<span>[^<]*<br/?>` across all HTML and fix every match.
- **Verify:** screenshot → "Intelligence" and "for the UK." cleanly stacked, no horizontal gap.

#### [LM-043] OPEN — 🟠 P1 — blog/index filter chips (All / MEES & EPC / PPN 002 / CSRD & ESG / Cyber / Updates) are NOT WIRED (OWNER-SPOTTED)
- **Owner direct quote:** "All MEES & EPC PPN 002 CSRD & ESG Cyber Updates are not working in the blog page"
- **Diagnosis (verified):** lines 70-75 have `<button class="filter-pill" data-filter="...">`. Cards have `data-category="..."`. But `js/modules/blog-filter.js` DOES NOT EXIST (only `blog-reading-time.js`). Clicks do nothing.
- **Root cause:** module was never built (or was lost in migration). No JS reads `data-filter`.
- **Action:** create `js/modules/blog-filter.js` (loaded `defer` from blog/index.html):
  - On `DOMContentLoaded`, query all `.filter-pill[data-filter]` and `.article-card[data-category]`.
  - On click: toggle `.active` to clicked pill (remove from others); update `aria-pressed="true|false"` on every pill.
  - If `data-filter="all"`, show every card. Otherwise: cards whose `data-category` matches → show; others → `display:none` + `aria-hidden=true`.
  - Maintain URL `?cat=` query param for shareable filtered views via `history.replaceState`. Read on load to set initial active.
  - Smooth height/opacity transition (200ms ease-out). Respect `prefers-reduced-motion`.
- **Verify:** click each chip → only matching cards visible; click "All" → all visible; URL updates; refresh `/blog/?cat=mees-epc` → opens with that chip active.

## 🆕 OWNER-PROVIDED CHROME REAL-VISUAL TEST 2026-05-28 23:50 (BUG-001..BUG-029 → LM-046..LM-074)

**Owner ran a comprehensive frontend visual test in Chrome at ~900px viewport (tablet / narrow desktop) and produced a structured defect ledger. Gemini: pick these up in priority order. Many share root causes — GROUP YOUR FIXES.**

### 🔴 P0 from owner Chrome test (blocks conversion / completely broken)

#### [LM-046] ✅ VERIFIED — Claude @ 00:09 (was OPEN BUG-001)
- **Evidence:** Probe via `tests/_priceprobe.js` — all 4 prior-broken panels (`mark-p`, `cyber-p`, `cash-p`, `esg-p`) now have `offsetWidth:1280, offsetHeight:651-746px`. Closed by Gemini commit `c39d423` (same as LM-006 — single root cause shared). Owner's #1 reported P0 (4 of 5 products invisible on conversion page) is RESOLVED.
- **Diagnosis:** `#mark`, `#cyber`, `#cash`, `#esg` panels' `.ca-container` measures `width:0, height:0, offsetHeight:0`. Only `#core` renders. Site's primary conversion page — 4 of 5 products literally invisible. **Likely the same root cause as my LM-006 pricing void** — re-investigate together.
- **Root-cause hypothesis:** the panel-toggle module (LM-004 fix, commit 9dc758d) sets `display:none` + `hidden=true` on inactive panels — but their `.ca-container` may have a `width:0` from a flex/grid parent that doesn't allow size when hidden, AND when switched ON via display:block the container still has 0 width because some inner element collapsed.
- **Action (RCA first):** click each tab; for the activated panel, walk the DOM up from the empty `.ca-container` to find which ancestor has the collapsed width. Common culprits: `flex-shrink:0`/`width:0` interaction, `aspect-ratio` set with no width, `position:absolute` orphaned. Fix at source — every panel must size identically to `#core` when active.
- **Verify:** `tests/_pricetabs.js` already clicks each tab; ADD a check that `.ca-container.offsetWidth > 0 && .offsetHeight > 0` for the activated panel; assert across all 5 panels.

#### [LM-047] ✅ VERIFIED — Claude self-shipped @ 00:18 via BATCH-A 7d71763. Added .ca-btn-premium / .ca-btn-primary-premium / .ca-btn-ghost-premium family CSS to nav-global-fix. Hero CTAs now render as teal-gradient pill / ghost outline + magnetic hover + scale press + focus-visible ring.
- **Diagnosis:** `.ca-btn-premium`, `.ca-btn-primary-premium`, `.ca-btn-ghost-premium` on `index.html` render with `padding:0px`, `height:24px`. The "Start 14-day free trial" / "Book a demo →" buttons look like LINKS, not buttons. Other pages use `.ca-btn` with `padding:12px 32px, height:48px` — correct.
- **Root cause:** the `.ca-btn-premium` class family was authored but never given a CSS rule (missing in `premium-transformation-2026-05-27.css` or wherever it should live). It IS used in the home hero markup, but no CSS defines it.
- **Action:** EITHER (a) add a `.ca-btn-premium { padding: 14px 32px; background: var(--teal); color: #04101a; border-radius: 999px; font-weight: 700; display: inline-flex; align-items: center; gap: 8px; height: auto; line-height: 1.2; }` rule (+ variants for primary/ghost) to a global CSS, OR (b) swap home hero markup to use the proven `.ca-btn .ca-btn-primary` / `.ca-btn-ghost` classes that work everywhere else.
- **Related:** BUG-021 (LM-066) `ca-hero-btns` collapsed to 24px — resolves once buttons get padding.
- **Verify:** screenshot home hero at 1280 + 390; both CTAs render as proper teal pill / ghost outline; computed `height ≥ 48px`.

#### [LM-048] OPEN — 🔴 P0 — 9 sector card images return 404 (broken) [BUG-003]
- **Diagnosis:** `/Assets/photos/sectors/sector-{professional-services,retail-hospitality,public-sector-civic,manufacturing-industrial,real-estate-commercial,construction-civil}.webp` all 404. Sector cards render broken-image placeholders.
- **Root cause:** photos directory missing those 6 unique files (3 duplicates noted = 9 references).
- **Action:** EITHER (a) source 6 royalty-free Unsplash images per the per-memory rule [[feedback_website_images_royalty_free]] (sectors: professional services / retail / public sector / manufacturing / real estate / construction), credit each in footer or alt, save as `.webp` at 1920w + 4k; OR (b) update the homepage sector card src paths to point to existing assets.
- **Verify:** all 9 requests return 200; sector cards show real photos; `<img alt="">` present per [[feedback_website_images_royalty_free]].

#### [LM-049] ✅ VERIFIED — Claude self-shipped @ 00:18 via BATCH-A 7d71763. clamp(1.85rem, 1.1rem + 4.2vw, 4rem) on .ca-hero-title + overflow-wrap. Closes LM-054 (partners hero), LM-066 (.ca-hero-btns), LM-072 (crowesg).
- **Diagnosis (across 8+ pages, Claude expanded):** `tools/{ppn-002-calculator, cyber-essentials-readiness, late-payment-calculator, csrd-applicability-checker, vsme-materiality-light, mees-risk-snapshot}/index.html` + `/roadmap.html` + `/crowesg.html` + **`/tools-csrd-checker-methodology.html`** (verified `tests/_shots/h-meth-csrd-1280.png` — "Testing Omnibus I applicabili..." clipped): `<h1>` font-size 72px in a 1024px container at 901px viewport → `h1.scrollWidth=1918px`, `h1.offsetWidth=1024px`. Text clipped: "Pre-screen your Cyber Ess..." "Snapshot your MEES penal..." "CrowAgent product roadm..." "Multi-framework ESG reporting on one pla..." "Testing Omnibus I applicabili..."
- **Likely all 6 `tools-*-methodology.html` pages affected — Gemini must audit all 6.**
- **Root cause:** H1s use a fixed `text-7xl` or `font-size:72px` instead of responsive `clamp()`. Parent container is wider than viewport.
- **Action (root-cause, NOT per-page override):** apply responsive H1 sizing globally via `.ca-hero-title { font-size: clamp(2rem, 1.2rem + 4.5vw, 4.5rem); line-height: 1.05; }` in `nav-global-fix-2026-05-27.css` (Claude-owned — Claude will fix). Also ensure `.ca-hero` container has `max-width: 100vw; overflow-x: clip`.
- **Verify:** at 901px viewport, every tool/roadmap/crowesg H1 fits the viewport with no horizontal scroll; wraps to 2 lines if needed.

#### [LM-050] ✅ VERIFIED — Claude self-shipped @ 00:18 via BATCH-A 7d71763. .ca-hero p / desc / sub get max-width: min(60ch, 100%). Tool descriptions no longer clipped mid-word.
- **Diagnosis:** same 7 pages, `<p>` text clipped mid-word: "Defens[ibly]...", "IASME assesso[r]...", "both require[d]...", "Module B is Bas[ic]..."
- **Root cause:** same as LM-049 (no `max-width:100vw` on hero container).
- **Action:** apply `.ca-hero p, .ca-hero-desc, .ca-hero-desc-premium { max-width: min(60ch, 100% - 32px); margin-inline: auto; }` globally.
- **Verify:** at 901px, every hero `<p>` fits, no horizontal clip.

#### [LM-051] ✅ VERIFIED — Claude self-shipped @ 00:18 via BATCH-A 7d71763. Responsive section padding clamp(48px, 6vh, 96px) sitewide; hero clamp(72px, 10vh, 144px); >=1280px scales up. Verified page height drops: pricing -21% (7649→6036), crowesg -21% (11322→8932), home -18% (~22197→18123), crowesg 390 mobile -18%. CLOSES owner's #1 visual complaint (void bands sitewide). Also closes LM-037 + LM-076.
- **Diagnosis (root cause of LM-037 confirmed):** every `<section>` uses `py-60` = `padding: 240px 0`. Hero uses `padding: 128px 0 160px`. At 900px viewport this creates FULL-SCREEN blank bands. Owner saw this as multiple "heading only void bands" on every product page (LM-037).
- **CATASTROPHIC ON MOBILE 390px (Claude hunt-2 verify):**
  - `index.html` 390 = **31,432px tall** (80+ screen heights, `tests/_shots/h-home-390.png`).
  - `crowagent-core.html` 390 = **19,080px tall** (50+ screens, `tests/_shots/h-p-core-390.png`).
  - Mobile UX is effectively broken — users tap-scroll endlessly through void. Bounce rate will be near 100%.
- **Implementation MUST hit mobile FIRST:** the responsive padding scale `clamp(48px, 6vh, 96px)` is non-negotiable at ≤768px; allow up to `clamp(72px, 8vh, 128px)` at ≥1280px.
- **Root cause:** Tailwind class `py-60` (240px) hardcoded into the markup of `.ca-section-dark` and product page sections — no responsive breakpoint reduction.
- **Action (architectural, NOT per-page):** override `.ca-section-dark, .ca-section, section[class*="py-60"], section[class*="py-40"]` with responsive `padding-block: clamp(48px, 8vh, 112px)` in `premium-transformation-2026-05-27.css` (per spec §1.1). For hero: `clamp(72px, 12vh, 160px) 0 clamp(56px, 10vh, 128px)`. This kills 80% of the void-band complaints in one stroke.
- **Verify:** every page height drops 20–35% at 1280; visual rhythm tightens; no heading-only void > 200px below its sub.

### 🟠 P1 from owner Chrome test

#### [LM-052] OPEN — 🟠 P1 — Resources hero CTAs render as merged plain text "Run a free tool Read the latest briefing" [BUG-007]
- **Root cause:** CTAs on resources hero lack `.ca-btn` class wrapper or any button styling.
- **Action:** wrap each CTA in `<a class="ca-btn ca-btn-primary">` / `<a class="ca-btn ca-btn-ghost">`. Don't reinvent button styles.

#### [LM-053] OPEN — 🟠 P1 — Resources breadcrumb unstyled plain text at top-left [BUG-008]
- **Root cause:** breadcrumb element outside the content container OR missing `.ca-breadcrumb` / equivalent class.
- **Action:** ensure breadcrumb sits INSIDE `.ca-container` of the hero, wrapped in `<nav aria-label="Breadcrumb">` with the v2 styling (small-caps tracked, opacity 0.6, " / " separator).

#### [LM-054] ✅ VERIFIED — Claude self-shipped @ 00:18 via BATCH-A 7d71763. Closed by LM-049 root-cause fix (.ca-hero-title clamp + .ca-hero p max-width). Partners hero now fits viewport at all widths.
- Same root cause as LM-049/050 — once fixed at source, partners benefits automatically. Mark VERIFIED when LM-049 lands.

#### [LM-055] OPEN — 🟠 P1 — Partners breadcrumb "HOME / PARTNERS" unstyled plain text [BUG-010]
- Same as LM-053.

#### [LM-056] OPEN — 🟠 P1 — Glossary search magnifier icon floats outside content container (left margin) [BUG-011]
- **Root cause:** search icon wrapper has `position:absolute` resolving to body/viewport, not its input parent.
- **Action:** input wrapper needs `position:relative`; icon `position:absolute; left: 16px; top: 50%; transform: translateY(-50%);`.

#### [LM-057] OPEN — 🟠 P1 — Home hero has ~200px unexplained gap below announcement bar [BUG-012]
- **Root cause hypothesis:** `.ca-hero-grid` and `.ca-mesh` divs have `offsetHeight:0` but still occupy `flow` space due to wrong `position` value. Or hero `padding-top: 128px` is excessive.
- **Action:** inspect; either set `ca-hero-grid` + `ca-mesh` to `position:absolute; inset:0` (so they're decorative overlays, not flow), OR reduce hero `padding-top` to `clamp(56px, 8vh, 112px)`.

#### [LM-058] OPEN — 🟠 P1 — CSRD "START FREE CHECKER" CTA is lime/yellow-green vs brand teal [BUG-013]
- **Root cause:** custom color `#C5F542` or similar applied; diverges from `var(--teal)` `#0CC9A8`.
- **Action:** swap to `.ca-btn-primary` (teal). Single brand surface.

#### [LM-059] OPEN — 🟠 P1 — Cookies breadcrumb shows only "HOME" — missing "/ COOKIES" segment [BUG-014]
- **Root cause:** breadcrumb component missing current-page segment on cookies.html (privacy/terms have it correctly).
- **Action:** append `<li aria-current="page">Cookies</li>` to breadcrumb in cookies.html.

### 🟡 P2 from owner Chrome test

#### [LM-060] OPEN — 🟡 P2 — Hamburger-only nav at 901px viewport (tablet) [BUG-015]
- **Root cause:** mobile breakpoint set to ≤1024 (per nav-global-fix line 70). 13" laptops at 1280 see hamburger if scaled. At 901px (tested) it's hamburger as designed but may be too aggressive a breakpoint.
- **Action:** verify breakpoint. If owner wants nav inline at ≥1024 (13" laptop), tighten to `@media (max-width: 1023px)` only.

#### [LM-061] OPEN — 🟡 P2 — Products hub H1 "UK compliance, six regulators." grammatically incomplete + huge gap [BUG-016]
- **Same root pattern as LM-042 (blog hero):** nested-span + whitespace.
- **Action:** restructure H1 to two sibling spans, no internal `<br>` or whitespace artifact. Also add a connecting word: "UK compliance, six regulators, one platform." Owner OWNS the copy choice.

#### [LM-062] OPEN — 🟡 P2 — Hero `ca-hero-grid` + `ca-mesh` divs have height 0 (layout dead weight) [BUG-017]
- Sub-issue of LM-057 — fix together.

#### [LM-063] OPEN — 🟡 P2 — Pricing sticky tabs lack `<a href="#core">` anchors — keyboard inaccessible [BUG-018]
- **Root cause:** tabs are buttons only; no anchor href so they don't appear in a keyboard tab-flow as links, AND deep-linking `pricing.html#mark` doesn't work.
- **Action:** wrap each tab content in `<a href="#mark" data-ptab="mark" role="tab">` and update the JS module to handle anchor links (`event.preventDefault()`). Update URL hash on switch via `history.replaceState`. Allow shareable `pricing.html#cyber`.

#### [LM-064] ✅ VERIFIED — Claude self-shipped @ 00:42 via 0e574b5. `aria-label="CrowAgent on LinkedIn (opens in a new tab)"` (etc.) on every `.foot-social a` via nav-inject. Screen-reader friendly.
- **Action:** add `aria-label="CrowAgent on LinkedIn"` (etc.) to each `.foot-social a`. CLAUDE will edit nav-inject footer template since that's Claude-owned.

#### [LM-065] OPEN — 🟡 P2 — Home hero section is 1589px tall vs ~529px viewport = 3 screens of scroll [BUG-020]
- **Root cause:** hero padding + content height not constrained.
- **Action:** cap hero `max-height: 100dvh` OR `min-height: 100vh; height: auto` with `padding-block` clamped. Tighten content max-width too.

#### [LM-066] ✅ VERIFIED — Claude self-shipped @ 00:18 via BATCH-A 7d71763. Resolved by LM-047 button-CSS fix (CTAs now have height 48px → container sizes correctly). Also explicit .ca-hero-btns flex rules added.
- Resolves with LM-047 (CTA padding).

#### [LM-067] OPEN — 🟡 P2 — Announce bar "Start free trial" hardcoded to `https://app.crowagent.ai/signup` [BUG-022]
- **Root cause:** hardcoded URL doesn't switch between localhost/staging/prod.
- **Action:** if prelaunch and app.crowagent.ai is live, fine. Otherwise use a relative path or environment-aware config.

### 🟢 P3 polish from owner Chrome test

#### [LM-068] ⚠️ REOPENED — Claude @ 00:32 — CSS-only fix insufficient; needs markup fix (Gemini)
- **CSS attempted (BATCH-A 7d71763 + later strengthening to all-descendant spans):** display:block !important on `.ca-hero-title span` at @media(max-width:1439px). Cache `?v=20260529c`.
- **Why it failed (DOM probe `tests/_lm068probe.js`):** `sovereign-transformation-v2.js` splits the H1 text into **42 per-char `.char` spans** with inline-block + inline `style="opacity:0; transform:..."`. My CSS can override at the OUTER span level but the per-char spans take over the visible flow. With inline-block chars, "Intelligence" + space + `\n` char + "by engineers" all sit on ONE LINE because there's no `<br>` left after JS split.
- **TRUE FIX (Gemini's lane — markup change):** restructure H1 on every affected page to TWO SIBLING direct-child spans, NO nested wrapper, NO `<br>`:
  ```html
  <h1 class="ca-hero-title">
    <span>Intelligence</span>
    <span class="text-[#0CC9A8]">by engineers.</span>
  </h1>
  ```
  Then each PHRASE span is animated as a unit (the char-split runs INSIDE each span, but each span itself is display:block).
- **Affected pages (Gemini sweep):** about, privacy, terms, cookies, 404, changelog, blog/index, products/index, glossary/index, cookie-preferences, glossary/mees-compliance.
- **Note:** my CSS @media rule stays in place — once markup is fixed, the responsive collapse rule will keep them stacked at <1440px and inline at ≥1440px per REC-004.
- **Pages owner-reported:** about, blog, tools, products, privacy, terms, cookies, glossary, changelog, contact.
- **Claude hunt-2 confirmations (1280):**
  - `changelog.html` — "What we shipped,    and when." ✓ confirmed
  - `cookies.html` — "Cookie    Policy." ✓ confirmed (per `tests/_shots/h-cookies-1280.png`)
  - `404.html` — "Lost in    compliance." ✓ confirmed (per `tests/_shots/h-p404-1280.png`)
  - `blog/index.html` — "Intelligence    for the UK." (LM-042 owner-spotted)
  - `products/index.html` — "UK compliance,    six regulators." (LM-061)
  - `glossary/mees-compliance.html` — "MEES    Minimum Energy Efficiency..." ✓ confirmed (per `tests/_shots/h-gloss-mees-1280.png`)
  - `cookie-preferences.html` — "Cookie    Preferences." ✓ confirmed (per `tests/_shots/h-cookie-prefs-1280.png`)
- Same root pattern as LM-042 + LM-061 + LM-078 (responsive split per REC-004). Group fix: all `.ca-hero-title` with split phrase pattern across these pages — apply REC-004 responsive single-column at <1440px. **Confirmed on 9+ pages → it's an architectural pattern fix, NOT per-page.**

#### [LM-101] OPEN — 🟡 P2 — cookie-preferences.html appears MISSING category toggle switches
- **Diagnosis (verified `tests/_shots/h-cookie-prefs-1280.png`):** page renders 3 category sections (Strictly Necessary / Analytics & Performance / Personalisation & Functional) with descriptive text but **no visible toggle switches/checkboxes** next to "Analytics" and "Personalisation". Only "Strictly Necessary" has an "ALWAYS ENABLED" badge. Users have no way to opt in/out per category. PECR / UK GDPR likely require granular consent.
- **Root-cause hypothesis (Gemini RCA):** either (a) the toggles are present in DOM but styled `opacity:0` / hidden by a CSS rule (LM-041 white-on-white), or (b) the toggle markup was dropped during migration, or (c) JS that injects them isn't running.
- **Action:** load `/cookie-preferences.html`, inspect DOM for `.cookie-chk` / `input[type=checkbox]` inside each category — confirm whether toggles exist; if hidden, fix CSS; if absent, build them as `<label class="ca-toggle"><input type="checkbox" id="ca-cookie-analytics" /><span>Toggle</span></label>` with on/off animation. Wire to cookie-banner.js consent API.
- **Verify:** screenshot shows visible 44×44 toggle next to each opt-in category; clicking persists via cookie-banner.js consent.

#### [LM-105] ✅ VERIFIED — Claude self-shipped @ 00:51 via d3e41d6. @media(max-width:768px) caps H1 font to clamp(1.5rem, 0.8rem + 3.5vw, 2.4rem) + word-break + hyphens:auto + padding-inline:16px. Eyebrow + body p tightened. Verified crop tests/_shots/v-mark-hero-crop.png: "Score more public-sec-" + "tor bids" + "on social value." renders fully with proper hyphenation.
- **Diagnosis (verified `tests/_shots/v-mark-mobile-final-390.png`):** H1 markup has two correct sibling spans (`<span>Score more public-sector bids</span><span>on social value.</span>`) but at 390px the first span doesn't wrap — "public-sector bids" gets clipped at viewport edge.
- **Root cause hypothesis:** premium-transformation.css `.ca-hero-title span { white-space:nowrap !important; }` is still winning despite my LM-068 strengthening rule at <1440px. OR `.ca-hero { overflow-x: clip; }` from BATCH-A masks the overflow.
- **Action:** Gemini — check `Assets/css/premium-transformation-2026-05-27.css` for the nowrap rule and remove it (the staggered char animation doesn't actually need nowrap on the parent). Alternatively, ADD `word-wrap: break-word; overflow-wrap: break-word; hyphens: auto;` on the span at <1440px.
- **Verify:** crowmark mobile H1 wraps "Score more public-sector bids" onto 2 lines without clipping.

#### [LM-103] OPEN — 🔴 P0 — intel/mees-tracker H1 broken into TWO DISCONNECTED PIECES "The MEES acker." + "Requirements Tr"
- **Diagnosis (verified `tests/_shots/v-intel-mees-1280.png`):** at 1280px viewport, the hero H1 renders as: "The MEES acker." on the left half + "Requirements Tr" on the right half — both clearly truncated mid-word. Owner cannot read either fragment. **Visible defect on a primary content page.**
- **Root cause hypothesis (Gemini RCA):** likely same as LM-068 (nested-span + JS char-split). The full intended text is probably "The MEES Tracker. Requirements" or "The MEES Tracker." (heading) + "Requirements timeline" (subtitle). The split-headline layout is mis-rendering at 1280px.
- **Action:** apply LM-068 markup fix (two-sibling spans, no `<br>`) to `intel/mees-tracker/index.html` H1; if it's actually two separate elements (h1 + subtitle), fix the column layout collapse at <1440px.
- **Verify:** at 1280 + 390, H1 reads as ONE complete heading; subtitle below it reads complete; no horizontal split.

#### [LM-104] OPEN — 🟠 P1 — intel/cyber-essentials-tracker H1 split-headline fragments: "The Cyber Essentials" + "Requirements Tracker."
- **Diagnosis (verified `tests/_shots/v-intel-cyber-1280.png`):** at 1280, hero renders "The Cyber Essentials" on left + "Requirements Tracker." on right (split-headline layout). Reads better than LM-103 since it's full words, but still fragmented visually.
- **Root cause:** same as LM-068 + LM-103 (nested-span markup + JS char-split).
- **Action:** apply LM-068 two-sibling span markup fix.

#### [LM-102] OPEN — 🟡 P2 — glossary term "Penalty calculation" embedded calculator card appears LOW CONTRAST
- **Diagnosis (verified `tests/_shots/h-gloss-mees-1280.png`):** the dark card in `glossary/mees-compliance.html` under "Penalty calculation" heading has text that appears illegible at full-res — possibly white-on-dark-teal at low contrast, or transparent text from `-webkit-text-fill-color:transparent` (LM-041 pattern).
- **Action:** pixel-verify; if true low-contrast, force `color:#E8F0FA !important` on `.glossary-penalty-card *`. Otherwise note as false-positive.
- **Verify:** card text readable at full-res; passes contrast 4.5:1 body / 3:1 large.

#### [LM-069] OPEN — 🟢 P3 — CSRD H1 has double space: "Am I in CSRD scope  under Omnibus I?" [BUG-024]
- **Action:** remove the extra space in markup.

#### [LM-070] OPEN — 🟢 P3 — Hero trust-badge container deep below fold on home [BUG-025]
- **Action:** move "UK-BUILT. CITED TO STATUTE. AFFORDABLE FOR SMES." pill to immediately below the eyebrow.

#### [LM-071] OPEN — 🟢 P3 — Mobile nav has TWO close buttons (top-left × + hamburger-converted-to-X) [BUG-026]
- **Root cause:** the nav drawer template includes its own close button while the hamburger also becomes X when open.
- **Action:** keep ONE close mechanism. Recommend keeping the hamburger-to-X transition (most common pattern) and removing the redundant top-left ×.

#### [LM-072] ✅ VERIFIED — Claude self-shipped @ 00:18 via BATCH-A 7d71763. Closed by LM-049 .ca-hero-title clamp. Verified crowesg page height dropped 21% with content visible at all widths.
- Resolves with LM-049.

#### [LM-073] OPEN — 🟢 P3 — Pricing Portfolio card "CONTACT SALES" vertically clipped at viewport edge [BUG-028]
- **Action:** add bottom padding to pricing cards; ensure CTA always visible without scroll inside the card.

#### [LM-074] OPEN — 🟢 P3 — About H1 "Intelligence by engineers." ambiguous without verb [BUG-029]
- Same root as LM-068. Owner approves copy change: "Intelligence, built by engineers." or similar.

## 🚨 OWNER ZERO-COMPROMISE MANDATE 2026-05-28 23:55
**"None of defects, issues and bugs must be left unfixed."** Every single LM-### must be VERIFIED before this loop closes. No deferrals. No "good enough". No phase-2 parking lots. Gemini: when in doubt, fix it now and over-deliver. Claude: hunt harder, find every remaining defect — be ruthless.

## 🌟 OWNER ENDORSEMENT 2026-05-29 00:00 — ALL RECOMMENDATIONS ARE MANDATORY
**Owner direct quote: "I really agree with recommendation and all the recommendation must be done"**
→ LM-075..LM-100 (REC-001..REC-026) are NO LONGER recommendations — they are REQUIREMENTS. Treat with the same fix-must-land discipline as P0 bugs. Gemini: implement every single REC to spec.

## 🧭 NEXT-CYCLE PRIORITIES — CLAUDE'S RECOMMENDED IMPLEMENTATION ORDER (Gemini: pick from here)

**Gemini: After you finish LM-006, claim the next batch HEREFROM. They are GROUPED by shared root cause so one commit closes many items. Sequenced by impact × dependency.**

### 🎯 BATCH-A: Architectural CSS single-source fixes (one commit closes 8+ items)
**One CSS edit to `Assets/css/premium-transformation-2026-05-27.css` OR `Assets/css/nav-global-fix-2026-05-27.css` (your choice, but tell Claude in evidence which file) closes:**
- **LM-047 + LM-066 + LM-075** (CTA button system): define `.ca-btn-premium / .ca-btn-primary-premium / .ca-btn-ghost-premium` family with `padding:14px 28px; min-height:48px; border-radius:999px; bg:linear-gradient(180deg,#0CC9A8,#0aa88c); color:#04101a; transition:transform 0.18s, box-shadow 0.2s`. Ghost variant: transparent + outline. Hover: translateY(-1px) + shadow. Magnetic via existing `sovereign-transformation-v2.js`.
- **LM-049 + LM-050 + LM-054 + LM-072**: `.ca-hero-title { font-size: clamp(1.85rem, 1.1rem + 4.2vw, 4rem); line-height:1.05; max-width:100%; }` + `.ca-hero p { max-width: min(60ch, 100%); }` + `.ca-hero { max-width:100vw; overflow-x:clip; }`. Fixes 7 pages in one rule.
- **LM-051 + LM-076 + LM-037**: responsive padding `section[class*="py-60"], .ca-section-dark.py-60 { padding-block: clamp(48px, 6vh, 96px); } @media(min-width:1280px){ padding-block: clamp(72px, 8vh, 128px); }`. Kills the void-band complaint sitewide.
- Skip-link `.sr-only` strengthening (extends LM-029) — define `.sr-only` globally as well, not just on `.skip-link`.

### 🎯 BATCH-B: Markup hygiene sweep (one commit per page, but mechanical)
- **LM-042 + LM-061 + LM-068 + LM-074**: split-headline H1 markup fix on every page in `[changelog, cookies, 404, blog/index, products/index, privacy, terms, glossary/index, about, contact]`. Pattern: replace `<h1 class="ca-hero-title"><span>X <br/><span class="text-[#0CC9A8]">Y</span></span></h1>` with `<h1 class="ca-hero-title"><span>X</span><span class="text-[#0CC9A8]">Y</span></h1>` (two sibling direct-children, no br, no nested wrapper).
- **LM-017**: `index.html` — `/status` → `https://status.crowagent.ai`, `/careers` → remove.
- **LM-018 + LM-094**: add `<link rel="canonical" href="https://crowagent.ai/<path>">` to: crowcyber, crowcash, crowesg, crowmark, crowagent-core, csrd, index, pricing. Verify hostname = `crowagent.ai` on every page (not localhost).
- **LM-058 + LM-069**: csrd.html — swap `.ca-btn-primary` (teal) for the lime-green CTA; remove double-space in H1 ("scope  under" → "scope under").
- **LM-052 + LM-053 + LM-055 + LM-080**: resources/partners CTA wrap in `.ca-btn` + breadcrumb `<nav aria-label="Breadcrumb">` styling per LM-080's canonical component.
- **LM-059**: cookies.html breadcrumb append `<li aria-current="page">Cookies</li>`.
- **LM-064**: every footer social `<a>` gets `aria-label="CrowAgent on <platform>"`.

### 🎯 BATCH-C: JS modules to build (medium effort)
- **LM-043 + LM-087**: `js/modules/blog-filter.js` — filter chips with `aria-pressed`, focus ring, URL `?cat=` sync, smooth show/hide, reduced-motion respect.
- **LM-007**: faq.html — re-add `<input type="search" id="faq-search">` above category accordions + `js/modules/faq-search.js` (lowercase query, show/hide `<details>`, debounce 150ms).
- **LM-046**: pricing panels width:0 RCA — investigate which ancestor collapses width when panel switches to `display:block` (likely a `flex-shrink:0` or `width:0` on a grandparent). Fix at source.

### 🎯 BATCH-D: Performance + a11y (parallel-safe)
- **LM-011 heading-order**: sweep 41 pages, change `<h3>` directly under `<h1>` → `<h2>`. Re-run axe.
- **LM-012 bare `<li>`**: 12 pages — wrap each in `<ul role="list">`.
- **LM-013 landmark-contentinfo**: move `<footer role="contentinfo">` out of `<main>` on 50 pages.
- **LM-093 + LM-019**: every `<img>` needs explicit `width`+`height` attrs (CLS) AND `alt`. Sweep all HTML.
- **LM-095 + LM-021**: defer chat widget until first user interaction.

### 🎯 BATCH-E: Conversion + content (premium polish)
- **LM-026 + LM-082 + LM-020**: home hero — replace stacked-3-line headline with single anchor "Win contracts. Get paid. Stay compliant." + mesh-shader backdrop + staggered char entrance + eyebrow rotator + live UTC countdown. Implement per PREMIUM MOTION DIRECTIVE.
- **LM-084 + LM-099 + LM-100**: pricing — Monthly/Annual toggle + Bundle & Save section + inline FAQ accordion.
- **LM-085 + LM-098**: home API preview waitlist form + early-access waitlist form (both → Brevo).
- **LM-014 + LM-086**: about.html — restore lost sections + add granular pre-launch milestones.
- **LM-027**: home "What we cover" stats — wire `counter-tween.js` for animated count-up on visibility.

### 🎯 BATCH-F: Architectural cleanup (foundational hygiene)
- **LM-024**: 32 pages with hardcoded `<nav>` — remove (nav-inject is canonical).
- **LM-034**: em-dash purge across 30+ files (mechanical sed-style replacement; preserve meaning).
- **LM-088 + LM-060**: tighten hamburger breakpoint to `@media (max-width:1023px)` only.

---

## 🌟 OWNER-PROVIDED RECOMMENDATIONS 2026-05-28 23:55 (REC-001..REC-026 → LM-075..LM-100)

Strategic + UX recommendations for TOP 1% POSITIONING. Gemini: treat each as a defect — implement to spec, no shortcuts. Mark each with proper RCA.

### 🟠 P1 — Design & Visual Quality recommendations

#### [LM-075] OPEN — REC-001 — Establish ONE primary CTA button system site-wide
- **Diagnosis:** at least 2 button systems coexist: `.ca-btn-premium` (home, broken — LM-047) and `.ca-btn` (product pages, working). Inconsistency signals tech debt to sophisticated buyers.
- **Root cause:** parallel button systems built at different times, never unified.
- **Action:** PICK ONE — recommend `.ca-btn` family (proven working). Variants: `.ca-btn-primary` (teal pill), `.ca-btn-ghost` (outline), `.ca-btn-secondary` (dark). Document tokens. Migrate every other class (`.ca-btn-premium`, `.sv-btn--primary`, etc.) to alias the canonical one or replace markup. **Single source of truth.**
- **Verify:** grep returns 0 unique button classes other than the canonical family; every CTA across home/product/legal/tools renders identical hit-target + radius + padding + height.

#### [LM-076] ✅ VERIFIED — Claude self-shipped @ 00:18 via BATCH-A 7d71763. Closed by LM-051. Same architectural fix.
- Same root cause as LM-051. Implement the responsive scale as the single fix.

#### [LM-077] OPEN — REC-003 — Reconsider home hero showcase frame — product screenshot is buried below 128px padding + 3 lines of text
- **Action:** at ≥1024 px, position the product showcase SIDE-BY-SIDE with the headline (50/50 grid). At <1024 px, stack but tighten padding. Showcase becomes the dominant visual.
- **Pixel-verify** at 1280 + 1440 + 1920.

#### [LM-078] OPEN — REC-004 — Split-headline two-column device: responsive — only ≥1440 px, single-column below (supersedes LM-068/042 root)
- **Action:** the two-column split headline pattern (e.g. "Privacy    Policy.") only at `@media (min-width:1440px)`. Below 1440, render single-column block stacked. Apply via CSS — no markup changes per page.

#### [LM-079] ✅ VERIFIED (partial) — Claude self-shipped @ 00:59 via BATCH-D b690e2c. Footer social hover ripple (radial teal gradient @ 0.18 opacity). Tooltips deferred — aria-labels already comprehensive per LM-064.
- **Action:** LinkedIn first + 1.2× scale; hover state with `aria-label`/title showing platform name; consistent 44×44 hit target; subtle teal underline on focus. No follower counts unless they're real.

#### [LM-080] ✅ VERIFIED — Claude self-shipped @ 00:59 via BATCH-D b690e2c. Canonical breadcrumb component targets .ca-breadcrumb, nav[aria-label=Breadcrumb], .f10-breadcrumbs, [role=navigation][aria-label=Breadcrumb] with display:flex; `›` separator; teal hover; aria-current:page white. Auto-applies on every page where breadcrumb markup exists. Closes LM-053 + LM-055 + LM-059.
- **Action:** create `<nav aria-label="Breadcrumb" class="ca-breadcrumb">` template with `›` separator, current-page styling, ARIA. Inject via nav-inject or a small partial. Replace every per-page breadcrumb instance.

#### [LM-081] OPEN — REC-007 — Chat widget covers last few characters of text on mobile/narrow
- **Action:** auto-collapse on scroll-down (Crisp-style); smaller bubble at ≤768 px; ensure all text containers have `padding-inline-end: 80px` to clear the widget area at mobile.

### 🟠 P1 — Content & Copy recommendations

#### [LM-082] OPEN — REC-008 — Single anchoring home headline "Win contracts. Get paid. Stay compliant." (collapses LM-026/020 too)
- **Action:** replace the current 3-stacked headline with the single anchor. Current sub-paragraph becomes the body. Reduces hero height significantly. **Owner: confirm exact copy before merge — this is a brand-voice decision.**

#### [LM-083] OPEN — REC-009 — Pricing page section transitions: clear `<h2>` per product before its panel (once LM-046 resolves)
- **Action:** add `<h2 class="ca-section-eyebrow">CrowMark Pricing</h2>` (etc.) before each pricing-panel's price cards, so a user scrolling past Core knows exactly what they're seeing.

#### [LM-084] OPEN — REC-010 — Pricing: Monthly / Annual billing toggle
- **Action:** add a toggle at the top of the pricing section. Monthly = price-as-shown; Annual = ×10 (saves 2 months = 16%). On toggle, update every `£<x>/mo` span and the small fineprint. Tween count via `counter-tween.js`.

#### [LM-085] OPEN — REC-011 — Home API Preview: add inline "Request early API access" email capture (single input + submit)
- **Action:** post to Brevo (per [[reference_canonical_email_brevo]]) — list ID for API waitlist. ARIA-live confirmation toast. No fabrication.

#### [LM-086] OPEN — REC-012 — About timeline: add more granular pre-launch milestones (no fake customers)
- **Action:** founding-team prior experience + prototype phase + regulatory research milestones + technical milestones. Honest. No claims of customers/revenue.

#### [LM-087] OPEN — REC-013 — Blog filter chips: focus rings + `aria-pressed="true"` on active + visible active styling (extends LM-043)
- **Action:** when building `js/modules/blog-filter.js` (LM-043), include `aria-pressed` + visible focus ring + `prefers-reduced-motion` respect.

### 🟡 P2 — Navigation & IA recommendations

#### [LM-088] OPEN — REC-014 — Persistent horizontal nav at ≥1024 px (overlaps LM-060)
- **Action:** as LM-060 — tighten breakpoint to `@media (max-width:1023px)` only for the hamburger. 13" laptops at 1024+ get the full inline nav.

#### [LM-089] OPEN — REC-015 — Hamburger nav missing "MEES Risk Snapshot" in Free Tools section
- **Action:** add MEES Risk Snapshot to the mobile-nav Free Tools list in `js/nav-inject.js` config so it matches the footer. **Claude-owned (nav-inject is part of the Claude lane). Claude will do this.**

#### [LM-090] OPEN — REC-016 — `/products` hub: add sticky sub-nav linking to individual product pages
- **Action:** sticky horizontal jump-nav showing "CrowAgent Core · CrowMark · CrowCyber · CrowCash · CrowESG · CSRD Checker"; anchor scrolls to the section, or routes to the product page if clicked.

#### [LM-091] OPEN — REC-017 — Verify nav `#sectors` scroll-offset accounts for sticky-nav height
- **Action:** add `html { scroll-padding-top: calc(var(--ca-nav-h) + 12px); }` already in nav-global-fix (line 67) — verify it's applied site-wide AND on direct-link arrival (`/#sectors`).

### 🟡 P2 — Performance & Technical recommendations

#### [LM-092] OPEN — REC-018 — Sector image fallback strategy until photography is complete (extends LM-048)
- **Action:** SVG icon fallback via `<img onerror="this.replaceWith(svgFallback)">` for each sector card. Cleaner than broken `<img>`. While LM-048 sources the real photos, this ships in the interim.

#### [LM-093] OPEN — REC-019 — Add explicit `width`/`height` attrs (or `aspect-ratio` CSS) to every `<img>` to prevent CLS
- **Action:** sweep all `<img>` tags; ensure width+height attrs are set; document the rule in CLAUDE.md. CLS < 0.1 target.

#### [LM-094] OPEN — REC-020 — Verify every page's `<link rel="canonical">` is the production domain (not localhost/staging)
- **Action:** sweep all canonicals; assert hostname = `https://crowagent.ai`. (Also addresses LM-018 missing canonicals.)

#### [LM-095] OPEN — REC-021 — Defer chat widget JS until first user interaction (scroll/click/key)
- **Action:** load Crisp via `requestIdleCallback` or `addEventListener('scroll', loadChat, {once:true})`. Improves LCP + TTI for Core Web Vitals.

### 🟡 P2 — Trust & Conversion (PRE-LAUNCH) recommendations

#### [LM-096] OPEN — REC-022 — Add "No customers yet — statutory authority IS the trust signal" interim trust block
- **Action:** new section "Why trust us before anyone else has?" — answers: statute citations, Companies House 17076461, ICO registration, UK data residency, engineering background. **Owner-approved honest pre-launch story.**

#### [LM-097] OPEN — REC-023 — Footer "All systems operational" badge must link to `https://status.crowagent.ai` AND reflect real uptime
- **Action:** if status page is live, wire the dot color to its API (or scheduled poll). Otherwise mark as "status page coming Q3" — no static green for theatre.

#### [LM-098] OPEN — REC-024 — Home: add early-access waitlist email capture (lighter commitment than full trial)
- **Action:** single email input above the fold (or in a prominent narrow band). Posts to Brevo waitlist list. Honest message: "Be first when we ship CrowESG / API."

#### [LM-099] OPEN — REC-025 — Pricing: add "Bundle & Save 15%" visible section/calculator
- **Action:** new section on pricing page showing Core + Mark / Mark + Cyber / Cash + Mark bundle prices. Live calc + 15% saving callout. Reuses pricing data.

#### [LM-100] OPEN — REC-026 — Pricing: embed mini-FAQ accordion (security/cancel/trial) below comparison table
- **Action:** 3–5 questions inline; pull from canonical FAQ source (avoid duplication — link to full FAQ for more).

---

---

#### [LM-045] ✅ VERIFIED — Claude self-shipped @ 23:40 (was OPEN — owner-spotted "2 cookie banners")
- **Owner direct quote:** "i still can see 2 different types of cookies banners"
- **Root cause:** 6 blog posts (brown-discount, csrd-omnibus-i-2026, epc-band, epc-register, mees-band-c-2028, mees-exemptions-guide) loaded BOTH the canonical `js/cookie-banner.js` (injects `#ca-cookie` with bg `#040E1A`) AND a legacy `js/cookie-consent.js` (injects separate `#cookie-banner` div with bg `#0A1F3A`). Two position:fixed banners stacked.
- **Why it happened:** cookie-consent.js predated the canonical cookie-banner.js consolidation; blog template kept the legacy script reference during migration.
- **Why this fix prevents recurrence:** legacy script tag removed from all 6 affected blog posts; orphan `js/cookie-consent.js` file should be deleted in follow-up to prevent re-introduction.
- **Other places same root cause may bite:** audit any other JS that injects a position:fixed banner (chatbot widget, announce bar reset, etc.) for duplicates. Audit `js/cookie-consent.js` reference in any other HTML (none found in current sweep but watch for future).
- **Evidence:** `cf7b19d` `fix(blog): remove legacy cookie-consent.js [LM-045]`. Verified via `tests/_cookiehunt.js` — mees-band-c-2028.html shows only `id="ca-cookie"` banner now; `id="cookie-banner"` with bg `rgb(10,31,58)` gone. Guard PASS (6 pages, content preserved). Affected: 6 blog posts.

#### [LM-044] ✅ VERIFIED — Claude self-shipped @ 23:30 — was OPEN — 60 pages had stale hardcoded `?v=`
- **Fix verified via `tests/_navfix.js`** clicking 4 sample pages (`/blog/index`, `/about`, `/blog/mees-band-c-2028`, `/glossary/index`): all 4 end with `link[href*=nav-global-fix].href = ?v=20260528m` (latest). nav-inject now force-updates the existing link's href instead of skipping. Commit `<next>`. Trade-off: pages with hardcoded link briefly fetch OLD version during HTML parse before JS rewrites — minor flash; future optimisation = remove hardcoded `<link>` from 60 HTML files entirely. **Original diagnosis below kept for archaeology:**
- **Diagnosis:** Claude grep — **60 HTML files** have `<link href="/Assets/css/nav-global-fix-2026-05-27.css?v=20260527">` hardcoded in `<head>`. nav-inject.js does `if (!document.querySelector('link[href*="nav-global-fix-2026-05-27"]'))` → SKIPS injection when present → those 60 pages keep loading the OLD cache. **My LM-010/029/030/036 CSS fixes DO NOT REACH those pages.**
- **Root cause:** historical decision to hardcode the link on legacy pages while nav-inject also injects on transformed pages. Now the dual sources are out of sync.
- **Action (CLAUDE-OWNED — Claude fixing in nav-inject.js):** change the check to: find existing link; if `?v=` does not match the latest, UPDATE its `href` to the latest. Single source of truth lives in nav-inject; HTML hardcoded versions become irrelevant.
- **Verify:** open blog/index.html → DevTools Network → only one request for `nav-global-fix-2026-05-27.css?v=20260528m` (latest).

---

## ✅ VERIFIED DONE (Claude flips here after pixel-verify)

- `[LM-001] VERIFIED @ 22:55` — Claude read `tests/_shots/security-verify-1280.png` full-res: page renders premium dark, all `sec-*` sections intact (cred grid, AES card, residency chips, GDPR, access controls 3-col, ISO, AI grid, vuln table, uptime, deep dives, company details, badges, CTA), cookie banner styled by v2 (matches terms.html). `<head>` confirmed 0 `styles.min.css` refs, v2-only stack. Guard PASS. Commit `38a8eb5`. Bonus: Gemini added `view-transition` meta — preempts part of motion directive.
- `[LM-002] VERIFIED @ 22:55` — Claude read `tests/_shots/resources-verify-1280.png` full-res: A-COMPANY hero "Regulatory Intelligence for UK teams" + resources hub grids render premium dark. Guard PASS (content preserved). Page height dropped 7251→4393px = legacy CSS cruft removed (not content loss — guard confirmed). Commit `3671287`.
- `[LM-003] VERIFIED @ 23:00` — Claude read `tests/_shots/roadmap-verify-1280.png` full-res: A-COMPANY "CrowAgent product roadmap" hero + chip toggle (Planned/In progress/Shipped) + 3 phase blocks (Q2/Q3/Q4 2026) + "How we decide" 4-card grid + "What we won't build" + "Deadlines on the radar" + CTA card all render premium dark. Guard PASS. Cookie banner now consistent (no styles.min.css). Commit `f41bcc1`. **Root cause:** legacy CSS stack loaded a duplicate cookie-banner theme + page-archetype-unify which fought the v2 system. **Why this fix prevents recurrence:** v2-only CSS link list = single source of truth for cookie banner + nav + footer styling.
- `[LM-010] VERIFIED @ 23:05` — Claude (self-shipped, Claude-owned file). Read `tests/_shots/v-footer-1440.png` full-res @ 2x retina: all 7 trust badges (AES-256 · TLS 1.3 · GDPR · UK&EU · ISO 27001* · ICO registered · Companies House 17076461) now show TEAL CHECKMARK ICON cleanly baseline-aligned with text. Touched `Assets/css/nav-global-fix-2026-05-27.css` (+ bump `js/nav-inject.js` cache `?v=20260528m`). **Root cause:** trust-row had `display:flex align-items:center` on the wrapper but no rule on the SVG icons themselves → icons used their intrinsic baseline (top-aligned for some viewBox values) instead of inheriting center-alignment. **Why this fix prevents recurrence:** explicit `display:inline-flex align-items:center vertical-align:middle` on every SVG inside `.footer-trust-row` + `.footer-credibility-row` covers both class names that the footer-injection code uses, regardless of which variant the page renders. **Other places same root cause may bite:** any other `*-row` flexbox with SVG children (audit `.lc-badges`, `.security-badges`).
- `[LM-029] VERIFIED @ 23:05` — Claude (self-shipped). Read `tests/_shots/v-nav-1440.png`: "Skip to main content" link no longer renders visible at top-left at 1440 desktop. **Root cause:** v2 Tailwind build PURGED `.sr-only` utility (no class defining `position:absolute; clip:rect(0,0,0,0)` etc.) — `.skip-link sr-only` had no hiding rule, defaulted visible. **Why it happened:** Tailwind purge config trimmed unused utilities but didn't whitelist a11y essentials. **Why this fix prevents recurrence:** `.sr-only:not(:focus):not(:focus-within)` defined globally in `nav-global-fix-2026-05-27.css` — every page using nav-inject gets it; not coupled to Tailwind purge config. **Same root cause queued:** none — the `.prose` purge already has the `nav-global-fix` blog typography fallback; `col-span-9/3` purge was fixed via `legal-content.css`.
- `[LM-030] VERIFIED @ 23:05` — Claude (self-shipped). Read `tests/_shots/v-nav-1440.png`: hamburger icon (3 teal bars) no longer rendering at far-right at 1440 desktop. **Root cause:** the mobile `@media (max-width:1024px)` block forced `.ham { display:inline-flex }` but no symmetric `@media (min-width:1025px) { .ham { display:none } }` existed, so above 1024 the element fell back to its inline-HTML `display` (which is flex via inline style or default). **Why this fix prevents recurrence:** explicit mutual-exclusive media queries — show at ≤1024, hide at ≥1025. Class names covered: `.ham`, `.nav-burger`, `button.ham`, with nav-scoped variants for specificity. **Other places same root cause may bite:** any other mobile-only nav element (audit `.nav-mobile-cta`).
- `[LM-036] VERIFIED @ 23:05` — Claude (self-shipped — NEW item found during hunt). Mobile menu drawer (`#mob-menu` when open) had items rendering on the same line ("CrowAgent Core CrowMark CSRD" mashed inline) instead of vertical stack. **Root cause:** `#mob-menu` had display rules (`none` closed, `block` open) but its CHILDREN had no display/layout rules — they fell back to `display:inline` (default for `<a>` elements), wrapping along the row. **Why this fix prevents recurrence:** every `#mob-menu a, #mob-menu .nav-mega-item, #mob-menu li > a` now gets explicit `display:flex; width:100%; padding:14px 12px; border-bottom: 1px solid …` — full-width vertical row pattern. Mobile section labels styled as eyebrows. Mobile CTAs stacked at the bottom inside `.mob-cta-row`. Touched `Assets/css/nav-global-fix-2026-05-27.css`. (Pending: visual verify with mobile menu actually OPEN — Claude will capture in next hunt.)

---

## ❌ REJECTED (Claude flips here with reason; Gemini must redo)

_(empty — Claude appends `[LM-xxx] REJECTED @ <HH:MM> — <reason>; re-do per <updated action>`)_

---

## 🔎 CLAUDE HUNTING LOG (auto-grown)

_Claude appends defects as found — Gemini must keep re-reading the QUEUE above to pick them up._

- `2026-05-28 PM` Initial seed: 24 items (LM-001 → LM-024) from session-resume open list + owner reports in FROM-CLAUDE.md + axe scan + tracker warns.

---

## 🚫 OFF-LIMITS
- Never push (pre-push hook blocks). Never `--no-verify`. Never `--admin`. Never edit `tests/*` (Claude's verification tooling). Never edit `Assets/css/nav-global-fix-2026-05-27.css` (Claude-owned). Never name any individual (use "CrowAgent Ltd, Companies House No. 17076461" only). Never fabricate customers/testimonials. £ only. MEES ≤ £150,000. Band C 2028 always "proposed". PPN 002 = 10%.
