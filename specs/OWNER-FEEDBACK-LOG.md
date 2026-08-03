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

**Then the root cause turned out to be one line in the card recipe.** `.surface` already centred,
but it carried `:not(:has(ul, ol, dl, table, form, fieldset, pre, details))` — which dropped the
**whole card** out of centring as soon as it contained one list. The intent was right and the scope
was wrong: the list must stay left, not the kicker, heading and body above it. Now the card centres
and those structures take their alignment back explicitly, scoped to themselves. That also removes
the `:has()` dependency, which had been failing in the wrong direction: where `:has()` is
unsupported the whole selector was invalid and discarded, so the fallback silently disagreed with
the design.

**Measured, before and after, against a scratch build: 31 blocks on 75 route instances → 18 on 42,
from one rule.**

The 18 remaining are two honest groups, neither of them the defect the owner reported:

- **Eleven are drawn artefacts** carrying `sv-raised` — spines, rails, gates, the award line, the
  fit panel. The flagged children are labels sitting beside the geometry they label, and centring
  them would break the drawing. **The fix is to mark them up as `<figure>`**, which the gate already
  excludes for the right reason, rather than exempting them by name.
- **Seven are the `/compare` cards**, which do not carry `surface` at all — a second card recipe,
  which the charter forbids. **They cannot be fixed in CSS**: `cmp-choose-card`, `cmp-sources` and
  `cmp-relcard` are raw HTML hand-written into each comparison markdown file and repeated per file.
  That is presentation markup living in content. The central fix is a rehype step in the content
  pipeline that attaches the card recipe, not a class added to twelve markdown files.

**The gate is deliberately NOT wired into `npm run build` yet**, because wiring a failing gate
blocks every build. It runs manually today and gets wired the moment the sweep is clean. That is
recorded here rather than solved by seeding 31 exceptions, which would make it a gate that had
agreed not to look.

### G8 · "Why are button sizes different for Request access and Learn more?" · **DONE**

> "I have highlighted this issue earlier but nothing fixed. Why do we have these issues if we have
> strong architecture? Looks like you still follow the manual approach."

**Both halves of that are correct.** The first report was answered by measuring HEIGHT: every `.btn`
was 54px with identical padding, type and border, and the conclusion recorded in `Button.astro` was
that the difference must be optical irradiation. The heights were right and the conclusion was
wrong, because **the difference is WIDTH** — 152px against 127px in the hero. One dimension was
measured and it was the one that matched.

There were also **two button systems side by side in the header**. "Sign in" was `ca-btn
ca-btn-ghost`, a near-copy of `.btn` with 1.1rem padding against the component's 1.5rem. Zero remain.

Fixed by a width floor of 9.5rem (7rem in the nav), so short labels stop making small controls while
long labels still grow. Hero pair now 152 and 152, measured. **Still unequal and stated plainly:**
`/about`'s pair is 198 and 159, both above the floor because both labels are long. Equalising those
needs a rule on the ROW, which trades against wrapping on phones, so it is an owner decision.

### G9 · The hero gradient was not the live one · **DONE**

> "Why are you using a very poor gradient in Get paid? All the gradients must be the same as what we
> have in live... you must use the exact same gradient."

**Correct, and the error was mine.** Asked to make the phrase multicolour "like the section
capsules", I used `--grad-spectrum`, which IS the capsule gradient. The live site does not paint
that phrase with it. Read from the running legacy build, the element whose text is literally
"Get paid." carries `linear-gradient(100deg, #2DD4BF, #22D3EE 42%, #A78BFA)` — three stops, no pink.
The capsules run four stops at 90deg finishing on pink.

Both now verified identical to live by comparing computed values side by side. Our eyebrows already
matched byte for byte; only the hero did not.

**For the record, the pre-31-July hero was different again:** `.hero-h1-accent`,
`linear-gradient(135deg, #2DD4BF 0%, #EAF1FB 70%, #5BC8FF 100%)` — teal through near-white to sky,
no violet at all. Replaced on 2026-08-01 by the premium homepage now live. All three are recorded in
`tokens.css` so nobody has to dig through history again.

### G10 · "Where is glassmorphism?" · **DONE**

It was never missing. `backdrop-filter: blur(22px) saturate(1.5)` was computed and applied on every
card — 21 of 21 on `/pricing`, 14 of 14 on `/about`, 10 of 10 on `/sources`. **What was missing was
anything behind it.** A backdrop filter blurs what it sits over, and blurring a flat fill returns a
flat fill. The site paid for the effect on every card and drew a plain panel.

Owner decision: restore all four gradient tokens **and** add a page-wide grain. The grain is not
part of the revert and would be worth having without it — the orbs are fixed and sized to the hero,
so `/pricing`, `/about`, `/sources` and the legal pages carry 45 glass cards between them and no
ambient field at all.

### G11 · The three hero horizons sat 91.7px left of centre · **DONE**

