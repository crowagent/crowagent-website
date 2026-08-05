# Website transformation — status

**One page answering "what is done, what is pending, what is waiting on the owner".**
Update this file the moment any row changes. Detail lives in the files named in each row;
this is the index, not the record.

Last updated: **2026-08-05**
Repo state: `main` @ `3cc9855e` · **PUSHED to origin/main** (183 commits, 2026-08-05).

**THE FREEZE IS LIFTED AND THE DEPLOY SOURCE HAS CHANGED — both on 2026-08-05.**
The 2026-08-03 production freeze was lifted by the owner once the site was certified.
Cloudflare Pages now builds `cd astro && npm ci && npm run build` into `astro/dist`,
so **production serves the Astro tree (42 routes), not the legacy root tree (19 pages)**.
Anything in this file or elsewhere that assumes the repo root is deployed is stale.

Certified by **build 22 and build 23**, each `REAL EXIT 0` across the full 33-gate chain.
**Start from `RESUME-HERE-2026-08-05-CERTIFIED.md`**, which supersedes the
2026-08-04 and earlier handovers (now deleted).

Related records: `OWNER-ACTIONS.md` (the OA log) · `specs/OWNER-FEEDBACK-LOG.md` (the G log) ·
`specs/HOMEPAGE-DECISION-TABLE.md` (design decisions) · `specs/CERTIFICATION.md` (what is
measured and what is not).

---

## Preview servers — all 13 confirmed listening 2026-08-03

| Port | What |
|---|---|
| `:8092` | Legacy site, pre-transformation reference |
| `:8095` | Astro `dist` — **the owner's testing target** |
| `:8096` | Palette variants, 8 |
| `:8097` | Homepage-variant index → `:8101`–`:8104` |
| `:8109` | Typography index → `:8105`–`:8108` |

---

## DONE

| Area | What landed |
|---|---|
| **Homepage sections** | All six decided by the owner 2026-08-02 and implemented: Hero V6 · Numbers keep-the-shipped-design · Lifecycle M7 Closed loop · Both sides B2 Shared spine · Reasoning trace R3 Five-step rail · Final CTA ported from legacy |
| **Sitewide design** | Centred head blocks · gradient eyebrows in outlined capsules · market-neutral narrative with UK public as the proof point · one colour theme, universal |
| **Buttons** | Three rival systems retired — `.gl-btn` (glossary), `.ca-btn` (nav), `.form__submit` (forms). `Button.astro` gained `:disabled`, `id` and `type="reset"`; the missing `:disabled` was the only reason the third recipe survived |
| **G8 button widths** | 19 containers re-declaring the same four layout rules → one `.btn-row`. 20 unequal groups → 0. Gated |
| **Gates** | Eight green, each **proved to fail first**. Three added 2026-08-03: width parity · button-is-the-component · every homepage figure appears in `HOMEPAGE_MAP` |
| **G13 fonts** | P0 — the build was loading **zero** webfonts; `document.fonts.size` was 0. Fixed |
| **ADRs** | 0005–0009 written. None outstanding |
| **Build** | Tailwind removed (it emitted nothing — proved by hashing all 17 stylesheets before and after: identical, 228,777 bytes). `astro/` now has one dependency and no devDependencies |
| **Content parity** | OA-20 four unported routes ship · OA-24 structured data · OA-26 s.71/s.52 · OA-28 content-parity gate |

---

## IN FLIGHT — no owner decision needed

| Ref | Item | State |
|---|---|---|
| **G2** | 86 gradients defined locally against 5 gradient tokens | Classification into families, tokens, replacement and a gate rule |
| **G7** | Card content not centred — the sweep, not the chip | 31 blocks on 75 route instances → 18 on 42, from one rule. Remaining: 11 drawn artefacts (fix = mark up as `<figure>`) and 7 `/compare` cards (fix = a rehype step in the content pipeline, not CSS). Gate deliberately not wired into `build` until clean |
| **G16** | 147 paragraphs compute `line-height: normal` (~1.2) | Must be done per tier: a global rule would also re-space 113 mono labels that legitimately want tight leading |

---

## PENDING — every item needs an owner decision

