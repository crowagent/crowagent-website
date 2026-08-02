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

| # | Section | Decision | Figma designs created — **★ = my recommendation** |
|---|---|---|---|
| 1 | **Hero** | **PENDING** | Graphics: V1 Glass depth · V2 Perspective stack · V3 Data art · V4 Stacked deck · V5 The document · **★ V6 Isometric strata** · V7 Signal flow (reserved) · V8 Audit ledger. In composition: Hero V6, Hero V6.1 |
| 2 | **Numbers** | **PENDING** | Old set (market trivia, **do not choose** — three figures unsourceable, OA-27): S1 Numeral row · S2 Editorial bands · S3 Proportional · S4 Elevated cards · S5 Orbital · S6 Inline editorial.<br>Reframed set (statute-cited): N1 Obligation timeline · N2 Obligation stack · **★ N3 Waterline** · N4 Cycle dials · N5 Fifteen verdicts · N6 Core sample · N7 Fold-out · N8 Promise and proof |
| 3 | **Lifecycle** | **PENDING** stage names `Find / Answer / Commit / Deliver` also unconfirmed | **★ M2 Market matrix** · M1 Time bars ⚠ · M3 Artefacts · M4 Promise to proof ⚠ · M5 Isometric strata · M6 Interchange map · M7 Closed loop · M8 Folded ribbon.<br>⚠ M1 and M4 carry competitor claims and would need copy changes.<br>Superseded, do not choose: L1–L10 (UK-public-only stage names) |
| 4 | **Both sides** | **PENDING** | **★ B4 Reconciling ledger** · B1 Mirrored planes · B2 Shared spine · B3 Interlock · B5 Prism · B6 One artefact, two viewpoints |
| 5 | **Reasoning trace** | **PENDING** | **★ R8 The sum and the gap** · R1 Ledger · R2 Forensic log · R3 Five-step rail · R4 The gate · R5 Signal flow · R6 Annotated document · R7 Provenance tree |
| 6 | **Final CTA** | **PENDING** | **★ C2 Split ledger** · C1 Monumental line · C3 Receding horizon · C4 Light field · C5 Isometric close · C6 Quiet band |

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
