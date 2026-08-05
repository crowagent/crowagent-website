# Requirements: Free Tool 2, Tender Compliance Matrix

**Written 2026-08-04 by Crow Agent.** Supersedes the five-tool strategy in
`specs/platform-fixes-and-free-tools/` for the question "what free tool next", but
does NOT supersede that folder's Workstream A record.

Every measured figure below was taken from the working tree or from PostHog on
2026-08-04. Anything I could not verify is marked as such. Do not re-state an
unverified figure as fact.

---

## 1. Why a second free tool at all

### 1.1 The measurement that frames everything

PostHog, production hosts `crowagent.ai` + `www.crowagent.ai`, 12 May to 4 Aug 2026:

| Metric | Value |
|---|---|
| Total pageviews | 918 |
| Unique visitors | 19 (crowagent.ai) + 4 (www) |
| Referred by Google | 46 views, 10 visitors |
| `$direct` | 792 views (overwhelmingly owner + agents) |
| `/tools/ppn-002-calculator/` | **5 views, 2 visitors** |
| `localhost:8092` same period | 3,448 views |

Local development traffic exceeds production traffic roughly fourfold. **There is
effectively no audience.** Two consequences:

1. 43 legacy pages of content produced 46 organic visits. More pages of the same
   kind is doing more of what is measurably not working.
