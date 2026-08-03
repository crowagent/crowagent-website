# Content architecture: crowagent.ai

Required by `specs/PLATFORM-CHARTER.md`, which lists it as **MISSING** with the reason: *"collections
exist, the model is undocumented"*.

The charter's binding rule is **no duplicated content across pages**. So the job of this document is
to record, for every fact the site states, where its single home is. Where a fact still has two
homes, that is written down as a defect rather than described as a design.

Read from source on 2026-08-03. Schemas are in `astro/src/content.config.ts`.

> **Naming note.** `specs/architecture/README.md` links a `CONTENT-MODEL.md` that has never existed.
> The charter asks for "Content Architecture". This file is that document; the README link is
> corrected to point here.

---

## 1. The four places content can live, and how to choose

| Where | What belongs there | Why |
|---|---|---|
| **A content collection** (`src/content/**`) | A **set** of documents that share a shape and each get their own route | Zod validates the shape at build time; a missing field fails the build instead of rendering a blank |
| **A data module** (`src/data/**`) | Structured business content rendered by **one or two** pages, or by chrome on every page | Typed, greppable, and the same array can feed both the visible markup and the JSON-LD |
| **A domain module** (`src/lib/**`) | Content that is a **calculation or a derivation**, not prose | The number a reader will quote to a buyer has to be testable in isolation |
| **A page** (`src/pages/**`) | Copy that exists on exactly **one** route and has no second consumer | Anything else is premature structure |

**The test, in one line:** *is this fact stated in more than one place, or consumed by more than one
renderer?* If yes, it is data. If no, it is page copy.

Two worked cases from this repo:

- **The FAQ pairs are data.** The legacy `/faq` hand-wrote the accordions in HTML and hand-wrote a
  separate `FAQPage` JSON-LD beside them. They drifted: 14 visible pairs against 9 in the schema, 5
  visible questions missing from the structured data, one answer differing between the two, and the
  order of positions 6 and 7 swapped. The entire Security category: the most trust-critical block on
  the page: was invisible to structured-data consumers. Nobody made that mistake; it is what having
  two sources guarantees over time. `src/data/faq.ts:1-25` records it.
- **The four sectors with a page are a collection; the other five are not.** `content.config.ts:63-70`:
  only construction, education, facilities and highways have a real page on disk. The other five
  cards on the `/sectors` hub link straight to `/crowmark` and stay hand-written there. A collection
  entry that exists only to satisfy a naming symmetry is a page nobody wrote.

---

## 2. The collections

Five, defined in `astro/src/content.config.ts`, all loaded with `glob({ pattern: '**/*.md' })`.

### `blog`8 entries → `/blog/<slug>`

```
title, description, publishDate, category          required
updatedDate, readingTime, faq                      optional
draft                                              default false
```

**`faq` is modelled, not written into the body.** Five of the eight legacy posts carry an `FAQPage`
JSON-LD block, and a parity run found none of it survived the port. Putting the pairs in frontmatter
means the visible accordion and the structured data are generated from **one** source, so they cannot
drift the way a hand-maintained JSON-LD block always eventually does. `content.config.ts:20-28`.

The layout, not the Markdown, owns the `BlogPosting` and `BreadcrumbList` JSON-LD, the share rows and
the related-articles rail. See `COMPONENT-LIBRARY.md` §2.

### `compare`4 entries → `/compare/crowmark-vs-<competitor>`

15 fields, 14 of them required (`updatedDate` is the only optional one). **Three separate description
fields is not redundancy.** Every legacy compare
page hand-wrote a *different* sentence for the meta `description`, the `ogDescription` and the
`articleDescription` in the `Article` JSON-LD. Collapsing them into one would mean rewording one of
three already-published sentences. `content.config.ts:32-41`.

`og:title` and `twitter:title` equal the bare `title` with no `| CrowAgent` suffix on every legacy
compare page, so the page derives them from `title` rather than storing them.

