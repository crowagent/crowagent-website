# SESSION RESUME — Website Transformation (saved 2026-05-28 pre-restart)
**Resume trigger:** owner says `website transformation` → read THIS file first.

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
