# Review of the Copilot homepage review — verification and actions

**Date:** 2026-08-07
**Subject:** external AI (Copilot) review of `https://crowagent.ai/`, scored 7.2/10
**Status:** verification complete. Actions below are NOT yet implemented. Nothing deployed.

---

## Method, and what was not measured

Verified against the **live production page**, fetched `2026-08-07`: `curl https://crowagent.ai/`
→ `200`, 101,351 bytes. Text, markup, the served stylesheets (`/_assets/*.css`) and the inline
module scripts were read directly. Claims were checked against the artefact, not against the
review's description of it.

**Not measured** (state this before acting on anything that depends on it):

- **Pixel scroll depth.** Section position below is document order and cumulative word count, not
  `offsetTop`. Copilot's "buried mid-scroll" is assessed as *reading distance*, not pixels.
- **Rendered visual weight.** "Visually heavy", "dense" and the 5.8 Visual Communication score are
  judgements about a painted page. No browser render was taken this pass, so those are marked
  *unassessed*, not *refuted*.
- **Mobile / narrow viewport.** Desktop markup only.

Per standing constraint #5 in `WEBSITE-TRANSFORMATION-BACKLOG.md`, no counter-score is issued.
A 7.2/10 is not a measurement and cannot be tracked to a fix; the actions below can.

---

## Verdicts on the six claims

| # | Copilot claim | Verdict | Evidence |
|---|---|---|---|
| 1 | Hero states philosophy, not product; buyer can't answer "what is CrowAgent?" | **Valid** | `h1` = "Qualify. Win. Get paid." Eyebrow = "One engine, the whole contract". Sub = "Every figure traced to evidence you already hold." No category noun in the visible hero. It exists in `<title>` ("Bid software: supplier, buyer, public, private") and in the nav ("Bid and tender software") — i.e. the words exist, they are just not where the eye lands. |
| 2 | Text density, long paragraphs, few anchors, low scannability | **Not supported** | Measured: 1,183 body words across 93 paragraphs. **Median paragraph = 7 words.** Longest = 54. Only **4** paragraphs exceed 45 words. 25 headings → an anchor roughly every **47 words**. This is the opposite of "long paragraphs, few anchors". The page is long by *section count*, not by paragraph length — a different defect with a different fix (see A2). |
| 3 | Five-stage system buried; no diagram, no visual flow | **Half valid** | *"No diagram" is wrong:* it renders as an `<ol class="hir__steps">` on a connector rail (`hir__beam`), one `hir__dot` per stage, with stage 04 given its own `hir__step--refused` modifier. *"Buried" holds:* it is section 6 of 9, placed **after** the five-screen product tour. |
| 4 | Refusal-gate demo powerful, presentation heavy | **Unassessed as stated; a measurable problem sits underneath** | Visual weight needs a render. What is measurable: the refusal gate is stated in **four** places — hero rider, the "Refusal gate" section, stage 04 "Refuse", and the "Run the real engine" worked example. |
| 5 | Access friction appears before value is established | **Valid on position** | "Access is by request. There is no free plan, and no self-serve signup; a 14-day evaluation trial is available on request." sits in **section 1**, before any product screen. |
| 6 | Duplicate permissions block (SharePoint / OneDrive / Confluence twice) | **False** | Each name appears **once** in the served HTML (`SharePoint` ×1, `Sites.Read.All` ×1, `Confluence Cloud` ×1). The second copy is a marquee clone created at runtime — `a=u.cloneNode(!0); a.setAttribute("aria-hidden","true")` — the standard infinite-scroll technique, correctly hidden from assistive tech. No content defect. |

**Also redundant:** Copilot's offer to "create buyer vs supplier landing paths". They already exist —
`https://crowagent.ai/crowmark/` → `200` and `https://crowagent.ai/crowmark-buyers/` → `200`, both
linked from the nav and from the "Both sides of the table" section.

---

## Actions

### A1 — P1. The `h1` promises more than the product does, and contradicts the page's own discipline

**This is the highest-value item on the page and Copilot did not find it.**

`h1` is **"Qualify. Win. Get paid."** under the eyebrow "One engine, the whole contract".

Two separate problems:

1. **"Get paid" is not shipped.** Nothing on the homepage, in the nav, or in the footer covers
   payment or invoicing. The five stages end at *Evidence*. The five product screens end at
   *After award*. The promise has no referent anywhere on the site.
2. **"Win." contradicts the body of the same page.** The page says, three times, that it refuses
   to forecast award: *"Relevance is a sorting aid. It is not a forecast of anything."* /
   *"Stated as context, never as a probability of award."* / *"This is FIT context. It is not a
   probability of award, and CrowMark does not produce one."* The `h1` asserts the outcome the
   rest of the page is built to refuse.

