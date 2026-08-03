# Coding standards: crowagent.ai

Required by `specs/PLATFORM-CHARTER.md`, which lists it as **MISSING**.

**Everything here is derived from what the codebase already does**, not invented for the document.
Each rule names the defect that produced it and says whether a gate enforces it. Where nothing
enforces a rule, that is written down, because a rule with no enforcement is a preference and the
charter's whole argument is that *"a violation and a deliberate exception looked identical, so
neither the next agent nor the next person could tell them apart."*

Scope: `astro/`. The legacy tree at the repo root has its own, older conventions and is not being
brought to these.

---

## 1. The two rules everything else follows from

### 1.1 A value that is not in `tokens.css` is a defect, not a decision

`tokens.css:60-61` states it in those words. The legacy site carried three competing token systems
(`--ca-*`, `--nt-*`, and a long tail of hardcoded hex and px across 34 stylesheets); the rebuild has
one file.

| Concern | Token | Never write |
|---|---|---|
| Colour | `--c-*` | A hex outside `:root`/`html` |
| Type size | `--t-*` | A px/rem/em `font-size` outside the token block |
| Container width | `--measure*` | A px `max-width` outside the token block |
| Radius | `--radius-*` | 18px, 14px, or any other value |
| Interior padding | `--blk-pad` | 32/29/28/26/24/22/20 |
| Vertical rhythm | `--sec-*`, `--stack-*` | A bare clamp |
| Control height | `--btn-h`, `--btn-h-sm` | `44px`, `54px` |
| Duration and easing | `--dur*`, `--ease`, `--m-*` | A bare `600ms`, a bare cubic-bezier |

**Enforced** by `check-design-system.js` rule 4 for colour, `font-size` and `max-width` only.
Radius and padding are enforced indirectly through rule 3. **Not enforced:** control heights,
durations, easing. See §8.

**Two things are exempt and the distinction matters.**

- **Rebinding a token name is allowed.** `Article.astro`'s light reading pane sets `--c-bg: #f5f6fa`,
  `--c-text: #0b0e19` and four more on one element, with contrast measured against each. That is not
  six hardcoded colours, it is the palette re-scoped; brand `--c-teal` measures 1.6:1 on a light
  pane and is unreadable, so the pane rebinds the same *names* and every component inside inherits
  them without being edited. **You may re-scope the palette; you may not invent a member of it.** A
  *new* custom property holding a literal colour is rejected, because that is a colour outside the
  system wearing a name.
- **A relative unit is sometimes more correct than a token.** Inline `<code>` uses `0.9em` because it
  has to sit at 0.9 of *whatever it is inside*, and a token is an absolute value. Both instances are
  on the gate's allow-list with that argument written out.

### 1.2 One recipe per thing, and the recipe lives centrally

The measured history, all in the source:

| Thing | Recipes before | Now | Where it lives |
|---|---:|---:|---|
| Card | **21** | 1 | `styles/surfaces.css` |
| Heading | 15 → 9 → 6 | 4 tiers | `tokens.css` + `Section.astro` |
| Button | 9 hand-typed `background: var(--c-teal)` | 1 | `components/ui/Button.astro` |
| `<head>` block | 45 | 1 | `components/seo/Seo.astro` |
| Motion system | **11** | 1 | `tokens.css` + `scripts/motion.ts` |
| Section measure/padding | 6 widths, 5 gutters, 48–160px padding | 1 | `components/layout/Section.astro` |

**How to use the card recipe.** Put `surface` on the element. **Do not restate** `background`,
`border`, `border-radius`, `box-shadow`, `backdrop-filter` or the hover in a component's own styles:
Astro's scoped styles are unlayered and would win, and a card that restates them is how the count
reached 21. State only what is genuinely local, which is nearly always just layout.

```
surface           the card
surface--pad      + the standard interior padding
surface--panel    opaque rather than glass: a result box, a code block
surface--flat     glass, no cast shadow: a card inside a card, or a dense stack
surface--lift     opt in to the hover lift on a non-interactive card
surface--read     opt out of centring. Needs a reason on the gate's allow-list
```

**Hover scope is deliberately narrower than the live site's.** The specular highlight and the border
brighten on any hover, which is the "glossy" part and costs nothing. The **lift** is limited to
elements that are actually interactive (`a`, `button`, `label`, `summary`) plus an explicit
`surface--lift`, because *"lifting a paragraph of text under the pointer advertises an affordance
that is not there, and it moves the line somebody is reading."*

