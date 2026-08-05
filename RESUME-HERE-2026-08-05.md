# Resume here — website, 2026-08-05

Supersedes the earlier versions of this file. The traps below are the load-bearing part.

---

## FINAL STATE

- **Build: `REAL EXIT: 0` on the full 32-gate chain.** CLS 84/84 within threshold
  or a recorded exception, **0 outside**. Jest **144/144**. `astro check` 0 errors
  across 127 files.
- **Committed locally: `fb1977e8`.** 173 commits unpushed on `main`.
  **NOTHING PUSHED. Production is frozen.**
- **Board: 219 items, 7 OPEN.** Served at `:8099`.
- **Homepage fidelity: 218 → 146 deltas.** Of the 146, **115 are the owner's
  recorded type-scale divergence** and 31 are actionable.

```bash
cd "C:\Users\bhave\Crowagent Repo\crowagent-website"
npx http-server astro/dist -p 8095 -c-1 --cors   # THE BUILD. Not `.` — see below.
npx http-server status     -p 8099 -c-1 --cors   # the board
cd astro && npm run build > /tmp/b.log 2>&1; echo "REAL EXIT: $?"
```

---

## THE FIVE TRAPS THAT COST THE MOST TIME

1. **THE LIVE SITE DEPLOYS FROM THE REPO ROOT, NOT `astro/dist`.** Every fix made
   in the Astro tree is invisible on production. This is why the removed PPN 002
   calculator still serves a 200, why the withdrawn free-trial claim is still
   live, and why `:8095` showed a 22-hour-old page for a day. **On Cloudflare
   Pages a static file BEATS a `_redirects` rule**, so a redirect cannot work
   until the page is deleted. Board: A-126, A-128.
2. **A `<task-notification>` exit code is the WRAPPER's. It lied three times in
   one session**, reporting success over builds whose own line read `REAL EXIT: 1`
   and `127`. Always `echo "REAL EXIT: $?"` and read that.
3. **`astro check` IS step 4 of the build chain**, and takes under a minute
   against five to ten for the chain. Type-check BEFORE spending a build slot.
   Inside an Astro `<script>`, `querySelectorAll` returns `Element` (no
   `.dataset`, no `.hidden`) and `cloneNode` returns `Node`. Type your queries.
4. **Counting `/*` against `*/` is not a comment check.** Both a naive counter
   and Vite's own dep scanner match a `<script>` written INSIDE a comment.
   `scripts/check-comment-terminators.js` tokenises properly — trust it. It has
   caught two live build-breakers, one of them minutes old.
5. **Adding a variant suffix breaks every prefix match in the surrounding
   tooling.** `build-product-screens.mjs` reported all 52 new light rungs as
   stale files to delete.

---

## WHAT SHIPPED (all local)

**Homepage** — A-104 items 1 to 9 done. Product showcase autoplays five tabs
with a WCAG 2.2.2 pause control, never under reduced motion, permanent stop on
choice. Trust band replaces six cards with **no invented compliance claim**.
Statutory figures moved above The product and reduced 108px → 80px. Section
grounds now derive from POSITION (`nth-of-type`) on three pages, replacing 13
hand-placed classes.

**Light product screens sitewide.** All 16 drawn in Figma, verified by render,
originals proven untouched by census. Wired through ONE `VARIANT` constant, so
the whole site switches together; set it to `''` to go back to dark.

**The hover defect was AREA, not brightness.** Three rounds had tuned
brightness. A 1232px container was taking the full CARD hover — glass fill,
white borders, 2px lift, 2460px band — and `:hover` matches ancestors, so
pointing at a step card lifted the panel too.

**Semantic hues removed from hover states** in three places, hidden by token
naming: `--c-ambient-deep` resolves to `#7C3AED`, the refusal violet.

**58 gradient-clipped eyebrows removed.** Their contrast is now honestly
measurable — computed colour was `rgba(0,0,0,0)` on all 58, so any cheap check
returned a false ~1:1.

**Two `@font-face` rules declared narrower than their faces**, so the browser
was synthesising weights. `Jakarta Fallback` declared no weight at all, making
every heading using it a synthesised bold from Arial Regular.

---

## OPEN, AND WHO CAN CLOSE IT

**Needs the owner, not code:** A-126 and A-128 (production serves the old tree).
`CREDIT_ENFORCEMENT_MODE` → `enforce`, which blocks publishing any trial number.
The buy-4 severity collision. A-95's morphing mega-menu. Whether three surfaces
should stop lifting when you point at a control inside them.

**Genuine work left:** A-116 (the refusal argument is made four times),
O-25 (the broad UI/UX audit).

**The free trial is decided but not publishable:** 14 days, Starter, 1 user,
60 credits, no card — every figure read from a live constant. Terms now says
limits are stated per grant, which is honest and commits to nothing
unenforceable. **Publishing a number before the enforcement flip would recreate
the A-54 defect exactly.**

---

## STANDING CONSTRAINTS

- Production is FROZEN. Nothing pushed.
- Identity is `Crow Agent` / `crowagent.platform@gmail.com`.
- British English · no em-dashes in visible copy · never claim win rates ·
  PPN 002 is always 10% · no raw hex outside `tokens.css`.
- **One semantic per hue: teal = verified, violet = refused.** Neither on a
  hover, a focus ring or a control fill.
- **Approved gradient rule:** luminance anywhere; hue once per section, on the
  element the section is about; never under text, on a control, or on a state.
- Never two `npm run build` at once. Guard with `Get-CimInstance Win32_Process`;
  `ps -W | grep npm-cli` NEVER matches.
- Add board items with `node status/add-issue.js` — it allocates from a
  monotonic counter. Two terminals collided on ids on 2026-08-05.