A reader who notices this reads the refusal discipline as marketing rather than as architecture —
which costs exactly the credibility the gate is there to buy.

**Change:** rewrite the `h1` so it claims only what the five stages deliver, and so it carries the
category noun that fixes claim #1 in the same edit. It must survive the test the product applies to
itself: *every claim traceable to something on the page.*

**Acceptance:** every verb in the `h1` maps to a stage shown on the page; no outcome or award
language; the words "bid" or "tender" appear above the fold; `pnpm`/`npm run build` green.

---

### A2 — P2. Three five-step sequences, back to back

This is the real form of Copilot's claims #2 and #3, and the correct fix is the opposite of the one
it proposed. The reader meets **three** five-item models in a row:

| Order | Sequence | Steps |
|---|---|---|
| 1 | Product screens | Discover · Bid or no bid · Draft · Evaluate · After award |
| 2 | How it runs | Find · Qualify · Draft · Refuse · Evidence |
| 3 | Worked example | Retrieve · Ground · Compute · Check · Cite |

Sequences 1 and 2 are near-synonyms: *Discover≈Find, Bid-or-no-bid≈Qualify, Draft=Draft,
Evaluate/After-award≈Evidence*. The only member of sequence 2 that is not already on screen in
sequence 1 is **Refuse** — which is the differentiator, and it arrives fourth in a list the reader
has already been shown once.

**Change:** do not add a diagram (there is one) and do not break up paragraphs (they are 7 words
median). **Merge sequences 1 and 2**, or promote "How it runs" **above** the product tour so the
model is taught once and then evidenced. Keep sequence 3 — it is a different object (a single
answer being computed), but label it as such so it does not read as a third framework.

**Acceptance:** a reader encounters one five-stage model before any screenshot; "Refuse" is
introduced no later than the second section.

---

### A3 — P2. Give the hero the category noun

Fold into A1 if A1 is done first; keep as a separate action if A1 slips.

The `<title>` already says "Bid software: supplier, buyer, public, private". The visible hero does
not. One line, in the existing voice, stating what it is and who it is for — placed above the
"Access is by request" qualifier, not below it.

**Acceptance:** what CrowAgent is, and for whom, is answerable from the hero alone.

---

### A4 — P3. Move the access qualifier below the first proof

Copilot is right about the position and wrong about the remedy. "Access is by request. There is no
free plan, and no self-serve signup" is **deliberate** — it is a qualification filter and an owner
positioning decision, not an accident. It is not to be softened or removed.

**Change:** keep the "Request access" CTA in the hero. Move the *explanatory sentence* (no free
plan / no self-serve / 14-day evaluation) to sit after the product tour or into the closing CTA
block, where it already appears in shorter form ("Access is limited and by request.").

**Acceptance:** the first thing a new reader meets is what the engine does; the terms of access are
met after at least one product screen. No change to the substance of the terms.

---

### A5 — P3. Four statements of the refusal gate → decide which two earn their place

Hero rider, "Refusal gate" section, stage 04, worked example. The worked example and the gate
section are the two that carry new information (one shows the mechanism, one names the rule); the
hero rider and stage 04 restate them.

**Change:** keep the mechanism and the rule; reduce the restatements. This is a copy edit, not a
redesign, and it shortens the page — which is the honest version of Copilot's "density" complaint.

---

### A6 — P3. `aria-roledescription="carousel"` on single-slide containers

Each of the five product panels is a `<div data-pcar role="region" aria-roledescription="carousel">`
containing exactly **one** `.pcar__slide`. The driver guards on
`if (slides.length < 2) return;` — so it bails, and `data-pcar` is never set to `on`.

**A first pass called this "five pairs of dead prev/next buttons". A control run refuted that:**
`index.DnyWY2ej.css` carries `.pcar__arrow,.pcar__tabs{display:none}` with reveal gated on
`[data-pcar=on]`, and the pause button ships `hidden`. The controls are invisible **and** out of
the accessibility tree. There is no visual defect.

**What remains, and it is small:** a screen reader is told "carousel" for a static image, and each
panel ships an unused tablist, ring SVG and two arrow buttons.

**Change:** drop `aria-roledescription="carousel"` and the unused control markup when a panel has
one slide.

**Also:** standing constraint #2 in `WEBSITE-TRANSFORMATION-BACKLOG.md` ("carousel markup must be
`[data-pcar]` + ≥2 `.pcar__slide`") predates the Astro build, where single-slide panels switched by
an outer tab strip are the intended design. The constraint is **stale, not violated** — update it
so a future pass does not "fix" a non-bug.

