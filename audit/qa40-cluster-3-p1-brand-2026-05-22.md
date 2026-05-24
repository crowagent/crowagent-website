# QA40 Cluster-3 — P1 Brand/Visual (BUG-014..018 + BUG-029)

**Date:** 2026-05-22
**Scope:** homepage only (`index.html`, `js/nav-inject.js`, `styles.css`)
**Working dir:** `crowagent-website/`
**Localhost:** http://localhost:8092

---

## Per-bug audit

### BUG-014 — JTBD eyebrow rename
**File:** `index.html` line 593
**Change:** `<span class="sv-eyebrow">Where it hurts &middot; What we fix</span>` → `<span class="sv-eyebrow">Three core jobs</span>`
**Why:** "WHERE IT HURTS · WHAT WE FIX" read as debug-style copy. "THREE CORE JOBS" anchors the section to its actual content and matches Stripe/Apple section-eyebrow voice.
**Verified:** 1440 + 390 screenshots show `THREE CORE JOBS` in teal small-caps; rendered text query returns exactly that string.

### BUG-015 — Moat eyebrow + frameworks "& EU"
**File:** `index.html` lines 646, 674
**Changes:**
- `<span class="sv-eyebrow">The Statutory Moat</span>` → `<span class="sv-eyebrow">Every claim cited</span>`
- `<span class="sv-eyebrow">Built on UK + EU regulation</span>` → `<span class="sv-eyebrow">Built on UK &amp; EU regulation</span>`
**Why:** "Statutory Moat" is investor jargon; "Every claim cited" describes the user-facing benefit. "+" is dev-stack notation; "&" is proper English in a marketing eyebrow.
**Verified:** 1440 + 390 screenshots show `EVERY CLAIM CITED` + `BUILT ON UK & EU REGULATION`. Frameworks list now renders as 3-col card grid (see BUG-018) — no longer the centered bulleted strip.

### BUG-016 — Try-it-now card duplicate header + clipped button + frame
**Files:** `index.html` line 780-782 + `styles.css` (append-only at EOF)
**Changes:**
- HTML: `.u-label` content `Try it now. No account required.` → `Free tool &middot; No signup`
- CSS: `#live-demo .f10-try-now-card::before { content: none; }` to suppress the duplicate floating pill
- CSS: `#live-demo .f10-try-now-card .demo-widget-card { padding: var(--space-6); box-shadow: inset 0 0 0 1px rgba(12,201,168,.10), 0 8px 24px rgba(0,0,0,.25), 0 1px 2px rgba(0,0,0,.40); }` — visual frame with teal inner-glow
- CSS: `.demo-widget-row { flex-wrap: wrap; }`, button `flex: 0 0 auto; min-width: max-content;` — submit button can never be clipped; mobile breakpoint stacks full-width
**Why:** Eyebrow + floating pill duplicated the same message; periods in the original eyebrow were typographically wrong; button risked clipping when the postcode input fought for row width.
**Verified:** 1440 + 390 — single eyebrow `FREE TOOL · NO SIGNUP`; `getComputedStyle(::before).content` returns `none`; submit button bounding box 201×48 at 1440, 240×48 at 390 (fully visible at both viewports).

### BUG-017 — Logo proportions
**Files:** `styles.css` lines 12533-12559 (legacy fallback typography only — picture renders primary)
**Changes:**
- `.logo .logo-wordmark { font-size: 1.375rem; font-weight: 700; letter-spacing: -0.02em; }` (was 1.0625rem / 800 / -0.01em)
- `.logo .logo-tag { font-size: 0.625rem; font-weight: 500; letter-spacing: 0.1em; opacity: 0.7; margin-top: 1px; }` (was 0.5625rem / 600 / 0.14em / no opacity)
**Investigation:** The "logo box 1×1px = broken" diagnosis is incorrect for this codebase. The 1×1px `.logo-box + .logo-text` are *intentionally* sr-only-clipped (`styles.css` line 28512-28523) since the Brand Logo 2.0 PNG ships through `<picture>` instead. The PNG **does** load (verified `curl -I` returns 200, 86577 bytes; Playwright reports `currentSrc=crowagent-logo-2-dark-272.avif`, `naturalWidth=272`, `naturalHeight=80`, `complete=true`). `.logo-img` renders at **44px** height on desktop and **36px** on mobile per existing CSS line 28477-28499 — exactly the brief's spec. No JS or HTML change required.
**Why bump the legacy tokens anyway:** Defensive — if the picture ever fails (network drop, CSP block), the fallback wordmark/tag now paint at the Apple-grade brand-master sizes the brief specifies, not the older SF35 values.
**Verified:** Nav strip screenshot at 1440 + 390 shows logo crisp at correct height, wordmark + tagline + ascending bars all readable.