---

## 2. CSS

### 2.1 Cascade layers, and no `!important`

The legacy stylesheets carry **2,279** `!important` declarations. The rebuild has **zero**.

That is not a discipline difference, it is an architecture difference. `tokens.css:1-40`: with no
agreed priority order, *"every new rule has to out-shout the last one, so the only way to win is to
escalate."* Layer order resolves **before** specificity, so a single-class rule in a later layer
beats a deeply nested selector in an earlier one. Priority becomes a property of **where** a rule
lives, and the escalation has nowhere to go.

```
@layer reset, tokens, base, layout, components, utilities;
```

`reset` normalisation only · `tokens` custom properties, no selectors that paint · `base` element
defaults · `layout` containers and grids · `components` UI, where most CSS lives · `utilities`
single-purpose helpers, deliberately able to beat components.

**Astro's scoped component styles are unlayered, and unlayered ranks above every layer.** That is the
correct default: a component's own styles should beat `base` and `layout` without anyone thinking
about it. Only reach for the `components` layer when a style must be shareable across components.

**If a rule is losing, it is in the wrong layer. Move it; do not escalate it.** The one legitimate
exception is accessibility overrides such as `forced-colors` and `prefers-reduced-motion`, which must
beat everything by design.

### 2.2 Restate the layer order in every stylesheet that opens a layer

**This is the rule with the sharpest defect behind it, so it is worth reading in full.**

A `@layer` statement only fixes the order if it is seen **before** any layered rule. Astro emits one
CSS bundle per route, and nothing guarantees which bundle a given route links first. On `/terms` the
bundle carrying `prose.css` was linked **ahead of** the one carrying `tokens.css`, so `components` was
registered as the **first** layer and the real order became:

```
components, reset, tokens, base, layout, utilities
```

Everything in `base` then outranked every component rule on that page: the exact opposite of the
documented contract, on one route, silently.

**The fix is idempotent restatement.** Whichever file arrives first establishes the correct order and
the rest are no-ops. Four stylesheets carry the line today:

```
styles/tokens.css:42     styles/surfaces.css:57
styles/prose.css:33      styles/forms.css:27
```

**Any new stylesheet that opens a layer must carry it too.** Astro `<style>` blocks inside `.astro`
components do **not** need it, because they are unlayered by design.

Measured in the current build: 17 CSS bundles in `dist/_assets`, of which **2** carry the layer
statement (`_legal_` and the shared `_slug_` bundle every route links). Every route links at least
one of those two, so the order holds today. It holds because of which files happen to be in which
bundle, which is Astro's decision and not ours, which is why the restatement rule is not optional.

**Nothing enforces this.** A new stylesheet without the line would be a silent, route-specific
cascade inversion. See §8.

### 2.3 Comments explain WHY, not what

Every long-lived file in `astro/src` opens with a header comment that names the defect it exists to
prevent. That is not documentation overhead; it is the mechanism. A rule with no recorded reason is
removed by the next agent in good faith.

The shape that has worked, from `Button.astro`, `Section.astro`, `surfaces.css`, `tokens.css`,
`PostImage.astro`:

1. **WHY THIS EXISTS**: the measured defect, with numbers
2. **WHAT IT OWNS**, and therefore what a caller must not redeclare
3. **WHAT MUST NOT COME BACK**: the specific edit that would reintroduce the defect
4. **WHAT WAS DELIBERATELY NOT DONE**, so an omission is not read as an oversight
5. Anything **superseded**, with the date and the decision that superseded it

`PostImage.astro` is the model for point 4: a `class` prop was removed and the reason is 12 lines
explaining that Astro's scoping made it render and do nothing, ending *"A prop that is accepted,
rendered and silently inert is worse than no prop."*

**A comment that records a decision is load-bearing.** `tokens.css:163-198` refuses a `--t-control`
tier below `--t-micro` and gives four numbered reasons *"so nobody has to work it out again"*. That
block is the difference between a decision and a thing somebody will re-propose next month.

### 2.4 A stray comment terminator ships an entire block as dead code

CSS has no nesting for `/* */`. A `*/` in the wrong place, or a missing one, silently swallows every
rule until the next terminator, and the page renders without them. This has shipped on this site.

