# Platform charter: CrowAgent.ai

**This is the governing document.** Where anything else in `specs/` conflicts with it, this wins and
the other document gets corrected.

Set by the owner, 2026-08-03, and **restated and widened by them the same day** as the MASTER
TRANSFORMATION DIRECTIVE. Both are in force; the restatement is the fuller version.

## Two standing rules added with that restatement

**1. Nothing deploys to production until the bar is met AND certified.** Owner, 2026-08-03: *"nothing
must be deployed into production until we reach top 1% ultra premium and must certified."* This
**revokes** the earlier authorisation that permitted website production deploys. No push to the
deploying branch, no dashboard deploy, no rollback. Local commits and `:8095` continue: the freeze is
on production, not on work. Certified is not self-declared — it means every gate green, stated
numbers, and the owner signing off from renders.

**2. Compare against the DEPLOYED site, never against the legacy copy in this repo.** Three separate
attempts to match live's page background failed because they read `styles.css` and the pages served
on `:8092` instead of `https://crowagent.ai/`. The repo copy and the deployed site are not the same
thing, and the difference was structural rather than cosmetic: live paints one fixed full-viewport
wash at 0.08 to 0.10 alpha plus an animated starfield and four screen-blended orbs; this build had
two blurred circles at 0.82 alpha, no starfield, and violet and teal on the wrong sides. **When the
owner says "it differs from live", fetch live and sample pixels.** Guessing from the repo has now
cost four rounds.

**A third finding worth carrying:** the build shipped **zero `@font-face` declarations**, so every
visitor saw system fonts in place of all three brand families. Three separate mechanisms reported
success about it — `check-csp.js` verified `font-src 'self'` was permitted (true, and useless when
nothing requests a font), `copy-assets.js` copies only what the build references, and every developer
machine had the families installed locally. **A gate that cannot see absence is not a gate.**

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
and best practices."* Almost every parity fix to that point had been a manual sweep (measure, fix,
drift, measure again) because nothing in the build asserted the rules. A violation and a deliberate
exception looked identical, so neither the next agent nor the next person could tell them apart.

**What is genuinely central already:** design tokens in `astro/src/styles/tokens.css`; one card
recipe in `surfaces.css`; the `Section` component owning measure, gutter, padding and the head
block; a motion grammar in tokens (`--m-beat` 600ms, `--m-cycle` 12s, three easing curves) with
cadence expressed as stations times beat; content collections for blog, compare, glossary, legal
and sectors; `Seo.astro` owning all metadata; six build gates that fail on links, SEO parity,
content parity, design-system rules, CSP and regulatory facts.

**`check-facts.js` was added 2026-08-03** and is the only gate that reads source rather than
`dist/`, so it runs **before** `astro build`: a wrong date fails in a second instead of after a full
build, and it still runs when a build cannot. Its six rules are all errors this site published, not
errors someone imagined.

**What is not, and is being fixed:** enforcement. `check-design-system.js` is in build now and must
fail on card content left-aligned without an explicit opt-out, headings off the four-size scale,
bordered blocks that are not the one card recipe, hardcoded hex or px, and heading-structure
violations. Same contract as the existing gates: named exceptions each carrying a reason, printed
every build, stale entries reported, anything not listed fails, and **it must be proved to fail
before it is trusted.**

---

## Governance documents: required, and their real status

| Document | Status |
|---|---|
| Architecture Vision | `architecture/ARCHITECTURE-VISION.md`, written 2026-08-03 |
| Information Architecture | `architecture/INFORMATION-ARCHITECTURE.md`, written 2026-08-03 |
| Design System | `architecture/DESIGN-SYSTEM.md` + `DESIGN-TOKENS.md` |
| Component Library | `architecture/COMPONENT-LIBRARY.md`, written 2026-08-03. **§1 is the duplicate list** |
| Content Architecture | `architecture/CONTENT-ARCHITECTURE.md`, written 2026-08-03 |
| Motion Standards | `architecture/MOTION-AND-INTERACTION.md`, **rewritten 2026-08-03** for the motion grammar |
| Brand Guidelines | `branding/README.md` |
| Responsive Standards | `architecture/RESPONSIVE-STANDARDS.md`, written 2026-08-03 |
| Accessibility Standards | `architecture/ACCESSIBILITY-STANDARDS.md` |
| SEO Standards | `architecture/SEO-STANDARDS.md` |
| Performance Budgets | `architecture/PERFORMANCE-BUDGETS.md`, written 2026-08-03 |
| Coding Standards | `architecture/CODING-STANDARDS.md`, written 2026-08-03 |
| Quality Gates | `architecture/TESTING-AND-QUALITY-GATES.md`, **§12 added 2026-08-03**, all five `astro/` gates |
| Migration Roadmap | Partly `MODERNISATION-ARCHITECTURE.md` |
| ADRs | Three exist. Several later decisions were never written up as ADRs. **Still open.** |

**When this section was written on 2026-08-03, eight were missing and two were stale.** That gap
was the reason the same pain points recurred: the rules lived in agent briefs and commit messages
rather than in documents anyone could check.

**Status update, 2026-08-03.** The eight are written and the two are corrected. The table above
records what exists; it does **not** claim the repository now complies with them. Each new document
ends with an "Open, not decided" section listing what it could not determine, and each records where
the code disagrees with the ideal. The headline disagreements, all verified against the source:

