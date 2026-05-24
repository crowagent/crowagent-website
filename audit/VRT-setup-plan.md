# VRT (Visual Regression Testing) Setup Plan

**Generated:** 2026-05-21
**Status:** PLAN — read-only investigation; nothing modified
**Author scope:** unblock defects gated on "needs VRT" (C-1 deeper, ARCH-1 Steps 1-7, ARCH-10 bundle)

---

## 0. Discovery — what already exists

The repo is **70% set up**. We do not need a new tool.

| Asset | Path | State |
|---|---|---|
| Playwright config with `visual-regression` project | `playwright.config.js:65-72` | LIVE |
| `expect.toHaveScreenshot` defaults (2% pixel-ratio, animations:disabled, caret:hide, 25s timeout) | `playwright.config.js:36-49` | LIVE |
| `snapshotPathTemplate` set to single canonical folder | `playwright.config.js:35` | LIVE |
| Baseline spec covering 12 archetype routes | `tests/visual-regression/sf46-p3f-baselines.spec.js` | LIVE |
| 12 baseline PNGs committed | `tests/visual-regression/snapshots/*.png` | LIVE |
| npm scripts `test:visual` and `test:visual:update` | `package.json` | LIVE |

**Gaps:** (a) only `1280×720` (default `use.viewport`); no multi-viewport sweep, (b) no cookie-banner gating, (c) no CI workflow runs it, (d) no font-load wait, (e) only 12 routes (98 HTML files exist).

**Decision:** extend the existing harness. No new dependency.

---

## 1. Tool recommendation: **`@playwright/test` built-in (keep)**

| Option | Verdict | Reason |
|---|---|---|
| **`@playwright/test` screenshot API** | **ADOPT** | Already installed, already configured, snapshots already on disk. Zero new spend (charter §RULE 0 / cost-discipline). Identical Chromium engine to the 4 internal validators. |
| Percy.io | Reject | Paid SaaS. Pre-launch, no customers, no budget. |
| Chromatic | Reject | Storybook-coupled; this is a static HTML site, no Storybook. |
| BackstopJS | Reject | Duplicates Playwright; CSS engine drift; orphaned maintainer cadence. |
| reg-suit | Reject | Adds S3/GCS storage requirement → spend + ops surface. |

Playwright's `toHaveScreenshot` already supports `maxDiffPixelRatio`, `animations:'disabled'`, `mask`, `clip`, and per-OS baselines (`-darwin.png`, `-linux.png`).

---

## 2. Test matrix

### 2a. Pages (10, archetype-representative — superset of the existing 12 trimmed for runtime budget)

| # | Route | Archetype | Why |
|---|---|---|---|
| 1 | `/index.html` | Homepage hero + carousel + persona-switcher | Highest-traffic; most complex layout |
| 2 | `/pricing.html` | Pricing tiers + comparison table | Stripe-pattern grid; persona toggle |
| 3 | `/crowagent-core.html` | Product page (Phase 1, LIVE) | Hero, in-page rail, related-card strip (`f10-related-card`) |
| 4 | `/crowcyber.html` | Product page (Phase 2, COMING SOON) | Different hero state |
| 5 | `/crowmark.html` | Product page (Phase 1, LIVE) | Carousel + benefits + pricing block |
| 6 | `/about.html` | Long-form content page | Typography density |
| 7 | `/security.html` | Legal/utility page | Breadcrumb + sidebar archetype |
| 8 | `/blog/index.html` | Blog index | Article grid |
| 9 | `/blog/mees-band-c-2028.html` | Blog post | Long article + related strip |
| 10 | `/tools/index.html` | Tools landing | Tool-card grid (free-tool archetype) |

### 2b. Viewports (4 — matches the existing 6×6 sweep audit pages, narrowed to the 4 most-decisive)

| Token | Width × Height | Purpose |
|---|---|---|
| `m320` | 320×640 | Smallest supported mobile (catches H1 truncation, RESP-01) |
| `m390` | 390×844 | Modern iPhone (most-common UA) |
| `t768` | 768×1024 | iPad portrait (carousel mode switch boundary) |
| `d1440` | 1440×900 | Desktop reference (matches founder review viewport) |

**Total snapshots: 10 routes × 4 viewports = 40 PNGs.** Runtime budget ≈ 3 min on CI.

### 2c. States (2)

- **`with-banner`** — cookie banner visible (first visit; default).
- **`without-banner`** — cookie consent set via `localStorage` pre-navigation (steady-state representative of returning users).

Light/dark mode is **not in matrix** — site is single-theme (dark obsidian + teal; `--bg` / `--teal` are fixed per `CLAUDE.md`).

**Total: 10 × 4 × 2 = 80 snapshots.** Still under the 5-min CI budget.

---

## 3. Test file structure

