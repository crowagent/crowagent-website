# NEXT ACTION — Claude (Head of FE) is now DRIVING you in a loop. Do ONE task per invocation, commit, STOP. Claude re-invokes you immediately.
*Cycle 3 · 2026-05-27. Globals G1–G4 DONE (nav, contrast, glass, build) + footer + CrowMark + logo. Static guard 65/65. NOW: the real per-page transformation.*

## 🔴 P0 — DO THIS FIRST (see FROM-CLAUDE.md Message 3): BLANK HERO ON LOAD
Pages using `main.ca-main-transformation` (index, crowcyber, likely all) load **scrolled to the bottom** with a **~24,000px phantom height** (real content ~4,500px) → hero invisible on first paint. Also a corrupted `.h-[��G��]` rule in the compiled CSS. Fix the over-inflated cinematic section heights so document height ≈ content height, set `history.scrollRestoration='manual'` + scroll-to-top on init, rebuild clean to kill the mojibake class. **Verify: `node tests/_scrollprobe.js` must report `scrollY:0` + sane scrollHeight for index & crowcyber.** Log before/after numbers. Only after this is green, resume the march below.

## 🟠 P1 — VISIBILITY + AESTHETIC (after P0; see FROM-CLAUDE.md Message 4 — you have full creative liberty)
- **Remove the mesh/aurora bg** (`.atmos__aurora`, busy glow) — owner dislikes it. Replace with restrained premium treatment like your mock pages (`variation-vercel.html` / `variation-linear.html`).
- **Fix dark-on-dark sitewide:** cookie banner (1.08:1 every page), blog/index category labels (1:1 = invisible), pricing 10px + contact 9px footnotes. Target: `node tests/_a11y.js` shows every page ✅.
- **Back-to-top + floating controls:** adaptive contrast on any background (glass pill w/ visible border).
- **Icons:** audit sitewide; footer social icons render as faint squares — fix fill/contrast; no empty icon slots.
- **Glossy finish on every page**, homepage-grade.

## Pick the SINGLE highest item not yet done, do it fully, commit `fix()/feat()`, log to GEMINI-LOG.md, STOP:

1. **Per-page cinematic transformation — EVERY page, including ALL ~20 blog posts**, glossary/*, intel/*, tools/*, about/contact/partners/pricing/roadmap/faq/legal. Each must get: the premium type/space/glass system, the global 72px nav + footer, an orchestrated entrance + scroll motion, and lazy-loaded media. Blogs especially are currently plain — give them a proper article hero + readable measure + motion.
2. **Accessibility + contrast on every page** — run `node tests/_a11y.js <page>` and FIX every low-contrast text (WCAG AA 4.5:1), add alt to all images, fix heading order, focus states, ≥44px targets. (Known real issue: the cookie banner text is ~1.08:1 — fix it.)
3. **Imagery — minimal and purposeful (CORRECTED 2026-05-27).** Do NOT add images for the sake of it. Only use an image where it genuinely adds value; remove gratuitous embeds (e.g. the full-width `hero-london-uk-compliance.webp` at the homepage bottom). My earlier "add Unsplash imagery for human/sector trust" push was wrong — ignore it. Imagery is YOUR creative call. If any image is used: lazy-load, descriptive alt, and never caption/imply stock people as customers/staff/founders/testimonials.
4. **Page-load + motion polish** — preconnect, lazy-load, no CLS, 60fps, reduced-motion-safe.

## Order: finish the 7 main pages to this bar first (index → cyber → cash → mark → core → esg → csrd), then blogs (newest impact first), then glossary/intel/tools/legal.

## Rules
- One task per invocation; `node tests/_guard.js <page>` must PASS; self-test if you can; commit; log; STOP.
- LOCAL-ONLY (pre-push blocked). Don't touch tests/*, .git/hooks, or Assets/css/nav-global-fix-2026-05-27.css.
- Truth/regulatory always (no fabrication; £; no individuals; MEES ≤£150k; Band C "proposed"; PPN 002 10%).
- When EVERY page is fully transformed + images + passes guard & a11y and nothing remains, write the exact line `ALL-DONE-CONFIRMED` to GEMINI-LOG.md.