### `sectors`4 entries → `/sectors/<sector>`

16 fields, all required: hero fields, a `steps` array (`accent`, `verb`, `say`), a `figure` object
with an AVIF/WebP/PNG triple plus intrinsic dimensions, `alt` and `caption`, and an `faq` array.

`figure` carries `width` and `height` because those are what stop the page shifting as the image
arrives, and they belong with the image rather than with the layout that renders it.

### `glossary`2 entries → `/glossary/<term>`

21 fields, all required. The body is the `<slot/>`; the two sidebar cards and the "Read more" block
are typed frontmatter fields rather than Markdown, because their shape repeats identically across
both pages and typing catches a missing field at build time instead of rendering a silent blank card.

The index at `/glossary` lists every term and stays a static page, *"because 21 of those 23 terms
have no standalone page to route to"* (`content.config.ts:107-111`). **That comment is one out of
date:** `pages/glossary/index.astro:24` now holds **24** entries, and the design-system gate reports
24 `gx-term` cards. Two of them have a page; 22 do not.

**This is the one collection whose index is not derived from it.** Adding a 24th term to the index
means editing `pages/glossary/index.astro`; adding a 3rd term *page* means adding a Markdown file.
The two do not know about each other. That is a real seam and it is recorded here rather than
described as a design.

### `legal`4 entries → `/privacy`, `/terms`, `/cookies`, `/security`

```
title, description, heading                        required
eyebrow, lastUpdated                               optional
```

**These were not retyped.** `scripts/convert-legal.js` converts them from the legacy HTML
deterministically and **refuses to write a file unless the visible text of the output is
token-identical to the source**, because a model quietly rewording a retention period or a liability
cap would look entirely normal in review. 32,594 characters verified across the four.

**The bodies contain raw HTML** for tables, `<details>` and `<aside>`, and that is deliberate:
Markdown cannot express a `<caption>` or `th[scope]`, and approximating them is how a table caption
silently disappears.

`heading` is separate from `title` because the visible `h1` differs from the `<title>` on every one
of the four.

**`lastUpdated` is optional because two of the four genuinely carry no date on the live site.** That
is a content gap, logged in `OWNER-ACTIONS.md`, not a schema problem. `Legal.astro` renders no date
rather than an invented one. **Do not fill it in for visual consistency**; it would be a lie about
when a legal document last changed.

### Shared

`faqEntry` (`{ question, answer }`) is defined once at `content.config.ts:5-8` and reused by `blog`,
`compare`, `sectors`. It is the same object `lib/schema.ts` `faqPage()` consumes, so one shape serves
the accordion and the structured data everywhere.

---

## 3. The data modules

`src/data/**`. Typed, exported as `const`, imported by name.

| Module | Lines | Owns | Consumed by |
|---|---:|---|---|
| `site.ts` | 51 | Identity: name, legal name, origin, default OG image, Twitter handle, email, and the `Organization` JSON-LD node | `Seo.astro`, `lib/schema.ts`, 12 pages |
| `nav.ts` | 159 | The primary navigation tree: products mega-menu, top links, actions, mobile accordion | `Nav.astro` |
| `footer.ts` | 156 | The footer: trust badges, five social links, four link columns, bottom bar | `Footer.astro` |
| `faq.ts` | 154 | Every question on `/faq`, in categories | `pages/faq.astro`, accordions **and** `FAQPage` JSON-LD |
| `crowmark.ts` | 235 | `/crowmark` as data: proof strip, key facts, capabilities, FAQ | `pages/crowmark.astro` |
| `pricing.ts` | 237 | Plans, prices, credits, seats, comparison rows, FAQ | `pages/pricing.astro` |
| `blog-related.ts` | 70 | Which post each post points at | `RelatedPosts.astro` |

### `site.ts`: one identity correction worth knowing

