# RESUME HERE — session close 2026-08-05, 10:15

Read this first. It is the whole handover.

---

## 0. THE FIRST THING YOU DO, BEFORE ANY OF THE OWNER'S THREE TASKS

**Run a build.** There is no green build covering the last commit.

```
cd "C:/Users/bhave/Crowagent Repo/crowagent-website/astro"
npm run build > build.log 2>&1; echo "REAL EXIT: $?"
```

- **Last GREEN build is 18, at `e89961f4`.**
- **HEAD is `0410c712`**, which is green in *source* only: `astro check` 0/0, all four
  pre-build gates pass, and the standalone autoplay gate passes. **No full 33-gate
  run has confirmed it.**
- Builds 19 and 20 both failed. Both failures are already fixed in `0410c712`.
  Build 19 failed on a real defect (two width caps left their blocks 134px and
  270px off centre). Build 20 failed on **my own new gate**, not the site.

**`REAL EXIT` is the only exit code that means anything.** The
`<task-notification>` wrapper reported "exit code 0" for both failing builds.
Always append `; echo "REAL EXIT: $?"`.

---

## 1. OWNER'S THREE RESUME TASKS

Recorded on the board as **A-173, A-174, A-175**. The owner's order was
1, 2, 3 — but **A-175 runs first**, because it is the one that makes the other
two trustworthy.

### A-175 — deep status reconciliation (DO THIS FIRST)

> "there are so many items i clarified but still showing as pending and in to do
> list, so first thing on resume you must to do deep status check and clear and
> update backlogs and reflect correct status."

The complaint is almost certainly right, and this session generated evidence
for it. **Do not mass-close on the strength of notes saying FIXED — that is
exactly the failure being complained about.** For every non-terminal item, go
and measure the artefact and set the status from what is actually there.

Also: the board carries nine statuses and nobody has written down what
`FIXED` vs `BUILT` vs `CLEARED` mean. Define them into the legend the board
validates against.

### A-173 — restore the eyebrow gradient, **eyebrow only**

> "you must restore eybrow gradient (only eyebrow) in all the pages and sections"

- **This is the owner reinstating their own earlier decision, not correcting my
  mistake.** Added on their 2026-08-02 instruction ("all the eyebrow must be
  gradient"), shipped on 43 routes, then reversed on 2026-08-05 — and
  `labels.css` records that reversal as *the owner's own*. Rewrite that note so
  it stops contradicting the shipped state.
- **Scope is narrow: eyebrow ONLY.** Not headings, chips, buttons or badges.
- **`check-treatments.js` will fail the build** — rule 2 caps micro-label
  recipes at four and has line-height in the fingerprint. The allow-list must
  name the eyebrow and give the owner's instruction as the reason. Do not
  weaken the gate silently.

### A-174 — the 14-day free trial

> "why free trial 14 days is not yet back?"

**Measured state of both trees:**

| Tree | Says |
|---|---|
| Legacy root (**what production serves**) | `pricing.html:823` — "14-day free trial", **live right now** |
| Astro (what we build) | `terms.md:45` "There is no free plan"; `faq.ts` "no self-serve signup" |

**This is a sequencing failure of mine.** A-54 removed the trial because the
page's comments said it had gone. The owner then clarified **twice** that they
*do* want one — "i want to give free trial but with limits" — and under A-128
asked for a deep dive giving a minimum, very limited trial. The removal was
right for a *free plan* and wrong for a *free trial*, and the replacement was
never built.

**What is owed:** the limits proposal they asked for and never got — a length,
a cap in units a reader understands (documents/pages/questions, not tokens),
and what happens at the end. Then restore across `pricing.astro`, `faq.ts` and
`terms.md` **together**.

⚠️ A Railway read of `CREDIT_ENFORCEMENT_MODE` was **denied by the permission
classifier** and was not worked around. It decides whether a cap is real or
decorative.

---

## 2. WHAT THIS SESSION ACTUALLY CLOSED

Board went **227 → 245 items**; OPEN went **7 → 4** (now 7 with the three new
owner tasks).

- **A-158** the 834 two-card stacking — the audit's worst finding, "fixed" twice
  and never working. The element carries *both* `card-row` classes, so removing
  the modifier left the base selector matching.
- **A-152** Inter metric fallback. Inter is 93.4% of site text and had none.
  Re-derived rather than trusting the board's numbers; the control passed
  (106.66% vs the recorded 106.93%). `/tools/` at 390 fell **0.0678 → 0.0220**
  CLS.
- **A-170** carousel foot cut **35.9px of caption off each side at 320**. Hid
  from every audit because `overflow-x: clip` produces no scrollWidth growth.
- **A-164** `ch` is not a character — 0.631em vs a 0.526em mean, so `68ch` holds
  82 characters. Prose measures moved to `em`.
- **A-165** two unevidenced GDPR badges (footer on 43 routes, and `/security`).
- **A-161** a behavioural autoplay gate, wired as the 33rd link.
- **A-163** a parity baseline captured a false 404 mid-build and deleted 84
  lines of real data. Reverted.

---

## 3. THE FOUR THINGS THAT WASTED TIME — DO NOT REPEAT

1. **Never run two builds at once.** A build empties `dist` before repopulating
   it. Anything reading `dist` mid-build sees holes. This corrupted a tracked
   parity baseline (A-163).
2. **`overflow: clip` hides overflow from `scrollWidth === clientWidth`.** That
   test reported the page clean while 35.9px of text was being cut. Compare a
   child's rect against its clipping ancestor's.
3. **A gate that stops reporting must be proven still able to report.** Every
   check added this session was falsified by injecting a real fault into `dist`
   and confirming it was caught.
4. **My own harnesses were wrong three times** — a font-load race, a corpus
   split on a control byte, and an autoplay gate reading `data-band` (the
   reduced-motion gate) instead of measuring travel. Each was caught because
   the *numbers were absurd*, not by re-reading the code.

---

## 4. STATE

- **Working tree clean.** HEAD `0410c712`. Nothing pushed — production frozen by
  owner instruction of 2026-08-03.
- **Board:** `status/issues.json`, 245 items, served at `http://localhost:8099/`
  (re-reads every 20s).
- **Production still serves the legacy root tree, not `astro/dist`.** That is
  the root cause of A-126 and A-128, and shipping the Astro rebuild is a
  **deploy-source change**, not a deploy. Treat it as its own change with its
  own verification.
- A one-shot cron (`f61cc3a5`) was set to restart the 10-minute loop at 12:04.
  **It is session-only and dies with the session** — restart manually with
  `/loop 10m <directive>`.
