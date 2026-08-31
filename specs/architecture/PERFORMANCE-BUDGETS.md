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

## How a budget on this site is now derived, 2026-08-31

**The owner asked who set the 100 KB HTML budget and why. Nobody could answer, so the method was
looked up rather than defended.** What follows is the method, its sources, and what it says about
this site. The old table is below and is kept as a record.

### The method, from the people who publish it

**web.dev, Performance budgets 101.** Three kinds of budget: quantity based (bytes, request counts),
milestone timings (user centric metrics), and rule based (a Lighthouse score). The headline quantity
figure is **170 KB of critical path resources, compressed and minified**, and it is derived rather
than chosen: from a baseline device on a slow 3G connection targeting Time to Interactive under five
seconds, on the reasoning that over half of web traffic is mobile.

**web.dev, Your first performance budget.** The procedure is measure your own site, then **find
about ten competitors and measure them**, then **be at least 20 percent faster than the fastest
comparable site**, because 20 percent is the point at which a difference is noticeable. For a site
already live it says start at 20 percent faster than your own current speed and ratchet from there.

**Google, Defining the Core Web Vitals thresholds.** This is the part worth copying. A threshold has
to satisfy three things at once. It must reflect a **quality experience**, grounded in human
perception research, which is how the LCP candidate range came from a cited 0.3 to 3 second window
of sustained attention. It must be **achievable**, and the test they apply is that **at least 10
percent of origins already meet it**. And it is measured at the **75th percentile** of page loads,
so three visits in four see it or better, while outliers cannot drag it.

### The four rules this site now follows

1. **A budget is measured in the unit a reader pays.** Transferred, compressed bytes, never raw. This
   site is served from Cloudflare Pages, which serves brotli.
2. **A budget cites its source.** A number without one is not a number, which this document already
   said and did not do.
3. **A budget is derived from a user outcome**, a device and a network, or from a measured
   distribution of real sites. Never from rounding up whatever the build currently weighs.
4. **A budget must be achievable and must bind.** One that sits above everything binds nothing until
   it binds everything at once.

### What the site actually weighs, measured 2026-08-31

Forty five routes, brotli, the bytes a reader downloads:

| | p50 | p75 | p90 | worst |
|---|---|---|---|---|
| **HTML on the wire** | 11.0 KB | 12.4 KB | 14.0 KB | **20.0 KB** (`/`) |
| raw, for comparison | 54.0 KB | 61.4 KB | 72.0 KB | 113.7 KB |

**The worst route compresses 5.7 to 1.** HTTP Archive's Web Almanac 2024 measures a **median of 18 KB
of HTML per page, transferred**, across desktop and mobile. So this site's median route is **39
percent under the web median** and its worst route is **11 percent over it**.

Critical path for `/`, brotli, cold cache: **104.0 KB against the 170 KB budget, 61 percent, 66 KB of
headroom.** Document 20.0, three stylesheets 20.3, two preloaded woff2 59.1, two scripts 4.7.
**The fonts are 57 percent of it**, which no HTML only budget would ever have shown.

### What was wrong with 100 KB, stated plainly

**The unit was wrong.** Nobody downloads raw bytes. The gate reported a number 5.7 times larger than
the thing it claimed to protect, and the two had already visibly come apart: the carousel equal
height ghost added **4.15 KB raw and 27 bytes brotli**, because it is a literal repeat of text
already in the document. The gate got 4.2 KB angrier while readers got 27 bytes worse. That is the
same inversion `ADR/0010` rewrote the `jsTotal: 0` ratchet to stop rewarding, in a second place.

**The provenance was wrong.** 100 KB had no source anywhere in this repository, no owner decision
attached, and it was never met: on the day it was written the worst route was already 112.3 KB.

**woff2 is counted as delivered and is never recompressed.** It is already a compressed container, so
running brotli over it would report a smaller number than the browser downloads, which is the same
class of lie in the other direction.

### Still not measured, and therefore still not claimed

The competitor benchmark that web.dev's method requires **has not been done**. Ten comparable
procurement and bid software sites should be measured for LCP, INP and critical path weight, and the
20 percent rule applied. Until that exists, `htmlPerRoute` rests on the HTTP Archive median, which is
a real distribution but is the whole web rather than this market. **That is a weaker source than the
method asks for and it is written down here rather than glossed.**

No field data. There is no CrUX or RUM data for this origin, so nothing here is measured at the 75th
percentile of real visits, which is where Core Web Vitals are judged.

---

| Budget | Limit | 2026-08-04 | State |
|---|---|---|---|
| HTML per route | **100 KB** | worst 112.3 KB (`/crowmark`), median 63.6 KB | 43 of 44 routes pass; one recorded exception |
| CSS total | **200 KB** | 216–229 KB across 17–18 files | recorded exception |
| **JS total** | **~~0 KB~~ 15 KB, plus three assertions** | ~11.9 KB in 2 files | passes; the zero was a proxy that had stopped tracking the goal, see below |
| Any single image | **250 KB** | largest 293.9 KB | recorded exception |
| Images per route | **1,200 KB** | deliberately not measured — see below | not gated |
| Whole build | **~~8 MB~~ 14 MB** | 13.05 MB | passes; the 8 MB was stale, see below |

**~~The JS budget is zero and that is not a typo.~~ It was a ratchet, the ADR it was owed has been
written, and the answer it gives is that the ratchet was measuring the wrong thing.** See
`ADR/0010-jstotal-zero-is-replaced-by-a-budget-with-assertions.md`, owner decision A-73, 2026-08-04.

Zero counted `.js` FILES. Astro does not emit a file for a small script — it inlines the chunk into
the document — so the number went down every time the payload went up. Measured on the 2026-08-04
build: four sitewide scripts totalling **8,958 B written into all 44 documents, 384.9 KB**,
byte-for-byte identical and cacheable in none of it, while this row read 4.18 KB and called that the
breach. The exception it carried proposed fixing it with `is:inline`, which would have moved more
bytes into the document and made the gate report an improvement.

The budget is now **15 KB**, and three things a number cannot say are asserted against the built
output by `check-budgets.js`: **nothing render-blocking**, **no third-party JS in the payload**, and
**nothing paid for twice** (duplicated inline bundled script, budgeted at 16 KB, measured at 339.5 KB
before this change and 9.5 KB after). A runtime dependency is still an ADR — assertion 2 is what
refuses one, and it refuses it whatever the size.

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