The legacy `index.html`'s own `Organization` JSON-LD carried a `contactPoint` of
`crowagent.platform@gmail.com` / "Crow Agent". Those are the **`crowagent-platform` repo's** identity
strings, cross-pasted into the website. Not carried forward: every contact surface here uses
`hello@crowagent.ai`, matching the footer, the contact page and every other page's structured data.

### `pricing.ts`: every figure is derived from the platform, not authored here

The defect this file prevents is recorded in the platform itself (`credit-allowances.ts`): *"the same
per-tier number was restated in the Stripe catalogue copy, the marketing site, `PLAN_LIMITS`, and a
downgrade guard: and they disagreed."* The marketing site was one of the four that disagreed.

Sources are named in the header so a reader can re-check rather than trust:

- **seats** → `crowagent-platform/web/src/shared/lib/billing/seat-limits.ts`
- **credits** → `crowagent-platform/web/src/shared/lib/credit-allowances.ts` (15 / 200 / 750 / 3,000
  per calendar month; the **only** axis CrowMark is metered on)
- **prices** → £49 and £149, **not £99**, which `DEPLOYMENT-AND-RELEASE.md` §3.2 records as a
  non-existent price removed from an OG card on 2026-07-30. Portfolio's £549 is deliberately
  Stripe-only and must not appear
- **annual** → exactly 10% off twelve months, never 20%, and always rounded **down**, so the published
  figure is never higher than the stated discount implies

**This is a cross-repository dependency with no gate on it.** If `credit-allowances.ts` changes in
the platform, nothing in this repo notices. The header comment is the only mechanism. Recorded as
open.

### `crowmark.ts`: two answers that must be carried verbatim

