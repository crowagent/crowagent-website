# Homepage — decision table

One row per homepage section, in the order they render in `astro/src/pages/index.astro`.
This file is the single answer to "what is decided and what is still open". Update it the moment
a decision is made; do not ask the owner a question this table already answers.

Figma file `wJ9DK6ByFUN6rWe0CpCVPU`. Renders: `http://localhost:8096`. Build: `http://localhost:8095`.

Last updated: 2026-08-02

---

## Sitewide decisions (settled — do not re-ask)

| Decision | Value |
|---|---|
| Market narrative | **Market-neutral, UK public as the proof point** |
| Alignment | **Centred head blocks** (eyebrow, heading, standfirst; never slotted body) |
| Eyebrow | **Gradient text in an outlined capsule** |
| Sweep scope | Everything except homepage, pricing and product pages |
| Process | Homepage section by section, one decision at a time, agent implements each before the next |
| Tagline | `Qualify. Win. Get paid.` |
| Products named | **CrowMark only** |
| Never | win-rate claims · competitor claims · fabricated customers, logos or ratings · em-dashes |

---

## Homepage sections

**ALL SIX DECIDED BY THE OWNER, 2026-08-02.** Do not re-ask. Do not substitute my earlier
recommendations, four of which the owner did not take.

| # | Section | **DECISION** | Node | Figma designs created (★ was my recommendation) |
|---|---|---|---|---|
| 1 | **Hero** | **Hero — FINAL (V6)** | `43:3` | V1 Glass depth · V2 Perspective stack · V3 Data art · V4 Stacked deck · V5 The document · ★ V6 Isometric strata · V7 Signal flow · V8 Audit ledger |
| 2 | **Numbers** | **Keep the design already on :8095.** Only the messaging and the figures change. | `MarketShape.astro` | S1–S6 and N1–N8 all built, none taken. The owner likes the shipped treatment; the reframe applies to CONTENT only |
| 3 | **Lifecycle** | **M7 — Closed loop**, with a better title. Owner: "the lifecycle is a loop, not a line" — make that statement creative | `79:53` | ★ M2 Market matrix · M1 · M3 · M4 · M5 · M6 · **M7** · M8 |
| 4 | **Both sides** | **B2 — Shared spine, both ends** | `78:1065` | ★ B4 Reconciling ledger · B1 · **B2** · B3 · B5 · B6 |
| 5 | **Reasoning trace** | **R3 — Five-step rail** | `65:2` | ★ R8 Sum and the gap · R1 · R2 · **R3** · R4 · R5 · R6 · R7 |
| 6 | **Final CTA** | **Keep the legacy CTA from :8092** (the live homepage closing section) | legacy `index.html` | ★ C2 Split ledger · C1 · C3 · C4 · C5 · C6 — none taken |

---

## Standing rule — a gap in an approved design is a design task

Owner, 2026-08-02: *"if approved CTA is not in figma then you must design it"*.

When an approved Figma frame omits something the page needs, the answer is **never** to improvise
it in code, and **never** to silently drop it. Design it in Figma, 6–8 variants, put the renders up,
and let the owner choose. The approved frame is then extended rather than contradicted.

First application: M7 has no call to action, so the homepage lost its link to the PPN 002
calculator when the lifecycle section was implemented. CTA treatments are being designed on Figma
page `Section — Lifecycle CTA`.

## Other pages — owner decisions, 2026-08-02

Taken one page at a time. Same rule as the homepage: these are settled, do not re-ask.

| Page | Decision |
|---|---|
| **Pricing** | **Keep the `:8092` design exactly.** Refine the messaging and correct anything wrong. Design does not change. |
| **About** | **Keep the `:8092/about` design exactly.** Correct the messaging. Replace "engineers" with something that reflects the real background: **consulting and bidding experience from 2010**, on multi-million pound bids, delivered successfully. |
| **Colour theme** | **Current theme stays, and is universal across the site.** Not per-page. |
| **Blog** | **Match the `:8092/blog/` style.** Article imagery comes back. **No AI-generated images — licence-free photography only, and it must look professional.** |

### Blog imagery — the constraints that decide how this is done

- **The Astro build currently loads ZERO third-party origins**, and `astro/scripts/check-csp.js`
  enforces it on every build. So images cannot be hotlinked from Unsplash, Pexels or anywhere else.
  Every image is **downloaded, optimised and self-hosted** under `astro/public/Assets/`.
- **Licence must be recorded per image**, with source URL and photographer, in a file in the repo.
  A site whose entire argument is that every figure traces to a source cannot ship images whose
  provenance nobody can state. This is the same discipline as OA-27, applied to media.
- **No AI-generated imagery** (owner decision). Note also the standing licence finding: unDraw
  explicitly prohibits AI/ML use, and Aceternity UI and Untitled UI are not usable either.
- Alt text describes what the image actually shows. It never invents a claim, and it never
  suggests a customer, a client or live data.

### The "engineers" rename carries a positioning trap

The obvious candidate is "consultants", and it fights our own argument. This site's stated
mission is that a supplier can answer a tender *"without paying a bid-writing consultancy"*, and
the About page publishes that line today. Calling ourselves consultants on the same page tells a
reader the thing they are avoiding is the thing they are buying.

What the owner actually described is stronger than either word: people who **wrote and won
multi-million pound bids from 2010** and then **read the statute** rather than reusing a template.
Recommended: **"Built by bid practitioners who read the rules."** — practitioner claims the doing
without claiming the profession we position against. Alternatives if that reads stiff: "Built by
people who have won these contracts." or "Built by bidders who read the statute."

