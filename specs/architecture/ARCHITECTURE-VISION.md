# Architecture vision: crowagent.ai

Required by `specs/PLATFORM-CHARTER.md`, which lists it as **MISSING**. The charter is the governing
document; this one states the technical position the charter's directive resolves to, and measures
how close the repository actually is.

Measured from `astro/` on 2026-08-03.

---

## 1. The position in one paragraph

**A static Astro site, built to files, served by Cloudflare Pages, with no runtime and no server.**
Every page is HTML at rest and correct with scripts disabled. All styling comes from one token file
and one card recipe. All repeated content is a typed collection or a data module. All metadata is
derived from the route. Nothing is loaded from a third-party origin at first paint. The rules are
enforced by build gates that fail, not by review that reminds.

**None of that is a limitation imposed by cost.** The charter is explicit and it corrects an earlier
framing: almost nothing premium is blocked by hosting. What constrains the site is a rule we chose
(no JavaScript for content) and a budget we set (payload). Both are ours to revisit deliberately, as
an ADR, rather than to hide behind.

---

## 2. The stack

| Layer | Choice | Why this and not the obvious alternative |
|---|---|---|
| Framework | **Astro 5.16**, static output | Ships zero framework runtime by default. A component model without a client-side cost |
| Styling | **Plain CSS custom properties + cascade layers**, scoped Astro `<style>` | No CSS-in-JS, no runtime theming. Layers replace the escalation that produced 2,279 `!important` |
| Content | **Astro content collections** with Zod schemas | A missing field fails the build instead of rendering a blank |
| Hosting | **Cloudflare Pages** | Free static hosting, no recurring cost, `_headers` and `_redirects` as files |
| Dependencies | **One** (`astro`) | Two dev deps (`tailwindcss`, `@tailwindcss/vite`) exist and **generate nothing**: no stylesheet imports `"tailwindcss"` |
| Enforcement | **Five Node scripts** in `npm run build` | No browser: 41 routes in a headless browser is tens of seconds on every build, and a slow gate is a gate somebody removes |

**Tailwind is present and inert, and that is a live loose end.** Because no utility layer is
generated, `sr-only`, used in the markup on `/glossary` for the index heading and the search field
label; resolved to **nothing**, and both elements rendered in full view: a stray "Term index"
heading above the search box and a duplicate label beside its own placeholder. It is now defined by
hand in `tokens.css`. Either commit to Tailwind's `@theme` mapping or remove the dependency; a
half-wired build tool is how that class of defect happens.

---

## 3. The five properties worth protecting

### 3.1 Zero JavaScript files

**41 routes, 0 `.js` files in `dist/`.** Not "small": there is no bundle. Verified
`find astro/dist -name "*.js"` → empty.

**Stated precisely, because "0 KB of JavaScript" is a claim that will be checked.** What ships is
inline, and it is small but not nothing:

| Per route | Bytes |
|---|---:|
| Baseline inline JS (the Cmd/Ctrl badge stamp, the focus trap, the command palette) | ~6.7 KB |
| Command-palette index, `<script type="application/json">`**data, not code** | ~7.3 KB |
| Worst route (`/contact`, plus form validation) | ~19.1 KB in 6 tags |

So: **zero JS requests, zero bundles, zero framework runtime, and roughly 7 KB of inline behaviour on
a typical route.** All of it is enhancement. Every word on every page is in the HTML at first paint.

**Protect it.** The comparator sites ship hundreds of kilobytes of framework before anything renders.
Any proposal that introduces a bundle argues against this line and against the payload budget.

**The rule is narrower than it sounds and should be stated precisely** (charter, 2026-08-03):
*content* must never depend on JavaScript. *Enhancement* may. A hero that reads correctly with
scripts disabled and gains a shader when they run breaks no rule we have. That distinction is the
single biggest piece of headroom available.

### 3.2 No third-party origin at first paint

`check-csp.js` reports **0 external origin references across the build**.

**The honest qualification.** Two routes load one third-party origin *after a user action*:
`/contact` and `/partners` inject `https://challenges.cloudflare.com/turnstile/v0/api.js` on **first
focus** inside the form. That is a deliberate, measured decision: cold, `/contact` was 419 KB of
which 344 KB was the challenge widget, so an earlier `IntersectionObserver` made every visitor pay
for spam protection whether or not they typed anything.

