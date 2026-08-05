# RESUME HERE — 2026-08-05, website CERTIFIED

Read this first. It replaces `RESUME-HERE-2026-08-05-EVENING.md`.

---

## 1. THE STATE, IN ONE PARAGRAPH

**Build 22 is GREEN: `REAL EXIT 0` across the full 33-gate chain, 42 routes,
`check-cwv` 84/84 within 0.1 with 0 outside and 0 errored.** It is the first
green build since 18 at `e89961f4`, and it covers every fix made on 2026-08-05.
HEAD is on `main`, working tree clean, **nothing pushed**. The board is 245
items: **196 FIXED, 43 CLEARED, 5 non-terminal**, and every one of those five is
either owner-deferred, platform-repo scope, or resolved by the deploy switch
itself.

---

## 2. THE ONE THING LEFT, AND IT IS NOT A CODE CHANGE

The owner decided on 2026-08-05: **switch the deploy source to `astro/dist`**,
conditional on all pending items being fixed first. They are.

**Production serves the repo ROOT.** Cloudflare Pages has its build output
directory set to `dist` at the repository root, populated by
`scripts/build-dist.js` from the **legacy** 19-page tree. `astro/dist` is 42
routes and reaches nobody.

So the switch is a **Cloudflare Pages dashboard change**, not a deploy:

- Build command → the Astro build (`cd astro && npm ci && npm run build`)
- Build output directory → `astro/dist`

**Verified ready for that switch** (measured 2026-08-05, not assumed):

| Check | Result |
|---|---|
| `_redirects` / `_headers` present in `astro/dist` | yes, copied by `copy-cf-config.js` |
| Redirect rule count | 84, inside CF's ~109 honoured limit |
| All four `/tools/ppn-002-calculator` forms 301 | yes, at positions 24–27 |
| A static calculator file that would BEAT the redirect | absent |
| `/tools/tender-compliance-matrix` builds | yes |
| Bang-flag (`301!`) rules | one, deliberate and documented — served by a zone-level CF rule, not this file |

**A-126, A-128 and A-176 all close the moment the switch is verified.** They
exist only because production serves the legacy tree.

⚠️ **`check-content-parity` warned its legacy baseline is ~24 hours stale.**
Refresh it before relying on that 40/40 pass as switch evidence.

---

## 3. WHAT WAS DONE ON 2026-08-05

- **A-173** eyebrow gradient restored, eyebrow only (owner). `.eyebrow--marker`
  restored with it — not optional, it stops the spectrum fill painting over
  ProofGate's refusal hue (violet means refused, W7). **`check-treatments` still
  measures four label recipes and no fifth, so the gate was NOT weakened and
  needed no allow-list entry** — the handover had predicted it would fail.
- **A-174** the 14-day trial returns. **No credit figure is published**, and that
  omission is load-bearing: see §4.
- **A-118** the ground ladder was declared three times and **one copy was dead**
  — `/crowmark-buyers` rendered all eleven sections flat. Now declared once in
  `surfaces.css`.
- **A-172** sector routes published a `BreadcrumbList` and drew nothing. Both
  halves fixed; the gate hole is the durable half.
- **A-95** morphing mega-menu built (owner approved). +698 B, 13,491 of 15,360.
- **A-121** `check-cwv` now retries a navigation 3 times. A navigation timeout is
  not a measurement and must not render a verdict on the code.
- **A-57** the 28MB capture library deleted **and excised from history**.
- **A-175** the board reconciled against measured artefacts.

---

## 4. THE THINGS THAT WILL BITE THE NEXT SESSION

1. **DO NOT PUBLISH A TRIAL CREDIT NUMBER** until
   `CREDIT_ENFORCEMENT_MODE=enforce` is confirmed on the Railway
   `crowagent-platform` production service. **Confirmed 2026-08-05: the variable
   is NOT SET there at all**, so it falls through to its `observe` default and an
   exhausted balance never blocks. Publishing a cap while that is true recreates
   the A-54 defect exactly. A first pass of A-174 did publish "50 AI credits" and
   it was withdrawn before any build. Every limit now published is one the
   platform actually enforces.
2. **Two trial loopholes are PLATFORM work and still open** (A-80 verified them):
   the credit ledger buckets by **calendar month**, so a trial straddling
   month-end draws two full allowances; and there is **no trial-specific
   allowance**, so a checkout trial at Pro carries 750 credits.
3. **`backup-pre-a57-excision` still holds the pre-excision history locally.**
   Those commits are unreachable from `main`, so a push of `main` cannot carry
   the blobs. Delete the branch when satisfied.
4. **The wrapper exit code LIES.** Build 21 reported "exit code 0" while
   `REAL EXIT` was 1. Always append `; echo "REAL EXIT: $?"`.
5. **Never run two builds at once**, and do not run gate scripts while a build
   runs. Build 21's only failure was a `/changelog@1440` navigation timeout under
   chain contention on a healthy tree — `check-cwv` passed standalone 84/84.

---

## 5. THE FIVE NON-TERMINAL ITEMS

| id | status | why it is open |
|---|---|---|
| A-126 | OPEN P1 | production still serves the legacy trial claim — closes at the switch |
| A-128 | OPEN P1 | production still serves the PPN calculator — closes at the switch |
| A-176 | OPEN P2 | legacy tree's Ctrl K contrast — moot at the switch |
| A-117 | DECIDED P3 | owner deferred the CTA reduction until after the switch is stable |
| A-106 | DECIDED P2 | platform-repo scope, does not gate the website |