**Practices that make it survivable:**

- `check-design-system.js` **blanks** comments rather than removing them, *"so every index still maps
  back to a real line number in the file a person has to open"*: the same discipline applies to
  reading them.
- Prefer one comment block above a rule to many inline ones inside it.
- Never nest `/* */` inside `/* */`. The long header comments in this codebase divide themselves
  with box-drawing separators (`── … ──`, `══ … ══`) inside a **single** block, precisely because a
  separator drawn that way cannot terminate the comment it sits in.

**Nothing enforces this.** A brace-balance check exists for the legacy `styles.css` in the root
`CLAUDE.md`; there is no equivalent for `astro/src`. See §8.

### 2.5 Named transitions, never `transition: all`

`surfaces.css:66-72`: *"`transition: all` on a card animates height and width during a reflow and is
why hover felt sticky on the legacy build, which used `duration-700` on `all`."*

### 2.6 Selector hygiene

- **No substring class matches.** The legacy specular rule was written `[class*="ca-card-"]`, which
  matched `.ca-card-title`, `.ca-card-desc` and `.ca-card-tags` as well as the card, drawing a white
  1px line above every inner element and making the card look segmented. **Use a single explicit
  class.**
- **Never set colour on all descendants.** The same legacy stylesheet forced
  `-webkit-text-fill-color` on all descendants of a dark card and made white and teal buttons
  invisible. This site has shipped a P0 from inherited `-webkit-text-fill-color` making text
  invisible. Gradient text is confined to eyebrows and display headings: short, large, and verified
  by axe on every route.
- **Structural exclusions, not per-element opt-outs.** The legacy stylesheet force-centred sixteen
  element types inside every section and then needed **138 per-element opt-out attributes across 24
  pages** to escape. `surfaces.css` centres card content and excludes lists, tables, forms, `pre` and
  `details` **structurally**, with `:has()`, so nobody has to remember to say so.

---

## 3. Astro components

### 3.1 Props

- **Declare `interface Props`** and destructure with defaults in the frontmatter. 14 of the 26 files
  in the library do; the rest genuinely take none.
- **Document each prop with a `/** */` comment** where the name does not fully say it. `Section`'s
  `as` prop needs 14 lines because it is structure-only and getting it wrong shipped four pages with
  no `h1`.
- **Never ship a prop that cannot work.** See `PostImage` and §2.3.
- **Forward what call sites need.** `Button` forwards `target`/`rel` because five sign-in links could
  not be converted without them, and *"a component that cannot express what its call sites need is
  not a component, it is a narrower thing pretending."*
- **Default the safe thing.** `Button`'s `rel` defaults to `noopener noreferrer` whenever
  `target="_blank"`, so the protection cannot be forgotten at a call site.

### 3.2 Wire values are an API contract

Any string consumed by something outside this repo is a wire value and is **never** renamed for
readability. Marked in the source with the words WIRE VALUE:

- `ContactForm`'s field `name`s and `enquiry_type` option `value`s →
  `app.crowagent.ai/api/contact/submit`
- `PartnerForm`'s field `name`s → whatever reads the Formspree inbox
- `NewsletterForm`'s `source` values → the existing per-page signup series
- `?enquiry=limited-access` in every "Request access" href → read by `/contact` to preselect the
  subject
- Every `href` in `data/nav.ts` and `data/footer.ts` → live, indexed URLs

**Rename a label freely; never rename a value.**

### 3.3 Fail the build rather than render a hole

Three modules throw at build time and name the file to edit:

- `heroes.ts` `heroFor()`, a post with no hero image
- `RelatedPosts.astro`, a related slug that no longer exists
- Zod schemas in `content.config.ts`, any missing required field

*"A dead card would render as a link to a 404 that `check-links.js` catches only after the fact.
Failing here names the file to fix instead."*

### 3.4 Structured data is derived, never hand-assembled at a call site

`lib/schema.ts` exposes `blogPosting()`, `faqPage()` and `breadcrumbs()`. A layout knows what kind of
thing its pages are, so the layout emits the JSON-LD. *"Add a post, get correct structured data for
free."*

`faqPage()` returns an **empty array** for no entries rather than an `FAQPage` with zero questions,
which is a structured-data error rather than a neutral omission.

**Three layouts currently bypass this.** See `COMPONENT-LIBRARY.md` §1.3.

