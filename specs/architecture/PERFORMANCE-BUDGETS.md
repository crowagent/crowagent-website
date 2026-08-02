# Performance budgets

Required by `specs/PLATFORM-CHARTER.md`. Payload was the **measured** defect on the legacy site,
and until now nothing in the build guarded it.

Every number below was measured from `astro/dist` on 2026-08-03, not estimated.

---

## Measured today

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

Enforced per route on the built output, so a regression fails the build rather than being noticed
later.

| Budget | Limit | Today | Headroom |
|---|---|---|---|
| HTML per route | **100 KB** | 90 KB worst | tight, and `/` is the worst |
| CSS total | **200 KB** | 162 KB | 38 KB |
| **JS total** | **0 KB** | 0 KB | none, deliberately |
| Any single image | **250 KB** | 371 KB | **over budget on one file** |
| Images per route | **1,200 KB** | not yet measured per route | to measure |
| Whole build | **8 MB** | 6.0 MB | 2 MB |

**The JS budget is zero and that is not a typo.** It is a ratchet: the moment a bundle is
legitimately needed, the budget changes by an explicit decision recorded as an ADR, rather than by a
dependency arriving unnoticed.

The HTML budget is tight because Astro inlines small component styles, so richer sections push HTML
up. If `/` crosses 100 KB the answer is to stop inlining, not to raise the limit.

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
