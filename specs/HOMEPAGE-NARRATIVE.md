# Homepage narrative — the argument, not the styling

Raised by the owner, 2026-08-03, verbatim:

> "The home page has so much visual but looks like the storyline is missing overall, and what we are
> trying to say is completely lost. I think we need some research to make the home page slightly
> simpler and stronger."

Then, mid-flight, the deliverable changed:

> "show me 4 variations of home page based on your decision narrative including change of colours
> and then I can decide" ... "these 4 home page variations must be shown in localhost"

**Nothing here is decided.** This file records a measurement, comparator research, four built
variations and a recommendation. The owner decides from the running pages.

**Nothing in `astro/` was modified.** The four variations are built from a scratch copy of `astro/`
held under the system temp directory. `astro/dist` was not touched and no repo build was run.

| | |
|---|---|
| Index of the four | `http://localhost:8097` |
| Variant 1 — The refusal leads | `http://localhost:8101` |
| Variant 2 — One claim, one proof | `http://localhost:8102` |
| Variant 3 — Same six, two loud | `http://localhost:8103` |
| Variant 4 — One sentence, six sections | `http://localhost:8104` |
| The page shipping today, unchanged | `http://localhost:8095` |

If the servers are not running, bring all five back with one command. The scratch tree and the
script both live under the session scratchpad, outside the repository:

```
pwsh -File <scratchpad>/serve-variants.ps1
```

It skips any build directory that is missing, never touches 8092, 8095 or 8096, and prints the
status and variant number of each port when it finishes. To rebuild a variant from source:

```
cd <scratchpad>/hpv
$env:HPV="1"; npx astro build --outDir ./dist-v1     # repeat for 2, 3, 4
```

---

## 1. The shipped homepage, measured

Playwright, Chromium, 1440x900, `prefers-reduced-motion` forced, against `astro/dist` as built on
2026-08-03. Reproduce by serving `astro/dist` and re-running the probes; every figure below came out
of a live browser, not from reading source.

### 1.1 The spine as it stands

| # | Section | Height @1440 | Visible words | Artefact |
|---|---|---|---|---|
| 1 | Hero — "Qualify. Win. Get paid." | 972px | 48 | 3 SVG planes, isometric strata |
| 2 | "Four numbers you are already held to" | 744px | 37 | raised spine, travelling highlight |
| 3 | "Delivery is the first stage of the next bid." | 913px | 30 | 400x400 closed ring, 26 paths |
| 4 | "Read from either end." | 755px | 44 | shared spine read two ways |
| 5 | "Watch it refuse a figure." | 1084px | 61 | five-step rail with the dropped figure |
| 6 | "Your evidence already exists..." | 885px | 91 | connector chip grid |
| 7 | "See it on your own tender." | 547px | 39 | none |

`<main>` total: **5,900px, 352 visible words.** Document height 6,602px.

**The 752-word figure in the original brief is roughly double the truth.** It counts the navigation,
the mega-menu, the footer, the command palette and the screen-reader-only `<desc>` on the lifecycle
ring. Visible words inside `<main>` are 352. `ULTRA-PREMIUM-GAP.md` independently measured 405 at
1280px including the trust strip, which agrees.

### 1.2 The four numbers that matter

**Uniform weight.** The six content sections are 972 / 744 / 913 / 755 / 1084 / 885px. Mean 892,
SD 119, coefficient of variation **13.3%**. The tallest is only **1.46x** the shortest, and the
tallest is **not the hero** — it is the reasoning trace. Every one of the six carries a bespoke
drawing, so the ratio is **6 loud to 1 quiet**.

**No category noun.** Searching visible `<main>` text for the words a buyer would use:

| Word | First appearance |
|---|---|
| contract | 159px (2% down) — but only inside the eyebrow "One engine, the whole contract" |
| bid | 576px (9%) — inside a small artefact label, "2 gaps found before you bid" |
| answer | 2,064px (31%) — as a lifecycle stage name |
| draft | 4,432px (67%) — in a link, "How the drafter works" |
| **tender** | **5,578px (84%)** — "See it on your own tender.", the closing call to action |
| procurement, proposal, RFP, questionnaire, software | **never appear** |