---

## 4. JavaScript

### 4.1 Content must never depend on JavaScript

The single most-repeated rule in the codebase, and it is repeated because it has failed twice:

- A staged reveal on `ReasoningTrace` failed the sitewide axe gate with **colour-contrast on 7
  nodes**, because the checker sampled while the steps were mid-transition and semi-transparent text
  meets 4.5:1 against nothing. **The contrast failure was the symptom.** The fault was making correct
  content depend on an observer firing.
- The legacy `sv-reveal` left **4 of 9 homepage sections permanently invisible** after a normal
  scroll, and 7 of 9 in a full-page capture.

**Rest state is final state.** *"Motion may refine what is already there. It may never create it."*
The corollary: there is no failsafe timer in `motion.ts`, because *"if content only ever starts
CORRECT, there is nothing to fail safe to."*

### 4.2 JavaScript writes numbers; CSS decides what they mean

`motion.ts` sets `data-lit="on"` and writes `--mx` / `--my`. Everything else: cadence, colour,
reach, whether an animation exists at all; is CSS. The file states the test: *"If the ratio ever
inverts and this file starts deciding appearance, the page has acquired a way to break by failing to
run."*

The proof it works: the whole homepage was retimed to a shared beat, cycle and easing set on
2026-08-02, and **not one line of TypeScript was involved**.

### 4.3 No dependency without an architectural decision

`astro/package.json` has exactly **one** runtime dependency: `astro`. Two dev dependencies
(`tailwindcss`, `@tailwindcss/vite`), and no stylesheet imports `"tailwindcss"`, so **no utility
layer is generated**: which is why `sr-only` had to be defined by hand in `tokens.css` after two
elements shipped in full view.

`CommandPalette` is ~200 lines rather than a headless combobox library, *"on a site whose entire
measured problem was payload"*.

**A new dependency is an ADR, not a convenience.** `PERFORMANCE-BUDGETS.md` rule 4.

### 4.4 Read success from the response

An earlier legacy newsletter handler sent the request `no-cors` and showed *"you are on the list"*
unconditionally. While `/api/notify` 404'd, **every subscriber saw success and every address was
dropped.** A success message is shown only on a 2xx, and any other outcome is visible.

### 4.5 Errors are wired, not adjacent

Every form error carries `aria-describedby` and `aria-invalid`, and every error has text. The legacy
blur handler revealed an **empty** span; measured: `display: block`, height 0, `textContent` `""`.

**One validation rule per field, not two.** Legacy blur used `includes('@') && includes('.')` while
submit used an RFC-5322-lite regex, so `a@b.` cleared the error on blur and was rejected on submit,
the form appearing to change its mind.

**Colour is never the only signal.** An error state carries colour **and** text (WCAG 1.4.1). The
same rule governs every marker on the site: an at-risk value carries a word, a threshold or an icon
as well.

---

## 5. Language and copy

These are engineering rules because they appear in generated markup and in `alt`, `aria-label` and
visually-hidden strings as often as in prose.

### 5.1 No em-dashes in user-facing text

Use commas, semicolons, or separate sentences. **Em-dashes in source comments are fine**: the rule is
about what a reader sees.

**Measured 2026-08-03 on `astro/dist`, visible text with `<script>`/`<style>`/comments stripped: 15
em-dashes across 3 routes.**

| Route | Count | Where |
|---|---:|---|
| `/tools/ppn-002-calculator/methodology` | 6 | Visible prose. `methodology.astro:90,91,95,103,138` |
| `/tools` | 6 | `<span class="visually-hidden"> — {name}</span>`, `tools/index.astro:150,181` |
| `/crowmark` | 3 | The same pattern, `crowmark.astro:326` |

The visually-hidden ones are the interesting case: they are invisible on screen and **read aloud** to
screen-reader users, so they are user-facing by the only definition that matters. The pattern
`{cta}<span class="visually-hidden"> — {plan} plan</span>` builds an accessible name and should use a
comma.

**Nothing enforces this.** See §8.

### 5.2 £ only, and the one honest exception

**Measured: 6 `$` amounts in visible text, all on `/compare/crowmark-vs-autogenai`**,`$39.5m` and
`$65.3m`, AutogenAI's Series B and total investment, cited to FinSMEs, 6 December 2023.

