# Platform charter — CrowAgent.ai

**This is the governing document.** Where anything else in `specs/` conflicts with it, this wins and
the other document gets corrected.

Set by the owner, 2026-08-03.

---

## The directive

CrowAgent.ai is not a collection of web pages. It is the company's digital flagship, brand
platform, sales engine, SEO engine and AI-ready marketing platform. **Do not work in page-fix mode
or patch mode.** Every change must improve the whole platform, not the page being edited.

The bar is execution quality comparable to Stripe, Linear, OpenAI, Anthropic, Vercel, Notion and
Apple. Every implementation must move the repository measurably closer to that.

Operate as the long-term Chief Architect and Design System Owner, optimising for the platform's
future evolution rather than the fastest way to finish the current task.

---

## Platform first, pages second

Before changing any page, work out whether the issue should instead become a **design token, shared
component, shared layout, shared section, shared utility, motion primitive, SEO component, content
model, template or validation rule.** If a central solution is technically feasible, build that
instead of patching the page.

### Never implement

Page-specific fixes · one-off CSS · one-off JavaScript · local component variants · duplicate
layouts, metadata, animations or business logic · temporary workarounds · legacy compatibility
layers unless architecturally required.

### The test before any change

Does this strengthen the platform? Does it reduce technical debt? Can it become reusable? Does it
eliminate duplication? Does it simplify future development? Can future pages inherit it
automatically? **If not, redesign before implementing.**

---

## Honest position, 2026-08-03

Recorded plainly because the charter is worth nothing if it opens with a claim of compliance.

**The owner's criticism was correct.** Their words: *"I can see the same pain points and I am not
sure if you are doing things manually crafted, or following and enforcing centrally a design system
and best practices."* Almost every parity fix to that point had been a manual sweep — measure, fix,
drift, measure again — because nothing in the build asserted the rules. A violation and a deliberate
exception looked identical, so neither the next agent nor the next person could tell them apart.

**What is genuinely central already:** design tokens in `astro/src/styles/tokens.css`; one card
recipe in `surfaces.css`; the `Section` component owning measure, gutter, padding and the head
block; a motion grammar in tokens (`--m-beat` 600ms, `--m-cycle` 12s, three easing curves) with
cadence expressed as stations times beat; content collections for blog, compare, glossary, legal
and sectors; `Seo.astro` owning all metadata; four build gates that fail on links, SEO parity,
content parity and CSP.

**What is not, and is being fixed:** enforcement. `check-design-system.js` is in build now and must
fail on card content left-aligned without an explicit opt-out, headings off the four-size scale,
bordered blocks that are not the one card recipe, hardcoded hex or px, and heading-structure
violations. Same contract as the existing gates: named exceptions each carrying a reason, printed
every build, stale entries reported, anything not listed fails, and **it must be proved to fail
before it is trusted.**

---

## Governance documents — required, and their real status

| Document | Status |
|---|---|
| Architecture Vision | **MISSING** |
| Information Architecture | **MISSING** |
| Design System | `architecture/DESIGN-SYSTEM.md` + `DESIGN-TOKENS.md` |
| Component Library | **MISSING** — no inventory of what exists, so duplication is invisible |
| Content Architecture | **MISSING** — collections exist, the model is undocumented |
| Motion Standards | `architecture/MOTION-AND-INTERACTION.md` — **stale**, predates the motion grammar |
| Brand Guidelines | `branding/README.md` |
| Responsive Standards | **MISSING** — breakpoints are consistent by habit, not by rule |
| Accessibility Standards | `architecture/ACCESSIBILITY-STANDARDS.md` |
| SEO Standards | `architecture/SEO-STANDARDS.md` |
| Performance Budgets | **MISSING** — payload was the measured legacy defect and nothing guards it |
| Coding Standards | **MISSING** |
| Quality Gates | `architecture/TESTING-AND-QUALITY-GATES.md` — needs the two new gates adding |
| Migration Roadmap | Partly `MODERNISATION-ARCHITECTURE.md` |
| ADRs | Three exist. Several later decisions were never written up as ADRs. |

**Eight are missing and two are stale.** That gap is the reason the same pain points recur: the
rules live in agent briefs and commit messages rather than in documents anyone can check.

---

## Success criteria

The project is complete only when every page is built from shared architecture; every visual
decision originates in the design system; every content element originates in structured content;
every animation follows one motion system; every reusable pattern exists exactly once; technical
debt is actively reducing; future pages need minimal new code; **the platform enforces quality
automatically rather than relying on review**; and the site is production-ready, AI-ready, SEO-first
and highly maintainable **without increasing hosting cost**.

That last clause is load-bearing. The build currently loads **zero third-party origins** and is a
static Astro site on free hosting. Any proposal that adds a runtime service, a hosted asset or a
third-party script has to justify itself against it.

---

## Standing constraints that outrank convenience

- **Every figure is either cited to a named source or visibly marked as an example.** No third
  option. Three separate wrong-figure defects shipped in one week before this was enforced.
- **Everything correct and readable with no JavaScript**, before any animation. `prefers-reduced-motion`
  ships the final state with zero running animations.
- **Colour carries meaning:** teal verified, violet and orchid refused or flagged, cyan interactive.
  That governs markers; light, bloom and surface gradients take the full range.
- **Never claim win rates.** No fabricated customers, logos, testimonials or ratings.
- **CrowMark only.** Discontinued products never appear.
- **Market-neutral narrative, UK public as the proof point.**
- No em-dashes in user-facing text. £ only, UK spelling.
