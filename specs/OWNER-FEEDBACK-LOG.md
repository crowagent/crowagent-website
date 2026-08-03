# Owner feedback log

Every issue the owner has raised, with status. The owner has **stopped reviewing** as of
2026-08-02 and will not look again until this log reads DONE across the board.

Status values: `OPEN` · `IN PROGRESS` · `DONE` · `BLOCKED` (needs an owner decision) ·
`WONT DO` (with a reason).

Companion files: `HOMEPAGE-DECISION-TABLE.md` (what was chosen) · `DESIGN-DECISIONS.md` (the
binding rules) · `../OWNER-ACTIONS.md` (defects needing the owner) · `THE-REGISTER-PLAN.md`.

---

## G. Third review round — 2026-08-03

### G1 · The page background gradient · **DONE**

> "I don't think page gradients removed. I just wanted background gradient off, and don't want to
> switch off other gradients like eyebrow and section text."

The first attempt removed too much, and the owner was right to reject it. Measured properly: of the
ten large gradient backgrounds on the page, **only six were atmosphere, and all six drew from
`--orb-violet` and `--orb-teal`.** Setting those two tokens to `none` turns off exactly the
background haze and nothing else. Eyebrow capsules, hero stratum ramps, numeral ramps, gradient
borders and component glows are all untouched. Set to `none` rather than deleted, so one line
restores it.

The other four large gradients (`spine`, `bs__spine`, `rt__rail`, `fc`) are component surface wash,
not page background, and stay.

### G2 · "This gradient is another example of bad design, it must be managed centrally" · **IN PROGRESS**

Measured before arguing: **86 gradients defined locally in components and pages, against 5 gradient
tokens.** Worst files `crowmark.astro` 13, `HeroStack.astro` 9, `BothSides.astro` 9,
`Integrations.astro` 8, `ReasoningTrace.astro` 7, `MarketShape.astro` 6. The owner's read was
correct and the number is the proof. An agent is classifying them into families, adding tokens,
replacing every local definition and adding a gate rule so it cannot recur.

### G3 · The competing implementation on :8097 · **DONE, and it found a real fault in ours**

> "Personally I did not like anything apart from the scroll page animation, which feels like the
> page is loading on scroll, cinematic, or maybe floating."

The effect is **scroll-linked arrival**: content translating up and settling as it enters the
viewport, children arriving in sequence. Theirs used 40px of travel, a 1s ease-out-quint and a 0.1s
stagger.

**Why ours felt static beside it.** We do have scroll-driven motion — `animation-timeline: view()`
parallax — but it is applied only to `[data-field]`, the ambient light-field wrapper behind each
section. Content itself has never had arrival motion at all. Once G1 set the orb tokens to `none`,
the only scroll-linked motion on the site was moving something invisible.

**Their mechanism is not being copied.** It sets content to `opacity: 0` and depends on JavaScript
to reveal it; this codebase already shipped that pattern and it failed the axe gate. The
replacement is pure CSS on the `view()` timeline, no JavaScript, no state in which content can be
hidden, full opacity by the time a block is properly in view, applied to shared structural classes
so all 44 routes inherit it with no component edits.

Everything else there was rejected on inspection: magnetic buttons writing inline transforms that
fight our hover states, and a card glow rewriting `background` inline on every mouse move, which is
the opposite of central. All of it deleted, server stopped, repo checked for traces.

### G4 · Both CrowMark pages rebuilt from the approved design · **DONE**

P1's obligation ledger with P2's hero graphic, placed in front of the existing content rather than
instead of it, so nothing was lost. **Both product screenshots are gone**, replaced by drawn
artefacts. No shadow, radius, card recipe, colour or timing value is authored in either page file.

Zero axe violations on both. All gates pass. 0 KB of JavaScript still. Under
`prefers-reduced-motion`, `getAnimations()` returns 0 with final states shipped. No horizontal
overflow at 390/768/1440, measured mid-animation by pausing every animation and scrubbing it.

Known and recorded rather than hidden: `/crowmark` is 95.7 KB against a 100 KB budget, and the
plane stack, gate and ambient rig are duplicated across the two files and belong in
`components/sections/`.

### G5 · OA-20 closed — all four unported routes ship · **DONE**

44 pages, zero dead internal links, `KNOWN_UNPORTED` empty for the first time. Each route was
blocked on content accuracy rather than engineering. `/cookies` was materially wrong: it claimed
twelve cookies above a nine-row table, listed one nothing in the platform sets, named Stripe when
Stripe.js is not loaded at all, and omitted seven real first-party cookies.

