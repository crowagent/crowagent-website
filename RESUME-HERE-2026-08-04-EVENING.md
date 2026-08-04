# Resume here — website, 2026-08-04 evening

Written at the end of a long session, with **three agents still running**. Read
this before touching anything.

---

## Start with these

```bash
cd "C:\Users\bhave\Crowagent Repo\crowagent-website"

# Servers die on restart. The three that matter:
npx http-server astro/dist -p 8095 -c-1 --cors   # the current build
npx http-server .          -p 8092 -c-1 --cors   # the LEGACY reference (looks old BY DESIGN)
npx http-server status     -p 8099 -c-1 --cors   # the board, 161 items

cd astro && npm run build > /tmp/b.log 2>&1; echo "REAL EXIT: $?"
```

**Read the build's own `EXIT:` line.** A `<task-notification>` exit code is the
WRAPPER's and has said 0 over a failed build repeatedly today.

**A backgrounded `( … ) &` subshell dies when the tool call returns.** Use the
harness's background runner AND redirect to a log file.

---

## THE THREE JOBS IN FLIGHT

The owner's words: *"we will move into new session once all 3 jobs are done"*.

1. **Homepage rebuild** — the owner's agreed 9-section order. Agent created
   `astro/src/components/sections/ProofGate.astro` (section 2). **Not finished.**
2. **Free tool 2 — Tender Compliance Matrix** — `/tools/tender-compliance-matrix/`
   exists and is wired into nav and the tools index. Spec in
   `specs/free-tool-2-tender-compliance-matrix/`.
3. **Six open board items** — A-93 (responsive images) is well advanced; ~45
   derivative files generated under `Assets/shots/figma-v2/`.

**Nothing from any of the three is committed.** Verify before committing.

---

## THE AGREED HOMEPAGE ORDER — do not reinterpret

| # | Section | Source |
|---|---|---|
| 1 | "One engine, the whole contract" → **Qualify. Win. Get paid.** | LIVE, **unchanged** |
| 2 | UK public procurement + **Refusal gate**, side by side | concept's two hero cards |
| 3 | The product — 5-tab screen showcase | concept |
| 4 | How it runs — five stages, one a refusal | concept |
| 5 | Statutory figures | concept framing, same four numbers |
| 6 | Both sides of the table | LIVE, **more text** |
| 7 | Run the real engine | LIVE **+ concept's "core principle"** |
| 8 | Plugged in, read only | LIVE |
| 9 | Ready when you are | LIVE |

Reference only: `concepts/homepage-v2.html` on `:8712`. **The owner rejected a
standalone concept file — the work belongs in `astro/src`.**

**POSITIONING, corrected repeatedly by the owner:** the company is
**market-neutral**, private sector as well as UK public. That is decision OA-25,
in `HeroStack.astro`'s header. The hero says nothing about sector; UK public is
the **proof point** in section 2, not the market. The live homepage already has
**zero** "public sector" mentions — the narrowing was in the Gemini page and the
concept, not the site.

---

## OPEN OWNER DECISIONS — do not guess these

- **PPN 002 calculator removal.** The owner said it is "not giving any value".
  Scope is unsettled: remove the page + redirects, or drop it from the tools
  listing only? It is a live indexed route with a methodology sub-page, linked
  from the glossary sidebar and /404, and `check-content-parity.js` will fail
  because the legacy page still exists. **Its script is 4,317 B and removing it
  takes jsTotal from 16.7 KB to ~12.4 KB, back under budget** — see below.
- **A-57** — 28MB capture library. Never pushed, synthetic test-mode data, but it
  publishes an **80% win rate**. 61 of 64 files unreviewed.
- **A-80** — `terms.md` contracts for a free plan `/pricing` says does not exist.
  A contract outranks marketing copy; which is true is a commercial fact.
- **A-95** — Stripe techniques. One worth adopting (**morphing mega-menu**, ~40
  lines, no library). GSAP/Framer rejected by ADR 0003 and by budget. SVG scroll
  draw and the gradient already exist natively. Both Midjourney prompts banned.

