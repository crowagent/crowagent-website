# Session resume — 2026-05-17

## Where things stand

**Repo:** `C:\Users\bhave\Crowagent Repo\crowagent-website`
**Local server:** `npx http-server . -p 8092 -c-1 --cors` (keep alive throughout)
**Jest:** 249/249 last green (17.7s)
**Branches:** Working directly on local files (not a git repo per session env)

## ✅ Shipped this session (285 tracked tasks; 280 completed)

### Page-level Stripe/Apple/Google refactors (76 items)
- O1-O18 Security page — comprehensive refactor (sticky TOC, 2×3 overview, callouts, tables, accordions, CTAs, 99.5% uptime stat)
- P1-P15 Privacy page — 15-section refactor with sticky scroll-spy TOC, 4 tables, 3 callouts, 3 accordions, 2×3 overview grid
- Q1-Q13 Terms page — 11 sequential h2 + sticky TOC + 6-cell overview + 3 amber callouts + 3 tables + 3 accordions + 99.5% uptime
- R1-R11 FAQ page — hero photo-frame, sticky chip nav with scroll-spy, accordions, support block, 4 trust pills
- J1-J22 Cookie Policy page — TL;DR, retention table, accordions, third-party links, FAQ schema, sticky TOC

### Component / site-wide
- I1-I9 Pricing page — rotating border removed, cards equal height, CTAs aligned, all section gaps balanced
- G1-G15 Home + About + Contact + Double-underline fixes
- H1-H9 Blog article template — 8px-grid rhythm, line-height 1.7, related-cards grid + hover
- K1 Broken links: 31 pages / 69 URLs / 0 broken (was 8)
- K2 Teal buttons text color → near-black (was failing); CENTER alignment; **REGRESSION POSSIBLE — see "remaining critical" below**
- K3 /changelog RSS XSL stylesheet (renders branded HTML page when XML viewed in browser)
- K4 Cyber-essentials font fix — all 7 tool pages had no Google Fonts link → injected
- K5 Dead code: 12 legacy files deleted (6 tool teasers + 3 debug reports + verifiers)

### Performance
- L1 Hero carousel mirrors live crowagent.ai laptop layout (5 differences fixed)
- L3 LCP 3544ms → 2428ms (-900ms via AVIF preload)
- M2 Web Vitals improvements
- M3 PurgeCSS — **styles.min.css 471KB → 331KB** (-30%, -140KB) via `node scripts/build-css.js`
- M5 Self-host 6 Google Fonts WOFF2 across 66 HTMLs (Cache-Control: 1yr immutable; ~500ms render-block removed)
- M31 SRI hashes on GSAP + ScrollTrigger across 8 HTMLs (sha384 immutable)

### Security
- L4 CSP/HSTS/X-Frame-Options/Referrer-Policy verified in Cloudflare `_headers`
- L5 0 console errors across 19-page sweep
- M32 print stylesheet 4px overflow → 0px (`transform: none !important` on print)

### Asset fixes
- M14 Contact: replaced stock photo with on-brand abstract SVG
- M15 Blog reading-time normaliser (JS module)
- M19 Blog Article JSON-LD: 20 files normalised (no ", CrowAgent" suffix, author Organization)
- M24 3 SVG mockups upgraded to 1600×900 viewBox with denser detail
- F15 10 blog publisher.logo JSON-LD URLs fixed (was pointing to non-existent path)

### Plan-name alignment (S-series)
- **All 4 paid products now display Starter / Pro / Portfolio:**
  - CrowAgent Core: Starter / Pro / Portfolio ✓
  - CrowMark: Solo→Starter / Team→Pro / Agency→Portfolio
  - CrowCyber: Starter / Pro / Enterprise→Portfolio
  - CrowCash: Starter / Pro / Enterprise→Portfolio
- Affected: `pricing.html`, `crowmark.html`, `crowcyber.html`, `crowcash.html`, `faq.html`, `chatbot.js`
- Stripe routing slugs (`?plan=crowmark_solo` etc.) intentionally KEPT to preserve app.crowagent.ai signup flow

