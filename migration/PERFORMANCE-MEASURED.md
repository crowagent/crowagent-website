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

> legacy 9,267 KB → astro 924 KB — **90% reduction**, like for like.

(Row values are rounded to whole KB, so they sum to 994 rather than the 992 in the Total row,
which is computed from raw bytes. The 1–2 KB gap is rounding, not a discrepancy.)

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

## Re-measured 2026-08-02, after two corrections

The table above was measured while **every image on the Astro site was 404ing** — a defect found
immediately afterwards (`Assets/` was never copied into the Astro build). The figures were therefore
measuring a site with no images against one with images.

Re-measured with images loading, and with Turnstile deferred (below):

| | Legacy | Astro | Reduction |
|---|---:|---:|---:|
| All 11 routes | 10,765 KB | 1,207 KB | **89%** |
| Excluding the incomplete homepage | 9,267 KB | 1,137 KB | **88%** |

**88% like-for-like** is the number to quote, not the 90% above. It moved because the Astro side got
heavier and more honest, not because the legacy side changed.

### A 344 KB third-party dependency on the conversion page

`/contact` measured 419 KB with **zero images**. The breakdown: 77 KB of page and **344 KB of
Cloudflare Turnstile** — the challenge widget was 4.5x the document.

It loaded on arrival because the lazy-load used an IntersectionObserver with a 300px rootMargin, and
the form sits near the top of that page, so it fired immediately. Every visitor paid for spam
protection whether or not they ever typed anything.

Now loaded on **first focus inside the form only**. `focusin` fires on any focus within the form,
including tabbing to the submit button, so there is no path to submitting without having triggered
it, and the user spends seconds filling three fields while the token resolves.

| `/contact` cold | Before | After |
|---|---:|---:|
| On arrival | 419 KB | **77 KB** |
| After the user engages | 419 KB | 424 KB |

Verified: 0 KB third-party on arrival, 347 KB once focused, token still resolves, and the 12-test
contact gate still passes.

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

### Those timings were localhost, so they were re-run under throttling

The table above has no network latency, no CDN and no CPU contention. Measured again under
Lighthouse's mobile default — **1.6 Mbit/s down, 150 ms RTT, 4x CPU throttling, 390px** —
which is roughly a bid manager on 4G:

| Route | Build | FCP ms | LCP ms | CLS | load ms |
|---|---|---:|---:|---:|---:|
| `/` | legacy | 1476 | 1476 | 0.0044 | **8508** |
| `/` | astro | **616** | **616** | **0** | **617** |
| `/crowmark` | legacy | 1796 | 1796 | 0.0024 | **6803** |
| `/crowmark` | astro | **660** | **660** | **0** | **651** |
| `/faq` | legacy | 1712 | 1712 | **0.1072** | **6979** |
| `/faq` | astro | **804** | **804** | **0** | **810** |

Full load drops from **6.8–8.5 seconds to under one second**. LCP roughly halves.

### This corrects a conclusion above

The localhost section says both builds sit inside Google's "good" thresholds, so the work is
"a large margin becoming a much larger one, not a rescue from failing scores."

**Under realistic mobile conditions that is wrong for `/faq`.** Legacy `/faq` measures
**CLS 0.1072**, outside the 0.1 "good" threshold — confirmed identical across three runs, so it
is a stable property of the page rather than sampling noise. On localhost the same page reads
0.0383, comfortably inside. Throttling makes the shift visible because the reflow that causes
it happens after a slower paint.

So for at least one route this migration *is* a rescue from a failing Core Web Vital, and I
would not have known that from the localhost numbers I first reported.

Astro measures CLS **0** on all three routes, across every run.

### What is still not proven

Even throttled, this is a local server: no TLS handshake, no CDN edge, no real device. A field
measurement against production after cutover remains the only thing that settles absolute
performance. What transfers is the shape: payload, request count, and a CLS of zero.
