# Resume here — website, 2026-08-05 (overnight session close)

## FINAL STATE AT CLOSE — read this box first

- **Build: `REAL EXIT: 0`, full chain, all 30 gates**, read from the build's own
  line at 01:17. It covered every source file as it stood at 01:15.
- **Committed locally: `f7181465`** — 211 files, 32,780 insertions. **170 commits
  now unpushed on `main`. NOTHING PUSHED.**
- Two files carry uncommitted changes on top of that commit —
  `HeroStack.astro` and `HowItRuns.astro` — both structurally verified
  (balanced comment fences, correct frontmatter, clean close) and both included
  in the green build.
- `_tmp-measure-legal.mjs` was deleted as scratch. **`astro/scripts/measure-fidelity.mjs`
  was ALSO deleted and has been RESTORED from `f7181465` — it is not scratch.**
  No gate calls it, which is deliberate and documented in its header (a fidelity
  number that failed the build would block every unrelated commit until the
  redesign lands), but board item **A-108 exists to hold it** and it is the only
  repeatable way to score the concept fidelity work. **Do not delete it again.**
- **Board: 192 items**, and see **A-122**: two terminals were writing
  `status/issues.json` concurrently, both allocated `A-109`/`A-110`, and the
  other terminal's pair has been renumbered to **`A-120`/`A-121`**. Nothing was
  lost, but the file is a whole-file rewrite with no merge, so re-read the board
  immediately before every write.

**THE TYPE SCALE IS DECIDED — owner, 2026-08-05: KEEP 17px.** The concept's
15.2px body reproduces almost exactly the size the owner had already rejected as
"small and tiny" (which is why the build raised it 15 → 17 in the first place),
so exact-copy and that earlier decision were in direct conflict. The ruling is
**fidelity on everything except type**: width, padding, radius, colour, shadow
and label weight all move to the concept; the type scale does not, on any route.
That leaves roughly 127 of the 218 measured deltas permanently open **as a
deliberate, recorded divergence rather than as unfinished work** — 55 direct
type deltas and 72 heights downstream of them. See `A-120`.


Supersedes `RESUME-HERE-2026-08-04-EVENING.md`, which is still accurate on the
traps and the agreed homepage order. Read this first.

---

## Start with these

```bash
cd "C:\Users\bhave\Crowagent Repo\crowagent-website"

# Servers die on restart. The four that matter:
npx http-server astro/dist              -p 8095 -c-1 --cors   # the current build
npx http-server .                       -p 8092 -c-1 --cors   # LEGACY reference (looks old BY DESIGN)
npx http-server status                  -p 8099 -c-1 --cors   # the board, 176 items
npx http-server concepts/platform-theme -p 8120 -c-1 --cors   # platform V6 theme preview
# and :8712 serves concepts/homepage-v2.html, the fidelity reference

cd astro && npm run build > /tmp/b.log 2>&1; echo "REAL EXIT: $?"
```

**Read the build's own `EXIT:` line.** A `<task-notification>` exit code is the
WRAPPER's and has reported 0 over a failed build repeatedly.

**`ps -W | grep npm-cli` NEVER MATCHES** — `ps -W` prints no command line, so
that build-collision guard is inert. Use `Get-CimInstance Win32_Process`.

---

## WHAT SHIPPED THIS SESSION (all local, NOTHING PUSHED)

- **PPN 002 calculator removed completely.** Both routes 301 to
  `/glossary/ppn-002` (argued in `_redirects` block 6: a hub target reads as a
  soft 404 and keeps nothing). Chains collapsed, both URL forms, ordered above
  the `/tools/*/methodology` splat, no bang flags, 84 rules. Build **EXIT 0 on
  29 gates**.
- **`jsTotal:all` exception DELETED, not raised.** jsTotal **12.5 KB against
  15 KB**, green with no exception. This unwound a process error of mine.
- **A-93 responsive images:** `/crowmark/` 548,979 B → **84,754 B at 390**
  (−85%). Oversampling 8 of 8 images over 2× → **0 of 8** at every viewport.
- **A-87 FAQ parity** (0 mismatches, 103 questions, new gate proved to fail),
  **A-94** (`measure-cwv.js` deleted, replaced by a real `check-cwv.js`, chain
  now 31 steps), **A-89** (titles over 60 chars 20 → 4).
- **Card hover sheen halved** and MEASURED green: deltas 3.223 / 2.270 / 2.753
  against `MEAN_DELTA` 1.0.
- **Hero stratum graphic removed** (0 occurrences, all three invented metrics
  gone). `--grad-page-wash` removed. **But see A-103 — the ground is still not
  flat.**

---

## THE HOMEPAGE IS NOT A COPY — independent audit verdict, 2026-08-05

**Not one of ~55 measured elements in sections 2, 3 and 4 matches
`concepts/homepage-v2.html` on both width and height.**

**FIX THE CONTENT CONTAINER FIRST: 1232 concept vs 1064 built.** It cascades
into most other deltas, so re-measure after it before touching anything else.

| What | Concept | Built |
|---|---|---|
| S2 layout @834 | 2 cols, 383.00 × 561.39 | **1 col**, 750.63 × 367.80 |
| radius scale | 20 / 16 / 14 / 12 / 10 | **8px everywhere** |
| padding scale | 40 / 36 / 28 / 22 / 16 | **34px everywhere** |
| card background | solid `rgb(12,16,32)` | translucent + a shadow |
| body type | 15.2 / 24.32 | 17 / 26.35 |
| S4 stage card | 218.80 × 235.06 | 186.00 × **413.78** |
| S4 stage 1 dot | `rgb(45,212,191)` teal | **grey** — semantic loss |