---

## TRAPS THAT COST TIME TODAY

- **A-77** — geometry below the fold reads the scroll-timeline ARRIVAL TRANSFORM,
  not layout. Measure under `prefers-reduced-motion: reduce` or via `offsetTop`.
- **A-79** — section padding is keyed to viewport **HEIGHT** (`9.5vh`), not width.
  Quote the token, never the pixel.
- **A-81** — **CSS injected with `addStyleTag` LOSES to Astro's scoped rules on
  specificity.** A negative probe result means "my rule lost" until proved
  otherwise. Read the computed value back.
- **A-82** — a page namespace (`.pg-crowmark`) changed what a regex-based gate
  matched, because `ICON` had no leading word boundary and "crowmark" ends in
  "mark".
- **A-74 / A-83** — **a value landing exactly on a threshold flakes.** 3px padding
  put links on exactly 24.00px; it passed the run it was written in and failed
  later. Now 4px. A passing gate run is not evidence a boundary value is safe.
- **No backticks in comments inside `check-render.js`** — that function is
  serialised into a template literal and one backtick ends the string.
- **Playwright's `.click()` hovers first**, which can open a menu and then toggle
  it shut. Nearly filed a P0 nav defect that did not exist.

---

## WHAT LANDED TODAY (committed, 168 unpushed on `main`)

- **A-92 CLS** — 100% of layout shift was the webfont swap via `ch`. Fixed
  `22ch → 15.576em`, `16ch → 11.328em`. Summed CLS at 1440 **0.3958 → 0.0602**,
  zero routes over 0.1 (was two). **The metric-matched fallback attempt did NOT
  work** — it overrides vertical metrics; `ch` is a horizontal advance.
  **390 has a residual that is NOT this fix** and is unattributed: 28 other `ch`
  max-widths survive, and image work was concurrent.
- **Integrations** — one link glyph on all 12 connectors and 6 homepage chips,
  teal→violet **gradient** (a flat hue would read as verified/refused). Vendor
  marks referenced sitewide: **0**.
- **Roadmap** — chip/heading overlap fixed at the TRACK, then `subgrid` because
  each `<li>` was its own grid and the column was left crooked.
- **Partners** — portrait phone screen (`sup-8-action-centre`), reusing existing art.
- **A-37** — last Microsoft and Google marks withdrawn. **Do not delete the SVG
  files** — `check-vendor-logos.js` requires recorded files to exist.
- **ADR 0010** — shared script externalised; duplicated JS **339.5 KB → 9.5 KB**.
- **jsTotal is at 16.7 KB against 15 KB**, recorded with a **17 KB ceiling** and
  the note that it should be **deleted, not raised**, once the PPN tool goes.

---

## BOARD

`status/issues.json`, 161 items, live on `:8099`, verified in both directions.
**BUILT means the build is green. FIXED means somebody looked at the rendered
page.** Do not promote without looking.

Statuses: FIXED 120 · CLEARED 20 · BUILT 8 · OPEN 6 · HOLD 3 · DECIDED 1 ·
DECISION 1 · WIP 1 · CORRECTED 1.

---

## STANDING CONSTRAINTS

- **Production is FROZEN.** 168 commits on `main`, nothing pushed. Never push
  without an explicit instruction.
- Identity in all output is `Crow Agent` / `crowagent.platform@gmail.com`.
- British English · no em-dashes in visible copy · no AI-generated images ·
  **never claim win rates** · PPN 002 is **always 10%** · no raw hex outside
  `tokens.css` · zero third-party origins.
- **One semantic per hue: violet = refused, teal = verified.** Neither on a
  hover, focus ring or control fill.
- Max 2–3 concurrent agents on this 15.7 GB machine.
- **Never two `npm run build` at once** — `astro build` empties `dist` and every
  gate from step 9 reads it.
