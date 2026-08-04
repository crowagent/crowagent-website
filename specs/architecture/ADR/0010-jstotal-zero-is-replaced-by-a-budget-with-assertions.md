# ADR 0010 — `jsTotal: 0` is replaced by a budget with assertions, and the shared script is externalised

**Status:** Accepted. Owner decision A-73, 2026-08-04, taken on a written recommendation and returned
with the number and the assertions specified
**Date:** 2026-08-04
**Supersedes:** the `jsTotal` row of `specs/architecture/PERFORMANCE-BUDGETS.md` and the
`jsTotal:all` exception in `astro/scripts/check-budgets.js`, both deleted here
**Extends:** the enforcement contract every gate in `astro/scripts/` shares
**Implements:** `astro/scripts/check-budgets.js`, `astro/src/scripts/shell.ts`,
`astro/src/scripts/nav.ts`, `astro/src/scripts/nav-dropdown.ts`,
`astro/src/scripts/command-palette.ts`, `astro/src/layouts/Base.astro`,
`astro/src/styles/crowmark.css`

---

## Context

### Why zero was adopted, and why it was a good number for a while

`PERFORMANCE-BUDGETS.md` set the JavaScript budget at zero bytes and called it a **ratchet**:

> the moment a bundle is legitimately needed, the budget changes by an explicit decision recorded as
> an ADR, rather than by a dependency arriving unnoticed.

That was a considered choice and not a slogan. Payload was **the** measured defect on the legacy
site, and every other budget in the table is a number somebody can argue down a kilobyte at a time —
*this image is only 30 KB over*, *this sheet is only 8 KB*. Zero is the one budget with no such
conversation available. It also encoded a real position: a static marketing site does not need a
runtime library, and the cheapest moment to refuse one is before the first one arrives.

It held for a while. Then it stopped measuring what it was adopted to protect.

### Why it stopped tracking the goal

`jsTotal` counts **`.js` files in `dist`**. Astro's answer to a small script is not to emit a file.

`astro/dist/…/plugin-scripts.js` inlines a hoisted `<script>` into the document whenever its chunk
has no imports, is imported by nothing else, and is under Vite's `assetsInlineLimit` — **4,096
bytes** by default. Four scripts on this site qualified, and all four belong to `layouts/Base.astro`,
so all four were written into every document:

| script | source, before | bytes per document |
| --- | --- | ---: |
| command palette | `components/nav/CommandPalette.astro` | 3,572 |
| header, mobile menu and accordions | `components/nav/Nav.astro` | 1,698 |
| nav dropdown | `components/nav/NavDropdown.astro` | 1,601 |
| magnet | `layouts/Base.astro` | 987 |
| | **total** | **8,958** |

### The arithmetic

    8,958 B  ×  44 documents  =  394,152 B  =  384.9 KB

Measured on the 2026-08-04 build, not estimated. Byte-for-byte identical in all 44 documents, and
**cacheable in none of them**, because bytes inside an HTML document are not a resource a browser can
cache. A reader moving from `/crowmark` to `/pricing` downloaded the same command palette twice.

While that was true, the gate printed:

    JS total           0.0 KB     4.2 KB across 1 file(s)

— and recorded the 4.2 KB as a **breach**. The exception it carried proposed the fix:

> The likely fix is `is:inline`, which moves the bytes into index.html (79.1 KB, so there is room)
> and returns the file count to zero…

That sentence is the clearest evidence in this repository that the proxy had inverted. Taking that
advice would have moved 4,283 B *into* a document, made the payload worse for every reader of the
homepage, and made this gate report an improvement. A number that can be satisfied by doing the
opposite of the thing it exists to encourage is no longer measuring the thing.

### The owner's ruling