The owner has demanded exact fidelity **three times**. Treat it literally: copy
the design, do not reinterpret. Where a gate forbids a raw value, **add the
concept's value as a token**, never drift to the site's existing value.

---

## OWNER DECISIONS TAKEN — do not re-surface

- **Trust band APPROVED**, replacing the six integration cards, continuously
  autoplaying. **Binding: invent NO compliance claim** — no Cyber Essentials,
  ISO 27001, SOC 2 or bare GDPR badge. **Do not lose the integration content.**
- **Carousel KEPT** and sized to the concept. The owner asked for autoplay, and
  WCAG 2.2.2 requires a pause control for anything moving over five seconds; the
  carousel already carries those affordances. `TabSwitcher` stays **shared**,
  autoplay **opt-in**, `/pricing` unaffected.
- **Violet clash PARKED.** Never change CrowMark's live accent.
- Statutory figures moves **above** The product, expands, loses most animation.
  This breaks the floor/base alternation — re-derive it.

---

## PLATFORM V6 THEME — document only, nothing implemented

Preview `:8120`. Doc `concepts/platform-theme/ADOPTION.md`. Committed to the
platform repo at `docs/design-system/website-v6-theme-reference/`, branch
`docs/v6-theme-reference`, commit `2b383f81`, **LOCAL ONLY**.

**THE PUSH IS AN OPEN OWNER DECISION.** The platform holds ~37 unpushed R2.6.2
commits with certification half done, and any push consumes Actions and triggers
two Vercel projects where every non-main deploy must land CANCELED.

- **Light had to be DERIVED — the website has no light palette.** Teal reads
  **1.72:1** on a light page. verified → `#0F766E`, refused → `#6D28D9`,
  at-risk → `#7A5514`. The converse fails too (3.68 / 2.83 / 3.01 on dark), so
  **no single value serves both modes**.
- **The platform ALREADY has a finished, audited light mode.** Adoption
  **replaces** it.
- **`--crowmark` is `#6D28D9`** at `packages/tokens/src/tokens.css:1126` —
  byte-identical to the derived light refusal colour.
- **`brand-lint.sh:139` scans only `web/app` and `web/components`**, so
  **63% of teal call sites (543 of 868) are ungated**.
- **33–63 engineer-days, or 3–6 days of supervised Claude Code sessions.**

---

## TRAPS ADDED THIS SESSION

- **A stray `*/` inside a doc comment blocks EVERY build.** The literal
  `.stratum*/.plane*/` closed a `/** */` early: 1,318 type errors, esbuild parse
  failure, **and three phantom `check-facts` em-dash failures**. The symptom
  pointed at prose; the cause was syntax.
- **Checking that a token is absent is NOT measuring the rendered page.** I
  reported the gradient removed because `--grad-page-wash` was gone. The page
  still paints **23 radial-gradient layers** against the concept's one (A-103).
- **`xAvgCharWidth` is not comparable across fonts.** Arial uses the old
  weighted-lowercase definition, Inter the modern all-glyphs one. **A control
  re-derivation of the shipped Jakarta numbers missed by 31pp** — that control
  is the only reason it was caught. Always run one (A-100).
- **Gradient-clipped text computes to a false ~1:1 contrast.** `color:
  transparent` is the tell. Measure rendered pixels.
- **`dist` churns every ~3 minutes** while an agent builds. Fence findings by
  mtime + md5 before and after, or discard.

---

## BOARD ENTRIES THAT WERE FACTUALLY WRONG

- **A-88** — Google requires `name` AND `offers.price` AND a rating/review, not
  "one of" the three. The site cannot honestly publish a rating, so the
  `SoftwareApplication` family is **permanently ineligible**. **CLEARED as
  impossible**, specifically so nobody "completes" it by inventing a rating.
- **A-68** — "68 orphan classes" grows by one per route (42 are namespace
  hooks). The real defect is **16 declarations that never reach a reader**, and
  **eight were on no allow-list at all**: `badge-*` on `/cookies`, `sev-*` on
  `/security`. Twelve category badges render as plain text.
- **A-90** — the sitemap half is fine (42 URLs, 12 with `lastmod` sourced from
  each page's own JSON-LD). Only the `/sectors/` breadcrumb is real.

---

## OPEN

**Unowned:** O-25 (the big UI/UX audit) · A-62 (CI still installs an
outside-project tree; needs a **clean-checkout build** to remove safely) ·
A-96 / A-100 (font metric overrides) · A-99 (13 forked static servers) ·
A-102 (comment-terminator gate).

**Held for the owner:** A-80 (Terms contracts for a free plan `/pricing` denies
— the platform's billing code sides with **Terms**) · A-95 (Stripe techniques) ·
A-98 (blog FAQ accordion promised by the schema, never rendered) · A-101 (dead
exports after the calculator removal) · A-106 (platform theme adoption).

---

## STANDING CONSTRAINTS

- **Production is FROZEN.** Nothing pushed, website or platform.
- Identity in all output is `Crow Agent` / `crowagent.platform@gmail.com`.
- British English · no em-dashes in visible copy · no AI-generated images ·
  **never claim win rates** · PPN 002 is **always 10%** · no raw hex outside
  `tokens.css` · zero third-party origins.
- **One semantic per hue: violet = refused, teal = verified.** Neither on a
  hover, focus ring or control fill.
- Max 2–3 concurrent agents. **Never two `npm run build` at once.**
- **Never `git add .` in the platform tree** — it holds uncommitted release work.