**`check-csp.js` cannot see it**, because a script element created at runtime is not a `<script src>`
attribute. So the accurate claim is: *zero third-party origins at first paint on all 41 routes; one
third-party origin on two routes after a user focuses a form; and the gate that says so is measuring
the first sentence only.* See `TESTING-AND-QUALITY-GATES.md` §12.2.

**The rule stays, and it is an asset rather than a limitation** (charter): no CDN, no tracking, no
external font, nothing that can break or leak. Self-hosting is not a workaround for having no budget;
it is the better engineering position, and it is what makes the CSP gate meaningful.

### 3.3 One design system, and it is enforced

`tokens.css` is 1,001 lines, of which roughly 600 are the reasoning. Every visual value on the site
resolves from it. `surfaces.css` holds the one card recipe. `Section.astro` owns the measure, the
gutter, the vertical rhythm and the head block.

The measured history is the argument: 21 card recipes → 1, 15 heading recipes → 6 → 4 tiers, 9
hand-typed button backgrounds → 1 component, 45 `<head>` blocks → 1, 11 motion systems → 1, 2,279
`!important` → 0.

**The enforcement is what changed on 2026-08-02**, and it changed because the owner was right:
*"I can see the same pain points and I am not sure if you are doing things manually crafted, or
following and enforcing centrally a design system and best practices."* Every parity fix to that
point had been a manual sweep, measure, fix, drift, measure again, because nothing in the build
asserted the rules.

### 3.4 Content is structured, and its structure is validated

Five collections behind four templates; 18 routes generated from Markdown. Seven data modules feeding
both visible markup and JSON-LD from one array, which is what stops the `/faq` defect returning: 14
visible pairs against 9 in the schema, the whole Security category invisible to structured-data
consumers.

`lib/schema.ts` derives structured data from the content model rather than asking each route to
hand-assemble it. *"Add a post, get correct structured data for free."*

### 3.5 The build fails on a violation

Five gates, all in `npm run build`, all following one contract (see `CODING-STANDARDS.md` §7). The
contract was arrived at four times independently before anyone named it, which is the strongest
evidence it is right.

---

## 4. Where the repository actually stands

Measured, not asserted.

| | Legacy tree (repo root) | `astro/` |
|---|---:|---:|
| `!important` declarations | 2,279 | **0** |
| Stylesheets | 34 (~1.03 MB) | 4 shared + scoped component styles |
| CSS shipped | 575 KB on the homepage | **162 KB total, 17 bundles** |
| JavaScript files | many | **0** |
| Motion systems | 11 | **1** |
| Duplicated `<head>` blocks | 45 | **1** |
| Routes from templates | 0 | **18 of 41** |
| Build gates | 7 (`build-dist.js` sub-checks) | **5**, all failing-by-default |
| Third-party origins at first paint | PostHog, Calendly, Turnstile, Railway | **0** |

**And the honest counter-list**, because a vision document that only reports wins is not usable.

Gate figures are a **snapshot at 2026-08-03 00:45**. Re-measured 35 minutes later the debt count had
already fallen from 9 to 7 and the violation was gone, because another agent was clearing it. **Run
the gate rather than quoting these.**

- **9 known design-system debt items** (7 by 01:20), each named with a reason, printed on every
  build.
- **5 stale allow-list entries** in `check-design-system.js`: exemptions that no longer match
  anything and should be deleted.
- **1 unrecorded design-system violation**
  (`align /blog/ feat.surface.surface--pad.surface--read`), which meant **the build failed its own
  design-system gate**. Cleared during the same session.
- **Seven files restate `Section.astro`'s rules** rather than using it; four hero recipes and five
  closing-CTA recipes exist. `COMPONENT-LIBRARY.md` §1.
- **17 distinct width breakpoints**, four of them one pixel from another.
  `RESPONSIVE-STANDARDS.md` §2.
- **`PartnerForm`'s `fetch()` to `formspree.io` is blocked by the shipped CSP.**
  `COMPONENT-LIBRARY.md` §6.
- **Six rules in `CODING-STANDARDS.md` §5 have no gate at all**, and 15 em-dashes are in visible text
  today.