> *"jsTotal:0 is a proxy that has stopped tracking the goal: 10KB inlined into 44 documents is
> ~440KB of duplicated bytes to protect a number. Replace the ratchet with a real budget — e.g.
> jsTotal <= 15KB, nothing render-blocking, no third-party JS — and externalise the shared script so
> it caches once. Do the crowmark.astro 22KB style block move in the same slice for the 5.3KB.
> 1,147 B of headroom is not a budget, it's a tripwire."*

The measured figure is 8,958 B and 384.9 KB against the ruling's ~10 KB and ~440 KB. The ruling is
right about the shape and slightly generous about the size; both numbers are recorded so nobody has
to reconcile them later.

---

## Decision

### 1. `jsTotal` is 15 KB, and three assertions sit beside it

The number alone could not have caught this, and a bigger number would not have caught it either.
The goal behind `jsTotal: 0` was never "few JS bytes". It was three separate claims, and each is now
**checked against the built output** in `check-budgets.js` rather than asserted in prose:

**Assertion 1 — nothing render-blocking.** No `<script src>` may lack `defer`, `async` or
`type="module"`. Inline `<head>` script, which blocks the parser but opens no connection, is
**budgeted at 2 KB per document** rather than banned, because this build has exactly one on purpose:
the platform-aware Ctrl/⌘-K badge in `Base.astro`, 1,100 B, which must run before `<body>` is parsed
or the nav paints the wrong label and then corrects it. Moving it to a file would convert a
microsecond of parsing into the network round trip the first half of this assertion forbids.

**Assertion 2 — no third-party JS in the payload.** No `<script src>` may point at another origin —
no scheme, no protocol-relative `//host/…` — and no inline module may `import` from one. Zero today.

This does **not** duplicate `check-csp.js`, and must not grow into it. That gate collects every
absolute origin in the build, including `el.src = 'https://…'` assignments and absolute `.js`
literals inside inline script, and checks each against the shipped policy in `_headers`. It is the
authority on *which origins are allowed*. The question here is narrower and is about payload rather
than policy: *does a document declare somebody else's script?* Turnstile answers no — it is created
at runtime by `Turnstile.astro` on the first focus inside a form, so it is in an interaction and not
in the payload, and `check-csp.js` asserts its origin is permitted. Nothing about it is unchecked,
and nothing about it is checked twice.

**Assertion 3 — nothing is paid for twice.** For every distinct inline script body in the build, the
cost of every copy after the first — bytes × (documents − 1) — summed, **budgeted at 16 KB**. This is
the assertion that would have caught A-73 on the day it was created. On the pre-A-73 build it
measures **339.5 KB**; after, **9.5 KB**, which is what four page-level components legitimately cost
(the carousel on two routes, the share row on eight, Turnstile on three, one form validator on two).
16 KB leaves room for another such component without a discussion and nowhere near enough for a
sitewide script to slip back in: the four removed here were 337.9 KB between them, so one of them
returning is a 5× breach rather than a creeping one. **That is the difference between a budget and a
tripwire**, which is the owner's own objection to the 1,147 B of margin on `/crowmark`.

Only **bundled** inline script counts against it. An inlined bundle is a *build* decision nobody
made; an `is:inline` script is an *author* decision, typed as a directive with, in this codebase, the
reason written above it. Astro emits the first with `type="module"` and the second with whatever the
author wrote, which was verified against the real build rather than assumed. The `is:inline`
duplication total is 46.9 KB — 47,300 B of it the head badge above, and the remaining 689 B the view
trigger `/crowmark` and `/crowmark-buyers` each carry a copy of. It is **printed on every run with
its subjects** and not budgeted, on the same rule the exception list runs on: a cost nobody sees
stops being a cost.

### 2. The shared script is externalised behind one entry

`src/scripts/shell.ts` is now the site's single client entry, carried by `layouts/Base.astro` and by
nothing else. It imports and boots the four behaviours above; `Nav.astro`, `NavDropdown.astro` and
`CommandPalette.astro` no longer carry a `<script>` at all, and each carries a note saying so and
why.

