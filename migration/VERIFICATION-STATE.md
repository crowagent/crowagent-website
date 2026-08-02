# Verification state

Recorded 2026-08-02. Every figure below is from a run in that session, not from a previous
result carried forward.

## What passes

| Suite | Covers | Result |
|---|---|---:|
| `jest` (6 files) | unit: cookie banner, consent state, form helpers | **147 passed** |
| `tests/smoke.spec.js` | legacy site: 19 journeys incl. contact form and cookie banner | **19 passed** |
| `tests/accessibility.spec.js` | legacy site: axe on 13 routes | **13 passed** |
| `tests/responsive.spec.js` | legacy site: 12 routes × 8 viewports | **96 passed** |
| `astro/scripts/check-links.js` | every internal href vs what the build ships | **build step** |
| `tests/sitewide.spec.js` | **Astro: all 37 routes**, 11 checks each | **38 × 3 engines = 114** |
| `tests/astro-contact.spec.js` | the sitewide CTA target and its consent gate | **12 passed** |
| `tests/contact-consent.spec.js` | legacy contact form consent enforcement | **9 passed** |
| `tests/ppn002-parity.spec.js` | calculator: legacy vs port, 22 cases × 6 fields | **22 passed** |
| `tests/heading-structure.spec.js` | one h1 and no level skip, every route | **44 passed** |
| `tests/command-palette.spec.js` | ⌘K palette incl. axe with it open | **9 passed** |
| `tests/nav-dropdown.spec.js` | Products dropdown, hover AND coarse pointer | **6 passed** |

**491 assertions-level tests, all passing.**

### Cross-browser

`tests/sitewide.spec.js` runs on **Chromium, Firefox and WebKit** — 38/38 on each. WebKit was
added as a first-class project on 2026-08-02 and immediately found three defects the other two
engines passed:

- a card grid flattened into 18px inline links (WCAG 2.5.8);
- a code block pushing the document sideways;
- a URL that could not wrap, overflowing a 390px viewport by 6.8px.

Everything else in this list is Chromium-only. That is a known limit, not a claim of coverage.

### Three traps that make a run look like a result

**The three-engine sitewide suite produces FAKE FAILURES under contention.** Run alongside other
browser work it timed out at 30s inside axe's `page.evaluate` on a dozen Firefox routes, complete
with retries and failure artefacts — none of which were content defects. This machine has 15.7 GB
and the suite drives Chromium, Firefox and WebKit at once. Run it alone, and constrain it:

```
npx playwright test tests/sitewide.spec.js --workers=2 --timeout=90000 --reporter=line
```

Same lesson the platform repo already learned about vitest at default concurrency. A timeout is
not a defect, but it is indistinguishable from one in the report.

**`responsive.spec.js` defaults to port 8080, which nothing serves.** The local server runs on
8092. Point it explicitly:

```
BASE_URL=http://localhost:8092 npx playwright test tests/responsive.spec.js --project=chromium
```

Without that every test fails on `ERR_CONNECTION_REFUSED`, which looks like 96 real regressions.

**`… | tail -8; echo "EXIT: $?"` reports the exit code of `tail`, not of the test run.** It prints
`EXIT: 0` no matter what happened. It cost a full responsive run this session — the output was
truncated to nine lines with no summary and a `0` that meant nothing. Redirect to a file and read
the code from the command itself:

```
npx playwright test … > run.log 2>&1; echo "EXIT: $?"; grep -E "passed|failed" run.log
```

## What is NOT run, and why

| Suite | Why not |
|---|---|
| `tests/visual-audit.spec.js` | needs committed screenshot baselines; none exist for the Astro build, so it would compare against nothing |
| `tests/parity.spec.js` | legacy-vs-Astro page parity; blocked while 5 routes are unported, since it would report expected absences as failures |
| `tests/sweep-6x6.spec.js` | targets production, not a local build |
| `tests/e2e-3g-perf.spec.js` | throttled-network run; not executed this session |

## Known gaps, all owner-blocked

Five legacy URLs have no Astro equivalent. Cutover is blocked on decisions, not on engineering:

| URL | Blocked by |
|---|---|
| `/pricing` | OA-05 — "Active bids: Unlimited" against enforced 5/25-per-month caps |
| `/integrations` | OA-10 — "Read-only throughout" against its own alerts, exports and SMS |
| `/roadmap` | OA-13 — a "Q4 2026" stamp above "not yet committed engineering" |
| `/tools/ppn-002-calculator/methodology` | OA-17 — describes a calculator that does not exist |
| `/cookie-preferences` | needs the consent system, which the Astro site does not yet require (it sets zero cookies) |

Homepage sections 3 and 5 are also unported, under OA-01.

**`/partners` is ported but must not go live** until OA-08 is resolved: the form POSTs name,
company, role, email and phone to Formspree, which `privacy.html` does not name.

## What the suites are built to prevent

Each of these was a real defect that a passing check failed to catch. They are recorded because
the checks were rewritten around them:

- **12 broken images passed an "every image has alt" sweep.** Counting an attribute is not
  checking an outcome. `sitewide.spec.js` now asserts images *load*, after scrolling the page.
- **A card grid survived a text-equality check** because every word was preserved and only the
  structure was destroyed.
- **344 KB of Turnstile loaded on arrival** behind an IntersectionObserver called "lazy". It
  deferred nothing.
- **The Astro build shipped no `_headers`, `_redirects` or `robots.txt`** — page-level checks
  cannot see a missing deployment contract. Now a build step that fails.
- **Five dead links sat on every page while 38 routes passed 11 checks each on three engines.**
  The suite asserts a page's *subresources* return 2xx; a link is not fetched during a page load,
  so nothing looked at where links went. Found by reading a screenshot. Now `check-links.js`.
- **Then the link checker had the same class of bug.** It accepted any URL appearing on the left
  of a `_redirects` rule as proof the link resolved. One of those rules is a **200 rewrite**,
  which serves a file directly rather than redirecting — and the file it named was not in the
  build. A rule is not a destination. It now follows each rule's destination recursively. The
  lesson repeating here is that a check must assert the *outcome*, never the *mechanism*: alt
  attributes vs images that load, rule sources vs pages that exist.