Whatever is chosen, the 2010 experience should appear as a fact in the body, not a claim in the
headline, and it must not become a customer or client claim: we have no customers to name.

### Notes that follow from these decisions

- **Numbers is now a content job, not a design job.** The treatment stays; `40,000+`, `55%` and
  `44%` still cannot be sourced (OA-27), so the figures must be replaced with ones that cite
  statute: **3** KPIs (s.52, contracts over £5m) · assessed every **12 months** (s.71) · **10%**
  minimum weighting (PPN 002). Keep s.52 and s.71 as separate duties (OA-26).
- **M7 needs a new heading.** The owner asked for something creative on "the lifecycle is a loop,
  not a line". The point M7 makes geometrically is that Deliver occupies roughly 162° of the ring
  and closes back into Find, so the next bid starts from evidence the last one produced.
- **The legacy CTA must be read from `index.html` at the repo root**, not reinvented.
- My recommendation was taken for one of six. The renders decided it, which is the point.

**Nothing in column 2 is decided yet, and this has now been checked exhaustively.**

The first search read only text blocks, which left open the possibility that a decision was sent
alongside a screenshot. That gap is closed: the lost session `719ab1a7` contains **26 real owner
messages and zero of them carry an image**. Every one has been read in full.

**The complete set of design instructions the owner gave, verbatim in substance:**

| Line | What was said |
|---|---|
| 3335 | "i cant see you produced enough figma designs you must use for background designs like stripe and apple has also think very innovative 3d illusion etc home page must be master class of design" |
| 7790 | Less text, more visuals; depth behind a "learn more"; inspiration Stripe, Apple, antigravity.google, betterstack.com, mixpanel.com |
| **7806** | **"i want all the website text centered and all the eybrow must be gredient, also think eyebrow must be in capsules ?"** plus purpose-drawn graphics not screenshots, no hedging labels, "there are so many small decisions we need to take" |
| 7944 | **"v4 looks okay but i wanted to see more different styles, show me couple of more think creative"** |
| 8361 | The market repositioning that became OA-25 |

**Two conclusions.**

1. **Centred text, gradient eyebrows and the capsule were the owner's own decisions, given at line
   7806** — earlier than this session, and they were right to be irritated at being asked again.
   They are implemented and shipped.
2. **No variant was ever named.** The closest is line 7944, and it explicitly says V4 is *not*
   final. So every row in the table above is genuinely open, and the previous session's
   "Hero — FINAL (V6)" page name and "S3 Proportional chosen" note were its own conclusions.

---

## Why each recommendation

| Section | Pick | Reason |
|---|---|---|
| Hero | V6 | Three planes reading Qualify / Win / Get paid top to bottom, matching the headline directly above. Abstract rather than product UI: of 13 sites researched, the two that led with product screens read as the most ordinary. |
| Numbers | N3 | "One day above the line. Five years below it." Running total 3/6/9/12/15 brightening downward. Every figure cites statute, so it removes OA-27 rather than re-sourcing it, and it lands on the post-award half we own. |
| Lifecycle | M2 | Proves the market-neutral decision instead of asserting it: same four stages, three market columns, only the paperwork changes. Carries no competitor claim. |
| Both sides | B4 | Committed in the bid against measured after award, reconciling row by row. Closest to the product's actual mechanism, and the set carries no figures at all so nothing needs sourcing. |
| Reasoning trace | R8 | Least text, most impact. The refused figure reads instantly as a dashed empty slot without anyone parsing a table. |
| Final CTA | C2 | The graphic carries the argument rather than decorating it: three commitments cited, one struck through. Closes on the refusal, which is the position. |

---

## Node IDs

| Set | Page | Frames |
|---|---|---|
| Hero graphics | `30:2` | V1 `30:3` · V2 `31:2` · V3 `32:2` · V4 `34:2` · V5 `36:2` · V6 `39:2` · V7 `40:2` · V8 `41:2` |
| Hero in composition | `43:2` / `49:2` | V6 `43:3` · V6.1 `49:3` |
| Numbers, old | `51:2` | S1 `51:3` · S2 `51:19` · S3 `51:36` · S4 `52:2` · S5 `52:23` · S6 `52:42` |
| Numbers, reframed | `81:192` | N1 `81:193` · N2 `84:2` · N3 `84:8` · N4 `84:14` · N5 `84:20` · N6 `84:26` · N7 `84:32` · N8 `84:38` |
| Lifecycle | `72:2` | M1 `72:3` · M2 `73:2` · M3 `74:2` · M4 `74:48` · M5 `79:39` · M6 `79:46` · M7 `79:53` · M8 `79:60` |
| Both sides | `78:3` | B1 `78:4` · B2 `78:1065` · B3 `78:2126` · B4 `78:3187` · B5 `78:4248` · B6 `78:5309` |
| Final CTA | `77:2` | C1 `77:3` · C2 `77:4` · C3 `77:5` · C4 `77:6` · C5 `77:7` · C6 `77:8` |
| About (parked until the homepage is done) | `106:2` | A1 `106:3` · A2 `109:2` |

Enumerate with `use_figma` running `figma.root.children.map(p => ({id: p.id, name: p.name}))`.
The MCP's "list pages" call reports only the desktop app's open file and will look empty.
