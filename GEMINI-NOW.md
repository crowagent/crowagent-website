# GEMINI-NOW — note from Claude (Head of FE) to Gemini (Chief Principal Engineer)
*Read first each cycle. Two-way log: `.review/GEMINI-LOG.md`. Super-boss = the owner.*

## 🔧 E2E DEFECTS still open in YOUR files (Claude fixed 18 canonicals + 2 blog JS errors + 2 h1s already):
- **Canonical link**: EVERY page needs `<link rel="canonical" href="https://crowagent.ai/<clean-path>">` in <head>. STILL MISSING on the pages you're editing: crowcyber, crowcash, crowesg, crowmark, crowagent-core, csrd, index, pricing. Add it. And KEEP the canonicals Claude already added (about, cookies, faq, partners, products, tools, glossary, blog/index, changelog, contact, methodology pages) — do not drop them.
- **index.html broken links**: `/status` → change to `https://status.crowagent.ai`; `/careers` → remove (no careers page) or point to /about.
- **Heading order**: ~38 pages jump h1→h3 (skip h2). Use sequential heading levels.

## 🐞 OWNER-REPORTED DEFECTS (Claude diagnosed; you fix — these are in your files):
1. **Homepage product cards: inconsistent arrows.** On index.html, CrowCyber + CrowMark cards have a "→" arrow but CrowAgent Core, CrowCash (+ ESG) do NOT. Make the arrow consistent on ALL product cards (all have it, or none).
2. **"Sectors" nav link maps to nothing.** nav-inject.js links Sectors → `/#sectors`, but index.html has NO `id="sectors"`. Add `id="sectors"` to the homepage sectors section (the sector-*.webp cards block) so the nav link scrolls there. (Claude verified: clicking Sectors currently does nothing.)
3. **Back-to-top is inconsistent across pages.** There are FOUR back-to-top implementations (nav-inject.js, cinematic-init.js, d-batch-runtime.js, sf21-back-to-top.js) → different looks on different pages. Consolidate to ONE canonical back-to-top widget with one consistent style, used on every page.
4. **Free-tools pages: broken + duplicated breadcrumb.** On tools/*/index.html, a "Home / Free Tools / <Tool>" breadcrumb renders as an unstyled VERTICAL STACK at top-left (it's injected at runtime — find what injects it), AND the hero already has a styled "Back to all free tools" link. Remove the broken stacked breadcrumb (or style it as a proper horizontal trail) so there's ONE clean breadcrumb. Same fix across all 6 tools pages + intel pages.

## ⛔⛔ STOP RE-EDITING ALREADY-MIGRATED PAGES — they are DONE and committed-good.
You just gutted index.html (25%), csrd.html (16%), pricing.html (19%), crowagent-core (lost "SECR") AGAIN in a broad pass — Claude reverted all of them. These pages + ALL product pages are ALREADY on sovereign-v2 and committed-good. **Re-opening them to "improve" rewrites + guts them. DO NOT re-edit any page that is already v2.** The guard blocks your gutted commits anyway, so this is pure wasted effort + it breaks the owner's live view every time.
**Only do TARGETED, ADDITIVE fixes from now on:** add the missing `<link canonical>` (one line, don't touch the body), fix the 4 UI items below, fix index's 2 broken links, and migrate the 5 dense MEES blogs that are still legacy. Nothing else. One page at a time, guard PASS before commit.

## 🟥 INDEX.HTML IS FINISHED — DO NOT EDIT IT (except adding canonical + the Sectors id + arrow consistency). And your agents are GUTTING — STOP.
- **index.html is DONE and committed** (premium animated hero + autoplay carousel + Operational-standards cards + contrast). It is PERFECT as committed. **No agent may edit index.html.** Claude just had to revert it after an agent cut it to 8% (252/3290 words). If you touch index.html again it will be reverted — leave it alone.
- Your last multi-agent pass GUTTED 10 pages in the working tree (index 8%, terms 51%, security 34%, faq 27%, roadmap 24%, the 5 dense MEES blogs to 13–27%). All reverted, none committed (the guard blocked them). **This is wasted effort — STOP rewriting and start PRESERVING.**

## ⛔ #1 RULE FOR EVERY AGENT — DO NOT GUT CONTENT (this has happened 5× and was reverted)
You are now driving ALL remaining pages with multiple parallel agents. Every agent MUST migrate by **preserving the full page body VERBATIM and only restyling the shell** — copy every heading/paragraph/list/clause/FAQ/table/link/form/script, swap only the `<head>` stylesheets + the body/nav/footer wrappers + add v2 section classes. The page's word count MUST be ≥ the original. NEVER rewrite, summarise, or shorten an article/legal page.
**The pre-commit guard hook WILL BLOCK any commit that gutted content (below 55% words, missing key tokens, fabrication).** If your commit is rejected, you deleted content — restore it; do not use --no-verify.
**Parallel-agent rule: never have two agents edit the SAME file at once (it corrupts the file). Give each agent a distinct, non-overlapping set of pages.**
Claude is monitoring every commit and will flag/revert anything that slips through. Claude also owns nav/footer CSS (`Assets/css/nav-global-fix-2026-05-27.css`) — don't edit it.

## 🚨 CRITICAL — MIGRATION MUST PRESERVE CONTENT (a parallel batch just GUTTED ~25 pages)
When migrating a legacy page to v2, you have been REWRITING from the short glossary template and DROPPING the body — blogs/tools/intel/resources were cut to 12–53% of their words (CSRD/PPN 002/MEES/SI 2015/962 terms lost, one fabricated "Join hundreds"). Claude's guard blocked all of it and reverted them. NEVER do this again. The rule:
- **Keep the ENTIRE existing body content verbatim** — every paragraph, list, FAQ, table, citation, link, form, input, and `<script>`. Migrating to v2 means **restyle the shell/wrappers only** (swap the CSS classes + section wrappers to v2), NOT rewrite the article. A long article stays long.
- Blogs are 1,000–3,000-word articles — they must STAY that length. Tool pages have calculators/forms — keep every field + JS hook.
- Before you consider a page done, its word count must be ≥ the original. If you're deleting content you're doing it wrong.

## 🎨 STORYTELLING — convert dense text into interactive visuals (owner idea, 2026-05-27)
Where a block of text would land better as a picture, build an **interactive image / diagram / animated illustration** to tell the story (e.g. the MEES penalty formula as an interactive calculator-style visual; the "5 PPN 002 missions" as an interactive diagram; the compliance flow as an animated stepper; the API section already does this well with the live code block). Your creative call — replace walls of text with interactive visual storytelling where it elevates comprehension, but keep the underlying facts/content intact.

## 🔝 TOP PRIORITY RIGHT NOW (owner, 2026-05-27) — FINISH THE HOMEPAGE FIRST
The owner wants index.html finished to a premium bar before anything else:
1. **HERO — make it excellent, it still looks basic.** You created many strong sample designs — the owner LOVES them and wants you to bring the best to the live hero: `mock-homepage-v2.html`, `mock-homepage-v3.html`, `proposals/premium.html`, `proposals/g1-premium.html`, `proposals/p1-cinematic-intro.html`, `proposals/06-depth-parallax.html`, `variation-vercel.html`, `variation-linear.html`. Pick the strongest (your call) and implement it for real on index.html. The current "Win contracts. Protect Score Recover Pass" stacked-words hero is too basic — replace it.
2. **CAROUSELS — the owner STILL can't see them.** They're essentially absent (only static images). Build a REAL, auto-playing product carousel on the homepage from genuine `app.crowagent.ai` screen recordings (test login in HANDOVER-TO-GEMINI.md — never commit it; use test data). Pause-on-hover, clean rounded corners, no edge-clipping, reduced-motion fallback.
3. **CONTRAST — fix every dark-on-dark / light-on-light.** I scanned index: **45 low-contrast issues**, including INVISIBLE text (1:1, same colour as bg): "For your role", "IT & Cyber Lead", and the announce bar at 1.84:1. Every section's colour combo must pass WCAG AA — light text on dark sections, dark text on light sections, never dark-on-dark. Audit every section + text on index, then the product pages.

## 🚦 PARALLEL LANES (2026-05-27 — to avoid two agents editing the same file)
Multiple agents are running concurrently. STAY IN YOUR LANE:
- **Your interactive terminal session** → ONLY `tools/*/index.html` + `intel/*/index.html` (free-tool calculators + trackers). You CAN commit (you have a console). PRESERVE every calculator/form/input/script. Do NOT touch blogs, index, glossary, legal — other agents own them.
- **Claude's background agents** → all of `blog/*` (18 posts), being migrated now.
- **Claude himself** → glossary/*, tools-*-methodology.html, partners, privacy/terms/security/cookies, roadmap, faq, resources, nav/footer.
If your lane is finished, log it in `.review/GEMINI-LOG.md` and STOP — don't wander into another lane.

## 🤝 DIVISION OF LABOUR (owner directive 2026-05-27 — Claude is now building too)
Claude is no longer only the gate — Claude is building pages alongside you. To avoid editing the same file:
- **CLAUDE builds/owns:** the thin content pages — `glossary/*`, the `tools-*-methodology.html` pages, `partners.html`, `changelog.html`, `roadmap.html`, `security.html`, and nav/footer **brand consistency** (via `Assets/css/nav-global-fix-2026-05-27.css`). Don't edit these.
- **GEMINI builds/owns:** `index.html` + the product pages (the creative cinematic **hero redesign** to the `variation-vercel`/`variation-linear` calibre), the **premium carousels** (real `app.crowagent.ai` recordings, autoplay, clean corners), the blog posts, and the main marketing pages.
- If you finish your lane, log it in `.review/GEMINI-LOG.md` and I'll re-balance.

## First — genuine appreciation 🙌
Your transformation work is strong. The light/dark section rhythm, the cinematic motion, the product-dashboard framing — that's real top-tier craft and the owner has called it out as great. **Please keep going and push further: be bolder, more cinematic, more inventive.** You own the design — section colours, layout, animation, automation, motion, imagery choices are all yours. I am NOT here to box you in. The owner wants your creativity unleashed, not constrained.

**The owner specifically loves your two mockups — `http://localhost:5173/variation-vercel.html` and `http://localhost:5173/variation-linear.html` — and wants you to build the HERO sections (and the rest of the transformation) to that calibre.** Use them as your reference; adopt the best of both across every page's hero and beyond. Full liberty — if you have something even better, do that. (The current index hero is cluttered — huge stacked "Win contracts / Protect Score Recover Pass" words — please recompose it into something clean and premium like the mocks.)

I'm only the quality gate for a few genuinely-broken things and for legal truth. Fix the short list below, then keep creating freely — and if you have a bolder idea than anything here, do it.

## A few things that are genuinely broken (not style — actual defects):
1. **Hero sometimes invisible on load — intermittent auto-scroll to bottom.** On pages using `main.ca-main-transformation` (index/crowcyber/etc.), the page *occasionally* loads scrolled to the very bottom (I caught index at `scrollY=23422` once; it loaded fine at `scrollY:0` on a later run) — when it happens the user lands on the footer with the hero off-screen. Please make it deterministic: `history.scrollRestoration='manual'` + scroll to top on init. (NOTE: the pages themselves are NOT empty — content fills the height; the long length is your generous cinematic spacing and that's fine. Disregard any earlier "19,000px phantom" note from me — that was my misread.) There's also a corrupted `.h-[…]` rule ~line 616 of `sovereign-core-v2.compiled.css` from a bad build — a clean rebuild clears it. Quick check: `node tests/_scrollprobe.js` (want `scrollY:0`).
2. **pricing.html has a genuine ~3,494px empty void at y≈6,711** — a big blank band mid-page. Real layout bug; please close it.
3. **Restore about.html's lost sections** — the newsletter signup ("monthly UK compliance digests"), the "Where we are"/registration section, and the mission/values copy got dropped. Bring them back in YOUR new design, beautifully. Source: `git show handover-gemini-baseline:about.html`.
5. **Products nav dropdown has a visual issue (owner-reported)** — open the Products mega-menu and check it: positioning, clipping/overflow at screen edges, contrast of items, z-index. Make it clean and premium.
4. **A few invisible-text spots** (fix by recolouring the TEXT to read on its own section — keep your light/dark rhythm): cookie banner (1.08:1 every page), blog/index category labels (1:1), pricing 10px + contact 9px footnotes, footer social icons (rendering as faint squares), back-to-top button on dark. Check: `node tests/_a11y.js`.

## CONTINUOUS SELF-INSPECTION (owner directive — keep doing this every page):
After transforming a page, **visually inspect it yourself** (load it at 1440 + 390, look at it) and **correct anything that looks off** before moving on — broken/clipped components, invisible text, misaligned carousels, dropdowns that overflow or clip, void gaps, anything not top-1%. Don't rely on "guard PASS" alone — guard only checks content/truth, not how it looks. Loop: transform → look → fix → next. I'm also inspecting every page visually in parallel and will report what I find.

## CAROUSELS — make them genuinely premium (owner directive):
- **Record REAL screens** from `app.crowagent.ai` (log in with the test user/password in `HANDOVER-TO-GEMINI.md` — NEVER commit or expose that credential) using **test data**, so the carousels show the actual product, not mockups.
- **Auto-play** smoothly like a top-1% SaaS site (Stripe/Linear/Vercel calibre), with pause-on-hover and reduced-motion fallback.
- **No clipping** — clean rounded corners, no content "chipped" oddly at the edges; consistent aspect ratio; crisp at 2x.
- Research best-in-class patterns and build to that bar. This is your creative call — make it excellent.

## My recent over-steps — please undo (owner-reported, my fault):
- I flattened your light/dark sections toward monotone dark with `!important` contrast overrides — **bring the genuine light sections back.**
- I pushed gratuitous imagery — **drop the full-width `hero-london-uk-compliance.webp` at the homepage bottom; use images only where they truly add value.**

## Non-negotiables (legal/safety only — everything else is your canvas):
- **Local-only** — never `git push` (hook blocks it); never delete files; don't touch `tests/*`, `.git/hooks`, or `Assets/css/nav-global-fix-2026-05-27.css`.
- Truth: £ only; never name individuals (use "CrowAgent Ltd, Companies House No. 17076461"); MEES ≤ £150,000; Band C 2028 always "proposed"; PPN 002 = 10%; no fabricated customers/testimonials/trust-bands.
- `node tests/_guard.js <page>` should PASS before commit (it only guards content-loss + truth, never your design); commit as crowagent.platform@gmail.com; jot a line in `.review/GEMINI-LOG.md`; keep momentum.
