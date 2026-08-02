# Owner feedback log

Every issue the owner has raised, with status. The owner has **stopped reviewing** as of
2026-08-02 and will not look again until this log reads DONE across the board.

Status values: `OPEN` · `IN PROGRESS` · `DONE` · `BLOCKED` (needs an owner decision) ·
`WONT DO` (with a reason).

Companion files: `HOMEPAGE-DECISION-TABLE.md` (what was chosen) · `DESIGN-DECISIONS.md` (the
binding rules) · `../OWNER-ACTIONS.md` (defects needing the owner) · `THE-REGISTER-PLAN.md`.

---

## A. Sitewide parity — raised 2026-08-02, the big batch

| # | Issue, in the owner's words | Status | Notes |
|---|---|---|---|
| A1 | "Hero section messages must be same size" | OPEN | Hero heading and standfirst sizes differ per page. Needs one hero type scale, applied everywhere. |
| A2 | "Content and text must be central" | OPEN | Head blocks were centred sitewide, but body content, buttons and cards were not. Partially fixed on partners, resources, changelog, tools. Not yet swept everywhere. |
| A3 | "Use of cards and sizes parity" | IN PROGRESS | 21 distinct card recipes found and reduced to 12 via `styles/surfaces.css`. Not finished: sizes still vary. |
| A4 | "Blogs pages look very poor to compare how we had earlier, must be in similar style" | OPEN | Blog index and posts must match the `:8092` style. Article imagery is also missing entirely. |
| A5 | "Another big issue is with font sizes differences" | OPEN | 15 heading recipes found, reduced to 10. Still not one scale. Needs a full type audit against tokens. |
| A6 | "Why did I lose all the animations from button and tile/card mouse hover shiny animations" | OPEN | A shared `.surface` hover was added for cards. **Buttons were not covered** and are the likely gap. Verify both on the live build. |
| A7 | "You are excessively using teal/green colours in header and text which must be gradient or white" | OPEN | Headings and body text should be white or gradient; teal reserved for accents and semantic marks. |
| A8 | "Lots of buttons and cards are not centrally aligned" | OPEN | Same root cause as A2. |

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
| 9 | Card body text | **Left-aligned.** Body copy is read, not scanned. Legacy centres it, but the legacy source's own comments record that as an unfixed bug. |
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