### G6 · A sixth build gate, for regulatory facts · **DONE**

`check-facts.js`. Six rules, all of them errors this site actually published: the Procurement Act
date attached to PPN 002, a 5% social value floor, PPN 06/20 theme names under the PPN 002 name,
the withdrawn EPC C by 2028 interim stated as law, the proposed 2031 EPC B stated as settled, and
any MEES penalty above the £150,000 cap. It reads source rather than `dist/` and runs before
`astro build`, so a wrong fact fails in a second and still fails when a build cannot run.

Proving it fails caught two things worth keeping. It printed "every rule clean" while crashing on
the reporting path, so the clean result had never executed the code that reports a violation. And
it fired seven times on our own corrective text, four of those in comments written specifically to
prevent the bug.

### G7 · "Plugged in, read only" cells still not centred — third time of asking · **CHIP FIXED, SWEEP OPEN**

> "Why are product icons not centrally aligned in the card in this section, Plugged in, read only?
> I am so much frustrated by telling you again and again about these issues, which must be handled
> centrally."

**The frustration is earned and the cause is now known.** The chip was a two-column grid: an 18px
logo column, then the name and scope left-aligned beside it. The previous fix corrected the
placeholder's **size** (an 8px dot sitting in an 18px slot) and reported the icons as centred. They
were, each within its own column. **The question was about the cell; the answer was about the icon.**

**Why nothing caught it, which is the part that matters.** The design-system gate's alignment rule
fires on `text-align: left | start` being *declared*. This chip never declared it. It was left
aligned **structurally**, by the column template, inheriting `start` from the document like
everything else. There was nothing to grep for. The rule was not weak; it was reading the wrong
artefact. A declaration is what an author typed. Alignment is where the box ends up.

**The fix is a new gate that renders the built site and measures.** `astro/scripts/check-render.js`
opens all 43 routes in a real browser, finds every block that *looks* like a card to a reader (a
card-scale radius, padding, and a painted background or border — a visual test, not a class-name
test, because the defect was a block that never used the card class), and reports any whose content
is off the centre line. It reads the **computed** `text-align`, so inherited values are visible, and
it measures child box centres, so a grid track that puts content left is visible too.

**First run: 37 blocks on 98 route instances.** The top two were correct — a blockquote in eight
blog posts and a Shiki code block — so what is read rather than scanned is now excluded
structurally rather than by allow-list, mirroring the list the static gate already uses.

**Measured position now: the chip is fixed and 31 blocks on 75 route instances remain.** That is
the honest scale of "so much content still showing left aligned", and it is a sweep rather than a
patch. Worst offenders: `.cmp-relcard` on 12 routes, `.src__card` on 7, the three `about` cards on
10 between them, the `compare` choose-cards on 8.

**The gate is deliberately NOT wired into `npm run build` yet**, because wiring a failing gate
blocks every build. It runs manually today and gets wired the moment the sweep is clean. That is
recorded here rather than solved by seeding 31 exceptions, which would make it a gate that had
agreed not to look.

---

## A. Sitewide parity — raised 2026-08-02, the big batch

Everything in this section is **measured**, at 1440 across 24 to 25 routes, before and after.
No item is marked DONE on the strength of a report.

| # | Issue, in the owner's words | Status | Measured result |
|---|---|---|---|
| A1 | "Hero section messages must be same size" | **DONE** | 2 distinct h1 sizes → **1**. Root cause was structural: `Section.astro` rendered every heading at section size regardless of level, so any page whose hero came from that component got 46.4px while hand-built heroes got 83.2px. Fixed on the tag, and in `Legal.astro`, which carried its own copy of the same defect. |
| A2 | "Content and text must be central" | **DONE** | Left-aligned card content **126 → 44**. The 44 that remain are deliberate: cards holding 4 to 7 line paragraphs, where centring reads worse than the misalignment. Each is named in the agent report. |
| A3 | "Use of cards and sizes parity" | **DONE** | Card recipes **21 → 3 → 1** sitewide (`20px` radius, `28.8px` padding). Root cause: `surfaces.css` claimed a border it never set, so six card classes rendered as `border: 0px none`, `radius: 0`, `background: transparent` — a cast shadow and 28px of padding around bare text. That is the half-finished card look. |
| A4 | "Blogs pages look very poor to compare how we had earlier" | IN PROGRESS | 6 index variants and 6 article variants being designed in Figma first, per the method rule. Legacy is the reference for structure, not the quality bar. |
| A5 | "Another big issue is with font sizes differences" | **DONE** | Heading recipes **15 → 9 → 6**: four sizes, one weight per tier. Root cause: prose ran one tier below its tag (h2 at `--t-h3`, h3 at `--t-h4`) in `prose.css`, `Glossary.astro`, `Compare.astro`, `methodology.astro` and `Article.astro`, which is how two h2 sizes ended up on one page. |
| A6 | "Why did I lose all the animations from button and tile/card mouse hover shiny animations" | IN PROGRESS | The glossy hover was one legacy declaration: `inset 0 1px 1px` white 8%, a specular top-light, plus `backdrop-filter: saturate(160%) blur(16px)` and a teal-tinted border and lift on hover. Rebuilt as `.surface` in `surfaces.css`, verified firing on 9 routes. **Buttons still to be confirmed separately.** |
| A7 | "You are excessively using teal/green colours in header and text" | **DONE** | Teal-painted headings **7 → 1**. The survivor is "Deliver" on the homepage lifecycle, where teal is load-bearing: it is the verified mark the palette rule reserves. |
| A8 | "Lots of buttons and cards are not centrally aligned" | **DONE** | Uncentred multi-action rows **8 → 0**. |

