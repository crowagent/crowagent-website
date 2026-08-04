# Performance budgets

Required by `specs/PLATFORM-CHARTER.md`. Payload was the **measured** defect on the legacy site,
and until now nothing in the build guarded it.

Every number below was measured from `astro/dist`, not estimated. The "Measured today" table is
from 2026-08-03; the budget table below it was re-measured on 2026-08-04, when the budgets first
became enforceable.

---

## Measured 2026-08-03

| | Value |
|---|---|
| Routes | 41 |
| HTML total | 2,492 KB · median route **60 KB** · largest **90 KB** (`/`) |
| CSS total | 162 KB across 16 files |
| **JavaScript total** | **0 KB, 0 files** |
| Images | 3,388 KB across 34 files |
| Whole build | 6.0 MB |

### Two things worth reading twice

**JavaScript is zero.** Not "small" — the build ships no JS bundle at all. Every animation is CSS,
every interaction is CSS or native HTML, and the only scripts are small inline ones. That is a
genuine competitive asset: the comparator sites ship hundreds of kilobytes of framework before
anything renders. **Protect it.** Any proposal that introduces a bundle has to justify itself
against this line, and against the charter's "without increasing hosting costs".

**Images are 58% of the build**, and the six largest are all product screenshots at 175–371 KB:

```
371 KB  mark-analytics-hero.png     210 KB  mark-opportunities-feed.png
264 KB  mark-analytics.png          177 KB  mark-tender-questions.png
175 KB  mark-answer-library.png     175 KB  mark-s52-kpi-check.png
```

They are **PNG**. Every one of them should be AVIF or WebP with a PNG fallback, which is the
treatment the blog photographs already get (a 400/600/800/1200 ladder). This is the single largest
payload win available and it needs no design decision.

There is also a standing content question underneath it: product screenshots on the public site are
a recorded credibility defect, and the owner's instruction is purpose-drawn graphics rather than
captures. Some of these files may not belong on the site at all, which would make the payload
question moot.

---

## The budgets

**Enforced by `astro/scripts/check-budgets.js`**, which runs last in `npm run build` and fails it.

That sentence was here before the gate was, and it was not true. From this document's own date until
2026-08-04 nothing measured any of these numbers, and the claim that something did is the more
expensive half of the defect: an unenforced budget lets a regression through, an unenforced budget
that says it is enforced stops anyone looking. Five of the six were already breached one day later.

| Budget | Limit | 2026-08-04 | State |
|---|---|---|---|
| HTML per route | **100 KB** | worst 112.3 KB (`/crowmark`), median 63.6 KB | 43 of 44 routes pass; one recorded exception |
| CSS total | **200 KB** | 216–229 KB across 17–18 files | recorded exception |
| **JS total** | **0 KB** | 4.18 KB in 1 file | recorded exception |
| Any single image | **250 KB** | largest 293.9 KB | recorded exception |
| Images per route | **1,200 KB** | deliberately not measured — see below | not gated |
| Whole build | **~~8 MB~~ 14 MB** | 13.05 MB | passes; the 8 MB was stale, see below |

**The JS budget is zero and that is not a typo.** It is a ratchet: the moment a bundle is
legitimately needed, the budget changes by an explicit decision recorded as an ADR, rather than by a
dependency arriving unnoticed. One arrived unnoticed — Astro's bundle of a single `<script>` in
`src/pages/index.astro`, 4,283 bytes. It is recorded as an exception rather than absorbed into the
number, so the ratchet still holds and the ADR is still owed.

The HTML budget is tight because Astro inlines small component styles, so richer sections push HTML
up. If `/` crosses 100 KB the answer is to stop inlining, not to raise the limit. `/crowmark` has
crossed it: 95.7 KB when `OWNER-FEEDBACK-LOG.md` recorded it, 99 KB before this week, 112.3 KB now.
It is the only route over, and the answer above is still the answer.

### Why the whole-build number moved and the others did not

8 MB was written as "6.0 MB measured, 2 MB headroom". It is the only row in the original table with
no argument under it, and on the same day it was written the owner approved sixteen drawn product
screens, which ship as PNG/WebP/AVIF triples and weigh 4.2 MB. The budget was stale within hours, by
a decision taken after it and above it. It is also the least meaningful of the six, because no
reader downloads the whole build: it is a repo-hygiene ratchet, which is worth keeping and worth
being honest about. 14 MB against 13.05 MB measured.

The other five did not move. Being unmet is not evidence that a limit is wrong, and four of them are
carrying a **recorded exception** instead: a named entry in `check-budgets.js` with a written reason
and a ceiling of its own, printed on every run, reported as stale the moment it stops matching, and
failing the build if the thing it names grows past its ceiling. An exception records a breach. It is
not permission to spend the gap.

### The 1.94 MB nobody is using

The WebP tier of the sixteen drawn screens is **larger than the PNG tier on all 16 of 16 files** —
1.94 MB against 1.13 MB — because they are flat-colour interface drawings, which PNG encodes better
than a lossy codec does. `Carousel.astro` offers AVIF, then WebP, then the PNG as `<img src>`, so
every browser that takes the WebP source is downloading more than the fallback that tier was added
to improve on.

Retiring the **WebP** tier removes 1.94 MB from the build and makes every non-AVIF browser faster.
Retiring the **PNG** tier — the fix identified earlier — removes only 1.13 MB and leaves the
slowest option in place as the fallback. It needs an owner decision because it deletes published
assets, and it is the first place to look when the whole-build budget next binds.

### Images per route stays unmeasured, on purpose

Every image here is served through a `<picture>` with AVIF/WebP/PNG alternates or a 400/600/800/1200w
srcset ladder, and a browser downloads exactly **one** candidate from each. Summing a route's
referenced files counts three to four times what any reader pays; picking a candidate means guessing
which one. The gate therefore does not implement this row, and says so where it would have gone. The
rule in the section below applies to this document as much as to the site: a number without a source
is not a number.

---

## What is not measured yet, and is therefore not claimed

- **No Lighthouse or Core Web Vitals numbers here.** The legacy CI had a Lighthouse gate that had
  failed 20 of its last 20 runs before it was closed as OA-22. Reinstating a score-based gate is
  worth doing, but a number nobody trusts is worse than no number.
- **No render-blocking analysis.** CSS is 16 files; how many block first paint per route is
  unmeasured.
- **No font payload figure.** Fonts are self-hosted and were not counted separately above.
- **No 3G or slow-CPU timing.** `tests/e2e-3g-perf.spec.js` exists and was not run for this
  document.

Each of these is a real gap. They are listed rather than filled with plausible figures, because the
site's whole argument is that a number without a source is not a number.

---

## Rules

1. **Zero third-party origins.** Enforced today by `astro/scripts/check-csp.js`. No CDN, no hosted
   font, no analytics script, no embedded video. Images are downloaded and self-hosted.
2. **Every raster image ships a modern format** with a fallback, and carries `width`/`height` so
   nothing shifts as it loads. Below-the-fold images lazy-load.
3. **No JavaScript for content.** Everything must be correct and readable with scripts disabled.
   This is an accessibility rule and a performance rule at once, and it is already enforced by
   review; it should become a gate.
4. **A new dependency is an architectural decision**, recorded as an ADR, not a convenience.
