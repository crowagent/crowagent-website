# SESSION RESUME — Website Transformation (saved 2026-05-28 pre-restart)
**Resume trigger:** owner says `website transformation` → read THIS file first, THEN the two trackers below.

---
# 🟢🟢🟢 MOST RECENT — 2026-05-31 LATE (HERO GRADIENT/CENTRING/CARDS/CAROUSEL — READ FIRST)

## ROUND 2026-05-31 (deep) — free-tools card + carousel parity + Turnstile:
- **FREE-TOOLS rotator was BROKEN** (desktop+mobile): all 3 headlines + 3 descriptions rendered STACKED (rotator hide rule only worked for `button.ca-rotator`, not h2/p). Fixed in nav-global-fix: `h2.ca-rotator/p.ca-rotator .ca-rotator__item` → absolute/opacity0/hidden; active → relative/visible. Gradient-title (`-webkit-text-fill-color:transparent`+bg-clip:text) made positioned rotator items INVISIBLE → forced `-webkit-text-fill-color:currentColor; background:none` on h2 rotator items. Mobile padding: `!p-20`(80px) is in `@layer utilities`; unlayered !important loses → override in `@layer base` (earlier layer wins for !important): `#free-tools .ca-card{padding:36px 20px}` ≤767. Now 1 headline+1 desc+1 input+1 CTA, synced/legible/compact.
- **ALL CAROUSELS = HERO EXACTLY** (owner repeated ~100×). Rebuilt carousel block on all 5 product pages (crowcyber/cash/mark/core/esg) to hero structure: `ca-hero-visual max-w-5xl mx-auto` wrapper (was `ca-container`), mac chrome + live indicator, `aspect-[16/10]` (was 16/9), dots+caption as glass overlay INSIDE viewport (was stacked below), shadow+slab base. CSS: full-bleed mobile breakout `.ca-container > [data-pcar].ca-hero-visual{width:100vw;margin-inline:calc(50%-50vw)}` escapes BOTH product-section(0+20) AND homepage #interface(24+20) padding. VERIFIED desktop 1022/628 + mobile 388/236, 16/10, caption-inside, 0 overflow — IDENTICAL across hero + "real product"(#interface) + all 5 products. div-balance OK on all 5.
- **CLOUDFLARE TURNSTILE contact form**: was invisible on localhost (prod sitekey domain-locked to crowagent.ai; `data-localhost-sitekey` test key never applied). Added `applyLocalhostKey()` in contact.html inline script → swaps to test key `1x0000...AA` on localhost before API auto-renders. VERIFIED: shows "✓ Success!" test widget locally. Server-side verify is at app.crowagent.ai backend.
- nav-global-fix cache `?v=20260531bv`. Ran full crawler + axe (this round) — results in tests/_OUT_audit.txt / _OUT_axe.txt.

