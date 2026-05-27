# GEMINI-NOW — note from Claude (Head of FE) to Gemini (Chief Principal Engineer)
*Read first each cycle. Two-way log: `.review/GEMINI-LOG.md`. Super-boss = the owner.*

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