---

### A7 — CLOSED 2026-08-07. Owner decision: the light-mode carousels STAY

Owner, 2026-08-07: *"i need my light mode carousels"*. **No dark variants will be produced and no
screenshot is to be regenerated for theme reasons.** The five `-light` shots inside browser-chrome
frames are the intended composition, not an oversight, and a future pass must not "fix" them.
Anything that reads this as an inconsistency should read this line instead. The detail below is
kept as the record of what was measured, not as an open item.

---

### A7 (original finding, now closed) — product screenshots are light-only on a dark page

All five product images are light variants: `sup-1-discover-light.png`,
`sup-3-bid-no-bid-light.png`, `sup-2-tender-questions-light.png`, `buy-2-response-review-light.png`,
`buy-4-delivery-oversight-light.png`. Zero `-dark` assets, and no
`<source media="(prefers-color-scheme: dark)">`. The site is a dark-ground design (tokens.css states
contrast ratios against `--c-bg`; `--c-teal` is documented as "a dark-ground colour"), and the page
declares no theme switching at all.

This is likely what drove Copilot's "Visual Communication 5.8" — though it did not identify it.

**It is defensible as-is:** each shot sits inside a browser chrome frame with traffic lights and an
`app.crowagent.ai` URL bar, so a light screenshot reads as *a browser window on a dark page*, which
is a standard convention.

**Decision needed from the owner, not a unilateral change:** keep the light shots in chrome frames,
or produce dark variants from the Figma sources. Do not act on this without that call — it is 16
screens of rework if the answer is "dark".

---

## Rejected, with reasons

- **"Rewrite the homepage" / "conversion-optimized layout"** — the page's problems are four copy
  edits and one section reorder. A rewrite discards a voice the review itself scored 9.5.
- **"Convert the five-stage system into a diagram"** — it already is one (rail, dots, per-stage
  modifier). Acting on this would rebuild what exists.
- **"Break up the text"** — median paragraph is 7 words. Would make a long page longer.
- **"Buyer vs supplier landing paths"** — shipped: `/crowmark/` and `/crowmark-buyers/`, both `200`.
- **The 7.2/10 and the category scores** — not adoptable. A score is not traceable to a change, and
  three of the seven categories were scored against things the artefact does not do.

---

## Owner decisions taken 2026-08-07, and what is already built

1. **Design system: sovereign dark, role-bound, KEPT.** "Warm Organic Minimal" is rejected. Teal =
   VERIFIED and orchid = REFUSED stay, and `check-palette-roles.js` stays the enforcement.
2. **Hero headline: REOPENED** (supersedes the 2026-08-04 freeze) to remove the unshipped claim.
3. **Motion: hold the line.** No new animation. The 2026-08-04 removal stands.

**Built and verified on `localhost:8093` this session — A1 + A3, in `HeroStack.astro`:**

| | Before | After |
|---|---|---|
| Eyebrow | One engine, the whole contract | **Bid and tender software, supplier and buyer** |
| `h1` | Qualify. Win. Get paid. | **Qualify. Draft. Prove it.** |

Every verb now names a stage rendered further down the same page (Qualify = 02, Draft = 03,
Prove = 05/Evidence). *Refuse* is deliberately kept out of the `h1` so it is shown by ProofGate
rather than asserted. The gradient stays on the third sentence, which keeps the owner's 2026-08-02
instruction intact — the post-award half still takes the light. The full argument is recorded in
the file header, and the five stale comments that described the old glyphs were corrected with it.

Verified: `check-comment-terminators` / `check-facts` / `check-english` all clean; the eyebrow and
`h1` confirmed in the rendered localhost DOM. **`npm run build` (the 33-gate chain) has NOT been
run yet — that is the ship gate and it is outstanding.**

---

## Round 2 — the ten "ultra premium" proposals

Assessed against the same artefact, the design system, and the owner decisions recorded in source.

### Two that must not ship as written

**P9 — "Zero-Hallucination Guarantee" / "CrowAgent does not hallucinate. It refuses."**
**Reject.** This converts a process claim into a warranty. The page's own grounding banner says
*"Answers are AI-assisted and grounded only in your own answer library..."* and *"A named human
reviews, edits and approves every answer before you submit it."* A guarantee of zero hallucination
is absolute, unprovable, and contradicted by the human-approval step the product depends on. It is
also the exact overstatement class the refusal gate exists to prevent — shipping it would prove the
opposite of its own claim. **Buildable version:** state the *mechanism*, not a guarantee — what the
gate removes, and what it does not. "It refuses" is defensible on its own. "Does not hallucinate"
is not.