An empty fourth grid track: 320 / 140 / 500 and then **200fr of trailing air**, defended in the code
as "a deliberate left bias" from the approved frame. The bias was exactly half that track, while the
h1, standfirst and buttons above were all centred. The air is split evenly now; every internal
proportion survives. Measured after: all three rows 280..1160, off-centre **0.0**.

### G12 · Typography is not at the standard, measured · **PROPOSAL RUNNING**

Ours: h1 **83.2px at weight 800**, h1:body **5.2x**, three families. Google's Display Large is 57px
at weight **400**; Stripe's h1:body is 2.19x. **We shout where they compose.** Live treatments are
being built for comparison rather than applied.

Found while measuring: **`h3` renders at 32.8px on `/` and blog but 20.9px on `/pricing`.** The
design-system gate passes it because rule 2 checks that a heading's size comes from a token, not
that the token matches the heading's LEVEL. Same blind spot shape as the alignment and button
defects: the rule is right and the question it asks is wrong.

### G13 · The build was loading NO webfonts at all · P0 · **FIXED**

Found while auditing typography, and it is the largest defect found in this transformation.

**Zero `@font-face` declarations anywhere in `astro/src`.** `document.fonts.size` returned **0** on
the shipped page; the deployed site returns **7**. `--font-display: 'Plus Jakarta Sans'`,
`--font-body: 'Inter'` and `--font-mono: 'JetBrains Mono'` all resolved to **system-ui**, for every
visitor, on every word of every page. The five woff2 files were sitting in `Assets/fonts/` unused.

**Why nobody saw it.** A developer machine with those families installed renders the intended type
from local fonts, so it looked correct to everyone who worked on it.

**Why no gate saw it, which matters more.** `check-csp.js` verified that `font-src 'self'` is
permitted — true, and useless when nothing requests a font. `copy-assets.js` copies only assets the
build *references*, so with no `@font-face` there was no reference, no copy, and no missing file to
notice. Three mechanisms all reported success about a font stack that was not there. **A gate that
cannot see absence is not a gate.**

Fixed by lifting the declarations verbatim from `Assets/css/fonts-selfhosted.css`, which is what
live serves. Both now load 7 faces.

### G14 · "The page background gradient is still different" · **RESOLVED after four rounds**

The owner said this three times and was right three times. **The cause of the repeats is mine and
is worth recording:** I kept comparing against the legacy copy in this repo and the pages served on
`:8092`, instead of fetching `https://crowagent.ai/`. Those are not the same thing.

Once measured properly, the difference was **structural, not a matter of degree**:

| | live | ours |
|---|---|---|
| page wash | one fixed full-viewport layer, three gradients at 0.08–0.10 alpha, no blur | two circles at 0.82 alpha, blur 40px |
| starfield | 8 dots, animated, opacity 0.35 | **absent entirely** |
| hero orbs | **four**, blur 90px, `mix-blend-mode: screen` | two, blur 160px |
| orb placement | **violet left, cyan right** | **teal left**, violet low right |

The last row is why no amount of alpha tuning ever closed it: **the two halves of the hero were the
wrong colours.**

Sampled at 20 fixed points, `360,300` moved from Δ40 to Δ6 and `1080,300` from Δ44 to Δ10. A hero
vignette was then found to be under-lighting the top: switching it off took `60,120` from Δ37 to
Δ6. Stated honestly, the overall mean only moved 21.4 → 20.8, and two of the largest remaining
deltas are **not background** — they compare live's hero text against our background, because our
h1 sits higher.

### G15 · Typography measured against nine comparators · **DECISION OPEN, live on :8105–8109**

| | h1 | weight | h1:body |
|---|---|---|---|
| **ours** | 83.2px | **800** | 4.9x |
| Apple | 80px | 600 | 4.7x |
| Linear | 64px | 510 | 4.3x |
| Google | 60px | 400 | 3.3x |
| Stripe | 35.1px | 300 | 2.2x |

**My "our type is too big" claim was wrong and is withdrawn.** At 83px we sit beside Apple at 80px,
and our line-height 1.04 and tracking -0.020em sit between Apple and Linear. The 5.2x ratio compared
us against Stripe, whose h1 is 35px and is the outlier at the bottom of the set.

**Weight is the whole gap.** Every comparator caps display weight between 300 and 600; the single
exception is Anthropic at 700. Nobody reaches 800.

Four live treatments to choose from: **8105** control, **8106** Material 3 literal, **8107**
restraint on one family, **8108** weight only. Index on **8109**. The recommendation is **8108**,
because it is the only change the evidence actually supports, and it costs three token values.

Two further defects found in the same pass: **`--t-body` has no base rule** (written by hand in 145
places, so any paragraph no component styles falls to the UA's 16px), and **`--t-read-h1/h2/h3` have
no consumer** — the article title still uses `--t-h1` at 83.2px, which that token's own comment
calls "the hero, and nothing else".

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