- **The `astro/` build was failing its own design-system gate** when this was written (one
  unrecorded alignment violation), with **5 stale allow-list entries** and **9 named debt items**.
  Re-measured 35 minutes later the debt was **7** and the violation was gone, because another agent
  was actively clearing it. **Run the gate; do not quote these figures.**
- **None of the six `astro/` gates runs in CI.** No workflow in `.github/workflows/` mentions
  `astro` at all, so every one of them depends on somebody running the build. This is now the
  single largest hole in the enforcement story: the gates are real, provable and ignorable.
- **Seven files restate `Section.astro`'s rules rather than using it**; there are four hero recipes,
  five closing-CTA recipes, three hand-written `BreadcrumbList` blocks and two hand-written
  `FAQPage` blocks.
- **Breakpoints are not consistent by habit either:** 17 distinct width values, four of them one
  pixel from another.
- **`PartnerForm`'s submission to `formspree.io` is blocked by the shipped CSP**, silently, and no
  gate can see it. **Both halves updated 2026-08-03.** The block is real and was proved on the LIVE
  site, not just in the build: the origin was dropped from `connect-src` and `form-action` on
  2026-06-02, so partner enquiries have been discarded by the browser for two months (OA-31). The
  gate can now see it: `check-csp.js` reads `<form action>` against both directives, plus `fetch()`
  and dynamically-injected script URLs, and was proved to fail on each shape before being trusted.
  formspree.io is a named `KNOWN_BLOCKED` entry so it prints on every build until the owner settles
  it. Restoring a US processor to the CSP is a decision, not a gate's call.
- **Six of the standing constraints below have no gate at all**, and 15 em-dashes are in visible
  text today.

The remaining gap is now **ADRs**, and it is closing. ADR 0004 records the scroll-driven arrival
and ADR 0005 records the colour semantics, which absorbed the amber fourth mark and added the
`--c-interactive` role the measurement exposed. Still unwritten: the light reading pane on
`/blog`, the motion grammar itself, the six deleted motion primitives, and `/sources` as the
single citation home.

---

## Success criteria

The project is complete only when every page is built from shared architecture; every visual
decision originates in the design system; every content element originates in structured content;
every animation follows one motion system; every reusable pattern exists exactly once; technical
debt is actively reducing; future pages need minimal new code; **the platform enforces quality
automatically rather than relying on review**; and the site is production-ready, AI-ready, SEO-first
and highly maintainable **without increasing hosting cost**.

### Cost is a design constraint, not a ceiling on ambition

Owner, 2026-08-03:

> "We must remain within Cloudflare Pages with no additional recurring hosting costs. However, this
> constraint should not reduce our ambition. Assume we can achieve a top 1% enterprise marketing
> website using open-source technologies, modern static architecture, disciplined engineering and
> excellent design. If any premium technique genuinely requires paid infrastructure, identify it
> explicitly, explain the business value, and propose an equivalent free or self-hosted alternative
> wherever possible. Treat cost as a design constraint, not as a reason to lower the quality target."

**This corrects something I had framed wrongly.** I listed the zero-third-party-origin rule as
though it ruled premium techniques out. It mostly does not. Re-examined honestly:

| Technique | Actually blocked by cost? | The truth |
|---|---|---|
| Stripe's animated WebGL gradient mesh | **No.** A shader is a few KB of self-hosted JS and runs on the client. | Blocked by **our own no-JavaScript rule**, not by hosting. A CSS hero with WebGL as a progressive enhancement satisfies both. |
| Scroll-linked continuous motion | **No.** `animation-timeline` is pure CSS, zero JS, zero cost. | ~84% support and behind a flag in Firefox, so it needs `@supports` and a correct fallback. Nothing else stops it. |
| Grain, depth, parallax, micro-interactions | **No.** All CSS. | Already the top-ranked levers in `ULTRA-PREMIUM-GAP.md`. |
| Self-hosted video | **No.** Cloudflare Pages serves it free. | Blocked by the **payload budget**, which is our decision and revisable. |
| Apple's 148-frame pinned sequence | **No, but rule it out anyway.** | 55.8 MB measured, and it is scroll-jacking, which NN/g found users read as a bug. Two independent reasons, neither of them cost. |
| Better Stack's 133 product images | **No.** | We have no product to photograph, and screenshots on the public site are a recorded credibility defect. Not a cost question. |

**So almost nothing is blocked by hosting cost.** What actually constrains us is a rule we chose
(no JavaScript for content) and a budget we set (payload). Both are ours to revisit deliberately,
as an ADR, rather than to hide behind.

**The zero-third-party-origin rule stays**, and it is an asset rather than a limitation: no CDN, no
tracking, no external font, nothing that can break or leak. Self-hosting is not a workaround for
having no budget; it is the better engineering position, and it is what makes the CSP gate
meaningful.

**The no-JavaScript rule is narrower than it sounds and should be stated precisely:** *content* must
never depend on JavaScript. Enhancement may. A hero that reads correctly with scripts disabled and
gains a shader when they run breaks no rule we have. That distinction is the single biggest piece of
headroom available, and the build ships **0 KB of JavaScript today**, so there is room to spend
deliberately.

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
