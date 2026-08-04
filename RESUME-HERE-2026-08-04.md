# Resume here — website session, 2026-08-04

Written immediately before a machine restart. Everything below is committed;
`git status` was clean at the checkpoint (`37c14b57`).

---

## Start with these three commands

```bash
cd "C:\Users\bhave\Crowagent Repo\crowagent-website"

# 1. the preview servers all die on restart. Bring back the three that matter:
npx http-server astro/dist -p 8095 -c-1 --cors    # the current build
npx http-server .          -p 8092 -c-1 --cors    # the reference build
npx http-server status     -p 8099 -c-1 --cors    # the status page

# 2. confirm the build still passes end to end
cd astro && npm run build          # must exit 0, 29 chain steps

# 3. read the board
#    http://localhost:8099/   — 138 items, single source of truth
```

`:8096` (palette exploration) and `:8110` (pre-26-July archive) are also worth
restarting if the palette or homepage-comparison work resumes.

---

## Where things stand

**138 tracked items.** 72 FIXED · 24 BUILT · 3 WIP · 16 NOREPRO · 18 DECISION ·
**3 OPEN**. Zero P0s.

The board at `status/issues.json` is the single source of truth and is current.
**BUILT and FIXED are deliberately different states**: BUILT means the build is
green, FIXED means somebody looked at the rendered page. Every serious defect
this session was green in the build and obvious on the page — amputated
descenders, four empty page-map pills, a mega-menu drawing nothing, a filter
whose counter contradicted its own list, a leaked code comment rendering as body
text. **Do not promote anything to FIXED without looking.**

### The one thing genuinely waiting on the owner

**`O-54` — the blog article body flips to a light theme.** It is the only light
surface on an otherwise dark site. Theming it dark and making the reading mode
deliberate are *different products, not different CSS*, and the code cannot say
which was intended. This was held back on purpose; do not guess it.

The other 17 DECISION items are recorded with their arguments. The two most
consequential are **`O-35`** (V6 puts the violet RECOMMENDED badge into the same
hue family as *refused*, on a site whose argument is that violet means the engine
refused something) and **`A-73`** (`jsTotal: 0` and the per-route HTML budget pull
against each other, leaving `/crowmark` 1,147 bytes of headroom — needs an ADR,
not a code change).

### Work that was in flight when the session ended

Two background agents died with the session. **Their file edits are committed** —
what is lost is only their unwritten reports.

1. **A verification pass over the 22 BUILT items** — relaunch it. Its brief was to
   *falsify, not confirm*, at 1440/834/390, reading screenshots rather than
   computed styles, paying particular attention to notes claiming "0px", "zero
   gaps", "one recipe". It was also asked to re-check the FAQ answer alignment,
   because **that fix needed two files landing together and the second edit was
   applied by hand** — it is the least independently verified thing in the tree.

2. **`O-48` nav tap targets** — measured but deliberately not edited, because
   `Nav.astro` belonged to another agent. The exact change is recorded in the
   board and is two declarations:
   ```css
   /* Nav.astro,        .ca-nav-links > a   */ display: inline-flex; align-items: center; min-block-size: 44px;
   /* NavDropdown.astro, .ca-dropdown-trigger */ min-block-size: 44px;
   ```
   `min-block-size`, **not padding** — `--t-body` is fluid, and a padding figure
   clearing 44px at 1440 measured 43.4px at 1025. Verified by injection: column
   width byte-identical, nothing visible moves.

---

## Things that will bite you if you do not know them

**The 10-minute loop is gone.** Cron jobs here are session-only and in-memory;
they do not survive a restart. Re-arm with `/loop` if the owner still wants it.

**A second concurrent `npm run build` is the single biggest source of false
readings.** `astro build` empties `dist/` before writing, and every gate from
step 9 reads `dist/`. A neighbouring build makes gates report zero routes.
**A contiguous block of failures in route order is the signature of a neighbouring
build, not of the site.** Re-run before believing any failure. This was
originally misdiagnosed as the `:8095` server dropping requests — it was not.

**Serve `dist` on your own ephemeral port for any bulk measurement.** Do not loop
against `:8095`.

**Max 2–3 concurrent agents** on this 15.7 GB machine. Exceeding it emptied
`astro/dist` once and took every route to 404. Give each agent an explicit file
ownership list plus the paths other agents hold, and tell each to re-read a file
immediately before editing it.

**Two orphaned build processes** (PIDs 9952 and 30820 at checkpoint) were wedged
in `check-status-pulse.mjs` and `check-heading-ink.js` and would never exit. The
restart clears them.

---

## The pattern worth carrying forward

Almost every defect the owner found came from **one** of two mechanisms:

1. **A treatment defined inside one component's scoped styles**, so everywhere
   else hand-rolled its own and silently drifted. Page headings (26 of 43 routes
   had no gradient), 31 label recipes, 32 eyebrow treatments, 14 copies of
   `.visually-hidden` under two names, 7 link-underline recipes, 4 disclosure
   markers, 3 form controls.

2. **A gate asserting something adjacent to what mattered.** An audit of ~110
   gate claims found **44 false or overstated**, including four scripts that were
   not in the build chain at all — so every "fails the build" claim about them was
   false by construction. `check-render.js` told developers, in the message shown
   when their build failed, to reach for a class that had been retired the day
   before.

The durable outcome is that the chain went from 9 gates to **29**, and the new
ones assert **rendered facts** — a pulse that actually paints, a focus ring that
appears under keyboard modality, a sheen that travels across a card and leaves, a
filter whose visible count matches its list, a heading drawn to its last
descender. Several were caught lying during their own construction and fixed.

**Keep the discipline: a gate must be proved to fail AND to pass, and it should
assert the pixel, not the declaration.**

---

## Standing constraints (unchanged)

- **Production is FROZEN.** 154 commits on `main`, **nothing pushed**, nothing
  deployed. Do not push without an explicit instruction.
- Identity in all output is `Crow Agent` / `crowagent.platform@gmail.com`.
- British English. No hardcoded hex — role tokens only. No AI-generated images.
  Zero third-party origins. Never claim win rates.
- "As per architecture and design" means **genuine best practice**, not whatever
  was previously recorded as agreed. A prior decision is evidence, not authority.