The H1 plus standfirst is 12 words and neither names the category.

**Seven frames in 352 words.** Outcomes → statutory duties → a lifecycle loop → two audiences → a
reasoning trace → connector scopes → a close. That is a new mental model roughly every fifty words,
and **0 of the 6 section headings follows from the one above it.**

**The differentiator is buried.** "Watch it refuse a figure." is the tallest and heaviest section on
the page and it is fifth of seven, at 59% scroll depth, behind three sections that each open a
different frame first.

---

## 2. Comparator research

Nine homepages fetched live on 2026-08-03. Word counts are estimated from the markdown-converted
visible DOM at plus or minus 20% and are useful for ranking, not as absolute claims. LOUD/QUIET is
classified from DOM evidence, not rendered pixels; three borderline calls were resolved toward
QUIET and flipping all three moves the median ratio from 0.57 to 0.63 without changing the
conclusion.

| Site | Sections | H1, verbatim | Words to comprehension | Total words | Loud/Quiet | First proof at | Set-pieces |
|---|---|---|---|---|---|---|---|
| stripe.com | 12 | "Financial infrastructure to grow your revenue." | 8 | ~2,100–2,400 | 4/8 = 0.50 | §2 | 4 (2 bespoke) |
| linear.app | 9 | "The product development system for teams and agents" | 8 | ~1,200–1,400 | 6/3 = 2.00 | §1 | 6, one UI family |
| vercel.com | 7 | "Agentic Infrastructure" | 7 (rotating) | ~280–400 | 4/3 = 1.33 | §3 | 4 |
| anthropic.com | 4 | "AI research and products that put safety at the frontier" | 10 | ~200 | 0/4 = 0.00 | §3 | **0** |
| apple.com | 10 | "iPhone" | 1 borrowed / 6 | ~200–250 | 10/0 | §1 | 10 |
| vanta.com | 11 | "Trust is everything" | 11 | ~1,200–1,400 | 4/7 = 0.57 | §2 | 4 |
| drata.com | 13 | "Explore the World of Agentic Trust" | 13 | ~1,200–1,400 | 6/7 = 0.86 | §2 | 6 |
| gatekeeperhq.com | 15 | "Protection ✦ Performance. Together..." | 16 | ~2,200–2,400 | 5/10 = 0.50 | §2 UI, §4 named | 5 |
| ivalua.com | 9 | "The Enterprise AI Platform for Procurement" | **6** | ~280–320 | 3/6 = 0.50 | §7 | 3 |

### The four answers