## FINAL ROUND (2026-05-31 late night) — all open items closed:
- **GLOBE centred on the text block** (owner: "parallel to + behind Get paid/Stay compliant/description, not pushed down"): canvas full-hero, globe ON-AXIS + lens-shift (round), geometry radius 2.15 (reference size on the 1663px canvas), gFx=0.822 (left edge at a/n), **gFy=0.283** (centre = viewport ~604 = middle of [Get paid top 448 → desc bottom 760]). Lens-shift signs CORRECTED (elements[8]=1-2gFx → right, elements[9]=2gFy-1 → down; I'd had them inverted = globe on left). `hero-citadel.js?v=20260531y`.
- **CINEMATIC BG TO CAROUSEL (#3)**: #hero-canvas + glow now height:100% (full 1663px hero) → starfield+glow run to the carousel end. Globe stays round (on-axis+lens-shift) so the tall canvas no longer distorts it.
- **FOOTER ACCORDION (Apple/AWS-style)**: nav-inject `injectFooterAndExtras` adds tap-to-expand on each footer column heading (role=button, aria-expanded, chevron, resize-aware); CSS in nav-global-fix `@media max-width:767px`. Mobile collapses (verified h0→294, aria flips); desktop always open (272). Brand column never collapses.
- **MOBILE DASHBOARD ZOOM (#4)**: re-added, TIGHTLY scoped to `[data-pcar] .ca-showcase-frame .ca-viewport .pcar__slide img` (showcase dashboards only, NOT the .pcar__viewport carousels that broke before). `transform:scale(1.5) top-center` + overflow:hidden. Verified ALL 6 pages (home+5 product) mobile: dashboards legible, 0 overflow, nothing broken.
- **BASELINE CLEANUP (#2)**: deleted unlinked scratch `baseline-about.html` + `baseline-contact.html` (verified: not in sitemap/nav/any link).
- **#1 CTA**: kept brief-compliant `signup` on core/cash/mark dead CTAs; marketplace?highlight= slugs only exist for crowcyber/crowcash (partial) — left as-is, disclosed.
- nav-global-fix cache `?v=20260531bq`. a11y: production-clean (privacy/security gradient-title flags are axe false-positives; verified white).

## FULL BUG-BRIEF FIX + COMPREHENSIVE CRAWLER (2026-05-31 night):
Fixed the owner's 18-item bug brief (BUG-001..018) via 3 parallel agents + direct edits:
- **Pricing** (agent): annual toggle = monthly×12×0.9 shown as /mo "billed annually"; dead `href=#` CTAs → signup//contact; starter prices pre-filled; duplicate FAQ removed; ESG form source=pricing-esg; product pages synced. `pricing-billing-toggle.js?v=20260531b`.
- **Tool engines** (agent): all 6 `scrollIntoView` wrapped in double-rAF → no more black-screen-after-submit. Tool HTML cache `?v=20260531`.
- **Nav/a11y/tools/FAQ** (agent): hamburger aria-label flips Open/Close; skip-to-main-content injected site-wide via nav-inject; FAQ search filter + no-results; methodology links 200; "from £99/mo" confirmed. `faq-search.js?v=20260531a`.
- **index.html** (me): "2,028"→"2028" (removed data-counter-to); social `#`→X/LinkedIn/YouTube; demo input id demo-postcode→demo-tool-input (+ updated homepage-compliance-widget.js + d-batch-runtime.js); placeholder/action rotator update verified working; BUG-005 N/A (index uses injected nav).
- **HERO globe = WIDE-FOV + LENS SHIFT** (me): reverted telephoto. PerspectiveCamera fov75/z12 (cinematic depth + dense starfield restored), globe ON-AXIS (0,0,0) → perfectly ROUND with full depth; `applyLensShift()` offsets projectionMatrix.elements[8]/[9] (gFx=0.822, gFy=0.70 desktop) to position it right + slightly down, top at "Get paid.", left edge between a/n. Light above (0,6,5)=dark bottom. ambient 0.2, opacity 0.1, rotation = reference. `hero-citadel.js?v=20260531u`.
- **COMPREHENSIVE CRAWLER** (tests/_audit_full.js, 63 pages × 1440/390): 0 console-err, 0 page-err, 0 overflow, 0 broken-img, 0 missing-alt, 0 dead internal links (404). Found 9 real dead CTAs on crowagent-core/cash/mark (Get started/Contact sales href=#) → FIXED → signup//contact. Remaining `href=#` are blog share buttons (handled by share-system.js, intentional) + forms-without-action are JS-handled (contact inline JS, partners-form.js, tool engines, csrd-wizard) — NOT bugs.
- All LOCAL, nothing pushed. Cache/SW on owner's browser is the recurring "can't see changes" cause — clear SW + caches.

## GLOBE = TELEPHOTO PERSPECTIVE (2026-05-31 earlier, SUPERSEDED by wide-FOV+lens-shift above):
hero-citadel.js `?v=20260531s`. PerspectiveCamera **fov 40, z 25.3** (telephoto: same on-screen scale as reference fov75/z12 but the globe sits only ~21deg off-axis at the far-right position → stays ROUND instead of ellipse). radius 4, opacity 0.1, ambient 0.2, rotation = reference exact. Globe pos **x=9.4, y=-2.1** (top edge at "Get paid." middle = viewport 492; left edge between a/n of "compliant" ≈ x987) — verified with guide lines. PointLight moved ABOVE the globe `(wide?9:0, 6, 5)` so the bottom fades dark like the reference. Canvas reverted to 100vh (landscape, NOT full-hero — full-hero made it portrait→ellipse). Owner approved "narrow the lens, keep it round". DO NOT change other hero items.
## (older) GLOBE = ORTHOGRAPHIC (2026-05-31, superseded by telephoto above): the globe rendered as a vertical ELLIPSE because a PERSPECTIVE camera distorts an off-axis sphere (globe is far-right for centred text), worse on the tall full-hero canvas. FIX: switched hero-citadel.js to an OrthographicCamera (viewSize 18) → sphere is a perfect CIRCLE at any position/aspect. Globe radius 2.1, pos x=5.25 y=3.0 (top at "Get paid." mid, left edge at "n"). ResizeObserver added (canvas buffer re-syncs when #hero grows after carousel images load). `hero-citadel.js?v=20260531o`. Eyebrow gap reduced to clamp(88px,12vh,120px) (was too large).
## CAROUSEL ZOOM REVERTED: the mobile `transform:scale(1.7)` on `.pcar__/.ca-viewport` images broke non-hero carousels — REMOVED entirely (nav-global-fix `?v=20260531bm`). Carousels back to un-zoomed original. Product dashboards are small on mobile again; a better per-page legibility treatment is PENDING (confirm exact broken carousel with owner first — could not reproduce the breakage in headless captures; all 5 product + hero rendered legibly).

## GLOBE + CINEMATIC BG (2026-05-31 latest):
- Cinematic backdrop (canvas+glow) now `height:100%` of #hero (~1680px) so stars/globe/glow cover the FULL hero incl. carousel (was 100vh only — "covering half"). `#hero-canvas`+`#hero-space-glow` bottom:0;height:100%.
- Globe (hero-citadel.js, `?v=20260531k`): tuned for the 1680px canvas → `x=7.2, y=0.3` world; top aligns to "Get paid." middle, left edge to the "n" in "compliant" (verified with injected guide lines at y=582 / x=1010). Mobile `x=0, y=-1`.
- Globe **opacity 0.1 → 0.28** (was nearly invisible at the larger size; now a clear premium mesh).
- Eyebrow lowered: fold is now top-anchored `flex-direction:column; justify-content:flex-start; padding: clamp(150px,22vh,240px) 8vw 0` (was touching nav). All hero content centred.
- NOTE: globe alignment is tuned for 1440×900 (hero 1680); at very different viewports it drifts (static world coords). Reconfirm if owner uses a very different width.

## Real root-cause fixes this round (all verified by rendering + reading PNGs):
1. **HERO GRADIENT WAS STUCK (owner kept reporting "no purple" — was RIGHT).** background-position never moved (sampled "0% 0%" across 4.2s). ROOT CAUSE: the white-lines rule `#hero h1.cz-hero-title > span { background: none !important }` is a SHORTHAND that set `background-position:0% 0% !important` on ALL spans incl. the holo — and important-author beats CSS animations in the cascade → pinned. FIX: `> span:not(.cz-holo)`. Also use `background-image` longhand on .cz-holo (not `background` shorthand). Now scrolls white→teal→**purple**→white like reference (verified bgPos moves + PH-1 shows purple). `hero-citadel.js?v=20260531h`.
2. **HERO FULLY CENTRED** (owner: everything must be central; was left-positioned, 429px right gap). `cz-hero-fold{justify-content:center}`, `cz-hero-inner{margin:0 auto;text-align:center}`, title+desc `text-align:center`. Globe `citadel.position.x = 0` (centred behind content).
3. **HERO CTA "Start 14-day free trial" WAS INVISIBLE** = teal text on teal bg (global link rule). FIX: `@layer base #hero a.cz-btn-primary{color:#040E1A!important}`.
4. **PRODUCT CARDS "weird lines" (CrowCash/Cyber/Mark/Core) — REAL root cause finally found:** `Assets/css/premium-gloss-2026-05-31.css` applied `box-shadow: inset 0 1px 1px rgba(255,255,255,.10)` to `[class*="ca-card-"]` → over-matched EVERY inner card element (content/title/desc/tags) giving each a white top-line = segmented look. FIX: removed `[class*="ca-card-"]` from that selector (gloss `?v=20260531b`; nav-inject now UPDATES gloss version like nav-global-fix). Also disabled the gimmicky rotating rainbow `[data-premium-stroke]::before` conic border → clean Stripe border + teal hover.
5. **PRODUCT-PAGE CAROUSEL mobile**: active `.pcar__tab` button was a 12×24 teal PILL; reset to small dot (`@media max-width:767px` in nav-global-fix). Hid stretched `.pcar__ring`.
- nav-global-fix cache now `?v=20260531bj`.

## ⚠️ HONEST REMAINING for ultra-premium (NOT yet fixed — told owner):
- Product-page dashboard SCREENSHOTS are tiny/unreadable on mobile (desktop dashboards at ~360px). Needs mobile-optimised shots or zoom/crop. Design decision.
- Carousel browser-frame has empty space below dashboard on mobile; caption text faint.
- Full mobile-responsiveness audit of NON-carousel components (tools, tables, blog, glossary) still pending.
- Verify gloss/card fix across ALL pages (made nav-inject propagate, but spot-check needed).

---
# 🟢🟢 2026-05-31 EVENING (HERO REBUILT + CARDS; superseded by LATE block above)

## What was done (all in working tree; HEAD ~a434514, LOCAL-ONLY, NOT pushed)
1. **HERO PERMANENTLY REBUILT as an isolated `cz-*` component** (index.html hero section + inline `<style>`). ROOT CAUSE of all prior hero failures: the title used shared classes (`.ca-hero-title-premium`/`.ca-hero-content`/`.ca-hero-desc-premium`) targeted by 47 rules in nav-global-fix + 4 other CSS files AND char-split by sovereign-transformation-v2.js (the split dropped the full stops + spread letters + killed the gradient). Rebuild uses a private `cz-*` namespace none of those 6 files target. Now matches `concept-citadel-master-fusion-v2.html` EXACTLY + owner's centred-eyebrow spec. Verified 1440 + 390 (read PNGs C:/tmp/CMP-LIVE*.png).
   - **CSS cascade-layer gotcha (critical):** the global caps live in `@layer base` with `!important`. For `!important`, a LAYERED rule beats an UNLAYERED one regardless of specificity. So all `cz-*` overrides that fight a global MUST be declared INSIDE `@layer base` (then specificity decides: `#hero h1.cz-hero-title` (1,1,1) beats `#hero h1` (1,0,1)). Unlayered = silently loses → title stuck at 64px.
   - Neutralised global `.ca-hero` (flex-column+align-items:center+padding-block clamp 96–176px !important) via `@layer base { #hero.ca-hero { display:block!important; padding-block:0!important } }` — it was centring the fold horizontally (x=408) + pushing it down.
   - `data-no-split` kept on the `<h1>` (sovereign splitter honours it). Globe (hero-citadel.js): x=5, y=0 (reference exact; 100vh fold + canvas share vertical centre). Cache: `hero-citadel.js?v=20260531g`.
2. **STRIPE-STYLE CARD BOUNDARIES** (nav-global-fix ~line 1352, cache bumped `?v=20260531ba` in nav-inject.js). Cards were near-invisible at rest (dark-theme bg rgba(255,255,255,0.02) + faint border; white-on-white role/about cards). Added crisp 1px edge + soft depth shadow at rest for all `.ca-card:not(.ca-card-premium)`; dark hairline variant for `section[bg-white]`. Verified pricing + homepage role section + about Mission/Vision/Values.

## E2E SWEEP DONE (2026-05-31 eve): 65 pages × 390/768/1440 → **0 overflow, 0 console/page errors, 0 real broken images** (one transient Unsplash flag, URL is 200). Full axe WCAG2.1AA scan: started 79 nodes → fixed to ~11 residual (mostly axe FALSE-POSITIVES on gradient/clipped hero titles `#040e1a/#000212 r=1.06` — pixel-verified WHITE; + unlinked `baseline-*.html` scratch; + a couple stubborn terms `.lc-cta--primary span` white-on-teal + blog `.text-white/20` kickers). Real fixes in nav-global-fix a11y block (~line 1352): legal teal-on-light vars redefined to #066B56 on light scopes, TOC/coy/caption greys→.7, glossary card teal/desc, link-in-text underlines, pricing toggle label .4→.55. Cache `?v=20260531bf`.

## HERO ROUND 2 FIXES (2026-05-31 eve, owner-reported, all in index.html inline <style> + hero-citadel.js + nav-global-fix):
1. **"Start 14-day free trial" was INVISIBLE** = teal text on teal bg (a global layered link rule forced `<a>` teal). Fixed: `@layer base #hero a.cz-btn-primary { color:#040E1A !important }` (brand: teal bg + dark text).
2. **CTAs + 5 chips CENTRED** (owner spec): `#hero .cz-hero-btns/.cz-hero-chips { justify-content:center }`. (eyebrow already centred; title stays LEFT per "like reference" — confirm if owner wants title centred too.)
3. **GRADIENT no purple** (owner right!): holo span was `display:block` (896px box) but text ~625px left-aligned → gradient mapped to box, glyphs only got left white→teal, purple sat over empty space. Fixed: `.cz-holo { display:inline-block !important }` → shrink-wraps to text → full white→teal→purple→white like reference (GG-REF≈GG-LIVE at same phase).
4. **FOUC on mobile** = eyebrow-rotator.js stacks 4 items at DOMContentLoaded+100ms; no CSS pre-hid 2-4 → all 4 flashed. Fixed: pre-hide `[data-eyebrow-item]:not(:first-child){position:absolute;opacity:0}` in inline style.
5. **Homepage CrowCash/Cyber/Mark/Core cards "weird lines"** = my Stripe-border rule didn't exclude `[data-premium-stroke]`, slapping an opaque grey border over their animated conic-gradient stroke (border:1.5px transparent) → clash. Fixed: added `:not([data-premium-stroke])` exclusion; they keep animated stroke + get only depth shadow.
6. **Mobile carousel white caption capsule too large** = the desktop full-width white bar (`.ca-glass-premium:has(.pcar__caption){bg:white}` ~line166) dominated the small mobile dashboard. Fixed `@media(max-width:767px)`: compact auto-width DARK glass pill `rgba(8,20,36,0.94)` + light text + dropped Sample-Data badge. **NOTE: headless swiftshader renders this pill white in screenshots (backdrop-filter over WebGL artifact) but COMPUTED DOM is confirmed dark glass 3× — real browser renders correctly. Verify on owner's real device.**
- All cz-* hero changes are in the ISOLATED namespace (round-1 rebuild) so safe from the 6 global files. Verified desktop 1440 + mobile 390: 0 overflow, 0 console errors.

---
# 🟢 2026-05-31 (earlier — hero caching diagnosis; superseded by EVENING block above)

## One-line status
Homepage **hero rebuilt to EXACTLY match `concept-citadel-master-fusion-v2.html`** (left layout, reference title size, Three.js wireframe globe, holographic "Stay compliant."). Code + clean-browser render are verified correct. **Owner still could not see it — diagnosed as a stale service worker + cached old JS on the owner's machine (NOT a code bug). Owner frustrated; this caching friction is the #1 thing to resolve on resume.**

## Git state (LOCAL-ONLY — nothing pushed)
- Branch `transformation/global-sovereign-refinement`, **HEAD `dd637614`**, **10 commits ahead of origin**.
- Push gate: needs exact phrase **`APPROVED FOR PUSH — transformation/global-sovereign-refinement`**. Commit author MUST be `crowagent.platform@gmail.com`.
- Uncommitted: only `.review/LAST-GUARD.txt` + `.review/TRACKER.md` (auto guard logs — ignore). Untracked `concept-*.html`, `sample-*.html`, `ULTRA-PREMIUM-*.png`, `audit-*.png` are **Gemini's — NEVER commit them**.
- Server (restart after reboot): `npx http-server . -p 8092 -c-1 --cors`. Verify: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8092/index.html` = 200.

## What was done this session (all COMMITTED)
1. **Hero layout = reference exact** (inline `<style>` in `index.html`, hero section starts ~line 65): LEFT-aligned, `#hero .ca-hero-inner { max-width:none !important; padding: 0 8vw }`, text in `56rem` box, eyebrow LEFT; **centred only `@media (max-width:1150px)`**.
2. **Title** `clamp(3.5rem, 8vw, 6rem)` at ALL widths (removed the old mobile override). Declared inside `@layer base` with `#hero` specificity to beat nav-global-fix's `@layer base { .ca-hero-title-premium: 4rem !important }` cap.
3. **Globe** (`js/modules/hero-citadel.js`): Icosahedron(4,15), opacity **0.1**, shininess **50**, `PointLight(0x0CC9A8, 2, 50)`, **1000** particles, ambient **0.2**, camera.z=12, breakpoint **1150**, **x=7** (nudged from reference 5 so it clears the end of "Stay compliant."), y=0 desktop / **y=-3** mobile.
4. **Holo gradient "Stay compliant."** (`#fff → var(--teal) → #A78BFA → #fff`, `background-size:200%`, `animation: ca-holo-text 5s infinite linear !important`).
   - **ROOT CAUSE the gradient vanished:** `js/modules/compiled/sovereign-transformation-v2.js` → `setupKineticTypography()` split the title into `.char` spans → broke parent `-webkit-background-clip:text`. **Fix: added the `[data-no-split]` guard it was missing** (hero-staggered-entrance.js already had it). The `<h1>` carries `data-no-split`.
   - **Competing rule:** `.ca-liquid-text` (nav-global-fix-2026-05-27.css ~line 1788) sets its OWN teal→white→teal gradient + `caLiquidShimmer 6s ease-in-out` ping-pong. My `!important` background+animation beat it. (The span has classes `holo-mask ca-liquid-text`.)
5. **Cache versions bumped (index.html only):** `hero-citadel.js?v=20260531d`, `sovereign-transformation-v2.js?v=20260531c`.
6. **service-worker.js = RESET/self-heal worker** (APP_VERSION 52): on activate deletes ALL caches + `clients.claim()`, and has NO fetch handler (network-only passthrough). Reason: a previously-registered cache-first SW was serving stale assets immune to hard-refresh.

## VERIFICATION done (do not re-trust — was pixel-verified)
- Rendered live at 1440 + 390 via Playwright (swiftshader), read the PNGs (`C:\tmp\MINE3-1440.png`, `MINE2-390.png`). Matches reference: left title, white lines 1-2, gradient line 3, bright globe right (desktop) / below (mobile).
- DOM diagnostic on `.holo-mask`: `animation-name: ca-holo-text`, `5s`, `linear`, `background-size: 200%`, **chars: 0** (no split), `background-clip: text`, fill transparent. **Gradient + animation are correct in code.**

## ⚠️ OUTSTANDING / DO FIRST ON RESUME
1. **The caching friction (TOP PRIORITY).** Owner kept seeing "nothing changed" / no gradient after hard-refresh. Cause = stale SW + old cached `sovereign-transformation-v2.js` on owner's browser. Owner-side fix given (run in F12 console on localhost:8092, or Incognito):
   `navigator.serviceWorker?.getRegistrations().then(r=>r.forEach(x=>x.unregister()));caches.keys().then(k=>k.forEach(c=>caches.delete(c)));setTimeout(()=>location.reload(),400)`
   **On resume: ask whether owner ran this / tried Incognito and now sees the gradient + globe. If YES → hero is DONE. If STILL not after clearing cache+SW → there is a genuine browser-specific bug to hunt (code + clean-chromium render are confirmed correct, so look at: real-browser @layer support, font load, or a Gemini auto-commit that reverted my files — re-check HEAD vs my commits).**
2. **Possible Gemini-loop interference:** a background auto-commit/Gemini process may edit the same files. On resume, confirm `index.html` hero `<style>` + `hero-citadel.js` (x=7, opacity 0.1) + the `data-no-split` guard in `sovereign-transformation-v2.js` still match the above — they may have been overwritten.
3. **Strategic advice on Gemini's 5 samples = DELIVERED** (ship: holographic-pricing + magnetic-cards; one-page: storytelling-beam; gated: kinetic-glossary; reject: product-morph; all need CSP port off `cdn.tailwindcss.com`/inline + copy scrub). **Correction:** I flagged "Danzell" as a hallucination in the samples, but the LIVE site uses "Danzell" 10× deliberately as the Cyber Essentials v3.3 question-set codename — **do NOT remove "Danzell" from the site.**

## Constraints (unchanged)
No push w/o the exact approval phrase; author `crowagent.platform@gmail.com`; £ only, UK spelling, no em-dashes; no individual names (only "CrowAgent Ltd, Companies House No. 17076461"); no fabricated customers; bump cache `?v` on every CSS/JS edit; pixel-verify (Read PNGs), never trust agent reports; use `@layer base` for `!important` overrides; reference spec = `concept-citadel-master-fusion-v2.html`.

---
# ⚪ 2026-05-30 (superseded by the 2026-05-31 block above)

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