**P10 — compliance footer bar.** The proposed bar lists "ISO 27001 controls" **without the
qualifier the live page carries**: *"\* We follow ISO 27001 controls. We are not certified yet."*
Shipping the bar as specified asserts certification the company does not hold. **The asterisk is
not optional and does not move.** The bar itself is fine — a thin authoritative strip is consistent
with the design — provided every claim on it keeps its qualifier.

### Three that collide with recorded owner decisions

**P1 — replace the hero headline.** `HeroStack.astro:29` records: *"THE HEADLINE STAYS, and the
owner was explicit about it. 'One engine, the whole contract', 'Qualify. Win. Get paid.', the
standfirst and both buttons are untouched"* (owner, 2026-08-04). **Not a unilateral change.**
Note the proposed line — *"Bid software that refuses untraceable claims"* — is a genuinely good
clarity anchor and would resolve A1 and A3 in one stroke. It needs the owner to reopen a decision
they closed, which is a question, not an edit.

**P1/P3/P6/P7 — micro-animations, cinematics, parallax, "Verified" stamp animation.**
Backlog constraint #9 records an **OWNER DECISION**: *"OWNER-ORDERED: remove the disliked animated
mesh / aurora / grain / glow ... Hide them globally for a clean, restrained surface."*
`HeroStack.astro:72` adds: *"NO JAVASCRIPT, AND NOW NO ANIMATION AT ALL IN THIS COMPONENT ... Not
one word on this page is animated."* Four of the ten proposals are animation-led. They ask to
re-add the category of thing the owner ordered removed. Additionally, a "Verified" stamp animation
implies automated verification, contradicting *"It does not score, rank or recommend."*

**"All output must follow Warm Organic Minimal design direction"** — **this is not this site's
design direction.** `grep -ril "warm organic"` across the repo returns **zero** matches. The actual
system is a dark ground with a **role-bound palette**: teal = VERIFIED, orchid = REFUSED, violet
names nothing, under an owner-approved rule (`HeroStack.astro:107`): *"A gradient may change
LUMINANCE anywhere. It may change HUE once per section, on the one element that section is about,
and NEVER under text, NEVER on a control, NEVER on a state."* That rule is **enforced by a build
gate**, `scripts/check-palette-roles.js`. Repainting to a warm palette would break the gate and
destroy a semantic colour system. The reviewer supplied a house style from somewhere else.

### Three that describe things the site already has

- **P2 Proof Stack diagram** — exists: `<ol class="hir__steps">` on a connector rail (`hir__beam`),
  one `hir__dot` per stage, stage 04 carrying its own `hir__step--refused` modifier. The work is to
  **promote and strengthen** it (see A2), not to create a signature asset from nothing.
- **P4 supplier ↔ buyer split-screen** — exists as "Both sides of the table": a spine with supplier
  reading left-to-right above it and authority right-to-left below, across Requirement / Evaluation
  / After award.
- **P8 micro-blocks, "1–2 sentence units"** — already the case. Median paragraph is **7 words**;
  4 of 93 exceed 45. This is the density claim from round 1, restated, and it is still not true.

### Two worth building

- **P5 "Rulebook Mode"** for s.52 / s.71 / PPN 002. The statutory block is the page's strongest
  credibility asset and currently renders as three plain stat tiles. A distinct citation treatment
  is a real upgrade **and** it is the kind of thing that belongs in the design system as a reusable
  treatment, not as page-local CSS. Constraint: thin serif must be introduced as a **token**, and
  it must not collide with `check-design-system.js` / `check-heading-ink.js`.
- **P10 compliance bar** — with every qualifier preserved (above).

### How any of it must be built

Per the master design directive: **centrally, with a gate that can fail.** This site already runs
~33 build gates including `check-design-system.js`, `check-palette-roles.js`, `check-motion.js`,
`check-transitions.js`, `check-treatments.js` and `check-autoplay.mjs`. Any new treatment
(rulebook citations, compliance bar, proof-stack styling) must be added as a **token + component +
gate**, never as page-local CSS. Write the gate so it fails on the current code first, then make it
pass. `npm run build` in `astro/` is the certification chain and is the ship gate.

---

## Note on the review itself

Copilot rendered the page with JavaScript — it saw the marquee clone, which is only created at
runtime. That is also what produced its one false finding: it read a rendering artefact as a content
oversight. Its two strongest calls (hero clarity, access friction placement) are both about **where
things sit**, and both hold. Its density and diagram calls do not survive measurement. It missed the
`h1` over-claim entirely — the one item on this list that touches what the market is told we do.