FAQ 6 (*"Does the fit score tell me whether I will win?"*) and capability 6 (*"Answer marking against
the rubric"*) both **explicitly refuse a win-likelihood claim**. That refusal is the company's
positioning, not hedging to be tidied away: competitors in this category advertise win rates, and
declining to is the differentiator. **Do not soften, shorten or "improve" either sentence.**

The PPN 002 answer here is the best-cited on the site: February 2025, mandatory 1 October 2025, 10%
minimum, five missions M1–M5, eight policy outcomes: and it carries the *"not a full National TOMs
implementation"* hedge that `/crowmark-buyers` is missing (OA-15).

### `nav.ts` and `footer.ts`: extracted verbatim, hrefs never "corrected"

Both are lifted from `js/nav-inject.js`, the legacy runtime injector. **Hrefs are preserved
exactly** because they are live, indexed URLs.

One deliberate inconsistency is preserved rather than fixed: the mobile Products accordion uses
different labels and hrefs for two free-tools rows than the desktop mega-menu (*"Free PPN 002
calculator"* / `/tools` against *"PPN 002 Social Value Calculator"* / `/tools/`). That mismatch
exists in `nav-inject.js` itself. `nav.ts:132-138`.

### `blog-related.ts`: an editorial graph, not a derivation

Every list is read straight off the corresponding legacy page in its published order. A derived set
*"would quietly change the internal link graph of eight indexed pages at the same moment the port
claims to restore it."* Three posts carry three cards rather than four; that is what ships and it is
preserved, not padded out.

A slug in the map that no longer exists **throws at build time** and names the file to edit.

---

## 4. The domain module

### `src/lib/ppn002.ts`106 lines

The PPN 002 floor calculation as a pure function, ported line for line from
`js/tool-engine-ppn-002-calculator.js`.

**Why it is extracted rather than written inside a component:** *"This is the only page on the site
that produces a NUMBER a user will quote to a buyer. A content page that drifts during a port reads
slightly differently; this one would tell somebody their evaluation clears a statutory floor when it
does not."* It is gated by a test that drives the legacy page and this one with identical inputs.

Two bugs already fixed in the legacy engine are preserved here, and the file records both because
they are the reason its shape looks the way it does:

- The floor was compared in the **wrong units**: a percentage tested directly against a number of
  points, so the two sides only agreed when the total happened to be 100.
- A social-value weighting **larger than the total** was accepted, which is how the tool came to
  report "12 pts" on a "10 total points" evaluation.

Three binding content rules live here rather than in copy:

1. **The floor is always 10%, never 5%.** It is a weighting of the total evaluation score, not a
   score.
2. **PPN 002 was published 13 February 2025 and is mandatory from 1 October 2025.** 24 February 2025
   is the Procurement Act 2023's own commencement date and must not be attached to the PPN.
3. **It must never assert compliance.** Whether a procurement is compliant is a judgement for the
   contracting authority. It reports whether a number clears the floor and stops.

`MISSIONS` and `FLOOR_PCT` are imported by `/sources`, `/tools/ppn-002-calculator` and its
`/methodology` page, so the five missions and the threshold have exactly one home.

`src/lib/schema.ts` and `src/lib/search-index.ts` are build-time derivations rather than content. See
`COMPONENT-LIBRARY.md` §1.3 for the three layouts that bypass `schema.ts`.

---

## 5. Where each recurring fact has its single home

The charter's rule is no duplicated content across pages. This table is the record it needs.

| Fact | Single home | Enforced by |
|---|---|---|
| Company identity, origin, OG default, `Organization` node | `data/site.ts` | Only `Seo.astro` emits it |
| Every price, credit allowance, seat cap | `data/pricing.ts` | Nothing. Cross-repo, comment only |
| The PPN 002 10% floor and the five missions | `lib/ppn002.ts` | Imported, never restated |
| Nav labels and hrefs | `data/nav.ts` | `Nav.astro` is the only renderer |
| Footer labels and hrefs | `data/footer.ts` | `Footer.astro` is the only renderer |
| Every `/faq` question and answer | `data/faq.ts` | Accordion and JSON-LD read the same array |
| Every `/crowmark` FAQ and capability | `data/crowmark.ts` | Same |
| Legal document text | `content/legal/*.md` | `convert-legal.js` refuses non-identical output |
| Blog post relations | `data/blog-related.ts` | Build throws on a dead slug |
| Blog hero images, alt and credits | `components/blog/heroes.ts` | `heroFor()` throws on a missing entry |
| **Every citation, date, threshold and primary-source link** | **`/sources`** | Nothing. Convention only |
| Structured data shapes | `lib/schema.ts` | Bypassed by three layouts. See below |
| The 24 glossary terms | `pages/glossary/index.astro:24` | Not derived from the collection |

### `/sources` is the citation home, and it is new

`/sources` did not exist on the legacy site. It was created on 2026-08-02 when the owner's verdict on
the homepage was that it *"reads as a research site rather than a product site"*. Four blocks moved
there whole: `MarketShape`'s 90-word source note, `Lifecycle`'s three market-vocabulary lists,
`ReasoningTrace`'s National TOMs footnote, and `Lifecycle`'s per-stage examples.

**The accuracy was relocated, not relaxed**: every figure now has a table row with its dates, its
threshold and a link to `legislation.gov.uk` or `gov.uk`, and `s.52` and `s.71` are two separate
records.

**The standing rule that came out of it: one link, once.** The homepage links `/sources` from
`MarketShape` and from `ReasoningTrace`, and from nowhere else. *"Scattering the citations back into
the sections, one 'source:' clause at a time, is exactly how the note grew the first time."*

Nothing enforces this. It is a convention held by comments in two component headers.

---

## 6. Content accuracy rules that outrank editorial preference

These are content-model constraints, not style. Each exists because the opposite shipped.

1. **Every figure is either cited to a named source or visibly marked as an example. No third
   option.** Three wrong-figure defects shipped in one week before this was enforced. `MarketShape`'s
   old lead figures: 40,000+ notices a year, 55% stopped at qualification, 44% citing process
   complexity: could not be sourced; CIPS and techUK have both published on that exact subject and
   neither 55% nor 44% appears in their data, and 40,000+ was traceable only to tender-alert
   marketing copy (OA-27).
2. **`s.52` and `s.71` are two duties and must never be merged.** s.52 sets and publishes the KPIs;
   s.71 assesses performance against them and publishes the result. Collapsing them was a live
   accuracy defect (OA-26). `MarketShape` carries two `s.52` stops and one `s.71` and the tags are
   what keep them apart at a glance.
3. **The PPN 002 model is not the PPN 06/20 Social Value Model.** Two pages described the superseded
   model under the current model's name and linked
   `gov.uk/government/publications/social-value-model` as though it were PPN 002's (OA-29). That link
   is now on the `check-content-parity.js` allow-list as a **deliberate** removal, with the note:
   *"Restoring this link would restore the defect."*
4. **The EU post-award duty is Art. 70 monitoring.** Earlier drafts put a US federal
   contractor-performance reporting system in the EU column. `Lifecycle.astro:79-86`.
5. **Never claim a win rate.** No fabricated customers, logos, testimonials or ratings. The 82 in the
   hero is fit and rubric coverage and *"must never be reworded"* into a win probability.
6. **CrowMark only.** Discontinued products never appear.
7. **UK public is the proof point, not the whole story.** The market-neutral decision, OA-25. It is
   why the hero eyebrow *"Worked example · award question 4.2 · social value weighting 10%"* was cut:
   it capped the company at one UK procurement note in one financial year.
8. **A read-only claim needs a scope, not the words "read only".** `Integrations` prints
   `Sites.Read.All`, `Files.Read.All`, "Sign-in only"*"A scope is checkable; a caption is an
   assertion."* Three of the nine sources the legacy page named write, and two had no connector at
   all; the grid is six chips because that is the length the evidence supports.

---

## 7. Adding content

| You are adding | Do this |
|---|---|
| A blog post | Markdown in `content/blog/`. Add a `heroes.ts` entry (the build throws without one) and a `blog-related.ts` entry (or it falls back to the derived rule). Everything else, JSON-LD, share rows, related rail, comes from `Article.astro` |
| A competitor comparison | Markdown in `content/compare/`. All 18 fields required |
| A sector page | Markdown in `content/sectors/`, plus the figure assets |
| A glossary term with its own page | Markdown in `content/glossary/`, **and** update `pages/glossary/index.astro` to link it. They are not connected |
| A fifth legal document | Markdown in `content/legal/`, produced by `convert-legal.js`. It inherits the contents rail and the breadcrumb |
| A price, credit or seat figure | `data/pricing.ts`, with the platform source named in the comment. Never inline |
| A citation, date or threshold | `/sources`. Link it once from wherever it is needed |
| One-off marketing copy on a single route | The page. Do not create a data module for a single consumer |

---

## 8. Open, not decided

Named rather than filled with an invented rule.

1. **`/sources` is a convention with no gate.** Nothing stops a citation being written back into a
   section. The "one link, once" rule lives in two component header comments.
2. **The glossary index and the glossary collection are unconnected.** 24 terms in a page, 2 in a
   collection, no build-time relationship. A term can be added to one and not the other, and
   `content.config.ts`'s own comment has already fallen one behind the page.
3. **`data/pricing.ts` depends on a second repository with no check.** If `credit-allowances.ts` or
   `seat-limits.ts` changes, nothing here fails.
4. **There is no gate on content accuracy rules 1–8 above.** `check-content-parity.js` asserts that
   headings, form controls and link targets are not *lost*; it says nothing about whether what
   replaced them is true. Every rule in §6 is held by review and by component header comments.
5. **Two of four legal documents carry no `lastUpdated`.** Logged in `OWNER-ACTIONS.md`. Owner
   decision, not an engineering one.
6. **The `sectors` collection covers four of nine sectors.** The other five are cards on a hub. There
   is no recorded threshold at which a sector earns a page.