**One entry, because the inline decision is made per chunk.** Four `<script>` tags would still be
four Rollup entries and four chunks, and the small ones would go straight back to being inlined. The
only way to stop it is to have one chunk, and the only way to have one chunk is to have one entry.
The merged chunk is ~7.9 KB, comfortably over the 4,096 B limit, so it is emitted as one hashed file
— fetched on the first route a reader lands on, served from cache on every route after it.

**Not one line of the four scripts changed.** They were moved into `src/scripts/*.ts` verbatim, which
is where `motion.ts`, `magnetic.ts` and `tabs.ts` already live. The design reasoning stays in each
component's frontmatter, with the markup it describes.

**`motion.ts` is deliberately not in it.** It drives the homepage's arrival light, `index.astro`
imports it directly, and it stays a second entry on that one route. Folding it in would put an
`IntersectionObserver` on 43 routes that do not ask for one — a motion decision with a visual
consequence everywhere, not a payload one. It is the obvious next step and it is not this step.

### 3. `crowmark.astro`'s `<style>` block becomes `src/styles/crowmark.css`

1,206 lines and 45.7 KB moved out of the page file. It is the same "stop inlining" logic one layer
down: `scopedStyleStrategy: 'class'` stamps `astro-ivyj52o5` onto every element a page with a
`<style>` renders, and a page with **no** `<style>` gets no scope class at all — so the ~5.3 KB goes
entirely rather than shrinking. `/crowmark` is the largest document on the site.

**The scoping is replaced, not dropped.** A file in `src/styles/` is global. All 192 selectors — the
whole count, there is no rule that is not — are anchored under `.pg-crowmark`, which `Base.astro`
puts on `<body>` derived from the route. This is the technique `styles/prose.css` already states in
its own header: a global sheet made safe by anchoring, not by trust.

**It is not a precaution.** 41 of the 103 class names the sheet selects on also exist on eight other
routes — `/crowmark-buyers`, `/pricing`, `/resources`, `/integrations`, `/partners`, `/roadmap`,
`/tools`, `/cookie-preferences`. `.note`, `.kicker`, `.lead`, `.card__h`, `.card__body`, `.compare`,
`.proof`, `.facts` and the whole `.gate__*` family. Imported without the anchor it would have
restyled eight routes on its first build.

**Specificity is unchanged, and that was the condition for moving it.** Astro compiled `.hint` to
`.hint.astro-ivyj52o5` — (0,2,0). `.pg-crowmark .hint` is (0,2,0). That is also why the anchor is a
class and not `[data-page='/crowmark']`, which weighs the same and costs 9 bytes per selector across
192 of them against a CSS budget with 6.3 KB of headroom.

**The element set is unchanged, and that was checked rather than assumed.** All 103 classes appear in
the built `/crowmark` document and every occurrence of every one of them carries the scope class —
zero unscoped, zero absent. So the rules select exactly what they selected before. The check matters
in one direction specifically: a scoped rule naming a class rendered by a *child* component never
matched, and would have started matching the moment the scope came off. There is no such rule here.

`@keyframes` names are not anchored, because a keyframes name is not a selector. Astro did not scope
them either — they appear under their plain names in the 2026-08-04 build — so this is not a change.

### 4. The `jsTotal:all` exception is deleted

The gate's contract says the exception list may only shrink. This is it shrinking. It is the one
deletion in this file's history that is **not** a subject coming back inside a budget: the budget
moved. Its text is quoted above rather than only removed, because it is the evidence.

---

## Consequences

**What is now forbidden, and by what.**

