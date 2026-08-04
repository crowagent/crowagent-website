# Owner register — everything reported, and what happened to it

Owner instruction, 2026-08-03: *"you must keep track of all the issues i reported
and all the enhancements."*

**This file is the record. It is updated the moment something is reported, not at
the end of a session.** `OWNER-ACTIONS.md` holds items that need an owner
DECISION; this holds everything the owner has ASKED FOR, decided or not, so
nothing depends on my memory of a conversation.

Status: ✅ done · 🔨 in progress · ⏸ on hold by the owner · ❓ needs a decision

---

## Binding working-style directives

| # | Directive | Date |
|---|---|---|
| **W1** | **Enforce centrally and automatically, never by manual patching.** *"mostly things must be forced centrally and automated way not the manual patching"* | 2026-08-03 |
| **W2** | *"adopt similar"* means **style and design only** — everything else stays as the current build | 2026-08-03 |
| **W3** | British English throughout | standing, restated 2026-08-03 |
| **W4** | Keep the terminal clean; it is for decisions. Use background agents and parallel execution where there is no conflict | 2026-08-03 |
| **W5** | Keep this register current | 2026-08-03 |

**W1 is the one I have broken most.** The centring fix was eleven hand-edits
across seven files before a gate went in behind it, and the page-header decision
was propagated by copying a comment into ten files. Both are recorded below as
the defects they were.

---

## Reported issues and enhancements

| # | What was reported | Status | Where it landed |
|---|---|---|---|
| **1** | Seven interactions lost since 26 July: magnetic hover, product carousel, micro-animations, shiny button, glassmorphism, ambient motion, scroll progress | ✅ | 8 gates green, browser checks 21/21 and 10/10 |
| **2** | Ambient drift **animated nothing** — found by a pixel check, not by review | ✅ | Percentage `background-position` is a no-op on a full-bleed gradient. Fixed and gated on the measured delta |
| **3** | 8 supplier + 8 buyer product screens in Figma, drawn not captured | ✅ | Approved: *"all the screens looks fine"* |
| **4** | Insights screen *"half done as just one bar chart"* | ✅ | Rebuilt from the real product route: KPIs, pipeline summary, quick stats, sector benchmarks |
| **5** | *"a lot of pages still has left aligned content"* | ✅ | 19 routes → 0. One cause: `max-width` with no `margin-inline: auto`. Gated in check-render.js |
| **6** | *"some pages headers are different"* — `/blog/` vs `/about/` | ❓ | `/about/` is correct. **10 independent header implementations across ~27 routes.** Gate designed, not yet built — see below |
| **7** | About: repeated content, overclaiming, facts to correct, lost animation | 🔨 | Proposal approved with four owner decisions. **Only the layout half is applied** |
| **8** | About: Mission/Vision/Values as cards; History beside Company details; digest in a card | ✅ | Legacy two-column layout restored, rail and sticky card included |
| **9** | British English not being followed | ✅ | `toward` ×8 across six files including a published blog post. Fixed, and `check-english.js` is now the ninth gate |
| **10** | `/partners/` Enquiry section: *"Why partner?"* and the form are different sizes | 🔨 | Measured: **619px apart**, the only such row on the site |
| **11** | `/contact/`: use the Figma screen instead of the screenshot | ✅ | Drawn screen shipped; caption corrected because *"screens from the live product"* over a drawing would be false |
| **12** | `/contact/`: *"Send a message"* as two parallel cards, form + how to reach us | ✅ | Two cards, equal height |
| **13** | *"all the Monthly digest must be in card"* | ✅ | Both instances, `/about/` and `/contact/` |
| **14** | `/roadmap/` *"needed further finishing like :8092/roadmap"* | 🔨 | Style and design only, per W2 |
| **15** | Homepage variant matching pre-26-July, for comparison | ⏸ | Pre-26 site served at **`:8110`**. Owner is deciding |
| **16** | Playwright specs and all test work | ⏸ | Held until the build is complete |
| **17** | *"why every pages has multiple times CrowAgent Ltd, Companies House No. 17076461"* — keep only where absolutely required | 🔨 | Measuring sitewide before touching anything |
| **18** | `/compare/` use the Figma screens instead of real screenshots | 🔨 | Doing all 11 remaining captures, not only /compare — half a swap recreates the OA-34 inconsistency |
| **19** | `/glossary/` filters *"All, Legislation, Procurement, Bidding process are not working"* | 🔨 | Reported 2026-08-03, not yet diagnosed |
| **20** | Page headings *"seems bvery dull"*; one white shiny style on every page except the homepage hero, per betterstack.com | 🔨 | Measured: **26 of 43 routes had no gradient at all**, five implementations. Token recipe fixed; treatment moved out of `Section.astro` into `styles/headings.css`; 8 source files converting |
| **21** | Text turning teal on hover on `:8095`, should match `:8092` | ❓ | Could not reproduce. Found instead that `::selection` exists on pre-26 (teal wash, white text) and is **absent** on Astro — likely what was seen. Needs the owner to confirm before I change it |
| **22** | `/pricing/`: *"why everything is visible by deafult if thats the case why we need the product switcher?"* — and adopt `:8092`'s design style | 🔨 | Reported 2026-08-03. Two defects in one report: the switcher filters nothing (functional), and the styling (per W2, style and design only) |

---

## Open, and what each needs

**#6 — the page-header gate.** Ten implementations, ~27 routes, propagated by
hand-copying a comment. The rule is one assertion: every route's `<h1>` sits
inside `.section__head`, which only the shared component emits. It **fails today
on 27 real routes** and passes on the 17 that use `Section`, so it is provable in
both directions without a fixture. The homepage hero is a genuine exception; the
other nine go on the debt list and print by name on every build until converted.
This is the W1 fix for #6 and it is not built yet.

**#7 — the About content.** Still on the page: *"built by bid practitioners"* ×3
including an `<h2>` and the meta description, the citation promise ×7, s.52/s.71
×16, and OA-33's *"a UK company"*. Owner decisions are recorded and the copy is
not written.

**Three facts on /about still need the owner** — *"multi-million pound"* (the
page's own rule forbids naming any project, so the biggest claim has the least
evidence), *"The founders"* plural with nobody named, and *"inside regulated
industries"* which nothing on the site supports.

---

## Standing risks, not yet actioned

- **`audit-screenshots/` is untracked in the deploy root** — the same publishing
  exposure as `Assets/screenshots v2.0/`. Needs an ignore rule or a move before
  the freeze lifts.
- **`/crowmark` is 108 KB against a documented 100 KB per-route budget.** It was
  already 99 KB before this work, so the doc's "largest 90 KB" is stale.
- **`npm run check` has never run** — no `.astro` file has ever been
  type-checked. Closing it means adding two devDependencies back.
- **None of the gates runs in CI.** They are real, provable, and ignorable.