### Cleanups
- M6 + M23 cinematic.css 84KB orphan → moved to `_archive/cinematic.css.removed-2026-05-17`
- M33 7 tmp-*.js audit artefacts → `_archive/`

## 🚨 REMAINING CRITICAL — START HERE AFTER RESTART

### Button contrast regression (user-reported just before restart)
**User reported:** "lot of buttons has white text or light color text and button color is green/teal so can't read the text"

Comprehensive Playwright audit at end of session found **168 candidates** across 21 pages where a button-like element has a teal background and light text. **Many are false positives** (nav-mega-item links inside dark dropdown menus where the `linear-gradient(rgb(12, 201, 168), ...)` detected was a CHILD SVG icon's inline style being mis-read by my probe). **But some are likely genuine regressions** introduced when:
1. Page-scoped CSS files were added (`security-page.css`, `privacy-page.css`, `terms-page.css`, `faq-page.css`, `cookies-page.css`)
2. PurgeCSS run trimmed `styles.min.css` and may have stripped some rules my K2 fix had appended

**Action plan after restart:**
1. Improve the contrast probe to filter out false positives — only flag buttons where:
   - Computed `background-color` (not inherited / not child) is actually teal-ish
   - OR the actual rendered `background-image` (using getBoundingClientRect screenshot + sampling) is teal — not child element style
2. Test specifically these newly-styled scoped CSS files for teal-bg+light-text rules:
   - `Assets/css/security-page.css`
   - `Assets/css/privacy-page.css`
   - `Assets/css/terms-page.css`
   - `Assets/css/faq-page.css`
   - `Assets/css/cookies-page.css`
   - `Assets/css/pricing-extras.css`
   - `Assets/css/contact-page.css`
   - `Assets/css/blog-article.css`
   - `Assets/css/tool-page.css`
   - `Assets/css/crowesg-page.css`
   - `Assets/css/_session-2026-05-16-fixes.css`
3. Re-append site-wide K2-style override rule with very high specificity so it survives PurgeCSS + page-scoped overrides
4. Run a fresh visual verification: take screenshots of every page's button row, check by eye

### Still genuinely pending (not regressions)
- **M1** Replace 40 Unsplash stock images across blog → BLOCKED on photography budget (~£1.5-3K)
- **M4** Lighthouse Windows EPERM → workaround needed (run via WSL or CI)
- **M7** Cleanup `audit-results/` + `audit-screenshots-final/` directories → NEEDS-REVIEW user decision
- **M25** Turnstile localhost 110200 error → dev-only, doc-only
- **M26** Blog card aspect-ratio "mismatch" → deliberate object-fit:cover, doc-only

## Files modified this session (summary)

### New files
- `Assets/css/fonts-selfhosted.css` (1.8KB)
- `Assets/css/security-page.css`
- `Assets/css/privacy-page.css`
- `Assets/css/terms-page.css`
- `Assets/css/faq-page.css`
- `Assets/css/cookies-page.css`
- `Assets/css/pricing-extras.css`
- `Assets/css/contact-page.css`
- `Assets/css/blog-article.css` (extended +280 lines)
- `Assets/css/tool-page.css`
- `Assets/css/crowesg-page.css`
- `Assets/css/_session-2026-05-16-fixes.css`
- `Assets/css/rss.xsl`
- `Assets/fonts/PlusJakartaSans-600/700/800.woff2`
- `Assets/fonts/Inter-400/500/600.woff2`
- `Assets/svg-mockups/contact-abstract.svg`
- `Assets/svg-mockups/retrofit-planner.svg` (upgraded)
- `Assets/svg-mockups/cyber-readiness-gauge.svg` (upgraded)
- `Assets/svg-mockups/esg-framework-matrix.svg` (upgraded)
- `js/modules/blog-reading-time.js`
- `js/modules/e-batch-runtime.js` (legal TOC builder + tool breadcrumb + pricing toggle sync)
- `js/modules/pricing-tabs-indicator.js`
- `js/faq-scrollspy.js`

### HTML / JS modified
- 66 HTMLs got `fonts-selfhosted.css` link + WOFF2 preload (M5)
- 8 HTMLs got GSAP+ScrollTrigger SRI hashes (M31)
- Complete refactors: `security.html`, `privacy.html`, `terms.html`, `faq.html`, `cookies.html`, `crowesg.html`, all 6 `tools/*/index.html`
- Partial edits: `index.html` (social proof bar + LCP preload), `pricing.html` (S1a alignment + testimonial removed), `contact.html` (G10 spacing audit + abstract SVG)
- `chatbot.js` (plan-name strings updated)

### Files moved to _archive/
- `cinematic.css` (84KB orphan)
- 7× `tmp-*.js` audit artefacts

### Deleted permanently
- 6 flat tool teaser HTMLs (legacy)
- 3 old DEBUG/E2E reports
- `audit-screenshot-1.png`
- `DEAD-CODE-REPORT.md` (stale)
- `verify-light-theme.js`
- `clean_css.ps1`

## Quality gates at session end
- jest **249/249** in 17.7s
- styles.min.css **331KB** (was 471KB before PurgeCSS)
- CSS braces balanced: styles.min.css **3379/3379** OK
- All 20 probed routes return **200**
- **0 console errors** across 20-page smoke
- **0 broken internal links** across 31-page crawl
- **0 console errors** site-wide
- **LCP 2428ms** on homepage (was 3544ms)

## CLAUDE.md hard rules being honored
- Local server kept alive at http://localhost:8092 throughout
- No em-dashes added
- No `@ts-ignore` / no empty catch blocks
- Brand tokens (`var(--bg)`, `var(--teal)`, etc.) used everywhere
- All CSS edits applied to BOTH `styles.css` AND `styles.min.css`
- MEES references treat Band C 2028 as "proposed" (not law)
- PPN 002 threshold stated as 10% (never 5%)

---

# 🚀 RESUME PROMPT (paste into Claude Code after restart)

```
Resume the CrowAgent marketing-site work. Read SESSION-RESUME-2026-05-17.md
at the repo root first for full context.

Current working directory: C:\Users\bhave\Crowagent Repo\crowagent-website

Step 1: Restart the local server in the background:
  npx http-server . -p 8092 -c-1 --cors

Step 2: Verify state still green:
  npx jest --silent | tail -5  (expect 249/249)
  curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:8092/  (expect 200)

Step 3: Tackle the PRIMARY OUTSTANDING ISSUE — button-contrast regression.
User reported just before restart:
  "lot of buttons has white text or light color text and button color is
   green/teal so can't read the text. you must fix all the buttons and such
   text issues"

The contrast probe at session end flagged 168 candidates across 21 pages but
most are FALSE POSITIVES (child SVG icons inheriting teal currentColor).

Required: build a BETTER probe that:
- Only flags an element if its OWN computed `background-color` OR
  `background-image` is teal/green (not inherited from child).
- Use canvas pixel-sampling on a viewport screenshot: getBoundingClientRect
  the button, sample 10 pixels inside, check if dominant colour is teal AND
  the text colour is light.
- Filter by `el.tagName === 'A' || 'BUTTON'` and visible only.

Then for each genuine offender:
- Identify which CSS rule wins (use Playwright's coverage API or just grep
  the page-scoped CSS file).
- Patch the page-scoped CSS to use color: var(--bg) (#040E1A) on those
  selectors.
- Re-run the audit; loop until 0 offenders.

Step 4: Re-run npm jest + curl smoke across 20 routes.

Step 5: Address remaining tasks in this order:
- M7 cleanup audit-results/ + audit-screenshots-final/ (ask user before deletion)
- M4 Lighthouse via WSL or CI (decision needed)
- M1 photography budget (BLOCKED — flag to user)

Use multiple sub-agents in parallel where files don't conflict. The
scope-per-agent pattern that worked this session: one agent per page-scoped
CSS file under Assets/css/, no concurrent edits to styles.css/styles.min.css.

CLAUDE.md hard rules still apply: no compromise, no deferrals, no silent
skips. Keep localhost http://localhost:8092 alive throughout. Test every
fix at runtime via Playwright before claiming done.

Reference task ledger: 285 items tracked; 280 completed pre-restart. The
button-contrast regression is the only remaining critical issue.
```