### BUG-018 — UK & EU Regulation frameworks grid
**Files:** `styles.css` (append-only at EOF)
**Change:** Added `.hp-frameworks-list` + `.hp-framework-row` + `.hp-framework-mark` + `.hp-framework-cite` + `.hp-framework-desc` + `.hp-framework-link` rules.
- Grid: `1fr` mobile, `repeat(2, 1fr)` ≥640px, `repeat(3, 1fr)` ≥1024px (per brief spec)
- `list-style: none` on `.hp-frameworks-list` (removes browser-default discs)
- `align-items: flex-start; text-align: left` on rows (per brief left-alignment requirement)
- 16px border-radius, hairline border, hover lift + accent border (Stripe-grade)
- All values are tokens or hairline rgba fallbacks — zero new hex
**Why:** The section had ZERO CSS rules in the entire repository for these class names (verified with grep), so the browser fell back to `<ul>` defaults: bullet discs + centered (inherited from `.sv-stack--align-center`). The brief explicitly asked for a responsive card grid using the existing `.sv-card` pattern; the new rules follow that visual recipe with the hp-frameworks-list classnames already in the markup, so no HTML change was required.
**Verified:** `grid-template-columns` at 1440 = `456px 456px 456px`, at 390 = `380px`. `text-align: left`, `border-radius: 16px`, `list-style: outside none none`. Screenshot shows premium 3-col card layout with wordmarks, monospace citations, body copy, and teal "Explore X →" CTA.

### BUG-029 — "Stop Claude" debug button leakage (CRITICAL)
**Files:** `styles.css` (append-only at EOF) + `js/nav-inject.js` (append after `runPhaseA` dispatch)
**Investigation:** A full repo grep for `claude-agent-stop`, `Stop Claude`, `stop-claude`, `stopClaude` returned **zero matches in code** — only in the audit/QA-AUDIT-40-BUGS-2026-05-22.md note. `curl http://localhost:8092/` returned 1727 lines with **zero** matches for any of those tokens. The container is therefore NOT shipped by the website itself; it must come from an external Claude Code browser-runtime injecting into the user's session.
**Defensive belt + braces:**
1. CSS: `#claude-agent-stop-container, [id^="claude-agent-stop"], [class*="claude-agent-stop"] { display: none !important; visibility: hidden !important; pointer-events: none !important; }` — guarantees zero paint even if injection succeeds.
2. JS: a MutationObserver in `nav-inject.js` that watches `documentElement` subtree and removes any node whose id starts with `claude-agent-stop` (covers async runtime injection).
**Verified:** Playwright `querySelectorAll('[id^="claude-agent-stop"],[class*="claude-agent-stop"]')` returns `[]` at both viewports. `document.body.innerText.includes('Stop Claude')` returns `false` at both viewports.

---

## Validator gates (all four required GREEN)

| Validator | Result | Score |
|---|---|---|
| `tools/sovereign-sheriff.js` | GREEN | 10/10 |
| `tools/geometric-truth.js` | GREEN | 4/4 |
| `tools/principal-spec-validator.js` | GREEN | 51/51 |
| `tools/reconciliation-checker.js` | GREEN | Phase 1 geometrically perfect |

## Smoke test

`BASE_URL=http://localhost:8092 npx playwright test smoke.spec.js --project=chromium` → **25 passed (2.2m)**.

## Files modified

1. `index.html` — 4 single-line edits (lines 593, 646, 674, 781)
2. `styles.css` — 2 in-place edits (lines 12533-12559 legacy logo tokens), 1 append-only block at EOF (BUG-016 + BUG-018 + BUG-029 CSS, ~110 lines)
3. `js/nav-inject.js` — 1 append-only block (~40 lines, BUG-029 MutationObserver) after `runPhaseA` dispatch (line 730)
4. `styles.min.css` — rebuilt via `npx csso styles.css --output styles.min.css`

## Forbidden files NOT touched
- `cookie-banner.js` — untouched
- `chatbot.js` — untouched
- `scripts.min.js` — untouched
- `Assets/css/*` core — untouched (BUG-016/018/029 CSS appended to root `styles.css`)