**Those are correct as they stand and should not be converted.** A funding round raised in dollars is
a fact about a dollar amount, and converting it would either invent an exchange-rate date or misstate
the source. **The rule as written has no carve-out for a cited foreign-currency figure, and it needs
one.** Recorded as open rather than resolved by an agent, because it is a copy decision.

Everything the company itself charges is in £: `pricing.ts` holds `£49`, `£149`, `£529`, `£1,609`, and
records that `£99` was a non-existent price removed from an OG card on 2026-07-30.

### 5.3 UK spelling

`organisation`, `analyse`, `licence` (noun), `centre`, `programme`. **Exception, and it is not
optional:** CSS properties and HTML attributes are American by specification,`color`, `center`,
`text-align: center`, `grid-template-columns`. Content collections and copy are UK; the platform's
own wire values (`organization` in `autocomplete`, `Organization` in JSON-LD) are whatever the spec
says.

### 5.4 No AI-register vocabulary

No *revolutionize*, *seamlessly*, *harness*, *unleash*, *cutting-edge*, *game-changing*. Inherited
from the root `CLAUDE.md` rule 5 and observable throughout `astro/src/content/**`.

### 5.5 Figures

**Every figure is either cited to a named source or visibly marked as an example. There is no third
option.** Three wrong-figure defects shipped in one week before this was enforced. The full content
rules are in `CONTENT-ARCHITECTURE.md` §6.

One narrow carve-out is recorded and **must not breed**: a purpose-drawn product graphic showing what
the product does needs no disclaimer. `HeroStack`'s *"2 gaps found"*, *"82 fit score"* and *"4
commitments live"* claim nothing about an outside body and cite nothing, so there is nothing to
source and nothing to hedge.

---

## 6. Files and naming

```
astro/src/
  components/
    <domain>/          blog, footer, forms, layout, nav, seo, ui, sections
  layouts/             Base + five specialisations. PascalCase
  pages/               file-based routing. lowercase-kebab
  content/<coll>/      Markdown. lowercase-kebab slugs = the route segment
  content.config.ts    every collection schema, with its reasoning
  data/                *.ts, lowercase-kebab, exporting a SCREAMING_CASE const
  lib/                 build-time derivations and domain functions
  styles/              tokens, surfaces, prose, forms
  scripts/             client-side TypeScript. One file: motion.ts
astro/scripts/         Node build scripts, kebab-case, `check-*` for gates
```

- **Components** PascalCase `.astro`. **Data and lib** kebab-case `.ts`.
- **Class names** are BEM-ish and **prefixed per component** (`bs__`, `rt__`, `cmp-`, `gx-`, `sv-`).
  Prefixes are how the scoped and the global coexist.
- **A domain folder is created when there are two files in it**, not before.
- **`check-*` is reserved for build gates.** A script named `check-*` in `astro/scripts/` is expected
  to be in `npm run build` and to exit non-zero.

---

## 7. The gate contract

All five gates in `astro/scripts/` follow the same shape, and it was **arrived at four times
independently** before anyone named it. Each was written after a defect shipped because a gate
asserted something *adjacent* to what mattered.

1. An **allow-list of named exceptions**, each carrying the reason it is one.
2. The allow-list is **printed on every build**, so a deliberate exception nobody re-reads cannot
   quietly become an accidental one.
3. Entries that no longer match anything are **reported as stale**, so the list can only shrink.
4. Anything **not** on the list **fails the build**.
5. **DEBT is counted separately from DESIGN.** A reason beginning `DEBT:` prints under its own count.
   *"Debt that is never counted is debt that is never paid."*
6. **It must be proved to fail before it is trusted.**

**The list is not a snooze button.** Seeding it to get a green build makes the gate worthless, which
is precisely the failure mode it exists to prevent.

**A reason is a sentence somebody can disagree with, not a restatement.** If the honest reason is
*"this is wrong and is not being fixed today"*, say that and start it with `DEBT:`.

Full detail: `TESTING-AND-QUALITY-GATES.md` §12.

---

## 8. What is enforced, and what is not