**Two defects found while doing the above, neither reported by the owner:**

- **`.sr-only` was used in markup and defined nowhere.** Tailwind is installed but no stylesheet
  imports it, so no utilities are generated. "Term index" and "Search glossary terms" were
  rendering in full view on `/glossary`. Now defined properly in `@layer utilities`.
- **`@layer` order was not actually enforced.** `tokens.css` documents "THE ORDER IS THE CONTRACT",
  but Astro emits one CSS bundle per route, and on `/terms` the bundle carrying `prose.css` was
  linked ahead of the one carrying `tokens.css` — so `components` registered as the first layer and
  silently outranked everything below it. Harmless until someone added a `base` rule, at which
  point it would have been outranked with no visible cause. Fixed by restating the idempotent
  `@layer` statement at the top of `prose.css`, `surfaces.css` and `forms.css`.

## B. Homepage — raised 2026-08-02

| # | Issue | Status | Notes |
|---|---|---|---|
| B1 | "Duties, not estimates: why so much text? Give one link to a page where we cite all sources" | IN PROGRESS | Cutting to numeral + short label + mono tag. New `/sources` page carries every citation. |
| B2 | Hero "Learn more" is not in a button | IN PROGRESS | Becoming a secondary `Button`. |
| B3 | "Get paid." should be gradient in the heading | IN PROGRESS | Scoped span behind an `@supports` gate, solid fallback. |
| B4 | Market numbers: reduce text, keep style, like S3 Proportional | IN PROGRESS | |
| B5 | "One engine, end to end": link to a detail page, less content here | IN PROGRESS | The three per-market vocabulary blocks come off the homepage. |
| B6 | "Both sides of the table" and "Run the real engine": too much textual information | IN PROGRESS | |
| B7 | "The biggest issue is animation, auto play and motion like Apple, Google Antigravity, Stripe" | IN PROGRESS | Motion system being designed in Figma, per section, with timing. |
| B8 | Integrations section "PLUGGED IN, READ ONLY" missing from the rebuild | IN PROGRESS | Exists on the live site. 4 Figma variants being designed. |
| B9 | "Do we need carousels to show product on 3 devices, desktop, tablet, mobile?" | IN PROGRESS | 3 Figma variants using purpose-drawn graphics, never captures. Recommendation to follow. |
| B10 | Hero 3 horizons should be gradient or colourful, not just green. Same for most diagrams. Cinematic, like Apple/Google/Stripe | IN PROGRESS | Resolution: **colour returns as light, not as a label.** Semantic marks keep their hue; atmosphere, bloom, surface gradients and lighting get the full range. |
| B11 | **Verdict:** "far away from a top 1% ultra premium home page, full of text, looks like a research website instead of a product website" | IN PROGRESS | Target: under 250 visible words on the page. Rigour moves to `/sources`, not deleted. |

## C. Specific pages

