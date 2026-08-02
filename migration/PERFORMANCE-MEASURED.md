# Performance: legacy vs Astro, measured

Measured 2026-08-02. Both builds served locally, driven with Playwright/Chromium.

## Method, and one correction

**Cold cache, a fresh browser context per route.** This matters, and my first attempt got
it wrong: I reused a single page across all routes, so shared CSS, JS and fonts were cached
after the first route and every legacy figure afterwards counted only that page's HTML. That
produced a "64% reduction" which was **wrong and far too low** — it credited the legacy build
with a warm cache it does not have on a first visit.

Re-measured with a new context per route, which is what a first-time visitor actually gets.

## Payload, cold cache

| Route | Legacy KB | Astro KB | Saved | Requests legacy → astro | DOM nodes legacy → astro |
|---|---:|---:|---:|---|---|
| `/` | 1248 | 70 | 94% | 32 → 3 | 982 → 337 |
| `/about` | 891 | 75 | 92% | 30 → 3 | 516 → 410 |
| `/contact` | 1044 | 158 | 85% | 37 → 5 | 572 → 398 |
| `/crowmark` | 1036 | 146 | 86% | 34 → 4 | 671 → 556 |
| `/crowmark-buyers` | 950 | 100 | 89% | 32 → 3 | 658 → 554 |
| `/faq` | 941 | 91 | 90% | 33 → 2 | 557 → 443 |
| `/blog/` | 888 | 65 | 93% | 35 → 2 | 482 → 338 |
| `/resources` | 909 | 69 | 92% | 31 → 2 | 449 → 355 |
| `/changelog` | 897 | 65 | 93% | 30 → 2 | 422 → 328 |
| `/tools/` | 792 | 71 | 91% | 27 → 2 | 451 → 377 |
| `/privacy` | 919 | 84 | 91% | 30 → 3 | 792 → 553 |
| **Total** | **10,515** | **992** | **91%** | | |
| **Mean per route** | **956** | **90** | | | |

### The honest caveat on the homepage row

`/` is **not a like-for-like comparison**. The Astro homepage currently has the hero and one
section; the legacy homepage has six. Its 94% is partly fewer sections, not only a lighter
stack.

Every other route in the table is a **complete port**. Excluding the homepage entirely:

> legacy 9,267 KB → astro 922 KB — **90% reduction**, like for like.

That 90% is the number to quote.

## Where the legacy weight goes

`/crowmark`, cold:

| | Legacy | Astro |
|---|---:|---:|
| HTML | 68 KB | 121 KB |
| CSS | **462 KB** | 7 KB |
| JS | **336 KB** | 0 KB |
| Fonts | 101 KB | 0 KB |

The single largest legacy assets are `sovereign-core-v2.compiled.css` (159 KB),
`nav-global-fix-2026-05-27.css` (134 KB), `nav-inject.js` (116 KB) and
`ultra-premium-responsive.css` (71 KB).

Astro's HTML is **larger** per page, which is the trade being made deliberately: component
CSS is inlined into the document instead of arriving as four render-blocking stylesheets, and
there is no framework runtime at all. One document beats one document plus 30 requests.

## Core Web Vitals

| Route | Build | FCP ms | LCP ms | CLS | DOMContentLoaded ms | load ms |
|---|---|---:|---:|---:|---:|---:|
| `/` | legacy | 980 | 980 | 0.0074 | 1869 | 2672 |
| `/` | astro | **268** | **268** | **0** | **45** | **82** |
| `/crowmark` | legacy | 520 | 520 | 0.0060 | 688 | 1429 |
| `/crowmark` | astro | **324** | **324** | **0** | **57** | **261** |
| `/faq` | legacy | 796 | 796 | 0.0383 | 776 | 1393 |
| `/faq` | astro | **280** | **280** | **0** | **220** | **220** |

**CLS is exactly zero on all three Astro routes.** That is the consequence of every image
carrying explicit `width`/`height` and no content being revealed by script after paint — the
hide-then-reveal pattern that this rebuild removed is also a layout-shift source.

Both builds sit inside Google's "good" thresholds (LCP < 2.5s, CLS < 0.1), so this is not a
rescue from failing scores. It is a large margin becoming a much larger one.

### What these timings do NOT prove

These are **localhost** measurements: no network latency, no TLS handshake, no CDN, no
contention. Real-world figures will be higher for both builds. The **payload and request
counts transfer directly**; the millisecond timings are directional only.

A field measurement against production, after cutover, is the only thing that settles real
performance. This establishes the relative shape, not the absolute numbers.
