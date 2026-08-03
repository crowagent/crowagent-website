# Component library: crowagent.ai

Required by `specs/PLATFORM-CHARTER.md`, which lists it as **MISSING** with the reason: *"no
inventory of what exists, so duplication is invisible"*. That is exactly right, and it is the reason
this document leads with the duplicate list rather than ending with it.

Scope: `astro/src/components/**` and `astro/src/layouts/**`. Every line below was read from the
source on 2026-08-03. Line counts are the file's own.

**This document describes what IS.** Where the code disagrees with the design system, the
disagreement is written down rather than smoothed over. A component inventory that flatters the
codebase is worse than none, because the next reader trusts it and builds a ninth variant of
something that should have had one.

---

## 1. The duplicates and near-duplicates

This is the point of the document, so it comes first.

Nothing below is a mystery. In almost every case the file that duplicates something says so in a
comment, names the canonical implementation, and explains why it did not use it. That is honest and
it is also the mechanism: a restatement that is *documented* still drifts, because the two copies
are edited on different days by different people for different reasons.

### 1.1 Seven files restate `Section.astro`'s head-block rules instead of using it

`components/layout/Section.astro` owns the measure, the gutter, vertical padding, the head block
(eyebrow, heading, standfirst) and the gap down to the content. Its header comment is explicit:
*"A section that sets its own max-width, its own H2 size, or its own top padding is reintroducing
the defect."*

Fourteen pages and six of the seven homepage sections do use it: **20 files render `<Section>`, 78
instances in total** (`grep -ro "<Section" astro/src --include=*.astro | wc -l`).

These seven do not, and each says so:

| File | What it restates | Its own stated reason |
|---|---|---|
| `pages/blog/index.astro:249` | centred head block, gradient eyebrow | *"this page builds its own head, so the same two rules are restated here"* |
| `pages/compare/index.astro:141` | centred head block, gradient eyebrow, 62ch standfirst, `--t-h2` CTA heading | *"this page builds its own hero"* |
| `pages/glossary/index.astro:400` | gradient eyebrow capsule, 62ch standfirst, `--t-h2` CTA heading | *"restated because this page builds its own bands"* |
| `pages/sectors/index.astro:194` | gradient eyebrow capsule (two classes), 62ch standfirst, `--t-h2` CTA heading | *"restated because this page builds its own bands"* |
| `layouts/Compare.astro` | hero, head block, closing band | matches `pages/compare/index.astro` by hand |
| `layouts/Glossary.astro` | hero, head block, closing band | not stated |
| `layouts/Sector.astro` | hero, head block, closing band | not stated |

`components/sections/HeroStack.astro:244-249` also restates the eyebrow capsule, and it is the one case
with a real argument: *"The hero cannot simply USE Section.astro, because Section renders `--t-h2`
and owns its own head block, and this hero needs `--t-h1`."* That is a genuine limitation of the
primitive, not a shortcut, and the fix is a `Section` variant that can render an `h1` at `--t-h1`,
not eight copies of a capsule.

**The measurable consequence.** The eyebrow capsule now exists in eight places. Change it in
`Section.astro` and seven pages keep the old one, silently, and nothing in the build says a word:
`check-design-system.js` asserts that values come from tokens, which they all do. Tokenised
duplication is still duplication.

### 1.2 Four hero recipes and five closing-CTA recipes

| Concern | Implementations |
|---|---|
| Page hero | `HeroStack` (homepage), `art__hero` (Article), `cmp-hero` (Compare **and** `compare/index.astro`), `gl-hero` (Glossary), `sec-hero` (Sector **and** `sectors/index.astro`) |
| Closing CTA band | `FinalCta` (homepage), `cmp-cta` (Compare **and** `compare/index.astro`), `gl-cta` (Glossary), `gx-cta` (`glossary/index.astro`), `sec-hero-cta` (Sector, used twice in the one file, **and** `sectors/index.astro`) |