| Rule | Enforced by | In the build? |
|---|---|---|
| No hardcoded colour outside `:root` | `check-design-system.js` r4 | **Yes** |
| No px `font-size` outside `:root` | `check-design-system.js` r4 | **Yes** |
| No px `max-width` outside `:root` | `check-design-system.js` r4 | **Yes** |
| Heading sizes from the four tiers | `check-design-system.js` r2 | **Yes** |
| One card recipe via `.surface` | `check-design-system.js` r3 | **Yes** |
| Card content centres, prose stays left | `check-design-system.js` r1 | **Yes** |
| One `h1`, no skipped levels | `check-design-system.js` r5 + `heading-structure.spec.js` | **Yes** |
| Internal links resolve | `check-links.js` | **Yes** |
| No SEO metadata lost vs legacy | `check-seo-parity.js` | **Yes** |
| No headings, form controls or link targets lost | `check-content-parity.js` | **Yes** |
| Static external origins allowed by the CSP | `check-csp.js` | **Yes**, with a blind spot (§8.1) |
| **`@layer` restated in every stylesheet** | nothing | **No** |
| **No `!important`** | nothing | **No** (0 declarations today) |
| **No em-dashes in user-facing text** | nothing | **No** (15 today) |
| **£ only** | nothing | **No** (6 `$` today, arguably correct) |
| **UK spelling** | nothing | **No** |
| **No AI-register vocabulary** | nothing | **No** |
| **Control heights from `--btn-h*`** | nothing | **No** (4 literals) |
| **Durations and easing from `--dur*` / `--m-*`** | nothing | **No** |
| **`transition: all` never used** | nothing | **No** (0 declarations today) |
| **No `[class*=]` substring selectors** | nothing | **No** (0 selectors today) |
| **CSS comment terminators balanced** | nothing | **No** |
| **Zero JavaScript required for content** | nothing | **No** |

### 8.1 What the gates cannot see

Stated plainly, because a gate whose limits are not written down is trusted further than it deserves.

- **`check-design-system.js` checks the source of a value, not the rendered pixel.** It cannot catch
  a heading pushed off the scale by an inherited `em`, a specificity fight, or a token whose own
  definition changed. What it *does* assert is that every heading size is a `--t-*` token, and that
  **bounds** the set of rendered sizes by the token set, which is what stops the 15-recipe drift
  returning.
- **`check-csp.js` reads static attributes only**: `<script src>`, `<link rel=stylesheet>`,
  `<img src>`, `<iframe src>`, and CSS `url()`/`@import`. It cannot see a `fetch()`, an
  `XMLHttpRequest`, a `<form action>`, or a script element created at runtime. **Two live consequences
  today:** it reports *"the build loads nothing from a third party"* while `/contact` and `/partners`
  inject `challenges.cloudflare.com` on first focus, and it cannot see that `PartnerForm`'s `fetch()`
  to `formspree.io` is **blocked** by the shipped `connect-src`.
- **No gate reads rendered CSS.** All five are text checks over `dist/` and `src/`. There is no
  browser in the `astro/` build, deliberately: *"a gate that is slow is a gate somebody eventually
  takes out of `npm run build`."*
- **`check-content-parity.js` asserts nothing was lost, not that what replaced it is true.** Every
  accuracy rule in `CONTENT-ARCHITECTURE.md` §6 is held by review and by header comments.

### 8.2 The cheapest gates still missing

In the order their absence has already cost something:

1. **Em-dash and currency scan over visible text in `dist/`.** ~20 lines. Would have caught all 15
   occurrences. Needs an allow-list for cited foreign-currency figures (§5.2).
2. **`@layer` restatement check** over `src/styles/*.css`: any file containing `@layer <name> {` must
   also contain the six-name statement. ~10 lines, and it guards a defect that has already shipped on
   one route.
3. **A runtime-origin scan** over inline scripts for `fetch(`, `.src =`, and `action=` with an
   absolute URL, checked against `connect-src` / `form-action` / `script-src`. Would have caught the
   Formspree block.
4. **`!important` and `transition: all`**; both are **zero declarations** today. A naive grep over
   `astro/src` returns 9 and 3 hits respectively, and **every one is inside a comment** explaining why
   the pattern is banned. So the check must blank comments first, exactly as
   `check-design-system.js` already does with `.replace(/\/\*[\s\S]*?\*\//g, m => ' '.repeat(m.length))`
blanking rather than removing, so line numbers still map to a file somebody has to open.
5. **Mid-animation overflow at 390.** Needs a browser, so it belongs in Playwright rather than the
   build. Method in `RESPONSIVE-STANDARDS.md` §4.2.