---

## 6. DEPLOY POLICY STILL BINDING

The owner's freeze of 2026-08-03 ("nothing to production until top 1% and
certified") was lifted **only** to the extent of the 2026-08-05 decision to
switch to Astro after all pending items were fixed. Confirm before pushing.

---

## 7. LATE SESSION, 2026-08-05 ~13:50 — THE DEPLOY-SOURCE SWITCH IS HALF DONE

**Cloudflare Pages IS now pointed at the Astro tree.** Settings changed via the
dashboard (account `Crowagent.platform@gmail.com`, project `crowagent-website`):

```
Build command:           cd astro && npm ci && npm run build:deploy
Build output directory:  astro/dist
Root directory:          (repo root, unchanged)
```

**THE FIRST ATTEMPT FAILED AND WHY MATTERS.** The command was originally
`... && npm run build`, which is the full 33-gate chain. It failed at 35s:
`npm ci` and `astro build` both SUCCEEDED and all 42 routes generated, then it
died where the ~20 Playwright browser gates begin. Those gates stand up Chromium
and drive real pages. **They are CERTIFICATION and must not run on a deploy** —
slow, spend build minutes, and fail for environment reasons that say nothing
about the site.

`build:deploy` was added to `astro/package.json` for exactly this: the cheap
browser-free guards (comment terminators, facts, English, vendor logos,
`astro check`) then `astro build` and the three EMITTING steps (`copy-assets`,
`copy-cf-config`, `build-sitemap`). Pushed as `5ceb33d4`.

### ▶ FIRST THING TO CHECK ON RESUME

**Did the build triggered by `5ceb33d4` succeed?** Deployments tab of the
project. If green, production serves the Astro tree and these three close:
A-126, A-128, A-176. **VERIFY WITH THESE THREE URLS:**

| URL | Expect |
|---|---|
| `/tools/ppn-002-calculator` | **301** to `/glossary/ppn-002` (was 200, serving the tool) |
| `/tools/tender-compliance-matrix` | **200** (was 404) |
| `/pricing` | 14-day trial with limits |

Then **purge the Cloudflare cache**.

**If it failed again**, read the build log to the END before changing anything —
scrolling the dashboard log pane is unreliable, use "Download log".

### ⚠ UNFINISHED AND UNCOMMITTED

- **THE STATUTORY FIGURES ARE IMPLEMENTED, NOT PARTIAL.** An earlier line here
  said the agent was mid-implementation; it finished afterwards. **FIVE FILES
  ARE MODIFIED AND UNCOMMITTED** — `MarketShape.astro`, `sources.astro`,
  `scripts/check-content-parity.js`, `scripts/motion.ts`,
  `ReasoningTrace.astro`. **NOTHING IS VERIFIED: no build, no `astro check`,
  no browser measurement.** Certify before committing. What was built:
  - **Set C, three figures:** `£5m` (s.52, contract value threshold), `12`
    (s.71, months between published assessments), `10%` (PPN 002, minimum
    social value weighting). Drops `3 KPIs`. **10% is KEPT but demoted out of
    first position** — it is correct and mandatory and must NEVER be restated
    as a different number.
  - **Layout:** take the Figma S3 frame's LEFT-ALIGNMENT (node `51:36`), on a
    shared baseline, captions left-aligned to the same track. **REFUSE its
    proportional bars** — only `10%` has a real denominator, so bars on the
    others would encode nothing while looking like data.
  - Also update `src/pages/sources.astro` HOMEPAGE_MAP (drop the `3` row), and
    correct `MarketShape.astro:563`, whose comment claims `tabular-nums` makes
    the figures share a width. Measured spread is **3.93:1**. It is false.
- **Check `git status` first** — the agent may have left partial edits.
- **`npm run build` must be run locally and be green before the next push.**

### THE FIGURES WORK, AS BUILT (uncommitted, unverified)

- `STOPS` is now three: `£5m` s.52 · `12` s.71 · `10%` PPN 002. Heading changed to
  **"Three numbers you are already held to"** — "Four" over three figures would be
  a countable falsehood on the one section whose subject is traceability.
- Layout left-aligned to a fixed track, `repeat(3, 1fr)`, shared baseline.
- **The rail is a FULL-TRACK `border-top`, never proportional.** The refusal is
  argued in the code: only `10%` is a share of a whole; `£5m` is a threshold and
  `12` an interval, so a proportional bar would encode nothing while looking like
  data. **Any `width`, `%`, `scaleX` or value-derived gradient stop on that border
  re-adds the bar.**
- `font-variant-numeric: tabular-nums` was **deleted**, not re-commented: its
  stated reason was false and correcting the comment would have left a no-op.
- The two-column breakpoint is **deleted** — three items in two columns wrap 2+1,
  so the second row's rail would draw across half the panel and stop.
- `/sources` HOMEPAGE_MAP drops the `3` row. Verified all three survivors already
  resolve to existing records, so no new rows were needed.

**Least-verified change, look at it first:** the one-column state below 1024 has
never been seen rendered — three full-measure rows where there were two bands of two.