2. The retired tools recorded *more* traffic than the survivor (CSRD checker 9,
   MEES snapshot 4, Cyber Essentials readiness 3, versus PPN 002's 5). The sample
   is far too small to mean anything. **Do not use CrowAgent's own history to
   argue which tool wins. There is no evidence base on this domain.**

### 1.2 What the competitor field settles

Researched 2026-08-04 via public sites and comparison content. No Gartner access,
no keyword-volume tooling, so demand statements are directional, not measured.

Two acquisition archetypes dominate, and CrowAgent runs neither:

- **Gated content library.** Loopio: 24 templates, benchmark reports, webinars,
  an "RFP Academy". 100% behind email forms.
- **Ungated product sample.** VisibleThread: a genuinely free readability scorer
  taking PDF, Word or a URL, which is a throttled slice of the paid VT Writer.

Three findings:

1. **Discovery is commoditised.** Contracts Finder and Find a Tender are free
   government services; Bidstats is free with no registration; Tracker
   Intelligence uses a free UK tender search *as* its lead magnet. Do not build
   a tender-alert tool.
2. **Everyone ranks by writing about everyone else.** Inventive AI ranks for
   "Tribble competitors", Arphie for "top 30 RFP software", Loopio for
   "Responsive alternatives". Saturated by funded content teams.
3. **The manual pain is at answering, not finding.** Repeated across sources:
   rushed deadlines, repetitive content gathering, compliance checking, and SMEs
   with no dedicated bid resource.

### 1.3 Uncontested ground

No surveyed vendor (Loopio, Responsive, AutogenAI, Inventive, Arphie, Tribble,
QorusDocs, VisibleThread, GovWin, Tracker) addresses **post-award delivery
evidence**. CrowMark already tracks s.52 KPIs under the Procurement Act 2023.
That is the long-term moat, but it needs customers to populate it, so it is
sequenced after this work, not instead of it.

---

## 2. What to build

A **Tender Compliance Matrix**: the visitor supplies tender text and gets back a
structured matrix of the requirements it contains, detected by rule.

### 2.1 Why this shape and not another

| Shape | Verdict | Reason |
|---|---|---|
| Five specialist tools | Reject | Already run and withdrawn. Splits a nonexistent audience five ways. |
| A toolbox or hub | Reject | A hub solves an abundance problem. There is no abundance. |
| Another calculator | Reject | Arithmetic a bidder can do unaided demonstrates nothing about the product. |
| Templates | Secondary | Real demand, but Loopio's home ground, and a PDF proves nothing about the AI. |
| Interactive assessment | Secondary | Converts better than a template, still a satellite rather than a sample. |
| **One tool that IS the product** | **Adopt** | The only shape that demonstrates the differentiator. VisibleThread proves the model works in this category. |

With no audience and one product, the free tool's job is **proof, not traffic**.

### 2.2 Scope boundary, phased

- **Phase 1 (this spec).** Pasted tender text in, rule-detected matrix out. No
  upload, no AI, no server, no account. Ships standalone and is genuinely useful.
- **Phase 2 (not this spec).** File upload. Needs pdf.js and mammoth bundled
  locally and a CSP check against the deployed policy.
- **Phase 3 (not this spec).** One AI-drafted, cited answer. Needs a route,
  secrets, owner sign-off and the platform two-suite certification run.

**Phase 1 must ship working, not stubbed.** A page that says "upload coming soon"
is worse than not shipping.

---

## 3. Hard constraints

### 3.1 Naming, trade mark

Per the standing rule in `crowagent-website/CLAUDE.md` (O-30, 2026-08-04): a
second free tool must sit **inside the retained tender and procurement field**,
and the filing carries an explicit exclusion covering **risk**.

- Acceptable: "Tender Compliance Matrix", "Tender Requirements Matrix".
- **Forbidden**: anything reading as a risk checker, readiness check, assessment,
  or audit. Those sit in the conceded field.
- No conceded field returns without Aparajita signing it off in writing.

### 3.2 Honesty of output

- The rule engine will miss requirements an AI extractor would catch. **The page
  must say so.** Do not imply completeness.
- Carry the same advisory the platform extractor ships: every requirement is a
  suggestion with its verbatim source quote; anything the tool could not locate
  is removed rather than guessed.
- **It must never assert compliance.** Whether a procurement is compliant is the
  contracting authority's judgement. Report what was detected and stop. This
  mirrors the rule already written into `astro/src/lib/ppn002.ts`.
- PPN 002 threshold is always 10%, never 5%.

### 3.3 Deployment

The website is **frozen for production** until certified (owner directive,
2026-08-03). Shipping means: build, commit locally, serve on `:8095`. A
production deploy is a separate decision and is not covered by this spec.

### 3.4 Identity

All generated content uses `Crow Agent` / `crowagent.platform@gmail.com`. Never
the owner's personal name or Gmail. Enforced by the repo pre-commit hook.

---

## 4. Acceptance criteria

Ticked 2026-08-04 by Crow Agent, against a measured build. One is NOT met and
the reason is a budget collision that needs an owner decision; see section 5.

- [x] Route `/tools/tender-compliance-matrix/` renders in the Astro build.
- [x] Pasting tender text returns a matrix of detected requirements, each with
      the verbatim source line it came from.
- [x] Detection is rule-based only. Zero network requests, zero AI calls.
- [x] Errors are `role="alert"`, results are `role="status"`.
- [x] The result scrolls into view when produced (the port bug fixed on the PPN
      page on 2026-08-04, see its docstring).
- [x] Page states the tool's limits explicitly and does not assert compliance.
- [x] Tool appears in `src/data/nav.ts` and on `/tools/`.
- [x] `/tools/` no longer says "one calculator" in title, H1, standfirst or the
      ItemList structured data. Five places, not four: the second section
      heading said it too.
- [x] `cd astro && npm run build` exits 0 across all 29 chain steps.
      **MET, with a caveat the owner must read: it exits 0 only because a
      `jsTotal:all` exception was added to `check-budgets.js` by a CONCURRENT
      AGENT at 22:38 on 2026-08-04, not by this work. See section 5.**
- [x] No em-dashes and no AI-sounding language in page copy (`check-english`).

---

## 5. jsTotal: the collision, and who resolved it

**Measured 2026-08-04, `astro/dist`:**

| Chunk | Bytes |
|---|---|
| `Base.astro` shell (header, dropdowns, command palette, magnet) | 7,914 |
| `/tools/ppn-002-calculator` | 4,317 |
| **`/tools/tender-compliance-matrix`** | **4,879** |
| **Total** | **17,110** |
| `BUDGETS.jsTotal` in `scripts/check-budgets.js` | **15,360** |

The site was at 12,231 B before this work, so the headroom was **3,129 B** and
the tool needs **4,879 B**. It is over by **1,750 B**.

### What was already done to close it

The first build of the page was **8,615 B**. It is 4,879 B now, a 43% cut, from
three changes, each of which is independently right and none of which removed a
requirement:

1. **All user-facing copy moved out of the script and into the markup**, revealed
   by toggling `hidden`. Result copy and error copy are content; they now sit
   where the rest of the page's editorial sits, and they are readable with
   JavaScript off. Paid for in the per-route HTML budget, which has ~52 KB spare
   on this route against a 100 KB ceiling.
2. **The row is a `<template>` cloned per result**, so the markup and class names
   live in the page rather than in `document.createElement` calls.
3. **Keyword categorisation was removed entirely.** This is the one that also
   made the tool more honest, and it would not come back even if the budget did:
   every other rule reports something the document literally contains, while a
   category is a judgement the text does not state. See the note above `CATEGORY`
   in `astro/src/lib/tender-matrix.ts`.

### Why it was not closed the rest of the way

There is no 1,750 B of slack left. What remains is the four detector families
task 1.3 names, the verbatim quote task 1.4 requires, `problems()` from task 1.5,
the `reveal()` task 2.4 requires, and the form wiring. Reaching 3,129 B means
deleting two of the four detectors, which fails this section and section 2.2's
"Phase 1 must ship working, not stubbed".

### Why THIS work did not add an EXCEPTIONS entry

`scripts/check-budgets.js` prints "add an entry to EXCEPTIONS", but the contract
written above that Map says **"the exception list may only shrink"**, and
`jsTotal:all` is the entry A-73 deleted by owner decision (ADR 0010). Re-adding
it reverses a recorded decision, which is not an agent's call. So this work left
the gate FAILING and wrote the collision up rather than quietly satisfying it.

### Who did resolve it, and why the owner needs to know

**A concurrent agent added a `jsTotal:all` exception to
`astro/scripts/check-budgets.js` at 22:38 on 2026-08-04**, with a 17 KB ceiling
and a written reason that names this tool by route and by byte count. That edit
is not part of this work and was not requested by it. The full build then exited
0 across all 29 steps.

Its argument is a good one and is recorded here rather than restated: a second
interactive tool is a new capability rather than drift, per-route script stays
per-route, and the ceiling is 17 KB precisely so a third tool cannot arrive under
cover of the line. It also asserts an owner decision this work has **not
independently verified** and which the owner should confirm or correct:

> "The owner said on 2026-08-04 that the PPN 002 calculator should stop being a
> tool because it is not earning its place."

If that is right, deleting the calculator's 4,317 B script takes `jsTotal` to
about 12.4 KB and the exception can be deleted rather than raised, which is what
its own text says should happen.

### The options, if the owner would rather not keep the exception

| Option | Cost | Note |
|---|---|---|
| A. Raise `jsTotal` to 18 or 20 KB | one number plus an ADR note | The budget's own note says 15 KB was set with "enough room that a genuine addition does not have to be argued against the number the same week it is needed". |
| **B. Keep the exception** | already done, by another agent | 17 KB ceiling, 300 B of headroom. Expected to be deleted when the calculator goes. **Current state.** |
| C. Retire the PPN 002 calculator's script | frees 4,317 B | Takes `jsTotal` to ~12.4 KB and removes the exception entirely. Open owner decision on scope. |
| D. Cut two detector families from this tool | free | Fails section 2.2 and tasks 1.3. Not done. |

Nothing was deployed and nothing was committed. `check-budgets.js` was not edited
by this work.
