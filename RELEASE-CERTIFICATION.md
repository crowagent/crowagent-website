# Website Release Certification

**Branch:** `fix/carousel-and-premium-shots` · **Commits ahead of `main`:** 184 · **Files changed:** 238
**Date:** 31 July 2026 · **Nothing has been pushed.**

## What this document is, and is not

Every line below is a MEASURED result, re-run at the end of the cycle. Where something was not
measured, it says so.

**It does not claim the site is "top 1% ultra premium".** That is a judgement about design
quality, and it is the owner's to make, not mine to award myself. What is certified here is
narrower and checkable: the automated gates pass, the binding content rules hold, and every
defect found in this cycle is either fixed or recorded with its reason.

---

## 1. Automated gates — all re-run at end of cycle

| gate | result |
|---|---|
| axe-core wcag2a/2aa/21a/21aa, **all 43 pages** @1440 | **43 clean, 0 with violations** |
| horizontal scroll, all 43 pages (`scrollWidth > innerWidth`) | **0 pages** |
| live-vs-branch regression | **0 regressions** across 41 of 43 (2 not yet on live) |
| dead-button-audit | 88 buttons, **0 with no observable effect** |
| british-english-audit | **0** American spellings, **0** em-dashes, 40,842 words, self-test passed |
| anchor-landing-audit | 52 anchors, 1 reported hidden = `#hero` at scrollY 0, the natural top-of-page state |
| centred-prose-census | 63 nodes / 33 pages, from 95; remainder deliberate (see §5) |
| `node scripts/build-dist.js` | passes |

The a11y pass separately ran 39 pages × 4 widths (1440/1024/768/390) twice, and took axe
violations from 7 to 0.

**Every zero came from a detector validated by breaking something on purpose.** The regression
detector was proved by planting a chip-leak rule on `faq.html` (heading median 36px -> 9.5px,
tiny headings 0 -> 5, invisible 0 -> 3) and reverting it. The a11y harness caught all 9 planted
defects.

---

## 2. Binding content rules

| rule | status |
|---|---|
| never imply a likelihood of winning | **enforced** — "70% Win rate" tile and "Win rate over time" chart removed from 4 image files, including the homepage hero |
| never say Crown Commercial Service | **enforced** — 10 prose/JSON-LD occurrences removed across 3 pages; 0 remain in any HTML in `dist/` |
| CrowCyber / CrowCash / CrowESG / CrowAgent Core appear nowhere | **enforced** — gate widened to check FILENAMES as well as contents, proved by planting a file |
| never brand as beta | no occurrence |
| never assert Procurement Act compliance | the s.52 capture shows the product's own "not legal advice and not an assertion of legal compliance" |
| never claim buyer-side AI scoring | buyers page states "The panel scores; the AI never does" |
| never state a measured AI accuracy percentage | none present |

---

## 3. Shipped artifact, and a live leak this release FIXES

Production currently serves an OLDER `dist`. Measured live against crowagent.ai:

```
Assets/photos/PHOTO-ATTRIBUTIONS.md   200   <-- 18 retired product mentions, PUBLIC NOW
styles.css                            200   <-- ~2MB legacy file no page loads
```

Both are eliminated by this build. Current `dist/`: 0 `.md`, no `styles.css`, no `package.json`,
no `.dev-tools/`, no `screenshots/`, no retired name in any filename or file content.

---

## 4. Homepage

| measure | value |
|---|---|
| height @1440 | 7,659px, from 11,778px at session start |
| height @390 | 10,350px = 12.3 screens, from 13.8 |
| axe @1440, @1440 reduced-motion, @390 | 0 violations each |
| product captures | 8, each used exactly once |
| illustrated walkthrough frames | 6, from 8 — each labelled |
| carousels | autoplay, pause, keyboard, reduced-motion and blank-slide all pass by measurement |

---

## 5. Open, and why — nothing here is hidden

1. **6 walkthrough frames remain illustrations.** Blocked on data, not effort:
   `crowmark_bid_answers` is 0 rows on staging and seeding it does NOT make the view render a
   draft (tested). `/marking` says "No drafted answers to mark yet", `/verification` "No checks
   run yet", `/delivery` returns skeletons. Each frame is labelled and the section notes name
   exactly which frames are real captures.
2. **`sovereign-core-v2.compiled.css` is not reproducible from source.** The artifact is correct
   and untouched; `npm run check:css:sovereign` reports the delta. Rebuilding drops the srgb
   `color-mix` fallbacks, so `ca-*` colours would render at full opacity where partial was
   intended. **A browser-support decision for the owner, not a code fix.**
3. **63 centred-prose nodes remain.** 16 are compare/glossary hero text that `data-align`
   physically cannot reach (a layered `!important` outranks an unlayered one); applying it anyway
   was measured and made the result WORSE. The rest is display copy that should stay centred.
4. **The hero still shows a "Lost" bar** in contracts-by-status. Measured from staging: won 7,
   lost 3, Won the tallest bar. It is a pipeline state, not a win-rate claim.
5. **One citation URL** still contains a prohibited name in its `href`
   (`crowncommercial.gov.uk`). A URL is not something the page says, and removing the citation
   would make a factual article less verifiable. Owner's call.

---

## 6. Deployment readiness

The gates pass and the binding rules hold. Two things the owner must decide before a push:

- whether items 2 and 5 above are acceptable as-is;
- whether the site meets the quality bar, which this document deliberately does not self-assess.

Cloudflare Pages already serves `dist` (verified: `.dev-tools/`, `scripts/` and `package.json`
all 404 in production), so no build-output change is required.