| # | Page | Instruction | Status |
|---|---|---|---|
| C1 | `/partners` | Exact same design and layout as `:8092` | DONE, needs owner sign-off |
| C2 | `/resources` | Content fine; layout, card style and centring to match `:8092` | DONE, needs owner sign-off |
| C3 | `/changelog` | Central alignment missing | DONE |
| C4 | `/cookies` | Corporate information block should be a card | DONE |
| C5 | `/tools` | Needs central alignment | DONE |
| C6 | Footer trust badges | Not centrally aligned (AES-256, TLS 1.3, GDPR, UK & EU residency, ISO 27001 controls*, ICO registered, and the asterisk note) | DONE, icon-to-text delta 0.2px at 1440 and 390 |
| C7 | `/security`, `/privacy`, `/terms` | Confirmed fine, leave alone | NO ACTION |
| C8 | **`/pricing`** | Keep the same style as live `:8092`. Refine messaging, correct if needed. **Not ported at all yet.** | OPEN |
| C9 | **Product pages** | Use a design like `betterstack.com/log-management` and `betterstack.com/real-user-monitoring`, with similar quality visuals created in Figma | OPEN |
| C10 | **`/about`** | Still a visualisation gap. Reference `betterstack.com/enterprise`. Design similar in Figma, add animation, and adopt similar messaging, e.g. "who we build this for" | OPEN (copy corrections already DONE; the visual work is not) |
| C11 | `/about` copy | "engineers" renamed; 2010 bidding experience added; market-neutral corrections | DONE |
| C12 | Blog | Match `:8092` style; **no AI images, licence-free photography only**, must look professional | OPEN |

## D. Accuracy defects found and fixed today

| # | Issue | Status |
|---|---|---|
| D1 | OA-26 — a blog post attributed the s.71 assess-and-publish duty to s.52 | DONE |
| D2 | OA-27 — three homepage figures (`40,000+`, `55%`, `44%`) could not be sourced | DONE, section content replaced with statute-cited figures |
| D3 | OA-28 — the port silently dropped content on 9 routes, and no gate looked at content | DONE, plus a content-parity gate proved to fail |
| D4 | OA-29 — two pages listed the PPN 06/20 themes as the PPN 002 missions | DONE |
| D5 | PPN 002 dates stated two ways across 12 files | DONE, settled from the gov.uk notice: published 13 Feb 2025, mandatory 1 Oct 2025 |
| D6 | The PPN 002 model does not use National TOMs or proxy values at all; two pages said it did | DONE |
| D7 | A malformed CSS comment in `Base.astro` had been shipping the ambient layer as dead CSS | DONE |
| D8 | Deleting a published route passed every build gate silently | DONE, gate added and proved to fail |

## F. Second review round — 2026-08-02, from Figma

| # | Decision or issue | Status |
|---|---|---|
| F1 | **Blog index: B1 — Editorial ledger** (`164:3`) | DECIDED |
| F2 | **Blog article: A1 — Dark hero to light reading pane** (`183:3`) | DECIDED |
| F3 | **Integrations: IN-C — Chip grid** (`152:2`). Supersedes IN-A, which had already been implemented. | DECIDED, rebuild in flight |
| F4 | "Duties, not estimates": text and numbers not centrally aligned | IN PROGRESS |
| F5 | **"Animation and page flow does not look perfect... still feels very poor despite great design."** Wants Apple and Google level vibrancy and energy. Colour changes explicitly permitted. Designs stay. | IN PROGRESS — research pass running |

**F3 carries two things that must survive the rebuild**, because they are correctness and not
styling: the narrowed connector list (six evidenced read-only sources; Slack, Teams and Drive named
separately as writers; Zapier and Make absent because no connector exists), and the read-only claim
remaining visible as a claim. IN-A carried it as geometry, a struck arrow. A chip grid does not, so
it has to be carried in words or a per-chip scope label.

**F5 is the important one, and it is not a request for more animation.** The owner is explicit that
the designs and messaging are good and should be kept. What is missing is whatever makes those
sites feel alive. The research pass is measuring the specific techniques rather than guessing:
scroll-linked continuous transforms against our fire-once triggers, depth and parallax, scale
contrast, the actual luminance and chroma range of their palettes against our very dark navy, and
micro-interaction density. Colour is on the table for the first time, with the constraint that the
marker semantics (teal verified, violet refused, cyan interactive) must survive any change.

## E-DECIDED — all resolved 2026-08-02

The owner reviewed the recommendations and said "go ahead with all your recommendations", plus one
correction of their own. These are settled. Do not re-ask.

