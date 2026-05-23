# WP-WEB-AUDIT-001 — Session A · Deferred metrics (follow-up)

**Date:** 2026-05-23
**Branch:** `audit/wp-web-audit-001-readonly`
**URL audited:** `http://localhost:8092/` (local dev server, plain static)
**Tooling:** lighthouse 12.x (Chrome headless), Playwright (Chromium)

This file closes the two deferred items declared in §3.3 and §4.2 of `2026-05-WEB-AUDIT-001.md`.

---

## 1 · Lighthouse — mobile profile

**Form factor:** mobile · **CPU slowdown:** 4× · **Network:** simulated slow 4G (~1.6 Mbps down, RTT 150ms)
**Raw reports:**
- `audit/lighthouse-2026-05-A-mobile.report.json`
- `audit/lighthouse-2026-05-A-mobile.report.html`

### 1.1 Category scores

| Category | Score | Verdict |
|---|---:|---|
| Performance | **25** | **CRITICAL** — well below the 90+ target |
| Accessibility | **97** | Acceptable; two specific failures listed below |
| Best Practices | **100** | Clean |
| SEO | **100** | Clean |

### 1.2 Core Web Vitals + lab metrics

| Metric | Observed | Threshold (good) | Verdict |
|---|---:|---:|---|
| LCP (Largest Contentful Paint) | **17.6 s** | ≤ 2.5 s | **CRITICAL** |
| FCP (First Contentful Paint) | **10.4 s** | ≤ 1.8 s | **CRITICAL** |
| CLS (Cumulative Layout Shift) | **0** | ≤ 0.1 | PASS |
| TBT (Total Blocking Time) | **13,190 ms** | ≤ 200 ms | **CRITICAL** |
| Speed Index | **13.0 s** | ≤ 3.4 s | **CRITICAL** |
| TTI (Time to Interactive) | **29.3 s** | ≤ 3.8 s | **CRITICAL** |
| INP (Interaction to Next Paint) | n/a in lab | — | INP is a field metric; Lighthouse cannot synthesise it. Capture via PostHog real-user monitoring once site is live. |

### 1.3 What the perf score tells us

The 25 mobile Performance score is dominated by **client-side JavaScript execution time** (TBT 13.19s under 4× CPU throttling means ~3.3s of main-thread blocking on a mid-range mobile in the wild) and a heavy LCP element (likely the WebGL/canvas night-Earth hero combined with web-font swap-in delaying the H1 paint). CLS being 0 is genuinely good — the layout doesn't jump.

These numbers do **not** contradict §3 of the audit MD; they sharpen it. The "Session B Phase 0 console-strip + audit/ cleanup" recommendations are not enough on their own — Session B should add a fifth Phase-0 action:

> **Phase 0 add (perf)**: lazy-load the hero WebGL bundle behind a static poster image with `IntersectionObserver` activation, defer non-critical `scripts.js` modules behind `requestIdleCallback`, and audit `styles.css` (113k words) for unused-rule prune. Target: mobile LCP ≤ 4 s, TBT ≤ 1 s, Performance ≥ 70 before Session B feature work begins.

### 1.4 Accessibility — two specific failures

Score 97/100. Two failing audits:

1. **`color-contrast`** — at least one element pair has insufficient contrast ratio against WCAG AA. Most likely candidates given the dark palette: muted body copy on `--obsidian` background where `--steel` is used instead of `--cloud`. Action: Session B Phase 0 — run axe-core, list the specific selectors, swap to a higher-contrast token.
2. **`label-content-name-mismatch`** — a form control's accessible name (computed from `aria-label` / `for=`) differs from its visible text label. Likely on the email signup or chatbot. Action: align the visible text and the `aria-label` (or remove the `aria-label` so the visible text wins).

Neither blocks Session B strategically, but both must be fixed in Phase 0 to honour the "Apple/Stripe/Google grade" charter.

---

## 2 · Viewport screenshots — full page, root URL

All saved to `audit/screenshots/2026-05-A/`. Captured via Playwright (Chromium) against `http://localhost:8092/` with `reducedMotion: 'reduce'` on the 375 retry (to avoid the lazy-content screenshot timeout). `_index.json` in that folder lists the file inventory.

| Viewport | File | Size (bytes) |
|---|---|---:|
| 375 × 812 (mobile, 2×) | `audit/screenshots/2026-05-A/375-home.png` | 2,635,808 |
| 768 × 1024 (tablet, 1×) | `audit/screenshots/2026-05-A/768-home.png` | 1,875,466 |
| 1440 × 900 (desktop, 1×) | `audit/screenshots/2026-05-A/1440-home.png` | 3,312,614 |

### 2.1 What the screenshots show (visual confirmation of audit findings)

- **Hero H1 verified as drifted.** The 1440 screenshot shows `Win contracts. {rotator} your business. Get paid faster.` overlaid on the WebGL night-Earth canvas — exactly the strategic mismatch flagged in §1.1 of the audit MD.
- **Page is unusually tall.** The 1440 full-page capture is ~19,120 px tall. Inspection of the mid-page region reveals **large empty dark voids** between sections (visible in the gap between the rotator-block band and the "Three jobs. One platform." section, and again between the regulatory-traceability claim and the "Six rules-sets, one platform" pivot). This is layout debt — likely accumulated `margin-block` from each finishing-pass CSS layer (`page-fixes-sf22.css`, `consistency-sf41.css`, `ca-hero-finishing.css`). Session B's 13-section narrative will replace this, but Phase 0 should not patch the voids — leave them for the Session B rewrite.
- **5-product surface vs 6.** All three viewports show CrowESG cards alongside Cyber/Cash/Mark/CSRD/Core — visual proof of the §1.4 "product surface FAIL" finding.

### 2.2 What the screenshots do **not** show (limitations)

- Hover / focus / active states (Playwright captures static state).
- Carousel / rotator mid-cycle frames (captured at frame 0 with reduced-motion).
- Chatbot / cookie banner if dismissed by prior session storage; the 375 retry was clean state so the banner state on first paint is captured.
- Cross-browser variance (only Chromium). For the WebGL fallback story, Session B Phase 0 should re-shoot at 375 in WebKit to verify the Safari iOS fallback path.

---

## 3 · Consolidated update to §6 (Recommended Scope for Session B)

The four Phase-0 items in the original audit MD become **five**:

1. Reconcile the 120-file `local-checkpoint-2026-05-18` carry-over via a separate baseline PR
2. Tokenise the 6 HTML/JS hex literals + 1 `ca-hero-finishing.css` rgba
3. Strip / gate `console.log` in production paths
4. Clean `audit/` (move probes to `scripts/probes/`, archive prior trackers)
5. **(NEW — from §1.3 above)** Mobile perf rescue: lazy-load WebGL hero, defer non-critical JS, prune unused CSS. **Target gates before any new feature work:** LCP ≤ 4 s, TBT ≤ 1 s, Performance ≥ 70. Plus axe-core fixes for the two A11y violations in §1.4.

Risk to Session B if Phase-0 perf isn't done first: the new 13-section narrative will add bytes (WebGL mesh gradient, countdown JS, readiness-check tool). Adding mass before pruning mass guarantees the mobile Performance score stays sub-30 at launch.

---

## 4 · Sign-off gate (unchanged)

Awaiting:

> **APPROVED WP-WEB-AUDIT-001 SESSION A — PROCEED TO SESSION B**

The metrics above do not change the strategic findings. They tighten the Phase-0 scope by one item and surface two specific A11y fixes.