**Q1. Words before a reader knows what the product does.** Range 6 to 16, **median 8**. The split is
clean: sites whose H1 carries the payload land at 6 to 10; sites whose H1 is a mood ("Trust is
everything", "Explore the World of Agentic Trust", "Protection ✦ Performance") pay a 5 to 10 word
penalty because the subhead has to do the work the H1 refused. **All three procurement and
compliance sites are in the slow group.** That is the sector's characteristic failure and it is an
opportunity, not a convention to copy. Working target: comprehension complete by word 10, with the
H1 alone carrying at least the category.

**Q2. Distinct visual set-pieces.** Range 0 to 6 excluding Apple, **median 4**. Nobody arguing a case
exceeds six, and Linear's six are all renders of one artefact family — the app itself. So the real
ceiling is one visual system shown four to six times, not four to six unrelated objects. Anthropic
proves zero is viable. Practical rule: **3 to 5, drawn from one visual language.**

**Q3. Loud to quiet.** Range 0.00 to infinity, **median 0.57**. The strongest signal in the dataset
is the 0.50 cluster: Stripe, Gatekeeper and Ivalua all land on exactly one loud section per two
quiet, from three unrelated sectors. Linear's 2.00 works only because the screenshot *is* the
argument. Quiet sections are the majority everywhere except Apple and Linear. A page that makes
every section loud has no emphasis left to spend.

**Q4. Proof relative to claim.** **Claim first, prove immediately.** First-proof positions across the
nine: 1, 1, 2, 2, 2, 2, 3, 3, 7. Seven of nine produce concrete proof by section 3. Nobody proves
before claiming. The strongest construction is Vercel's and Drata's: each section headline makes a
claim and the very next sentence proves it with a named party and a number, repeated three to five
times, rather than banking all proof in a testimonials block. **The transferable rule: a claim earns
about one section of unsupported credit.**

### Where CrowAgent sits against that

| | CrowAgent, shipped | Comparator |
|---|---|---|
| Words to comprehension | never above the fold; "tender" at 84% depth | median 8 |
| Loud to quiet | **6.0** | median 0.57 |
| Set-pieces | 6, in six unrelated visual languages | median 4, ideally one language |
| First concrete proof | §2, the statutory figures | median §2 — **we already do this right** |
| First *differentiating* proof | §5 of 7, 59% depth | n/a |

---

## 3. Diagnosis

The original brief proposed: *each section is a self-contained feature demonstration carrying its own
large drawn artefact, none builds on the one before, the visual weight is uniform, and "Qualify. Win.
Get paid." is three claims where the page needs one.* Tested against the measurements:

**Confirmed, and now quantified.** Uniform weight is real and it is the strongest finding: CV 13.3%,
tallest 1.46x shortest, and the hero is not the tallest section on its own page. Six loud sections
to one quiet against a comparator median of 0.57. Six set-pieces in six unrelated visual languages,
where the one site that ships six keeps them all in one language.

**Sharpened.** "None builds on the one before" is literally true and countable: **0 of 6 section
headings follows from the one above it.** That is the mechanical form of "the storyline is missing".

**Disagreed with, on one point.** The problem with "Qualify. Win. Get paid." is not that it is three
claims. It is that **none of the three, and nothing in the standfirst, names the thing being sold.**
The reader is handed a mechanism before a category. The word "tender" does not appear in visible body
copy until 84% scroll depth and "procurement", "proposal", "RFP" and "software" never appear at all.
That is fixable with an eyebrow and a standfirst, and it does not require touching the tagline, which
`HOMEPAGE-DECISION-TABLE.md` records as a settled sitewide decision. All four variations keep the
tagline verbatim.

**Agreed with, emphatically.** "Watch it refuse a figure" is the most differentiated thing on the
page. It is already the tallest and heaviest section; it is simply in the wrong place. Three of the
four variations move it to section 2, where seven of nine comparators put their first proof.

---

## 4. The four variations as built

Each pairs a narrative spine with a colour direction from `PALETTE-EXPLORATION.md`. Every hex is
lifted verbatim from `.shots-tmp/palettes.mjs`; no new colour was invented.

### Variant 1 — "The refusal leads" · Palette A, white as a paint · `:8101`

**Thesis:** put the one claim a competitor cannot copy first, and spend the rest of the page proving
it is true.

Hero (LOUD) → Watch it refuse a figure (LOUD) → Because these four are duties, not estimates (quiet)
→ The figures come from evidence you already hold (quiet) → The same discipline, from notice to final
report (quiet) → The authority reads it the same way (quiet) → See it on your own tender (quiet).

7 sections, **2 loud / 5 quiet**, 416 visible words, 5,707px.

**Why this palette.** When the argument is "it refuses", the refusal must be the loudest event on the
page. Palette A (V6) takes teal off the 27.7% of instances that paint interactive states and gives
them white, leaving violet-as-refused as one of only two hues, where it cannot be mistaken for a link
or a hover.

### Variant 2 — "One claim, one proof" · Palette B, ink and orchid · `:8102`

**Thesis:** three sections. A claim, the proof of it, an invitation. Everything else is a product page.

Hero (LOUD) → Watch it refuse a figure (LOUD) → See it on your own tender (quiet).

3 sections, **2 loud / 1 quiet**, 197 visible words, 3,382px. Closest in shape to Anthropic (4
sections, ~200 words) and Vercel (7 sections, ~300 words).

**Why this palette.** Palette B's recorded flaw is that orchid does interactive *and* refused. A
three-section page has almost no interactive chrome for that collision to occur on, and its neutral
surface steps drop the blue cast, so the single orchid refusal is the only colour event a reader sees.

**What it costs, stated plainly.** The lifecycle, the two-audience split and the connector scopes all
leave the homepage. Buyers reach `/crowmark-buyers` from the nav rather than from a section. The four
statutory figures survive only as the eyebrow above the trace. If the owner wants buyers converted
from the homepage, this variant is wrong.

### Variant 3 — "Same six, two loud" · Palette C, white, black, teal and violet · `:8103`

**Thesis:** the order is right, the emphasis is not. Keep every section and every headline the site
ships today; change only which two carry a set-piece.

7 sections, **2 loud / 5 quiet**, 397 visible words, 5,585px. Exactly one copy change: the hero
eyebrow becomes "Bid and tender software", which puts the category at word four instead of word 330.

**Why this palette.** This variant changes the least structurally, so it carries the palette that
changes the most legibly: the owner's own brief executed literally — white, black, teal and violet —
with the recorded fix that *refused* moves up to orchid `#E4A3FF` so a hover and a refusal are not
the same hue.

**What it does not fix, stated rather than glossed.** It still asks the reader to hold six unrelated
frames, and no heading still follows from the one above it. It makes the page calmer and better
paced; it does not give it a storyline.

### Variant 4 — "One sentence, six sections" · Palette D, violet-led ground · `:8104`

**Thesis:** the page is one sentence broken across six sections. Read the headings in order:

> Qualify. Win. Get paid. → And when one will not, **it refuses to state it.** → Which matters,
> because **all four of these are duties, not estimates.** → The figures come from **evidence you
> already hold, read where it lives.** → And after award, **the same record becomes the audit.** →
> So **see it on your own tender.**

6 sections, **2 loud / 4 quiet = 0.50**, the exact figure three independent comparator sites converge
on. 340 visible words, 5,028px.

**Why this palette.** The argument is continuity, so the colour should be carried by the ground
rather than by the elements. Palette D warms the whole surface ladder toward violet so the page reads
purple without any single element being painted, leaving teal as the only cool mark on it. A
continuous argument on a continuous ground.

**What it costs.** "Read from either end." is dropped. A second audience is the one thing that cannot
be phrased as a continuation of the first.

---

## 5. Verification

Playwright, Chromium, 1440x900 and 390x844, `prefers-reduced-motion` forced.

| | V1 `:8101` | V2 `:8102` | V3 `:8103` | V4 `:8104` |
|---|---|---|---|---|
| Page height @1440 | 5,707px | 3,382px | 5,585px | 5,028px |
| Visible words in `<main>` | 416 | 197 | 397 | 340 |
| Loud / quiet | 2 / 5 | 2 / 1 | 2 / 5 | 2 / 4 |
| Tallest : shortest section | 2.00 | 1.98 | 2.13 | 2.13 |
| JavaScript requests | **0** | **0** | **0** | **0** |
| Contrast pairs checked | 29 | 19 | 30 | 29 |
| **Worst contrast ratio** | **8.75:1** | **10.56:1** | **8.75:1** | **8.76:1** |
| WCAG AA failures | **0** | **0** | **0** | **0** |
| Em-dashes in visible copy | none | none | none | none |
| Horizontal overflow @390 | none | none | none | none |

Contrast was computed on *composited* colours: translucent backgrounds are flattened against the page
colour and translucent foregrounds against the resulting background, with the 3:1 large-text
threshold applied where the computed font size and weight earn it. The worst pair anywhere in the
four is 8.75:1, which clears AAA's 7:1, not merely AA's 4.5:1. Gradient-clipped text reports a
transparent fill and is excluded from the sample; it is governed by the existing `@supports` fallback.

Tallest-to-shortest improves from the shipped **1.46** to roughly **2.0**, not further, because
`Section.astro` centrally owns `--sec-pad-y` and a quiet section still pays full section padding.
The content weight difference is far larger than the height ratio suggests: a 1px hairline against a
400x400 ring with 26 paths. Reducing the padding on quiet sections is a design-system decision and
was deliberately not taken inside a proposal.

---

## 6. Recommendation

**Variant 4, "One sentence, six sections", with Palette A rather than Palette D.**

1. **It answers the complaint that was actually made.** The owner said the storyline is missing.
   Variant 4 is the only one of the four whose headings form a continuous argument, and it is the only
   one where covering the body copy still leaves a readable case.
2. **It lands on the comparator consensus without imitating anyone.** 2 loud to 4 quiet is 0.50, the
   figure Stripe, Gatekeeper and Ivalua independently converge on. 340 words sits between Vercel's
   ~300 and Linear's ~1,300. Six sections is one under the comparator median of ten.
3. **It moves the refusal to section 2**, where seven of nine comparators put their first proof, and
   it keeps the refusal as the page's structural hinge rather than its fifth exhibit.
4. **It costs one section**, "Read from either end.", and that section is the weakest earner on the
   page: it opens a fourth frame before the reader has been given the first.

**Why Palette A and not Palette D, against my own pairing.** Palette D is the better *idea* — a
continuous argument on a continuous ground — and it is the most beautiful of the four on screen. But
`PALETTE-EXPLORATION.md` recommends V6 for a measured reason that does not go away: 27.7% of teal
instances today paint interactive states, which the design system assigns elsewhere, and only V6
fixes that by making interactive white. Palette D leaves interactive on a violet that is one step
from the refusal orchid, on a violet ground. On a page whose entire position is that a refusal is
visible and unmistakable, that is the one adjacency not worth risking. **Run Variant 4 on `:8104` and
Variant 1 on `:8101` side by side; that pair is the real decision.**

**If the owner wants the lowest-risk change**, Variant 3 is honest about being exactly that: same
words, same order, better pacing, no storyline.

**If the owner wants to be brave**, Variant 2 is the most likely of the four to be remembered and the
most likely to lose a buyer who needed the buyer section.

---

## 7. Stated plainly — what is real and what is not

- **Nothing in the repository was modified.** The four are built from a scratch copy of `astro/`
  under the system temp directory, junctioned to `astro/node_modules` for the build only.
  `astro/dist` was not written and no repo build was run. Ports 8092, 8095 and 8096 were not touched.
- **The palettes are a token-value change plus one narrow button override**, not a sweep.
  `components/ui/Button.astro` hard-codes `background: var(--c-teal)`, so the primary button is
  overridden explicitly. The ~250-reference sweep that moves *decorative* teal off components that
  verify nothing has **not** been done, so every variant under-delivers on teal reduction relative to
  the measured figures in `PALETTE-EXPLORATION.md`. `--c-teal` itself is deliberately not repointed
  in any variant: teal keeps its meaning by getting rarer, not by being redefined.
- **The quiet sections are new components** written for this proposal, in the scratch copy only.
  Every figure in them is carried across unchanged from the shipped page and cited to PPN 002 or to
  Procurement Act 2023 s.52 and s.71. **No new figure was introduced anywhere**, and the only
  illustrative value on any of the four is the `£108,000` already marked ILLUSTRATIVE inside the
  approved reasoning trace.
- **The loud sections are the approved components**, `HeroStack.astro` and `ReasoningTrace.astro`,
  unmodified except that their head copy was made overridable in the scratch copy.
- **The black bar at the top of each variant is review scaffolding** and would never ship.
- **No win-rate claim, no customer, no logo, no rating** appears on any of the four.
- **Motion was not designed for the quiet sections.** `DESIGN-DECISIONS.md` section 0b requires
  keyframe sequences with timing before a section is called done. These are proposals for an
  argument, not method-complete sections, and they must not be treated as implementation-ready.
- **The Figma spine wireframes were not built.** The deliverable changed mid-flight from Figma
  renders to running pages, and no Figma page was created for this work.
