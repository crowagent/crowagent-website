# Website Release Certification — PENDING

**Branch:** `fix/carousel-and-premium-shots` · **Commits ahead of `main`:** 171 · **Files changed:** 234

**Status: NOT CERTIFIED. Two audits are still running. Nothing is pushed.**

This records only what was MEASURED. Anything not measured is listed as not measured.

---

## 1. Shipped artifact (`dist/`)

| check | result |
|---|---|
| referenced assets | no referenced asset missing; no dev surface leaked |
| retired names (CrowCyber / CrowCash / CrowESG / CrowAgent Core) | none in dist, filenames AND contents |
| `.md` authoring notes | 0 |
| `styles.css`, `package.json`, `.dev-tools/`, `screenshots/` | absent |
| authoring comments stripped | 46 files, 173.4 KB |

### A live leak this release FIXES

Production serves an OLDER `dist`. Measured live against crowagent.ai:

```
Assets/photos/PHOTO-ATTRIBUTIONS.md   200   <-- 18 retired product mentions, PUBLIC NOW
styles.css                            200   <-- ~2MB legacy file no page loads
.dev-tools/dead-button-audit.cjs      404   ok
scripts/build-dist.js                 404   ok
package.json                          404   ok
```

Both 200s are eliminated by this build. The retired-name gate was WIDENED this cycle: it
previously checked only file CONTENTS and skipped non-text extensions, so
`dist/Assets/og/crowcash.png`, `crowcyber.png` and `crowesg.png` were shipping at public URLs
while it reported clean. It now checks filenames too, proved by planting a file and requiring
the failure.

---

## 2. Automated gates, all re-run this cycle

| gate | result |
|---|---|
| live-vs-branch-regression | 0 regressions across 41 of 43 pages (2 not yet on live) |
| dead-button-audit | 88 buttons tested, 0 with no observable effect |
| british-english-audit | 0 American spellings, 0 em-dashes, 40,446 words, self-test passed |
| anchor-landing-audit | 52 anchors, 1 reported hidden = `#hero` at scrollY 0, the natural top-of-page state |
| centred-prose-census | 63 nodes / 33 pages, from 95; remainder deliberate |
| build-dist | passes |

Every zero above came from a detector validated by breaking something on purpose. The
regression detector was proved by planting a chip-leak rule on `faq.html` (heading median 36px
to 9.5px, tiny headings 0 to 5, invisible 0 to 3) and then reverting it.

---

## 3. Homepage — the priority surface

| measure | value |
|---|---|
| height @1440 | 7,659px (11,778px at session start) |
| height @390 | 10,350px = 12.3 screens (13.8 at start) |
| axe @1440 | 0 violations |
| axe @1440 reduced-motion | 0 violations |
| axe @390 | 0 violations |
| horizontal scroll @1440 and @390 | none, scrollWidth equals innerWidth |
| console + page errors | 0 |
| product captures | 8, each used exactly once |
| "win rate" / "Lost" in visible text | absent |

---

## 4. Backlog

13 items closed with evidence. **1 open, and it is not a defect:**
`sovereign-core-v2.compiled.css` is not reproducible from source. The artifact is correct and
untouched; `npm run check:css:sovereign` reports the delta. Rebuilding drops the srgb
`color-mix` fallbacks, so `ca-*` colours would render at full opacity where partial was
intended. That is a browser-support decision, not a code fix.

---

## 5. NOT YET MEASURED — certification is blocked on these

- [ ] Full accessibility and responsive sweep of all pages at 1440 / 1024 / 768 / 390
- [ ] Every carousel proved: autoplay advances, pause works, keyboard reachable, respects
      reduced motion, no blank slide, no page-level horizontal scroll
- [ ] Every product image: device-pixel downscale under about 2.5x, and no duplication
      across pages or within a page

---

## 6. Known and accepted — stated, not hidden

- The hero analytics capture contains a "Win rate" tile and a "Lost" bar. Measured from
  staging: **won 7, lost 3**, with Won the tallest bar. Removing it needs a capture of a
  screen with no win/loss framing; the two contract routes that would give one time out in dev.
- `#find` step 1 shows three tenders all at **Relevance 70 per cent**. Real data, but an
  identical value on three rows reads as a default rather than a computed score. Fit scoring
  is not configured on the capture tenant.
- 7 walkthrough frames remain illustrations, each labelled as such. They need product data
  that does not exist on staging: `crowmark_bid_answers` is 0 rows, and seeding that table
  does not make the view render a draft.