| Forbidden | Enforced by |
| --- | --- |
| A `<script src>` without `defer`, `async` or `type="module"`, on any route | `check-budgets.js` assertion 1 |
| More than 2 KB of parser-blocking inline `<head>` script in any document | `check-budgets.js` assertion 1 |
| Any `<script src>` at another origin, or an inline `import` from one | `check-budgets.js` assertion 2 |
| More than 16 KB of duplicated bundled inline script across the build | `check-budgets.js` assertion 3 |
| More than 15 KB of `.js` in `dist` | `check-budgets.js`, `BUDGETS.jsTotal` |
| A second `<script>` in `Base.astro`, or a new one in any component it renders | assertion 3 — it becomes a second chunk, and if under 4 KB it is inlined into all 44 documents |
| A `<style>` block returning to `crowmark.astro` | nothing yet. See below. |

**A runtime dependency is still an ADR.** 15 KB is a size, and "no third-party JS" is a different
claim that a size cannot make. Assertion 2 is what refuses a library, and adding an origin means
changing this ADR *and* `_headers`, because a script permitted by one and not the other is a page
that silently does nothing — which is the exact defect `check-csp.js` was extended to catch when
`formspree.io` was found to have been blocked for two months.

**The gate was proved in both directions before it shipped.** Assertion 3 fails on the *real*
pre-A-73 build — 339.5 KB against 16 KB, naming all four sitewide scripts and their per-document
cost — and passes on the post-change build at 9.5 KB. Assertions 1 and 2 and both new byte budgets
were each proved to fail against a deliberately broken copy of `dist`: a bare `<script src>`, an
off-origin `<script src>`, an inline `import` from `esm.sh`, a fattened head script, and 9 KB of
extra `.js`. All five exit 1 and name the route and the tag. `check-budgets.js` gained a `dist`
argument for this, copied from `check-csp.js`, which already carries the argument for it: a gate that
can only be run as part of the one build nobody is allowed to disturb is a gate that gets skipped.

**Nothing here was verified by a build, and that is the one gap.** A full `astro build` was running
in this tree throughout the work and a second one would have emptied `dist` and corrupted every gate
that reads it, so every measurement above is taken from the completed 2026-08-04 build and from a
simulated post-change `dist` derived from it. The externalisation therefore rests on Astro's
documented and source-read inlining rule rather than on a built artefact. **This is why assertion 3
exists in the form it does**: if the consolidation did not work, the next build fails loudly with the
four bodies named, rather than passing quietly.

---

## Open, not decided

**Nothing stops a `<style>` block returning to a page file.** The 5.3 KB saving on `/crowmark` is
protected only by the per-route HTML budget, which the page now clears by roughly 9 KB — so a scope
class could come back and be absorbed silently. A rule that a page in `src/pages/` may not declare a
`<style>` block over some size would close it, and would want to be written when the second page
sheet is extracted rather than for the first.

**`/crowmark-buyers` is the same page with the same problem** and is untouched. It carries its own
scoped block and its own byte-identical copy of the view trigger. The body class is already there for
it and `styles/crowmark-buyers.css` is a mechanical repeat of what was done here.

**Folding `motion.ts` into the shell entry is the next payload question and the first motion
question.** It would delete the two duplicated `is:inline` view triggers on `/crowmark` and
`/crowmark-buyers` — which `check-motion.js` already carries as two named DEBT exceptions — and give
those routes the full arrival behaviour rather than the interim trigger. It also runs an observer on
43 routes that currently have none, which is a visual decision on every page.

**The 4,096 B inline limit is Vite's default and nothing in this repository pins it.** A Vite or
Astro upgrade that changed it would silently re-inline or externalise scripts under the site's feet.
Assertion 3 would catch the direction that costs bytes; the other direction — everything suddenly
external — would show up as a `jsTotal` breach, which is a strange way to learn about a dependency
upgrade but is at least loud.

**Assertion 3 cannot see duplication that is not byte-identical.** Two components that do nearly the
same thing in two different chunks are the defect this codebase has spent a fortnight unpicking, and
this rule is blind to them by construction — it compares strings. `check-treatments.js` and
`check-shared-blocks.js` are where that question lives, and neither of them looks at script.