**Target path:** `tests/vrt/snapshots.spec.ts` (per founder's task spec). Co-locate baselines under `tests/visual-regression/snapshots/` so the existing `snapshotPathTemplate` (`playwright.config.js:35`) keeps working — no config churn.

```ts
// tests/vrt/snapshots.spec.ts
import { test, expect, devices } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:8092';

const ROUTES = [
  ['index',           '/index.html'],
  ['pricing',         '/pricing.html'],
  ['crowagent-core',  '/crowagent-core.html'],
  ['crowcyber',       '/crowcyber.html'],
  ['crowmark',        '/crowmark.html'],
  ['about',           '/about.html'],
  ['security',        '/security.html'],
  ['blog-index',      '/blog/index.html'],
  ['blog-post',       '/blog/mees-band-c-2028.html'],
  ['tools-index',     '/tools/index.html'],
] as const;

const VIEWPORTS = [
  { token: 'm320',  width: 320,  height: 640  },
  { token: 'm390',  width: 390,  height: 844  },
  { token: 't768',  width: 768,  height: 1024 },
  { token: 'd1440', width: 1440, height: 900  },
] as const;

const STATES = ['with-banner', 'without-banner'] as const;

test.describe('VRT — full matrix (10 × 4 × 2 = 80)', () => {
  for (const [name, route] of ROUTES) {
    for (const vp of VIEWPORTS) {
      for (const state of STATES) {
        test(`${name} @ ${vp.token} (${state})`, async ({ page, context }) => {
          await page.setViewportSize({ width: vp.width, height: vp.height });

          if (state === 'without-banner') {
            await context.addInitScript(() => {
              localStorage.setItem('ca_cookie_consent_v2', JSON.stringify({
                accepted: true, ts: Date.now(),
              }));
            });
          }

          await page.goto(BASE + route, { waitUntil: 'networkidle' });
          await page.evaluate(() => (document as any).fonts?.ready);  // wait for self-hosted fonts
          await page.waitForTimeout(500);                              // settle motion + countdown widget

          // Mask volatile widgets so they don't trigger false diffs.
          const masks = [
            page.locator('#countdown-widget'),     // updates every second
            page.locator('[data-live-clock]'),     // any live timestamp surface
            page.locator('#chatbot-bubble'),       // chatbot iframe (separate concern)
          ];

          await expect(page).toHaveScreenshot(
            `${name}--${vp.token}--${state}.png`,
            { fullPage: true, mask: masks, maxDiffPixelRatio: 0.02 }
          );
        });
      }
    }
  }
});
```

Add to `playwright.config.js` projects array:

```js
{
  name: 'vrt',
  testMatch: '**/vrt/*.spec.ts',
  use: { browserName: 'chromium', deviceScaleFactor: 1 },
  timeout: 90000,
  retries: 0,
},
```

Add to `package.json`:

```json
"test:vrt":         "playwright test --project=vrt",
"test:vrt:update":  "playwright test --project=vrt --update-snapshots"
```

---

## 4. CI gate recommendation

| Layer | Recommendation |
|---|---|
| **Pre-commit hook** | NO. Snapshots are slow (~3 min) — would block routine commits. Violates cost-discipline if developer reruns. |
| **Pre-push hook (husky)** | NO for the same reason. Keep husky for `tsc` / `pnpm build` only. |
| **CI on PR** | **YES, label-gated.** Add `.github/workflows/vrt.yml` triggered on `pull_request` when `paths` touch `styles*.css`, `*.html`, `js/modules/**`. Cost-gate via `if: contains(github.event.pull_request.labels.*.name, 'vrt')` for opt-in heavy runs. Auto-runs on the **CSS-affecting paths above** (the only paths that can move pixels). |
| **Storage** | **Commit baselines to git** (already the pattern at `tests/visual-regression/snapshots/`). 80 PNGs × ~200 KB ≈ 16 MB total — acceptable; no LFS needed yet. Re-evaluate at 200 MB. |
| **Tolerance** | **`maxDiffPixelRatio: 0.02`** (2% — already the global default in `playwright.config.js:43`). Generous enough for sub-pixel font hinting / anti-alias drift, tight enough to catch any real layout shift. **5% is too loose** — it would mask a moved card. |
| **Failure handling** | On diff: upload the three artefacts Playwright already emits (`<name>-actual.png`, `<name>-diff.png`, `<name>-expected.png`) as a GH Actions artifact. Founder reviews and either approves (regen baseline via `test:vrt:update`) or rejects (revert the offending commit). |

**Money-leak guard (charter §RULE 0):** VRT runs on `ubuntu-latest` GH Actions only. NEVER on Vercel preview — preserves the production-only deploy rule. CI cost ≈ 3 min per PR.

---

## 5. Sprint plan (4 days, ~6 engineering hours total)

### Day 1 — install + first snapshots (≈90 min)
1. Verify `npx playwright install chromium` is current on workstation.
2. Start localhost: `npx http-server . -p 8092 -c-1 --cors` (CLAUDE.md requirement).
3. Write `tests/vrt/snapshots.spec.ts` (matrix only — no CI yet).
4. Add `vrt` project to `playwright.config.js`.
5. Run `pnpm test:vrt:update` → generates 80 baselines.
6. Manually inspect 10 PNGs from each viewport bucket for correctness (no clipped hero, fonts loaded, banner state correct).
7. Commit baselines: `git add tests/visual-regression/snapshots/`. **One commit.**

### Day 2 — integrate with smoke + harden masks (≈90 min)
1. Add masks for `#countdown-widget`, `[data-live-clock]`, `#chatbot-bubble`. Re-record any affected baselines.
2. Add `data-vrt-stable="true"` attribute pattern for any animation Playwright cannot freeze via `animations: 'disabled'` (carousel auto-rotate, persona-switcher tick).
3. Wire `pnpm test:smoke && pnpm test:vrt` as a local pre-merge ritual.
4. Update `package.json` scripts.

### Day 3 — CI integration (≈90 min)
1. Author `.github/workflows/vrt.yml` (path-filtered + label-gated).
2. Cache the Playwright browsers between runs via `actions/cache@v4` on `~/.cache/ms-playwright`.
3. Upload diff artefacts on failure.
4. Trial run on a throw-away PR; confirm diff-artefact upload works.
5. Document in `README.md` under "Testing" section.

### Day 4 — tune thresholds + register (≈90 min)
1. Run VRT 3× back-to-back on `main` with no code change — verify zero false positives at `0.02` threshold. Tighten to `0.01` only if all 3 runs are 100% clean.
2. Add entry to design-system registry (`SOVEREIGN-ARCHITECTURE.md`): "VRT canonical baselines — 80 PNGs at `tests/visual-regression/snapshots/`, 10 routes × 4 viewports × 2 states".
3. Add 5th validator stub `scripts/vrt-baseline-presence.js` — fails CI if a route in `ROUTES` lacks all 8 baseline PNGs (matrix integrity check).
4. Update `audit/MASTER-DEFECT-TRACKER.md`: flip the 3 blocked rows to status `READY-FOR-FIX`.

---

## 6. First 3 defects this unblocks

Sourced from `audit/C-2-C-5-migration-research.md` and `audit/ARCH-1-research.md`:

| # | Defect | Why VRT unblocks it | Verification step |
|---|---|---|---|
| **1** | **C-5 / `f10-related-card` deletion** (90 CSS lines + 6 product-page HTML rewrites, ref `C-2-C-5-migration-research.md:165-172`) | Migration is a same-pixel codemod (`<a class="f10-related-card f10-related-card--cyber">` → `<a class="sv-card sv-card--interactive">`). VRT catches any drift on the related-strip section of all 6 product pages in one run. | Run `pnpm test:vrt` post-migration; diff must show **zero pixel change** on `crowagent-core`, `crowcyber`, `crowmark`, `crowcash`, `crowesg`, `csrd` baselines. |
| **2** | **ARCH-1 Step 1 — `postcss-import` introduction + `styles.css` split (Steps 1-7)** (ref `ARCH-1-research.md:81-137`) | The 31,724-line `@layer legacy` extraction must produce a **byte-identical** `styles.min.css`. VRT is the second gate after a byte-diff: confirms zero unintended cascade order change at the pixel level. | After each of the 6 extraction passes, run `pnpm test:vrt`. Any non-zero diff aborts the pass and rolls back the commit. |
| **3** | **ARCH-10 — bundle delete of legacy CSS dead-selectors** (`audit/dead-css-rank1.txt` lists ~600 rank-1 candidates) | Deletion is "safe-if-truly-dead". VRT is the empirical proof: if a "dead" selector was actually live on one page state we haven't anticipated, the diff appears immediately and the deletion is reverted. | Per-chunk: delete 50 selectors → `pnpm test:vrt`. Zero diff = chunk safe; merge. Any diff = restore the chunk via `git restore -p`. |

---

## 7. Definition of Done for this plan

- [ ] `tests/vrt/snapshots.spec.ts` written and reviewed.
- [ ] 80 baselines committed under `tests/visual-regression/snapshots/`.
- [ ] `vrt` project entry added to `playwright.config.js`.
- [ ] `test:vrt` + `test:vrt:update` in `package.json`.
- [ ] `.github/workflows/vrt.yml` path-filtered + label-gated, artifact upload on failure.
- [ ] Three back-to-back clean runs on `main` (no false positives).
- [ ] `MASTER-DEFECT-TRACKER.md` rows for C-5, ARCH-1, ARCH-10 flipped to `READY-FOR-FIX`.

**Word count: 982.**