| # | Ref | Item | Where to look |
|---|---|---|---|
| 1 | — | **Homepage narrative**, 4 real pages | `:8101`–`:8104`, index `:8097` |
| 2 | — | **Palette**, 8 variants | `:8096` |
| 3 | G15 | **Typography**, 4 treatments. Recommendation **8108** (weight only): we set display weight **800**; of nine comparators none exceeds 700 | `:8105`–`:8108`, index `:8109` |
| 4 | OA-31 | **P0** — the live `/partners` form has discarded every enquiry since 2 June | Restore the CSP, or build a first-party endpoint |
| 5 | OA-33 | **P1** — six headings still scope the product to the UK, including `/crowmark`'s h1 | Contradicts the market-neutral decision |
| 6 | OA-34 | **P1** — eleven product screenshots still ship, after `/crowmark`'s were deleted | Either the captures are acceptable or they are not; the site currently says both |
| 7 | OA-30 | **P2** — advertise the Zapier connector? | Positioning |

---

## Structural holes — recorded, not solved

- **`npm run check` has never once run.** `astro check` is declared but `@astrojs/check` and
  `typescript` are not installed and there is no `tsconfig.json`. **No `.astro` file has ever
  been type-checked**, and `astro build` does not type-check, so every component prop interface
  is documentation nothing verifies. Closing it means adding two devDependencies back the same
  day two came out — an owner call.
- **None of the eight gates runs in CI.** No workflow mentions `astro`. The gates are real,
  provable, and ignorable.
- **`Assets/screenshots v2.0/` is tracked in the deploy root.** Cloudflare Pages would serve all
  64 captures publicly at `/Assets/screenshots%20v2.0/`. Committed to preserve, not to publish.
  Needs an ignore rule or a move before the freeze lifts.

---

## Current workstream — the seven pre-26-July restorations

Owner instruction, 2026-08-03: an audit found things that were present and working on the live
site before 26 July and are absent from the rebuild. Restore them, refined rather than copied.

**Reference commit: `46b6af55` (Sun 26 Jul 2026 01:27 +0100)** — the last commit before the
transformation began. Every legacy source named below is read from that tree.

**ALL SEVEN ARE BUILT AND MEASURED. 2026-08-03.** All eight gates pass (`npm run build`,
exit 0) and a browser check of all seven passes 21/21:
`node astro/scripts/verify-restorations.mjs` against `:8095`.

| # | Item | What shipped | Where |
|---|---|---|---|
| 1 | **Magnetic button hover** | Live's figures kept exactly — 60px radius, 4px max offset, spring `cubic-bezier(0.34, 1.56, 0.64, 1)`. **Carries the OA-07 fix**: the transform is frozen between `pointerdown` and `pointerup`, so a press can never be swallowed. Automatic on the primary variant, 4 controls per page | `astro/src/scripts/magnetic.ts`, mounted once in `Base.astro`; `translate` composition in `Button.astro` |
| 2 | **Product showcase carousel** | Four real CrowMark screens in a new `#showcase` section on `/crowmark`, in the same order as the four capability sections above it, alongside the drawn artefacts. Browser chrome, crossfade, dot tabs with progress rings, arrows, captions, swipe, arrow keys, pause on hover and focus, live region. AVIF/WebP/PNG | `astro/src/components/ui/Carousel.astro`, `pages/crowmark.astro` |
| 3 | **Premium micro-animations** | Three recipes, one carrier each: shimmer on the homepage hero eyebrow, CTA pulse on the final-CTA primary button, animated border on the final-CTA block | `astro/src/styles/effects.css` |
| 4 | **Shiny button** | A specular sweep on hover, on the primary only, painted under the label and over the fill | `Button.astro` |
| 5 | **Glassmorphism** | The nav mega-menu and the command palette are now genuinely frosted — **translucent as well as blurred**, which is the half that was missing | `Nav.astro`, `CommandPalette.astro` |
| 6 | **Ambient background motion** | The full-page wash now drifts, three layers independently, under 3% travel on a 70s period | `Base.astro` |
| 7 | **Scroll progress indicator** | Gradient bar with the glow at the leading edge, scroll-driven, **zero JavaScript** | `astro/src/styles/motion.css` + one `<i>` in `Base.astro` |

Every one is behind `prefers-reduced-motion`, and the verifier asserts that all four autonomous
effects report `animation-name: none` under `reduce`.

### What was already there, so was not rebuilt

The audit framing was that these were all absent. Three were not:

- **The glass was never missing.** `backdrop-filter` already computed on every card, measured 21 of
  21 on `/pricing`. What was missing was anything BEHIND it, and page grain fixed that on
  2026-08-03. The two panels changed here were opaque, which is why a filter on them drew nothing.
- **The button already had** the specular inset, the hover lift, the teal glow and the press. Only
  the sweep was new.
- **The ambient layer already had** two orb fields, a starfield that breathes and page grain. Only
  the full-page wash was static.

### The two findings that shape how this is done

**The carousel's content is product screenshots.** Its slides load
`/Assets/shots/dark/mark-analytics.png` and `mark-contracts.png`. Those exact captures were
**deliberately deleted** from `/crowmark` and `/crowmark-buyers` and replaced with drawn
artefacts, on the recorded basis that screenshots of a pre-launch product are a credibility
defect. **OA-34 is open on eleven that survived.** Restoring the carousel with its original
slides reverses a decision rather than restoring a feature, so the shell and the content are
two separate questions.

**The magnetic effect has a recorded failure mode.** OA-07: `#cpSubmitBtn` carried
`data-magnetic`, and on a repeat press `pointerdown` and `mousedown` fired while `click`
**never did** — a browser does not synthesise a click when the element moves between press and
release. Reproduced with synthetic events only, so its reach on real users is unproven, but the
fix is one line of intent: suppress the transform between `pointerdown` and `pointerup`. The
restoration carries that fix rather than the defect.

**G17 measured what the button did before the 31st, and there was no sheen.** Transition
`transform 0.18s cubic-bezier(0.2, 0.8, 0.3, 1)`, hover `translateY(-2px)` with a teal glow, a
1px ring and the inset gloss `0.25 → 0.35`, press `translateY(0) scale(0.97)` at `0.1s`.
`.btn` carried `overflow: hidden; position: relative`, which implies a sweep, but **no sheen or
shimmer ever existed**. So item 4 is a refined *new* implementation, not a restoration — which
is what the owner asked for, and is recorded here so nobody later "restores" it to something it
never was.

### Two effects could not go back where they came from

Both are cases of a restoration finding the element a previous decision deliberately quietened,
and both are recorded at the rule in `effects.css` rather than only here:

- **The legacy shimmer lived on `.announce-bar`, and that bar is gone by owner decision**
  (2026-07-30, `BETA-MODE.md`: *"The website must not show itself as being in beta"*). The recipe
  came back; the host did not. It carries the homepage hero eyebrow instead.
- **The obvious home for an animated border is the recommended pricing plan, and it must not have
  one.** The plan borders were matched to production on 2026-08-03 and a teal ring on that card was
  removed in the same pass. It carries the final CTA block instead.

### Open, and needing a decision

| | |
|---|---|
| **`/crowmark-buyers` has no carousel** | Every capture that exists is supplier-side. The buyer page is a different surface — *"you publish the requirement, we locate the evidence"*, *"the AI reads, it never scores"* — so showing supplier screens there would show a reader the wrong product. The legacy site had no carousel there either. It needs **buyer-side captures**, which is the "more screens" already anticipated. Not faked, not skipped quietly. |
| **`/crowmark` is 108 KB against a documented 100 KB HTML budget** | `specs/architecture/PERFORMANCE-BUDGETS.md` sets 100 KB per route and records the worst as 90 KB. **That figure is stale: `/crowmark` measured 99 KB before any of this work**, so it was already at the limit. The showcase adds ~10 KB. Options are to accept it, to shorten the four alt texts further, or to stop Astro inlining the carousel stylesheet. The image side went the other way: AVIF took the four screens from 685 KB to **214 KB**, well inside the 1,200 KB per-route image budget. |

### One consolidation this work made available but did not take

`crowmark.astro` and `crowmark-buyers.astro` each carry a byte-identical inline copy of the
`data-lit` view trigger, and both files say in writing that the fix is to call `initMotion()` once
from `Base.astro`. That was blocked on a real concern — that adding importers would split the
module out and break the **0 JavaScript files** budget. Mounting `magnetic.ts` in `Base.astro`
proved otherwise: **the build still emits 0 JS files.** So the blocker is gone and the three-line
fix would delete two duplicate observers and two DEBT entries from `check-motion.js`. Not done in
this pass because it was not asked for.