`cmp-hero` and `cmp-cta` are the sharpest case: the **same class names** are defined twice, once in
`layouts/Compare.astro` and once in `pages/compare/index.astro`, in two Astro `<style>` blocks that
are scoped separately and therefore cannot share a rule. Two definitions of one class name is the
`background: var(--c-teal)` in nine files problem that `Button.astro` was written to end, at the
level of a section instead of a control.

`FinalCta` is a component and the other four are not, which makes the asymmetry visible: the
homepage's closing band was worth extracting and the four content-collection layouts' were not.
There is no recorded reason for that, and it is the most obviously extractable component on the
site.

### 1.3 Three hand-written `BreadcrumbList` blocks and two hand-written `FAQPage` blocks

`lib/schema.ts` exists precisely to stop this. Its header: *"a collection knows its own schema
types. Add a post, get correct structured data for free."*

| Helper | Used by | Bypassed by |
|---|---|---|
| `breadcrumbs()` | `Article`, `Legal`, and 9 pages | `Compare.astro:74`, `Glossary.astro:81`, `Sector.astro:70` |
| `faqPage()` | `Article`, `crowmark`, `crowmark-buyers`, `pricing` | `Compare.astro:103`, `Sector.astro:81` |

The three bypasses each build the `ListItem` array by hand with hardcoded `position: 1/2/3` and
their own `${SITE.origin}/...` string concatenation, where `breadcrumbs()` derives positions and
uses one `abs()` helper. The two `FAQPage` bypasses do not carry the empty-array guard that
`faqPage()` documents as load-bearing (*"An empty FAQPage is not neutral: it is a structured-data
error"*); both happen to be guarded by an `if (faq.length)` at the call site instead, so the
behaviour is correct today by coincidence of two people making the same decision separately.

This is the highest-value fix in the document, because it is five one-line changes and it removes
five places a JSON-LD defect can be introduced.

### 1.4 The Turnstile block is duplicated verbatim between two forms

```
ContactForm.astro:95   const TURNSTILE_SITEKEY = '0x4AAAAAADML7D0t7OQT4B4R';
PartnerForm.astro:106  const TURNSTILE_SITEKEY = '0x4AAAAAADML7D0t7OQT4B4R';
ContactForm.astro:305  s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
PartnerForm.astro:276  s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
```

Both also carry `TURNSTILE_LOCAL_SITEKEY = '1x00000000000000000000AA'`. Four literals, two lazy-load
functions, one concern. `styles/forms.css` already exists as the shared field vocabulary for exactly
this reason; the challenge widget is the one part of a form that was not pulled into it.

### 1.5 `44px` is written as a literal in four places where `--btn-h-sm` exists

`tokens.css` defines `--btn-h-sm: 44px` and says *"44px is also the WCAG 2.2 target-size floor, so
`--btn-h-sm` is the smallest a control may ever be."*

| Uses the token | Uses the literal |
|---|---|
| `ShareRow.astro:255-256`, `Integrations.astro:544`, `Nav.astro:596,636,747,766` | `CommandPalette.astro:404`, `Nav.astro:660-661,702-703`, `BothSides.astro:797`, `FinalCta.astro:344` |

`Nav.astro` does both, in one file. `check-design-system.js` cannot see this: rule 4 checks colours,
`font-size` and `max-width`, and a `min-height` in px is none of those. It is small; it is also
precisely how the 44px floor stops being one number.

### 1.6 Two disagreeing ratios for inline `<code>`

`prose.css` uses `font-size: 0.9em`; `Article.astro` uses `0.92em`. Both are on the
`check-design-system.js` allow-list as legitimate exceptions (a ratio is more correct than a token
here), and the allow-list entry itself records the problem: *"the two disagree, 0.9 against 0.92,
which nobody will ever see and which is exactly how a scale acquires a second opinion. One of them
should move."* Left here because the gate already tracks it, and because a documented disagreement
is a duplicate.

### 1.7 Not a duplicate, and worth recording so nobody "fixes" it

- `NewsletterForm` is deliberately **one** component rendered twice (`/about`, `/contact`) with the
  surrounding copy at the call site. Its header explains that the legacy tree shipped two copies
  that had already drifted in id naming. This is the pattern the rest of §1 should follow.
- `ShareRow` renders twice on every blog post and takes `position: 'top' | 'end'` solely to keep
  ids unique. One component, two instances, no duplication.
- `Button` replaced nine hand-typed `background: var(--c-teal)` declarations. It is the worked
  example of what §1.2 needs.

---

## 2. Layouts

Six. Every page renders through `Base`; five specialise it.

### `layouts/Base.astro`286 lines

The html shell. **Owns:** the document skeleton, `<html lang>`, the skip link, `color-scheme: dark`,
`Nav`, `Footer`, `CommandPalette`, and the two sitewide stylesheet imports (`tokens.css`,
`surfaces.css`). **Does not own:** any metadata, which is delegated wholesale to `Seo.astro`.

Props: `title`, `description`, `path` (required); `image`, `type`, `publishedAt`, `updatedAt`,
`noindex`, `schema`, `ogTitle`, `ogDescription`, `twitterTitle`, `twitterDescription` (optional).
Every optional prop is a pass-through to `Seo`.

**Must not be used for:** page content. If a rule would apply to *most* pages but not all, it goes
in a stylesheet in the `components` layer, not here, or it becomes unopt-out-able.

`surfaces.css` is imported here rather than per page so *"a card looks the same on every route by
default and has to be argued with to differ"* (its own comment).

### `layouts/Article.astro`802 lines

The blog post layout. Implements Figma A1 *"Dark hero to light reading pane"* (`183:3`), owner-chosen
2026-08-02.

Props: `title`, `description`, `path`, `publishedAt`, `category` (required); `image`, `updatedAt`,
`readingTime`, `faq` (optional).

**Owns, and this is the point of it:** the `BlogPosting` + `BreadcrumbList` + `FAQPage` JSON-LD, the
`ShareRow` (twice), and the `RelatedPosts` rail. All three were lost by the port from the legacy
site and all three are here rather than in the eight Markdown files, *"which is what stops the next
post from shipping without them"*.

**Also owns the only light surface on the site.** A literal light palette (`#F5F6FA`, `#0B0E19`,
`#2B3245`, `#626C82`, and a darkened teal `#0F766E`) is bound to the token *names* on one element,
so components inside it re-theme with no edits. `tokens.css:259-288` records why that palette has
**not** been hoisted into the token file: one instance is not a system. The brand `--c-teal`
measures 1.6:1 on that pane and is unusable there.

**Must not be used for:** anything that is not one continuous long-form document. The hard cut
between the dark band and the light pane is the whole idea and *"must never become"* a gradient.

### `layouts/Compare.astro`580 lines

`/compare/crowmark-vs-*`. 17 props, all required, all content: `title`, `description`,
`ogDescription`, `articleDescription`, `path`, `publishedAt`, `updatedAt?`, `competitor`, `eyebrow`,
`heroDescription`, `ogImage`, `ogImageAlt`, `ctaHeadline`, `ctaSubLine1`, `ctaSubLine2`, `faq`.

Three separate description fields is not redundancy: the legacy pages each hand-wrote a different
sentence for the meta description, the OG description and the `Article` JSON-LD, and collapsing them
would mean rewording published copy. See `content.config.ts:33-41`.

Renders the article on the dark palette even though the legacy pages used a white band, because
there is no light-surface token and hardcoding one *"would duplicate no token and drift the moment
tokens.css changes"*. Recorded in the file as a visual choice only.

**Duplicates:** hero, CTA band, `BreadcrumbList`, `FAQPage`. See §1.

### `layouts/Glossary.astro`442 lines

`/glossary/ppn-002` and `/glossary/toms-framework`. 22 props. The body is the `<slot/>`; the two
sidebar cards and the "Read more" link are typed props *"because their shape repeats identically
across both pages and typing it catches a missing field at build time rather than a silent blank
card"*.

Emits `DefinedTerm` + `DefinedTermSet` JSON-LD.

**Duplicates:** hero, CTA band, `BreadcrumbList`. See §1.

### `layouts/Legal.astro`277 lines

`/privacy`, `/terms`, `/cookies`, `/security`. Props: `title`, `description`, `path`, `heading`,
`headings` (required); `eyebrow`, `lastUpdated` (optional).

**Owns the contents rail**, generated from the `h2` headings Astro already parsed, *"so it cannot
drift out of step with the document the way a hand-maintained list always eventually does"*. `h3`
are excluded on purpose: in these documents they are sub-clauses and would swamp the rail.

`lastUpdated` is optional because two of the four documents genuinely carry no date on the live site.
That gap is logged rather than filled with an invented date. **Do not invent one.**

Uses `breadcrumbs()` from `lib/schema.ts`. One of only two layouts that does.

### `layouts/Sector.astro`510 lines

`/sectors/construction|education|facilities|highways`. 18 props including a `steps` array and a
`figure` object with an AVIF/WebP/PNG triple.

**Duplicates:** hero, CTA band (twice in the one file), `BreadcrumbList`, `FAQPage`. See §1.

---

## 3. Primitives

The three components everything else is built from.

### `components/layout/Section.astro`246 lines

**The most important file in the library.** Read its header before changing any section.

Props:

| Prop | Type | Notes |
|---|---|---|
| `eyebrow` | `string?` | Small mono line. *"Use it for provenance, not decoration."* |
| `title` | `string?` | Omit for a purely visual section |
| `standfirst` | `string?` | One or two sentences, ~62ch |
| `as` | `'h1' \| 'h2' \| 'h3'` | **Structure only.** Never changes rendered size |
| `id` | `string?` | Anchor id, also wires `aria-labelledby` |
| `bleed` | `boolean` | Content escapes the measure. Head block never does |
| `class` | `string?` | |

**Owns:** `--measure`, `--gutter`, `--sec-pad-y`, the head block and its internal gaps, and
`--sec-gap` down to the content. A section that redeclares any of these is reintroducing the defect
the file was written to fix: five different H2 sizes, six max-widths and five gutters on one page.

**`as="h1"` is not cosmetic.** Before the union allowed `h1`, four pages built on this primitive
(`/contact`, `/faq`, `/about`, `/partners`) shipped with **no `h1` at all**. `check-design-system.js`
rule 5 and `tests/heading-structure.spec.js` both assert one `h1` per route now.

**Centres the head block only.** Never the slotted body. A centring rule that reached into
`.section__body` would hit cards, tables, matrix rows and prose, and rebuild the legacy cascade of
138 per-element opt-outs across 24 pages.

**Known limitation:** cannot render a hero. It renders `--t-h2`, so `HeroStack` cannot use it. See
§1.1.

### `components/ui/Button.astro`247 lines

**The only button.** Replaced `background: var(--c-teal)` hand-typed in nine files.

Props: `href`, `variant` (`primary`/`secondary`), `size` (`md`/`sm`), `type`, `label`, `target`,
`rel`, `class`.

Renders `<a>` when `href` is given and `<button>` otherwise, *"because a control that navigates is a
link and a control that acts is a button"*.

`rel` defaults to `noopener noreferrer` whenever `target="_blank"`, so the protection cannot be
forgotten at a call site. `target`/`rel` are forwarded because five sign-in links could not be
converted without them.

`size="sm"` resolves to `--btn-h-sm` = 44px, the WCAG 2.2 target-size floor. **Do not add a smaller
size without reading 2.5.8 first.**

The variant axes match the `Button` component set in the Figma library `wJ9DK6ByFUN6rWe0CpCVPU`.
A variant added in one place is added in both.

### `components/seo/Seo.astro`110 lines

Every metadata concern in one place. Replaced 45 hand-written `<head>` blocks; the heads of
`index.html` and `crowmark.html` had drifted 427 lines apart.

Props: `title`, `description`, `path` (required); `image`, `type`, `publishedAt`, `updatedAt`,
`noindex`, `schema`, `ogTitle`, `ogDescription`, `twitterTitle`, `twitterDescription`.

**The canonical is derived from `path` and is never hand-written.** One special case, deliberate:
`/` canonicalises to `https://crowagent.ai/` with the trailing slash, matching the live site and the
legacy sitemap. Everything else has it stripped.

`schema` is **merged** into the shared `@graph`, never replaces it. The `Organization` node appeared
verbatim on 40 legacy pages; it is defined once in `data/site.ts` and emitted here.

**Must not be used for:** anything a page renders. It emits `<head>` content only.

---

## 4. Chrome

### `components/nav/Nav.astro`776 lines

Props: `currentPath` (required, drives `aria-current`).

Renders from `data/nav.ts`, extracted verbatim from the legacy injector `js/nav-inject.js`.

**Deliberate behavioural change from legacy:** the Products trigger is a single `<button>` disclosure
widget. The legacy version was an `<a href="/crowmark">` that also toggled a dropdown via a separate
chevron, reconciled at runtime by ~150 lines of capture-phase interception because it fought a
second handler in `scripts.min.js`. That handler does not exist here, so neither does the workaround.

**Carries two of the nine known design-system debt items** (`font-size: 11px` on the Cmd-K key cap;
`max-width: 1440px` on the outer rail, which is a recorded exception rather than debt). Both Nav and
Footer were ported as page chrome and were not in scope for any of the design sweeps, *"which were
measured across page CONTENT. The chrome on every page of the site is the part of it furthest from
the design system."*

### `components/nav/CommandPalette.astro`449 lines

No props. Mounted once by `Base.astro`.

Exists because `[data-cmdk-open]` shipped in `Nav.astro` with no handler anywhere: the search button
was a dead control.

Follows the APG combobox-with-listbox pattern rather than approximating it: `role="combobox"`,
`aria-controls`, `aria-activedescendant` (so focus never leaves the input while arrowing),
`role="option"` + `aria-selected` inside `role="listbox"`, `aria-modal` with a focus trap and focus
return, and a polite live region announcing the result count.

**No dependency, deliberately.** ~200 lines against any headless combobox library, on a site whose
measured problem was payload.

Its index is built at build time by `lib/search-index.ts` from the real routes, and ships as a
`<script type="application/json">` block of ~7.3 KB on every route. That is data, not JavaScript,
and it is the single largest per-route inline block on the site.

### `components/footer/Footer.astro`337 lines

No props. Renders from `data/footer.ts`.

**Deliberately not reproduced from legacy:** the mobile tap-to-expand accordion on each column
heading. It is progressive-enhancement convenience, not content; reproducing it would duplicate a
second stateful disclosure implementation next to the one in `Nav`. Left out on the record rather
than dropped silently.

**Carries one known debt item:** `font-size: 10px` on the "free" chip, the only 10px on the site.
`tokens.css:163-198` refuses a `--t-control` tier below `--t-micro` and gives four reasons; the fix
is to grow the chip, not to add a tier.

---

## 5. Homepage sections

Seven components under `components/sections/`. **None takes props.** Each is a single-use component
holding one owner-approved Figma frame, its data, its geometry and its motion, and each is imported
exactly once, by `pages/index.astro`.

That is unusual and it is correct here. These are not reusable UI; they are seven arguments, and the
component boundary exists so that the reasoning behind each argument has a place to live. Every one
carries a header comment running 40 to 120 lines that records the variant chosen, the variants
refused, the copy that was cut and why, and the specific defect a future edit would reintroduce.
**Those comments are the specification.** Read the file before editing the section.

| Component | Lines | Figma | Uses `Section` | The one thing that must survive every edit |
|---|---:|---|---|---|
| `HeroStack` | 1450 | `43:3` / `39:2`, Hero V6 | No (needs `--t-h1`) | The sequence runs **downward**: Qualify, Win, Get paid. Hue follows depth **continuously** across all three planes; three flat per-plane fills read as three categories |
| `MarketShape` | 748 | `144:2` | Yes | Four figures, each resting on statute. `s.52` and `s.71` are **two duties** and must never be merged (OA-26). No count-up animation |
| `Lifecycle` | 1174 | `79:53`, M7 "Closed loop" | Yes | It is a **ring**, not a rail. No sentence under a stage name. No figures at all |
| `BothSides` | 906 | `78:1065`, B2 "Shared spine" | Yes | One rail read from both ends. Flattening it to two side-by-side cards throws the argument away and keeps the words |
| `ReasoningTrace` | 1225 | `65:2`, R3 "Five-step rail" | Yes | **The dropped figure.** A version with a shorter rail and no refusal has kept the picture and thrown away the argument |
| `Integrations` | 647 | `152:2`, IN-C "Chip grid" | Yes | Six chips, not the nine the frame draws. Each prints its **actual scope**, not the words "read only" |
| `FinalCta` | 373 | none: the legacy CTA, ported | Yes | Both trust signals, and the free no-account row |

Three rules the whole set holds, each written into several of the files:

1. **No JavaScript for correctness.** Every word is in the HTML at first paint. This site has
   already shipped a staged reveal that failed the axe gate with colour-contrast on 7 nodes, and an
   observer that left 4 of 9 homepage sections permanently invisible.
2. **No arrow glyphs in `--font-mono`.** JetBrains Mono has no arrow coverage; `→` rendered as a
   stray `+` in the first build of `BothSides`. Use `>>` and `<<`.
3. **Colour is light, not taxonomy**; except on markers. `HeroStack:231-286` and `Lifecycle:736-762`
   both carry the test: change an element's hue and ask whether the *meaning* changed. Teal
   verified, cyan interactive, orchid refused, amber at-risk. Ambient fields, bloom and surface
   gradients take the full range.

---

## 6. Forms

Three. `styles/forms.css` holds the shared field vocabulary; each component holds its own fields,
validation and endpoint.

### `components/forms/ContactForm.astro`456 lines

No props. **The site's primary conversion path**: every sitewide "Request access" CTA points at
`/contact?enquiry=limited-access#contact-form`.

Four legacy defects were fixed at the source rather than carried across: consent is now enforced
(UK GDPR Art. 6(1)(a)); there is one email validation rule instead of two that disagreed; errors
carry `aria-describedby` and `aria-invalid` and are never empty; and there is one `?enquiry=` reader
instead of two.

`novalidate` **is load-bearing.** Without it the browser blocks submission, the `submit` event never
fires, and the inline errors never appear. Fields keep `required` so assistive tech still announces
them.

**Field `name`s and `enquiry_type` option `value`s are a wire contract** with
`app.crowagent.ai/api/contact/submit`. Rename a label freely; never rename a value.

Turnstile loads on **first focus only**. Measured cold, `/contact` was 419 KB of which 344 KB was
the challenge widget. The earlier `IntersectionObserver` fired immediately on this page, so every
visitor paid for spam protection whether or not they typed anything.

### `components/forms/NewsletterForm.astro`270 lines

Props: `id` (unique prefix, because `/contact` carries two forms on one document), `source` (sent as
the attribution field; values match what the legacy interceptor derived from the pathname).

POSTs `{email, source}` to `https://app.crowagent.ai/api/notify`. **Success is read from the
response, never assumed**: an earlier legacy handler sent `no-cors` and showed "you are on the
list" unconditionally while the endpoint 404'd, so every subscriber saw success and every address was
dropped.

**The payload is `{email, source}` and nothing more**, deliberately. The consent line is a notice,
not a checkbox, so there is no tick to record, and inventing a field a strict server schema would
reject is how a live capture path breaks.

### `components/forms/PartnerForm.astro`393 lines

No props. Posts to `https://formspree.io/f/xbdpkaol` via `fetch(form.action)` (line 354), with an
`action=` attribute on the form as the no-JS fallback (line 114).

**Its header comment is STALE, and the correction matters in both directions.**

The comment (lines 5–19) asserts that `privacy.html` contains zero occurrences of "Formspree", that
this is an undisclosed recipient under UK GDPR Art. 13(1)(e) and an undocumented US transfer under
Ch. V, and that **OA-08 is a cutover blocker for `/partners`**. **That is no longer true.**
`astro/src/content/legal/privacy.md` now names Formspree twice, in the sub-processor table and with
a full entry: *"Formspree (US): Delivery of partner and reseller enquiries submitted from the
Partners page. Receives the name, company, role, email address and phone number you enter on that
form."* Verified in the built `/privacy` on 2026-08-03. **OA-08 as written is resolved; the comment
should be corrected rather than left asserting a live legal defect that has been fixed.**

**A different and live defect is in its place, and nothing catches it.** The shipped CSP
(`dist/_headers:140`) has `connect-src 'self' https://crowagent.ai https://app.crowagent.ai …` and
`form-action 'self' https://app.crowagent.ai`. **Neither names `formspree.io`.** In production
Cloudflare serves `_headers`, the browser enforces the policy, and the `fetch()` on line 354 is
blocked: as is the `action=` fallback. The partner enquiry form does not submit on the live site,
and it fails the way `check-csp.js`'s own header describes: *"The failure mode is silent and total."*

A comment at `_headers:34` reads *"form-action restricted to self + formspree"*, so the intent was
recorded and the origin was then dropped from the directive. `check-csp.js` cannot see it: it scans
static `<script src>`, `<link rel=stylesheet>`, `<img src>`, `<iframe src>` and CSS `url()`. A
`fetch()` inside an inline script and a `form action=` attribute are none of those. See
`TESTING-AND-QUALITY-GATES.md` §12.2.

Better than the legacy form in four ways: consent is *recorded* with the exact wording and an ISO
timestamp (Art. 7(1) is about being able to demonstrate what was consented to); the Turnstile token
is sent rather than discarded; errors are wired and non-empty; and the submit button is never left
disabled by a rejection.

---

## 7. Blog

### `components/blog/PostImage.astro`309 lines

Props: `slug`, `sizes` (both required); `duotone` (`'a'|'b'`), `priority`, `credit`, `boxWidth`,
`boxHeight`.

Carries the approved photograph treatment as five named layers plus a type scrim. Roughly 15% of
original chroma survives. **It does not change on the light reading pane**: brightening it would put
full-colour stock photography back on the page, which the research found reads cheapest on a dark
premium site.

**Artwork is exempt from layers 1–3.** Two of the eight heroes are generated brand artwork;
desaturating something already drawn in the brand palette turns a deliberate graphic into a muddy
one. Layers 4 and 5 are frame chrome and stay on.

**There is deliberately no `class` prop, and the reason is a real defect.** The first version took
one and forwarded it. It rendered,`class="pi ledger__thumb"` was in the shipped HTML: and did
nothing, because Astro scopes styles with the *component's own* `data-astro-cid` and does not stamp
the parent's onto a child's root. `.ledger__thumb { grid-area: thumb }` compiled to
`.ledger__thumb[data-astro-cid-PAGE]` and matched nothing. *"A prop that is accepted, rendered and
silently inert is worse than no prop."* **Callers wrap this component and style the wrapper.**

Its `--pi-*` colour values are literal and none exists in `tokens.css` (there is no duotone pair, no
image floor, no scrim). They are gathered into one block so there is one place to move them from.

### `components/blog/RelatedPosts.astro`243 lines

Props: `slug`.

The rail all 8 legacy posts close with, which the port dropped. Those links **are** the internal link
graph between the posts: with the rail gone, six of the eight were reachable only from `/blog`. An
SEO regression, not a styling one. OA-28.

Relations come from `data/blog-related.ts` (carried across from the legacy pages). **Card text is
derived from the content collection, not carried across**, because the legacy rails disagree with
themselves: one post is titled three different ways across three rails.

A slug in the map that no longer exists **throws at build time** and names the file to edit.

### `components/blog/ShareRow.astro`306 lines

Props: `title`, `url`, `position` (`'top'|'end'`).

**These are links, not integrations.** No SDK, no widget, no counter, no pixel. That is why the
build's zero-external-origin property survives this file: `check-csp.js` reads script/img/iframe/
stylesheet sources and an `href` is none of those. **Do not "improve" this with an official share
button**; that is the version that phones home on page load.

No tracking parameters. The mailto has **no recipient**: adding one would turn a share control into
an unsolicited message to us. X is still `twitter.com/intent/tweet`, matching the live site.

### `components/blog/heroes.ts`143 lines

Not a component; the picture registry. Maps each post slug to a file basename, the legacy post's own
`alt` string carried verbatim, a `kind` (`photo`/`artwork`) and a credit.

**A missing entry throws.** `heroFor()` fails the build and names the file to edit, because a post
with no hero renders a row with a hole in it.

Also exports `accentFor()`, used by `pages/blog/index.astro`.

The eight images had existed with a 400/600/800/1200 WebP ladder and verified credits since before
the rebuild, and `scripts/copy-assets.js` copies **by reachability**, so until this module existed
not one of them had ever been copied into `dist/`. *"The pictures were licensed, resized, laddered,
credited and then left on the floor."*

---

## 8. Rules for adding a component

1. **Check §1 first.** If the thing you need is a hero, a closing CTA band, an eyebrow capsule, a
   breadcrumb or an FAQ block, the answer is not a new component: it is to consolidate one of the
   existing sets.
2. **A component that cannot express what its call sites need is not a component.** `Button` forwards
   `target`/`rel` for this reason. A narrower thing pretending is worse than no abstraction.
3. **A prop that is accepted and silently inert is worse than no prop.** See `PostImage`. If Astro's
   scoping means a prop cannot work, do not ship it.
4. **State only what is local.** Do not restate `background`, `border`, `border-radius`,
   `box-shadow`, `backdrop-filter` or the card hover: `surfaces.css` owns them, Astro's scoped styles
   are unlayered and would win, and restating them is how the card count reached twenty-one.
5. **Write the header comment.** Every component in this library that has survived a redesign has one
   that explains the defect it exists to prevent. That is not documentation overhead; it is the only
   thing that stops the next agent removing the fix in good faith.
6. **Add it here.** An inventory that is not maintained is how duplication became invisible in the
   first place.

---

## 9. Traceability

| Claim | Where to check |
|---|---|
| 20 files render `<Section>`, 78 instances | `grep -ro "<Section" astro/src --include=*.astro \| wc -l` |
| Seven files restate Section's head-block rules | `blog/index.astro:249`, `compare/index.astro:141`, `glossary/index.astro:400`, `sectors/index.astro:194`, `Compare/Glossary/Sector.astro` |
| Three hand-written `BreadcrumbList` | `Compare.astro:74`, `Glossary.astro:81`, `Sector.astro:70` |
| Two hand-written `FAQPage` | `Compare.astro:103`, `Sector.astro:81` |
| Turnstile literals duplicated | `ContactForm.astro:95,305`, `PartnerForm.astro:106,276` |
| `44px` literal in four files | `CommandPalette.astro:404`, `Nav.astro:660,702`, `BothSides.astro:797`, `FinalCta.astro:344` |
| 9 known design-system debt items | `cd astro && node scripts/check-design-system.js` |
| Formspree **is** named in the privacy policy (OA-08 resolved) | `grep -ci formspree astro/src/content/legal/privacy.md` → 2 |
| `formspree.io` is absent from `connect-src` and `form-action` | `grep -o "form-action [^;]*" astro/dist/_headers` |