| # | Decision | Outcome |
|---|---|---|
| 1 | Lifecycle CTA | **LC1 — Quiet rule** (`130:2`). Sits under a busy diagram without competing. |
| 2 | Device carousel | **Do not ship one.** Device bezels claim "three apps" for what is responsive web, and autoplay hides two thirds of itself from every reader and crawler. |
| 3 | Integrations "read only" claim | **Narrow the connector list** to those we can evidence as read-only. The blanket claim currently covers Slack, Teams, Zapier and Make, which are outbound and automation surfaces. An unverifiable guarantee does not ship. |
| 4 | Hero closing line | **Restore** "The engine cannot clear its own gate. A named person approves." Our strongest line against competitors selling autonomy; dropped by accident in the V6 redesign. |
| 5 | Data residency | **"UK and EU" is correct** — owner confirmed. The legacy page saying "UK data residency" is the wrong one. |
| 6 | About meta description | **Change it.** It still frames the company as "a London-based team that reads the UK procurement rules", which contradicts the market-neutral decision. Update the `parity.spec.js` baseline with it, since that test hard-fails on title/description drift. |
| 7 | About second CTA | **Point it at the PPN 002 calculator**, as the legacy page did. Stronger offer, and it needs no account. |
| 8 | "Kickstart" vs "Kick start" | **Keep "Kickstart"** so the site, the engine and the product screenshots agree. Never present it as a verbatim quote from gov.uk, which writes it as two words. |
| 9 | Card body text | **SUPERSEDED 2026-08-02 for cards. Card content now centres; long-form prose stays left.** The original decision (left-aligned, because body copy is read rather than scanned, and because the legacy source's own comments call its centring an unfixed bug) was taken about long *body copy*, and it still holds there. It was then applied to cards, and on review of `:8095` the owner reported "a lot of content is still showing left on the pages and not centrally aligned". Measured at 1440 across 24 routes, 126 card content groups sat hard against the left edge of a card whose section head above it was centred, which reads as a layout that has come apart rather than as a considered alignment. The distinction that resolves both: **a card is scanned, so its content centres; prose is read, so it stays left.** Implemented once, on `.surface` in `astro/src/styles/surfaces.css`, with structural exclusions (`:has(ul, ol, dl, table, form, fieldset, pre, details)`) so lists, tables, forms and disclosures keep their own alignment automatically, and a single `surface--read` opt-out for a card whose one paragraph runs three or four lines. The four content-collection bodies (`.prose`, `.cmp-body`, `.gl-article`, `.article-body`) are not reached at all. After: 126 left-aligned card groups down to 40, and every one of the 40 is a deliberate exclusion. |
| 10 | "The Register" name | **Keep the `/register` URL, rename the visible label.** Collides with theregister.com. |

## E. Open owner decisions (not blocking the fixes above)

| # | Decision | Raised |
|---|---|---|
| E1 | Lifecycle CTA: pick from LC1 to LC6 on `:8096` | 2026-08-02 |
| E2 | `/about` meta description still says "A London-based team that reads the UK procurement rules". Changing it trips `parity.spec.js`, which hard-fails on title/description drift | 2026-08-02 |
| E3 | `/about` second CTA: legacy offered "Try PPN 002 Calculator (free)", ours goes to the contact form | 2026-08-02 |
| E4 | "Data residency: UK and EU" (ours) versus "UK data residency" (legacy). One is wrong | 2026-08-02 |
| E5 | gov.uk writes "Kick start economic growth"; the site and engine say "Kickstart" | 2026-08-02 |
| E6 | The hero closing line "The engine cannot clear its own gate. A named person approves." was dropped with the V6 redesign. Strongest anti-autonomy line we had | 2026-08-02 |
| E7 | "The Register" name collides with theregister.com | 2026-08-02 |
| E8 | Card body text: legacy centres it, but the legacy source's own comments call that an unfixed bug | 2026-08-02 |
| E9 | OA-20: `/pricing`, `/integrations`, `/roadmap`, `/cookie-preferences` are linked from every page and do not ship | earlier |
| E10 | OA-05: publish the AI credit numbers, or flip `CREDIT_ENFORCEMENT_MODE` to enforce first | earlier |

---

## Standing rules the owner has set (do not re-ask)

1. Design decisions are made from **Figma renders only**, 6–8 variants. Never a text or ASCII list.
2. **One decision at a time**, homepage first, section by section.
3. **Almost all work in background agents. Limited text in the terminal**; it is for decisions.
4. Keep status and detail **on disk**, continuously. This file is part of that.
5. **If an approved design lacks something the page needs, design it in Figma** — do not improvise
   it in code and do not drop it.
6. Market-neutral narrative, UK public as the proof point.
7. Centred head blocks; gradient eyebrows in outlined capsules; current colour theme is universal.
8. Other pages keep their `:8092` design and get messaging corrections, apart from the pages
   explicitly named above for redesign.
