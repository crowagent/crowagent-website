# The Register — implementation plan

**Status:** proposal, not built. Nothing in this document has been implemented.
**Scope:** `crowagent-website` only. Astro build under `astro/`.
**Written:** 2026-08-02.
**Supersedes (in part):** `specs/platform-fixes-and-free-tools/requirements.md` REQ-B1, REQ-B2, REQ-B3, REQ-B5 to REQ-B10. See section 3.

---

## 0. One-paragraph summary

Stop running a blog, a glossary, a resources hub and a tools hub as four separate surfaces.
Publish one structured corpus, **the Register**, of the obligations a bid holds a supplier to.
Each obligation is a typed record with a trigger, a requirement, the question a buyer will
actually ask, the evidence that answers it, an explicit statement of what it cannot tell you,
at least one named source, and a verification date. Three depths sit over that one corpus:
**Browse** (filter to what applies to you), **Check** (answer eight questions, get the
obligations you trigger and, prominently, the ones we cannot decide for you), and **Read**
(articles rendered over entries so an article's figures come from the entry rather than from
a writer's memory). Alongside it sits a public **corrections ledger** of figures we removed
from our own site and why.

---

## 1. Interrogation: is this actually better than improving what exists?

The brief asked for this to be attacked before it is planned. It is attacked here honestly.

### 1.1 What is genuinely wrong with the site as it stands

Counted from the current Astro build:

| Surface | Content | Route |
|---|---|---|
| Blog | 8 posts | `/blog`, `/blog/*` |
| Compare | 4 competitor pages | `/compare`, `/compare/*` |
| Glossary | 23 index terms, **2** with a detail page | `/glossary`, `/glossary/*` |
| Sectors | 4 pages | `/sectors/*` |
| Tools | **1** tool | `/tools`, `/tools/tender-compliance-matrix`. Was the PPN 002 calculator plus its methodology page; both were removed on 2026-08-04 by owner instruction and 301 to `/glossary/ppn-002` |
| Resources | 0 content of its own | `/resources` |

Three structural faults:

1. **`/resources` is a hub of hubs.** Read `astro/src/pages/resources.astro`: every card on
   it links to `/tools`, `/blog` or `/glossary`. It contains no content. It exists because
   the site has four content surfaces and needed somewhere to list them.
2. **`/tools` advertises one tool.** Its own header comment records that four tools were
   withdrawn on 2026-07-28 and the page still described six at the time. A hub for one item
   is not a hub.
3. **21 of 23 glossary terms have no destination.** The index defines them inline and routes
   nowhere, because inventing 21 thin pages would be worse. The terms are real; the format
   is wrong for them.

So the "merge the three things" instinct in the brief is correct on the evidence. The
question is what they merge *into*.

### 1.2 The case for the Register specifically

- **It is the only differentiated asset available.** This site cannot cite customers, logos,
  testimonials, ratings or win rates. Those are the four things every competitor's homepage
  is built from. Provenance is the substitute, and provenance is a property of *structured*
  content, not prose. A blog post cannot be gated on having a source. A typed record can.
- **It converts reuse into functionality rather than UI.** One entry renders into the browse
  table, the entry page, the Check result, the glossary destination, the article sidebar, the
  JSON-LD, the change feed and `llms.txt`. That is the standing "reuse is functionality, not
  UI" rule applied properly.
- **It matches how this repo already works.** `check-links.js`, `check-seo-parity.js`,
  `check-content-parity.js` and `check-csp.js` all encode the same conviction: a rule that
  only prints is a rule that gets ignored, so make the build fail. The Register is that
  conviction applied to facts instead of markup.

### 1.3 The strongest arguments against it

These are the ones that would kill it. Each has a mitigation in the plan; if a mitigation is
not accepted, the corresponding part of the plan should not be built.

**A. A register of statutory duties is a maintenance liability dressed as an asset, and this
is a one-person operation.**
A stale blog post is embarrassing. A stale register entry is actively wrong in a format that
reads as authoritative, and someone acts on it. This site produced three separate wrong-figure
defects in one week (OA-26, OA-27, OA-29, plus a fabricated £27,000 constant) with only about
40 prose pages. Twelve entries at roughly eight typed facts each is ~100 new load-bearing
assertions. At the observed error rate several will be wrong on launch day.
*This, not decay, is the single biggest risk.* Mitigations: hard cap on entry count tied to
the review budget (section 8), a build gate that fails on stale entries (section 7), and
shipping the corrections ledger in Phase 1 rather than later, so that being wrong is
survivable and on-brand rather than fatal.

**B. It could destroy the only organic traffic asset the site has.**
The 8 blog posts are the only pages here with a plausible long-tail search surface. A register
entry titled "Procurement Act 2023 s.52" competes with legislation.gov.uk, gov.uk and every
law firm's briefing note, and loses. **The Register must therefore not be the SEO strategy and
must not absorb article URLs.** Articles stay at `/blog/*`, keep their URLs, keep their
FAQPage structured data, and become the ranking surface. The Register is what makes them
defensible and what makes Check possible. Where the Register does have a defensible search
position is the answer-side framing that gov.uk will never publish: not "what does s.52 say",
but "what question will a buyer ask about KPIs and what evidence answers it".

**C. A UK-statute register contradicts the market-neutral decision (OA-25).**
OA-25 recorded the owner decision: market-neutral narrative, UK public as the proof point.
A corpus of Procurement Act sections and PPNs is 100% UK public and pulls the site straight
back to where OA-25 says it should not be (PPN 002 x937, "global" x1 across 39 pages).
*This is the amendment that changes the shape of the concept*: organise the Register by
**obligation type**, not by jurisdiction. "You must publish at least three KPIs" (UK public,
s.52), "you must complete a CAIQ before onboarding" (global private), "you must hold a valid
Cyber Essentials certificate" (UK public, increasingly UK private) are the same shape of
thing: trigger, requirement, evidence, cadence, source. Organising by shape is what makes it
market-neutral, and it is also what makes the Check engine generic instead of a PPN 002
calculator with more questions.

**D. "Paste a notice and check it" is the part most likely to be wrong.**
A Find a Tender notice is semi-structured. A private RFP is a PDF. Client-side keyword
extraction that concludes "this triggers s.52" when it does not is precisely the defect class
this site keeps hitting, and it would be shipped as a headline feature. **Recommendation: the
first version of Check is a deterministic questionnaire, not a parser.** Eight closed
questions evaluated against each entry's machine-readable trigger predicate, in a pure
function with unit tests, exactly as `astro/src/lib/ppn002.ts` already does. Paste-parsing is
a Phase 5 experiment and, if it ships, it pre-fills the questionnaire and says so; it never
produces an answer directly.

**E. Is this creative, or is it a compliance checklist with good typography?**
On its own, a register is worthy and dull. Four things make it a market position rather than
a content project, and they are the parts that should not be cut for time:

1. **The refusal is the interface.** Every entry declares `cannotTell`, and every Check result
   renders a "What this cannot tell you" block assembled from the entries it matched. No
   competitor will ship a screen whose most prominent element is its own limits.
2. **The corrections ledger.** A permanent, dated, public list of figures we removed from our
   own site and why. Four are already available (OA-26, OA-27, OA-29 and the fabricated
   £27,000 constant). Competitors advertise things like "241% increase in success rates".
   Publishing your own corrections is cheap only if you are right, which is exactly why it
   cannot be copied by anyone who is not.
3. **Per-entry change history and a change feed.** Every entry carries a dated history of what
   changed and which source changed it. This turns the maintenance liability into the visible
   product, gives suppliers a reason to return that a blog does not, and is unfakeable.
4. **The answer-side translation.** `askedAs` and `evidence` on every entry. gov.uk publishes
   the rule; nobody publishes the question a buyer builds from it and the evidence that
   satisfies it. That is the whole reason to read us rather than the primary source, and it is
   what makes the Register useful to a bid team rather than to a lawyer.

### 1.4 Verdict

**Build it, with three amendments to the starting proposal:**

1. Organise by **obligation type**, not jurisdiction (fixes the OA-25 contradiction).
2. **Articles keep their URLs and their ranking role.** The Register does not absorb them
   (fixes the SEO risk).
3. **Check is a deterministic questionnaire first.** No paste-parsing until the corpus and
   the predicate engine have been in production and correct for a while (fixes the accuracy
   risk).

And one addition: **ship the corrections ledger in Phase 1**, not later. It costs half a day
and it is what makes launching a factual corpus safe.

### 1.5 What would make it fail

- Entry count grows past what one person can re-verify, and the freshness gate gets an
  ever-growing suppression list. This is the failure mode with the highest probability.
- Entries get written from search summaries rather than from primary sources opened and read.
  OA-27 documents exactly this happening already, including a wrong attribution that survived
  a first pass.
- The Register is treated as an SEO play, article URLs get folded into it, and rankings go.
- Check ships with a paste-parser and gives one confidently wrong answer that someone quotes
  to a buyer.
- It is built to Phase 1 and then not maintained, at which point it is worse than the blog it
  replaced, because a stale blog post is dated and a stale register is not.

### 1.6 A naming problem the owner should decide

"The Register" collides with theregister.com, a well-known UK technology publication.
`site:crowagent.ai` searches are unaffected, but the unqualified phrase is not ownable.
Options: keep `/register` as the URL and use a qualified visible name such as **"the bid
register"** or **"the obligations register"**; or pick a different name entirely. The URL
`/register` is short, British, and evokes a statutory register, so the recommendation is
**keep the URL, qualify the visible name**. Owner decision, needed before Phase 1 copy.

---

## 2. What exists today (read, not assumed)

### 2.1 Content collections (`astro/src/content.config.ts`)

Five collections: `blog` (8), `compare` (4), `sectors` (4), `glossary` (2), `legal` (4).

Observations that shape the design:

- The schemas are **presentation-shaped, not fact-shaped.** `glossary` carries
  `sidebarKicker`, `sidebarTitle`, `sidebarBody`, `sidebarHref`, `sidebarCta`,
  `productCardBody`, `readMoreHref`, `readMoreLabel`, `readMoreBody`, `ctaHeading`, `ctaSub`.
  Eleven fields describing where text goes on screen and none describing what is true. Adding
  a third glossary term means writing eleven strings of chrome. This does not scale and is a
  large part of why there are only two of them.
- `blog` already models FAQ pairs in frontmatter specifically so the visible accordion and the
  JSON-LD are generated from one source and cannot drift. **That is the Register's argument
  already accepted and implemented at small scale.** The Register is the same move applied to
  figures instead of FAQs.
- `legal` bodies contain raw HTML inside `.md`, deliberately. So does `glossary`. Raw HTML in
  markdown bodies is an established pattern here, which matters for the `<Fig>` design below.

### 2.2 The one live tool

`astro/src/lib/ppn002.ts` is a pure function with an extensive header comment explaining that
the arithmetic is separated from the markup because this is "the only page on the site that
produces a NUMBER a user will quote to a buyer". It records two bugs fixed in the legacy
engine and is gated by a test that drives the legacy page and the Astro page with identical
inputs. It refuses to say "compliant" because that is the contracting authority's judgement.

**This file is the template for everything in the Register.** The Check engine should be
written to the same standard, in the same shape, in the same directory. Do not modify
`ppn002.ts` and do not change either of its two URLs.

### 2.3 Build gates

`astro/package.json` build chain:
`astro build` → `copy-assets` → `copy-cf-config` → `build-sitemap` → `check-links` →
`check-seo-parity` → `check-content-parity` → `check-csp`.

- **`check-csp.js`** walks built HTML and CSS, collects every absolute origin, and checks each
  against the relevant CSP directive. The live policy is
  `default-src 'self'; script-src 'self' 'unsafe-inline' https://crowagent.ai ...` plus legacy
  PostHog / Calendly / Turnstile / Railway origins the Astro build does not use. Self-hosted,
  bundled scripts are permitted. **Everything in this plan is client-side and self-hosted.
  Nothing here adds a third-party origin, and nothing here needs a backend.**
- **`build-sitemap.js`** walks `dist/` and reads each page's canonical link. **New routes are
  picked up automatically** provided the layout emits a canonical, which `Base.astro` does.
  No manual sitemap edit needed.
- **`check-links.js`** fails on any internal link that does not resolve to a built page, a
  built file or a `_redirects` rule. It carries a named `KNOWN_UNPORTED` list of four routes.
- **`check-content-parity.js`** compares Astro routes to the legacy `dist/` page that served
  the same URL, for headings, form controls and link targets, with a named `ALLOWED_LOSSES`
  list.

**Gap found while reading these, which this plan has to work around.**
`check-content-parity.js` and `check-seo-parity.js` both iterate the **Astro** routes and look
up the legacy counterpart. A route that is deleted from the Astro build entirely is never
iterated, so **neither gate can see a route that disappears**. `check-links.js` catches it only
if something still links to it, and a `_redirects` rule satisfies that check. Retiring
`/resources` therefore passes every gate silently today. Section 6 requires the redirect
explicitly and adds a named retired-routes list so the decision is printed on every build
rather than being invisible.

### 2.4 `_redirects` budget

81 rules currently. Cloudflare Pages honours roughly the first 109 (see
`project_cf_pages_redirects_limits_and_static_precedence`). This plan adds **one** rule.
Comfortable.

Two traps in the existing file that this plan routes around:

- `/tools/*/methodology → /tools 301` is a live splat. The PPN 002 methodology page only
  survives because two guard rules sit above it. Any new tool under `/tools/` with a
  methodology page needs its own guard rule first, in the right order.
- `/tools/*.js`, `*.mjs`, `*.json`, `*.py`, `*.sh` all rewrite to 404 as a security gate.
  Any new asset under `/tools/` with those extensions is unreachable.

Consequence: **put Check at `/check`, not `/tools/check`**, and name its methodology page
`/check/method`, avoiding the word "methodology" entirely under any splat.

### 2.5 Legacy `tools/` directory at repo root

Contains only `tools/index.html` and `tools/ppn-002-calculator/` (plus `methodology/`). **That
calculator was removed from the ASTRO build on 2026-08-04 and survives here only because this legacy
tree is the parity baseline `check-content-parity.js` compares against; both routes are recorded in
its `RETIRED_ROUTES`. So there is now nothing under legacy `tools/` left to port at all.** The
other four tools named in the CLAUDE.md file structure (Cyber Essentials Readiness, Late
Payment Calculator, CSRD Applicability Checker, VSME Materiality Light, MEES Risk Snapshot)
**are not on disk.** They were withdrawn on 2026-07-28 and exist only as an HTML comment on
the legacy tools page. There is nothing to port. Any plan that assumes four ported tools is
working from the spec, not from the repo.

---

## 3. Verdict on the original free-tools lead-gen model (REQ-B1 to REQ-B4)

Asked for plainly, so answered plainly: **most of it is dead, and the live parts contradict
the site as it now exists.**

| Requirement | Verdict | Why |
|---|---|---|
| **REQ-B1** universal 7-step funnel | **Dead, and would be a breach of a published promise.** | The funnel is: show summary, gate the PDF behind an email, enrol in a 14-day nurture sequence, end on a Stripe link. Both `/tools` and `/resources` state in writing, twice, "No account, no email gate, no credit card", and `resources.astro`'s own header comment records that as "a promise to keep: if a resource ever moves behind an email capture, the line has to change with it." Ironically REQ-B1's own anti-pattern list is right and its funnel is wrong. |
| **REQ-B2** shared technical foundation | **Architecturally void.** | Specifies Next.js 15 App Router, FastAPI on Railway, Resend, Supabase Storage and RLS tables, Redis, Cloudflare Turnstile, PostHog, slowapi rate limiting. The site is a static Astro build on Cloudflare Pages whose build **fails** if any third-party origin appears. Not one line of REQ-B2 is implementable without reversing that architecture. |
| **REQ-B3** shared PDF generation | **Dead.** | fpdf2 on a Railway background job. No backend exists. |
| **REQ-B4** shared SEO architecture | **Keep, and reuse.** | SoftwareApplication and FAQPage JSON-LD, canonical, OG/Twitter, a methodology page per tool, a 3 to 5 article content cluster, sitemap priority above blog. All of this is correct, all of it is already partly implemented, and it transfers to the Register unchanged. |
| **REQ-B5 to B10** the five tools | **Dead by the CrowMark-only rule.** | MEES funnels to a compliance product that no longer exists; Cyber Essentials to CrowCyber; Late Payment to CrowCash; VSME and CSRD to CrowESG. Four of five funnel to discontinued products. |
| **REQ-B6** PPN 002 calculator | **Superseded by what shipped.** | The shipped `ppn002.ts` is a 10% weighting-floor check on three inputs. REQ-B6 specifies a monetisation engine over twelve TOMs proxy values with a contract-value input and a four-page PDF whose narrative "STOPS MID-SENTENCE as conversion mechanic". Do not resurrect that: a deliberately truncated deliverable is a dark pattern, and on a site whose entire position is honesty and refusal it is disqualifying. |
| **REQ-B11** quality gates | **Keep as written.** | Lighthouse thresholds, WCAG 2.1 AA, keyboard navigation, 375px, tsc strict, E2E. All still binding. |
| **Part C.2** regulatory invariants | **Keep, and promote.** | This is the most valuable surviving section. It is already a register in prose: PPN 002 is 10% not 5%; published 13 Feb 2025, mandatory 1 Oct 2025, and 24 Feb 2025 is the Act's date and must not be attached to the PPN; MEES capped at £150,000; Band C 2028 is proposed, not law; CSRD Omnibus I needs **both** conditions; CE v3.3 auto-fails. **These become the seed assertions for the Register's own accuracy tests.** |

**Action:** mark REQ-B1, B2, B3 and B5 to B10 as SUPERSEDED in
`specs/platform-fixes-and-free-tools/requirements.md` with a pointer to this document. Do not
delete them; traceability matters and the reasoning above is the record of why. Keep B4, B11
and Part C live.

### 3.1 The Cyber Essentials question, tested rather than accepted

The brief's view was that the Cyber Essentials tool survives if reframed as bid qualification,
since security questionnaires are part of the Answer stage, and asked for that argument to be
tested. Tested, it half holds.

**What holds.** The *requirement* is unambiguously bid qualification. Cyber Essentials appears
in UK public SQ and PQQ documents as a pass/fail gate, and its private-sector analogues
(ISO 27001, SOC 2 Type II, CAIQ, SIG) are the single strongest market-neutral bridge in the
whole corpus. No certificate, no bid. It belongs in the Register.

**What does not hold.** The *tool* should not come back.

- The original spec's own risk list says the question wording "needs IASME-accredited reviewer
  sign-off before launch" and that CrowAgent is not an accredited Certification Body
  (INFRA-15 open). That was never resolved; the tool was withdrawn instead.
- A 20-question self-assessment producing a "readiness band" is an accreditation-adjacent
  artefact. Publishing one without the reviewer sign-off the spec itself demanded reintroduces
  a known, named, unclosed risk.
- Its purpose was to be the front door to CrowCyber. CrowCyber is discontinued. Rebuilding the
  front door to a demolished building is not a reframe, it is nostalgia.

**Recommendation: the requirement survives, the tool does not.** Five Register entries deliver
the same bid-qualification value with none of the accreditation exposure, and they are among
the entries that make the corpus market-neutral rather than UK-public-only:

- Cyber Essentials certificate held and in date (trigger: UK public SQ, many UK private)
- Multi-factor authentication on administrative and cloud accounts
- Security updates applied within 14 days
- ISO 27001 certificate requested (trigger: global private, enterprise procurement)
- SOC 2 Type II report requested (trigger: global private, US-headquartered buyers)

Each carries `askedAs` (the actual SQ or questionnaire wording), `evidence` (certificate
number, scope statement, audit report and date) and `cannotTell` ("whether your certificate's
scope covers the systems this contract will use"). That is more useful to a bidder than a
score out of 100, and it makes no claim about certification.

---

## 4. Content model

This is the load-bearing section. Get it wrong and it is a blog with extra steps.

Four new or changed collections. All plain markdown with YAML frontmatter, loaded with the
existing `glob()` loader, validated with Zod, using Astro 5 `reference()` for relations.

### 4.1 `sources` — cited works, described once

Separate collection rather than inline strings, for three reasons: the same PPN is cited by
many entries and must have one spelling; a source needs its own `retrievedOn` date
independent of any entry's; and it lets `/register/sources` exist as a bibliography, which is
a credibility artefact in its own right.

```
src/content/sources/<slug>.md
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `citation` | string | yes | The exact human-readable string rendered everywhere. One spelling, one place. |
| `publisher` | string | yes | e.g. "Cabinet Office", "legislation.gov.uk", "Cloud Security Alliance". |
| `url` | string (url) | yes | Absolute. External. |
| `kind` | enum | yes | `statute` \| `statutory-instrument` \| `policy-note` \| `guidance` \| `standard` \| `directive` \| `framework` \| `survey` \| `dataset` |
| `jurisdiction` | enum | yes | `uk` \| `eu` \| `us` \| `international` |
| `publishedOn` | date | no | Null only where the source genuinely carries no date. |
| `retrievedOn` | date | **yes** | The date a human opened it. This is the anti-OA-27 field. |
| `note` | string | no | Sampling, scope, caveats. Used for things like "100 SME members, 2023". |

**Rule:** `retrievedOn` is required and has no default. A source nobody has opened cannot be
cited. OA-27 records a wrong attribution surviving a first pass precisely because search
summaries were trusted over opening the document.

### 4.2 `register` — the entries

```
src/content/register/<slug>.md
```

Slugs are stable public URLs and are never renamed. Format: `<market>-<instrument>-<topic>`,
e.g. `uk-pa2023-s52-kpis`, `global-soc2-type2-report`.

**Identity and classification**

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | Written from the supplier's side: "Publish at least three KPIs", not "Section 52". |
| `shortTitle` | string | yes | For table rows and chips. |
| `obligationType` | enum | yes | `publish` \| `certify` \| `evidence` \| `declare` \| `assess` \| `report` \| `weight`. **This is the market-neutral spine.** Browse groups by it. |
| `stage` | enum | yes | `qualify` \| `answer` \| `deliver`. Maps to the bid lifecycle and is portable across markets. |
| `markets` | array of enum | yes, min 1 | `uk-public` \| `uk-private` \| `eu-public` \| `global-private`. Directly answers OA-25: the schema cannot express a UK-only corpus without saying so on every entry. |
| `status` | enum | yes | `in-force` \| `proposed` \| `superseded` \| `withdrawn` |
| `inForceFrom` | date | conditional | Required when `status` is `in-force`. |
| `inForceNote` | string | conditional | **Required when `status` is `proposed`.** This is the MEES "Band C 2028 was withdrawn" defect class turned into a schema constraint. |
| `supersededBy` | reference(`register`) | conditional | Required when `status` is `superseded`. |

**Trigger: prose and predicate, from one place**

```yaml
trigger:
  summary: "Public contracts with an estimated value over £5 million."
  predicate:
    markets: [uk-public]
    minValueGbp: 5000000
    buyerTypes: [central-government, nhs, local-authority]
```

`predicate` is a **closed** schema. Every key is enumerated in the Zod object and the object is
`.strict()`, so an author cannot invent `minValueEur` and have it silently ignored by the Check
engine. The full key set for Phase 1:
`markets`, `buyerTypes`, `minValueGbp`, `maxValueGbp`, `minDurationMonths`,
`involvesPersonalData`, `involvesSubcontracting`, `isFrameworkOrDps`, `supplierHeadcountMin`.

**Rule that prevents the third wrong-figure defect of the week:** every threshold exists as a
typed field. `trigger.summary` must not be the only place a number appears. The rendered
sentence "public contracts over £5 million" is generated from `minValueGbp`, so there is
exactly one £5,000,000 in the codebase for this entry, exactly as `FLOOR_PCT = 10` is the only
10 in `ppn002.ts`.

**Substance**

| Field | Type | Required | Notes |
|---|---|---|---|
| `requirement` | string | yes | What the supplier must actually do. |
| `cadence` | enum | yes | `once` \| `at-award` \| `annual` \| `every-12-months` \| `on-termination` \| `on-change` \| `continuous` |
| `askedAs` | string[] | yes, min 1 | The question a buyer actually puts in an SQ, ITT or questionnaire. **The differentiator.** |
| `evidence` | string[] | yes, min 1 | What answers it. Certificate numbers, published KPI tables, audit reports, named policies. |
| `commonError` | string | no | What bidders get wrong. High editorial value and the strongest long-tail search surface in the corpus. |
| `cannotTell` | string[] | **yes, min 1** | What this entry cannot determine for you. Feeds the Check refusal block. **No entry may exist without declaring a limit.** |

**Provenance and freshness**

| Field | Type | Required | Notes |
|---|---|---|---|
| `sources` | array of `{ source: reference('sources'), locator: string }` | **yes, min 1** | `locator` is the section, paragraph or clause. An entry with no source is unrepresentable. |
| `verifiedOn` | date | yes | When a human last checked this entry against its sources. |
| `verifiedBy` | string | yes | `Crow Agent`. Present so the field exists when there is more than one reviewer. |
| `reviewCadence` | enum | yes | `quarterly` \| `annual` |
| `staleAcknowledged` | `{ until: date, reason: string }` | no | The named escape hatch. Downgrades a build failure to a warning until the date. Same contract as `KNOWN_UNPORTED`: printed on every build, must be defended, set can only shrink. |
| `history` | array of `{ on: date, change: string, source: reference('sources') \| null }` | no | Drives `/register/changes` and `changes.xml`. |

**Relations**

| Field | Type | Notes |
|---|---|---|
| `relatedEntries` | reference(`register`)[] | Symmetry is asserted by a build check, not by hand. |
| `glossaryTerms` | string[] | Term names matching `/glossary` index entries. Gives 21 currently dead terms a destination. |

**Zod refinements that must exist** (the schema is the gate; these are not optional polish):

1. `sources.length >= 1`
2. `cannotTell.length >= 1`
3. `askedAs.length >= 1` and `evidence.length >= 1`
4. `status === 'proposed'` implies `inForceNote` is a non-empty string
5. `status === 'in-force'` implies `inForceFrom` is set
6. `status === 'superseded'` implies `supersededBy` is set
7. `predicate` is `.strict()`
8. Any entry with `markets` containing only `uk-public` is permitted, but the **corpus-level**
   check in section 7 fails if fewer than 40% of entries are non-UK-public. OA-25 is enforced,
   not hoped for.

### 4.3 `corrections` — the public refusal ledger

```
src/content/corrections/<yyyy-mm-dd>-<slug>.md
```

| Field | Type | Required |
|---|---|---|
| `on` | date | yes |
| `claim` | string | yes — the figure or statement as it was published |
| `where` | string | yes — the page or component it appeared on |
| `finding` | enum | yes — `unsourced` \| `wrong-source` \| `wrong-figure` \| `fabricated` \| `superseded` |
| `action` | enum | yes — `removed` \| `replaced` \| `qualified` |
| `replacement` | string | no |
| `sources` | array of reference(`sources`) | no |
| `reference` | string | no — the internal tracker id, e.g. `OA-27` |

Body: what happened and why, in plain English.

Four entries are already available from this week and should seed it: OA-26 (a published post
attributed the s.71 duty to s.52), OA-27 (three homepage figures unsourced, plus the wrong
techUK attribution made while investigating it, which is itself the best entry in the set),
OA-29 (two pages describing the wrong social value model under the right model's name), and
the fabricated £27,000 constant.

**Rule:** entries are append-only. A correction is never edited except to add a follow-up.
Editing a corrections ledger destroys the only thing it is for.

### 4.4 `blog` — extended, not replaced

**Do not rename the collection, the directory or any filename.** Entry ids derive from
filenames, `/blog/<id>` is the live route, and eight of those URLs are in the sitemap.

Added fields, all optional so the existing eight posts keep building:

| Field | Type | Notes |
|---|---|---|
| `covers` | reference(`register`)[] | Entries this article explains. |
| `allowedFigures` | array of `{ value: string, source: reference('sources'), note: string }` | Figures in the body that are not owned by a covered entry, e.g. a survey percentage. Cited here so the body can reference them. |

The article page then renders, generated rather than written:

- a "Duties this article covers" panel from `covers`;
- a "Last verified" line taken from the **minimum** `verifiedOn` across covered entries, so an
  article cannot present currency its underlying entries do not have;
- a stale banner when any covered entry is past its review cadence.

**Be honest about what this does and does not achieve.** It stops the article's *metadata* and
its *duty panel* drifting from the rules. It does not by itself stop a sentence in the body
being wrong. That is what `<Fig>` is for.

### 4.5 `<Fig>` — the mechanism behind "cited or visibly an example, no third option"

The constraint is that every figure is either cited to a named source or visibly an example.
Enforcing that requires figures to be machine-identifiable in article bodies.

**Recommended implementation, matching the grain of this repo.** Bodies stay plain `.md`.
Figures are written as raw HTML spans, which `legal` and `glossary` bodies already do:

```html
<span data-fig="entry:uk-pa2023-s52-kpis#threshold"></span>
<span data-fig="source:techuk-govtech-sme-2023" data-value="52.6%"></span>
<span data-fig="example">£27,000</span>
```

A rehype plugin in `astro.config.mjs` rewrites these at build time into the rendered figure
plus its citation affordance. There is direct precedent: `rehypeFocusablePre` is already a
hand-written six-line tree walk in that file, added rather than pulling in a dependency.

- `entry:` figures render the value **from the register entry's typed field**. The number is
  never retyped into prose, so it cannot drift, and correcting the entry corrects every
  article at once.
- `source:` figures render the value with a visible citation from the `sources` collection.
- `example` figures render with a visible "example" marker and are excluded from all
  structured data.

**The gate** (`check-figures.js`, Phase 4): scan rendered article HTML for currency amounts,
percentages, and bare integers above a threshold that are **not** inside a `data-fig` element.
Fail on each. Carry a named `ALLOWED_BARE` suppression list with a reason per entry, on
exactly the `ALLOWED_LOSSES` contract: printed every build, must be defended, can only shrink.

Realistic caveat: the first run over eight long posts will produce a large list, and reading
years, section numbers and list counts as figures will be the main source of noise. Budget for
a tuning pass. The alternative, adding `@astrojs/mdx` for real components in content, is a
legitimate option but is a new dependency and an architectural change that would need an ADR
alongside the three that already exist.

### 4.6 Why this is not a blog with extra steps

Concretely, the four things a markdown blog cannot do that this can:

1. **An entry without a source cannot be committed.** Zod `.min(1)` on `sources`.
2. **A threshold exists once, as a number.** Prose is generated from it. Correcting an entry
   corrects the browse table, the entry page, the Check result, every article that covers it,
   and the JSON-LD, in one edit.
3. **A stale entry changes the site's behaviour automatically.** It banners itself, it is
   excluded from Check's positive assertions, and past a grace period it fails the build.
4. **Every entry is forced to declare what it cannot tell you.** The refusal is structural
   rather than a footer disclaimer, and it composes: a Check result's refusal block is the
   union of the `cannotTell` arrays of the entries it matched.

---

## 5. Routes

| Route | Status | Notes |
|---|---|---|
| `/register` | **new** | Browse. Server-rendered table, grouped by `obligationType`. Filters are progressive enhancement over static markup so it works and indexes with JS off. |
| `/register/<slug>` | **new** | Entry detail. `askedAs`, `evidence`, `commonError`, `cannotTell`, sources, verified-on, history. |
| `/register/sources` | **new** | Bibliography. Every cited work with publisher, date published, date retrieved. |
| `/register/changes` | **new** | Change feed from `history[]` across all entries, newest first. |
| `/register/changes.xml` | **new** | Same as RSS. The site already publishes `changelog.xml`, so the pattern exists. |
| `/check` | **new** | The questionnaire. Top level, **not** under `/tools`, to avoid the `/tools/*/methodology` splat and the `/tools/*.js` 404 gate. |
| `/check/method` | **new** | How the questionnaire decides. Deliberately not named "methodology". |
| `/corrections` | **new** | The refusal ledger. |
| `/blog`, `/blog/*` | unchanged | 8 URLs, unchanged, still the ranking surface. |
| `/glossary`, `/glossary/*` | unchanged | 23 index terms, 2 detail pages. Detail-page sidebars become generated from register relations. |
| `/compare`, `/compare/*` | unchanged | Commercial pages, not register material. Each gains one link into `/register`. |
| `/sectors/*` | unchanged | Out of scope. |
| `/tools`, `/tools/tender-compliance-matrix` | **URLs unchanged** | `/tools` is reframed as a short "free, ungated" index listing the free tool, `/check` and `/register`. |
| ~~`/tools/ppn-002-calculator`, `/tools/ppn-002-calculator/methodology`~~ | **REMOVED 2026-08-04, after this plan was written** | This row read *"The calculator and its methodology page are not touched"*, which the owner overtook: *"remove PPN 002 calculator page completly also with redirects"*, because the tool was not giving any value. Both URLs now 301 to `/glossary/ppn-002`. **This is the second URL death in this plan, so the line below is no longer true as written.** Any part of the plan that assumed a live calculator needs re-reading before it is executed. |
| `/resources` | **301 → `/register`** | The only URL death in this plan. |

**Structured data.** Register entry pages emit `BreadcrumbList` plus a `DefinedTerm` or
`Article`, whichever survives `check-seo-parity`. `/register` emits `ItemList` generated from
the collection, exactly as `/tools` already generates its `ItemList` from the `TOOLS` array so
a withdrawn item cannot linger in the schema. `/check` emits `WebApplication`, mirroring the
calculator, and `FAQPage` per REQ-B4.

---

## 6. Migration, and the URL guarantee

**No URL is lost.** One redirect is added and nothing else changes.

| Asset | Fate | Detail |
|---|---|---|
| 8 blog posts | **Kept, absorbed as views** | URLs, titles, descriptions and FAQPage blocks unchanged. Add `covers`. Three posts (`ppn-002-social-value-guide`, `procurement-act-2023-sme-guide`, `regulatory-updates-2026`) have their factual spine extracted into entries and their bodies edited to reference rather than restate. |
| `regulatory-updates-2026.md` | Kept, repurposed | Its subject *is* the change feed. Keep the URL; rewrite it to render `/register/changes` content rather than a hand-maintained list that goes stale by definition. |
| `social-value-portal-vs-crowmark.md` | Kept, flagged | It is a compare page living in the blog collection. Misfiled, but the URL is live and indexed. Leave it. Noted so nobody "tidies" it later. |
| 4 compare pages | **Kept unchanged** | Add one link each into `/register`. |
| 2 glossary detail pages | **Kept unchanged** | Their eleven hand-written sidebar strings become generated from the entry a term maps to. This is the fix for why there are only two of them. |
| 23 glossary index terms | **Kept unchanged** | About twelve gain a real destination via `glossaryTerms` on entries, without inventing 21 thin pages. |
| `/tools` index | **Kept, rewritten** | Same URL. Stops being a hub for one item. |
| PPN 002 calculator + methodology | **Untouched** | Both URLs, both tests, the pure function, the "never say compliant" rule. Linked from its register entry as the deep dive. Do not refactor it into the Check engine. |
| `/resources` | **Retired, redirected** | 301 to `/register`. It is not in `sitemap.xml`, which lowers the risk. |
| Withdrawn tools | **Stay withdrawn** | Nothing to port; not on disk. Their requirements become entries per section 3.1. |

**Gates that must be satisfied, explicitly.**

1. `check-links.js`: `/resources` is linked from the footer and elsewhere. Adding the
   `_redirects` rule satisfies it, since a redirect counts as resolving.
2. **The blind spot found in section 2.3:** neither parity gate sees a deleted route. Add a
   named `RETIRED_ROUTES` map to `check-content-parity.js`, seeded with
   `'/resources' → 'merged into /register, 301 in _redirects, 2026-08-xx'`, and have the gate
   assert that each retired route (a) is absent from the Astro build and (b) has a
   `_redirects` rule. Same contract as `ALLOWED_LOSSES`: printed every build, can only shrink.
3. `check-seo-parity.js`: every new route has no legacy counterpart, so nothing can be
   MISSING. New routes must still carry title, description, canonical, OG and JSON-LD or they
   will show as thin against the site's own standard.
4. `build-sitemap.js`: automatic, provided every new page emits a canonical.
5. `check-csp.js`: nothing here loads a third-party origin. Use bundled scripts, not inline
   `<script>` blocks, so no CSP hash or nonce work is needed.
6. `_redirects` ordering: the new rule is a plain single-path 301 and does not interact with
   the `/tools/*` splats. It goes in the redirects block, not the guard block.

---

## 7. New build gates

Two new scripts, chained after the existing four. Both **fail** the build. A gate that only
prints is a gate that gets ignored; `check-links.js` says so in its own header comment.

### 7.1 `check-register.js`

- Every entry resolves all `sources` references and all `relatedEntries` references.
- `relatedEntries` is symmetric: if A lists B, B lists A.
- Every `predicate` key is in the closed enum set.
- Every `glossaryTerms` value matches a term on the `/glossary` index.
- Corpus composition: **fails if fewer than 40% of entries have a market other than
  `uk-public`.** This is OA-25 enforced by the build rather than by intention.
- Regulatory invariants lifted from `requirements.md` Part C.2, asserted against the corpus as
  unit tests: PPN 002 weighting is 10 and never 5; PPN 002 `inForceFrom` is 2025-10-01 and its
  published date is 2025-02-13; 2025-02-24 never appears attached to PPN 002; MEES exposure
  never exceeds £150,000; anything MEES Band C 2028 is `status: withdrawn`; anything MEES
  Band B 2031 is `status: proposed` with an `inForceNote`; CSRD Omnibus I requires both
  conditions. These are the specific claims this codebase has got wrong before.

### 7.2 `check-freshness.js`

For each entry, `age = today - verifiedOn`, compared against `reviewCadence`
(quarterly = 92 days, annual = 366 days).

| State | Condition | Behaviour |
|---|---|---|
| Fresh | `age <= cadence` | Nothing. |
| **Due** | `cadence < age <= 2 × cadence` | Build passes, prints a named line per entry. The **entry page and every article covering it render a visible "Last verified <date>, due for review" banner, automatically.** Not a silent state. |
| **Stale** | `age > 2 × cadence`, or `age > 180 days` for quarterly entries | **Build fails**, unless `staleAcknowledged.until` is in the future, in which case it prints a named line with the stated reason. |

Site behaviour when an entry is Due or Stale, which is where the refusal machinery earns its
keep:

- The entry **stays published**. Removing it breaks a URL and hides the problem.
- The banner is generated from the date. Nobody has to remember to add it.
- **Check excludes Due and Stale entries from every positive assertion.** They appear in the
  result under "we have not re-verified these, check the source yourself", with the source
  link. A stale fact degrades into a refusal rather than into a wrong answer.

`staleAcknowledged` exists because a failing gate blocks deploys of unrelated work, and a gate
that can only be satisfied by doing research right now will eventually be deleted by someone
under deadline. It is deliberately dated, deliberately requires a reason, and is deliberately
printed on every build.

---

## 8. Phasing and effort

Effort is engineer-days for one person in this repo, with its gates. **Entry authoring
dominates and is research, not engineering.** Two to three hours per entry is realistic when
the standard is "open the primary source and read it", which OA-27 demonstrates is not
optional here.

### Phase 1 — the Register, browse only, plus the corrections ledger. **4 to 6 days**

Shippable and genuinely useful on its own. No Check, no article changes.

- `sources` and `register` collections with the full schema and all eight refinements.
- **12 entries.** Suggested mix, which satisfies the 40% non-UK-public rule at 5 of 12:
  Procurement Act 2023 s.52 (KPIs), s.71 (assess and publish at least every 12 months and on
  termination), PPN 002 (10% minimum weighting), PPN 017 (AI disclosure), a UK modern slavery
  statement duty; EU Directive 2014/24 Art. 67 and Art. 70; Cyber Essentials certificate,
  MFA on admin and cloud accounts, 14-day patching; ISO 27001 certificate requested; SOC 2
  Type II report requested.
- `/register`, `/register/<slug>`, `/register/sources`.
- `corrections` collection and `/corrections`, seeded with the four known corrections.
- `check-register.js` and `check-freshness.js`.
- `/resources` 301, `RETIRED_ROUTES` in `check-content-parity.js`, `/tools` index rewrite.
- Nav and footer entries.

Breakdown: schemas and refinements 0.5 · 12 entries researched, written and sourced 2 to 3 ·
pages 1 · two gates 0.75 · corrections 0.25 · redirects, nav, parity 0.5.

**Why corrections ships here rather than later:** it costs a quarter of a day and it is what
makes publishing ~100 new factual assertions survivable. Given three wrong-figure defects in
one week, launching a factual corpus without a correction mechanism already in place is the
wrong order.

### Phase 2 — Check. **3 to 4 days**

- `src/lib/check.ts`: a pure function, written to the `ppn002.ts` standard, evaluating an
  answer set against every entry's `predicate`. No DOM, no fetch, fully unit tested. It must
  never assert compliance, for the same reason `ppn002.ts` refuses to say "compliant".
- `/check`: eight closed questions. Market, buyer type, contract value band, duration band,
  framework or DPS, personal data, subcontracting, supplier size band.
- Result: triggered obligations grouped by `stage`; a **"What this cannot tell you"** block
  built from the union of matched `cannotTell` values, given equal visual weight to the
  answers; a separate "not re-verified" section for Due and Stale entries.
- Shareable result encoded in the URL fragment. Client-side only, no storage, no cookie, no
  consent banner needed, no CSP change.
- `/check/method`.
- Bundled script, not inline. Full result renders without JS as a static "answer these on
  paper" fallback, so it indexes.

### Phase 3 — change feed. **1 to 2 days**

`history[]` rendering, `/register/changes`, `/register/changes.xml`, and rewriting
`/blog/regulatory-updates-2026` to sit over it.

### Phase 4 — articles over the Register. **3 to 5 days**

`covers` and `allowedFigures` on `blog`; generated duty panels; generated verified-on and
stale banners; the `data-fig` rehype plugin; `check-figures.js`; retro-fitting the eight
existing posts. Highest risk of gate noise; budget a tuning pass on the suppression list.

### Phase 5 — optional experiments, only after 1 to 4 hold. **3 to 5 days**

- Glossary absorbed as a facet of the Register rather than a fourth collection, if and only if
  all `/glossary/*` URLs survive.
- `llms.txt` and `llms-full.txt` generated from the Register. The site already publishes both.
  A machine-readable obligations corpus with sources and dates is a strong visibility play and
  costs almost nothing once the corpus exists.
- Paste-a-notice **pre-filler**: extract candidate signals from pasted text, pre-fill the
  questionnaire, and require the user to confirm each one. Never produces an answer directly,
  and says so on screen.

**Total: 14 to 22 days.**

---

## 9. Risks

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | **Entries are wrong on launch.** ~100 new assertions from an operation with three wrong-figure defects this week. | **Highest** | 12-entry cap; `retrievedOn` required per source; primary sources opened and read, never search summaries; corrections ledger live from day one; Part C.2 invariants asserted as build-time tests. |
| R2 | **Decay.** A register is an asset only while current. | High | `check-freshness.js` with automatic banners, automatic exclusion from Check, and a build failure past grace. `staleAcknowledged` is dated, reasoned and printed. |
| R3 | **Corpus outgrows the review budget.** | High | **Hard rule: the number of entries is bounded by what one person can re-verify at their stated cadence.** 12 quarterly entries is about 4 per month, roughly 2 hours. 60 is not affordable and must not be attempted. Adding an entry past the cap requires either retiring one or moving entries to annual cadence, consciously. |
| R4 | **SEO regression.** | High | Articles keep their URLs, titles, descriptions and FAQPage blocks. `check-seo-parity` continues to gate. One redirect total. `/resources` is not sitemapped. |
| R5 | **Check gives a confidently wrong answer.** | High | Deterministic questionnaire, not a parser; pure function with unit tests; never asserts compliance; refusal block given equal weight; stale entries excluded from positive assertions. Paste-parsing deferred to Phase 5 and framed as a pre-filler. |
| R6 | **Market neutrality slips back to UK-only** (OA-25). | Medium | `obligationType` spine; `markets` required on every entry; **build fails below 40% non-UK-public**. |
| R7 | **Register cannibalises the articles.** | Medium | Stated as a design constraint. Entry titles are written from the supplier's side, never as section numbers, so they do not compete with the articles for the same query. |
| R8 | **`check-figures.js` is too noisy and gets disabled.** | Medium | Ship it in Phase 4, after the corpus is stable. Named suppression list with a reason per line. If the list is not shrinking after two passes, the gate is wrong and should be narrowed to currency and percentages only. |
| R9 | **A discontinued product reappears** through Cyber Essentials or CSRD content. | Medium | Entries carry no product funnel. Every CTA in the Register goes to CrowMark or to `/contact`. Nothing named CrowCyber, CrowCash, CrowESG, CSRD Checker or Core appears anywhere. |
| R10 | **Build fails and blocks unrelated deploys** because an entry aged out. | Medium | `staleAcknowledged` with a 30-day dated window, plus a Due tier that warns and banners before anything fails. |
| R11 | **Effort for a site with no measured demand.** RULE 0 money discipline applies. | Medium | Phase 1 is about 5 days and stands alone. The commercial argument is explicit: this company cannot use customers, logos, testimonials or win rates, so provenance is the substitute for social proof, and provenance requires structure. If that argument is not accepted, do not build Phase 1 either. |
| R12 | **Naming collision** with theregister.com. | Low | Keep `/register`, qualify the visible name. Owner decision before Phase 1 copy. |

### Who checks it, how often, and what happens when it goes stale

**Who:** the owner, as `verifiedBy: Crow Agent`. There is nobody else, and the plan is sized on
that basis rather than on an aspiration.

**How often:** quarterly for entries whose underlying instrument is live and moving
(Procurement Act sections, PPNs, Cyber Essentials versions); annual for stable standards
(ISO 27001, SOC 2, EU directives). At 12 entries that is roughly 4 re-verifications a month.

**What happens when it goes stale:** the entry stays up, banners itself as unverified,
disappears from Check's positive assertions and reappears under "we have not re-verified
these", and past twice its cadence the build fails until someone either re-verifies it or
signs a dated, reasoned acknowledgement that prints on every subsequent build.

---

## 10. Decisions needed from the owner before Phase 1

1. **Name.** Keep `/register` as the URL; what is the visible name, given the theregister.com
   collision?
2. **Retire `/resources`** to a 301 into `/register`. It is the only URL death in this plan.
3. **Entry cap and review cadence.** Confirm 12 entries and the quarterly/annual split, and
   confirm the commitment to about 2 hours of re-verification per month. If that commitment is
   not real, build Phase 1 with 6 entries instead of 12, not 12 entries with no review.
4. **Corrections ledger goes public.** It publishes our own errors, by date, permanently. This
   is the highest-upside and highest-exposure item in the plan and needs an explicit yes.
5. **Cyber Essentials.** Confirm the requirement returns as register entries and the
   20-question readiness tool does not, per section 3.1.
6. **REQ-B1, B2, B3 and B5 to B10 marked SUPERSEDED** in
   `specs/platform-fixes-and-free-tools/requirements.md`.