---

## 5. What this architecture is deliberately not

Recorded so the questions are not re-opened by accident.

| Not | Because |
|---|---|
| A CMS-backed site | Content is in git, reviewed as a diff, and validated by Zod. A CMS adds a runtime, a cost and an editorial surface nobody needs at this size |
| Server-rendered | There is nothing to personalise. A static file is faster, cheaper and cannot fall over |
| A component framework on the client | Nothing on the site needs client-side state beyond a dropdown, a palette and two forms, all of which are ~200 lines of vanilla |
| A CSS framework's utility layer | Tailwind is installed and generates nothing. See §2 |
| Analytics-instrumented | Zero third-party origins is the rule. PostHog is in the legacy CSP and is not loaded by this build |
| Scroll-jacked | Apple's 148-frame pinned sequence measures 55.8 MB **and** NN/g found users read scroll-jacking as a bug. Two independent reasons, neither of them cost |
| Screenshot-led | Product screenshots on the public site are a recorded credibility defect. The owner's instruction is purpose-drawn graphics |
| Light-themed | Settled owner decision: *"current theme stays, and is universal across the site."* `Article`'s reading pane is a reading surface, not a theme, and is not a step towards one |

---

## 6. The direction of travel

In value order. Each is a consolidation, not a feature.

1. **Consolidate the hero and CTA recipes into `Section` variants.** Four heroes and five closing
   bands, plus seven files restating the head-block rules. The blocking limitation is real and
   specific: `Section` renders `--t-h2` and cannot render a hero at `--t-h1`.
   `COMPONENT-LIBRARY.md` §1.1.
2. **Route the three remaining layouts through `lib/schema.ts`.** Five one-line changes; removes
   five places a JSON-LD defect can be introduced.
3. **Add the cheap missing gates.** Em-dash and currency scan, `@layer` restatement check,
   runtime-origin scan. `CODING-STANDARDS.md` §8.2 gives the order and the reason for each.
4. **Clear the 9 debt items and the 5 stale exemptions.** Each is a one-line change; the gate's own
   note says the list *"should be empty within a pass or two"*.
5. **Convert the six product screenshots from PNG.** 371 KB, 264 KB, 210 KB, 177 KB, 175 KB, 175 KB.
   The single largest payload win available, needing no design decision: subject to the standing
   question of whether they belong on the public site at all.
6. **Resolve Tailwind.** Commit to `@theme` or remove it.
7. **Decide the JavaScript question deliberately.** The build ships 0 KB of bundle, so there is real
   headroom to spend. `WebGL` behind a `<canvas>` that degrades to the CSS hero, or
   `animation-timeline: view()` behind `@supports`, are both live options that break no rule. They
   need an ADR, not a commit.

---

## 7. Related documents

| Document | Owns |
|---|---|
| `../PLATFORM-CHARTER.md` | The governing directive. Wins over everything here |
| `INFORMATION-ARCHITECTURE.md` | The 41 routes and how they group |
| `COMPONENT-LIBRARY.md` | Every component, what it owns, and the duplicates |
| `CONTENT-ARCHITECTURE.md` | Collections, schemas, and where each fact lives |
| `DESIGN-SYSTEM.md` / `DESIGN-TOKENS.md` | Layers, tokens, and the no-`!important` rule |
| `MOTION-AND-INTERACTION.md` | The motion grammar |
| `RESPONSIVE-STANDARDS.md` | Breakpoints, measures, overflow and target size |
| `CODING-STANDARDS.md` | Conventions, and what is enforced against what is intended |
| `ACCESSIBILITY-STANDARDS.md` | WCAG 2.2 AA and the behaviours that implement it |
| `SEO-STANDARDS.md` | Metadata, structured data, sitemap, canonicals |
| `PERFORMANCE-BUDGETS.md` | Payload ceilings and what is measured |
| `TESTING-AND-QUALITY-GATES.md` | Every gate, its command, what it protects against |
| `DEPLOYMENT-AND-RELEASE.md` | Cloudflare Pages, caching, rollback, known traps |
| `../MODERNISATION-ARCHITECTURE.md` | The migration contract |
| `ADR/` | Decisions, with the reasoning that produced them |
