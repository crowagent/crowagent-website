# Putting the website's colours on the platform

**A decision document. Nothing has been built and nothing has been changed.**

Prepared by Crow Agent · 2026-08-05 · preview at `http://localhost:8120/`

---

## 1. What is being proposed

Repaint `app.crowagent.ai` in the marketing site's V6 palette, in both dark and light.

**The platform already has a finished light mode.** It is 120 token declarations with
per-token contrast notes, a 149-declaration dark re-assert block, a working switcher and a
documented elevation model, all dated 2026-06-05 and audited since. This proposal does not
fill a gap. It **replaces audited work that already ships**, and the two light modes cannot
run side by side.

That is the whole decision. Everything below is detail.

---

## 2. What the preview proves

Dark is the website palette used verbatim, and it passes everywhere: 487 rendered elements
measured in a real browser, zero contrast failures, zero console errors, zero third-party
requests. The gate was proven able to fail by injecting two known-bad values, which produced
6 and 7 failures respectively.

Light had to be **derived**, because the website has no light palette and its own token file
says so. I recomputed every ratio independently and all of them reproduce exactly.

| Role | Dark value | On a light page | Derived light value | On a light page | On the dark canvas |
|---|---|---|---|---|---|
| verified | `#2DD4BF` | **1.72** fail | `#0F766E` | **5.07** pass | 3.68 fail |
| refused | `#B39DFB` | **2.13** fail | `#6D28D9` | **6.58** pass | 2.83 fail |
| at risk | `#E8B84B` | **1.71** fail | `#7A5514` | **6.20** pass | 3.01 fail |

Read that table both ways. The dark values are unusable on a light page, and the light values
are unusable on a dark one. No single value serves both modes, so this is genuinely two
palettes and not one palette with a switch.

---

## 3. The real obstacle

It is not swapping hex values. It is that **the platform names colours after the pigment and
not the job.**

The app writes `var(--teal)`. It does not write `var(--c-verified)`. I counted **937
occurrences of `var(--teal)` across 338 files**. Split by what each one is actually doing:

| What the call site does | Count |
|---|---|
| focus and focus-visible rings | 389 |
| backgrounds and fills | 199 |
| borders | 111 |
| hover and other state variants | 42 |
| accent and caret on native controls | 25 |
| bare ring and outline | 11 |
| shadow and glow | 2 |
| **Control states, subtotal** | **779** |
| teal used as ink | 63 |
| bare, context not readable from the token alone | 95 |

So **779 of 937 are control states**. The website's rule forbids a meaning-hue on any of them.

The reason for that rule is worth one paragraph, because it is the entire argument. If teal
can mean "you are hovering this", then teal can no longer mean "this figure is evidenced". A
colour that decorates has stopped being evidence. V6's answer to "what colour is a button,
then" is white in dark mode and near-black in light: the maximum-contrast neutral, never a
hue. Only an irreversible action gets a hue, and it still carries a word.

The sharpest single instance: `web/app/globals.css:180` sets the focus ring to
`2px solid var(--teal)` for the entire application, and `packages/ui/src/primitives/button.tsx`
repeats it. That one line governs 389 call sites.

---

## 4. Effort estimate

One engineer, working days. This is the answer to the question you asked.

| # | Work | Days | How solid |
|---|---|---|---|
| A1 | Add role tokens, bound to today's pigments. No visible change. | 1–2 | Firm |
| A2 | Mechanical sweep of the 779 control-state sites by utility prefix | 3–5 | Firm, counted |
| A3 | Read and classify the 158 ambiguous sites (63 ink, 95 bare) | 3–6 | Medium |
| A4 | Rewrite the Button primitive. 9 variants, 3 already duplicates. | 1–3 | Medium |
| A5 | Repoint the focus ring, 2 places, 389 consumers, plus keyboard regression pass | 1–2 | Firm |
| B | Extend `brand-lint.sh` to fail on pigment names, and widen its full-tree scan | 1–2 | Firm |
| C1 | Swap the values: `:root`, the 120-declaration light block, the 149 dark re-asserts | 3–5 | Medium |
| C2 | Retire the 15 light-mode contrast patches in `globals.css` | 1–2 | Medium |
| C3 | Decide and rehome 8 orphan accent hues that V6 has no room for | 2–4 | **Guess** |
| D | Charts: move `CHART_COLOURS` from a compile-time constant to theme-aware | 2–4 | Medium |
| E | 38 email templates, `brand-colors.ts`, and 6 API routes that inline their own hex | 4–7 | **Guess** |
| F | PDF, DOCX and OG generators, 5 files, all literal | 2–4 | **Guess** |
| G | Portal: a 590-line hand-copied token file with 160 hex values, 73 pages, 58 teal sites | 4–8 | **Guess** |
| H | QA: extend the screenshot harness from 25 routes and one theme to broad coverage in two | 5–9 | Medium |
| | **Total** | **33–63** | |

**What drives the range.** A2, A5 and B are counted work and the range is narrow. A3 is a
reading task over 158 sites where somebody has to decide, one at a time, whether the author
meant "verified" or "clickable". Nobody currently knows that split, which is exactly why the
work is worth doing.

**The four lines marked Guess.** C3 depends on product decisions outside this brief. E, F and
G I sized from file counts I verified but never opened one by one. G is the widest because the
portal's token file is maintained by hand and its agreement with the main one has never been
checked, so it could be a copy job or a reconciliation.

**One piece of good news that lowers H.** A Playwright screenshot harness already exists and
uses no paid service. It covers 25 routes across 3 viewports, dark only. Extending it is real
work, but building it is not.

---

## 5. What breaks, ranked

1. **Charts.** `CHART_COLOURS` is a compile-time TypeScript constant of dark-only hexes, with a
   header instructing that CSS variables must never be used, because Chart.js draws to canvas
   and cannot read them. The CrowMark analytics page imports it directly. **This is already
   broken under the light mode that ships today.** Adoption does not create the defect, it
   makes it impossible to ignore.
2. **Emails.** 38 templates plus a deliberately separate email palette, because email clients
   strip `var()`. A further 6 API routes inline their own hex. None follows a token change. The
   app would go white-on-black while every transactional email stayed teal on navy.
3. **Documents.** PDF lockup, DOCX letterhead, brand spec, the OG image template and the
   portal's document generator are all literal hex. Five separate hand edits.
4. **The portal.** A hand-copied 590-line token file. Any change lands twice or the duplication
   is removed first.
5. **Things that must not move.** The EPC band scale is a regulated visual scale. The Google
   and Microsoft OAuth colours are third-party marks. A blanket sweep would break all of them.

One pre-existing defect is worth fixing in the same pass: `--coral` is overridden in the light
block and, unlike its neighbours, is **not re-asserted in the dark block**. I confirmed that
from source. A dark-pinned island inside a light document therefore paints it at the light
value.

---

## 6. Three decisions for you

**The CrowMark clash, and it is worse than first reported.** CrowMark's accent is `#A78BFA`,
which is the website's `--c-violet` exactly. In the platform's **light** mode CrowMark is
already `#6D28D9`, which is byte-identical to the light refusal colour this preview derives.
Not a near miss, the same value. Options: move CrowMark to another accent, or move refusal.
**My recommendation: move refusal.** A product's brand accent is externally visible and
CrowMark is live; a semantic marker is internal and cheaper to change. No automated gate will
ever catch this, so it needs you.

**Keep or replace the existing light mode.** Options: replace it, or adopt V6 in dark only and
leave light as it is. Replacing discards 120 audited declarations and makes 15 contrast patches
dead code. Keeping means the app looks like the website in dark and like something else in
light. **My recommendation: replace, but only after the role layer exists**, because at that
point it is a value edit rather than a rewrite.

**Sequencing against R2.6.2.** Options: start now, or wait for certification. **My
recommendation: wait.** R2.6.2 Phase 2 is cut with commits unpushed and certification half
complete, with web shards 4 to 6 and the entire API suite unrun. Take the CrowMark decision now
on paper. Let the code wait.

---

## 7. Recommendation, and the risk

I agree with the two-release split, and my own counts strengthen the case rather than weaken it.

**Release one: the role layer, no visible change.** Add the role tokens bound to the pigments
they already resolve to. Reclassify the call sites. Extend the lint so naming a pigment from a
component fails the build. Nothing moves on screen, and the screenshot harness already exists to
prove it: any pixel that shifts is a misclassification.

This is worth doing whether or not the website palette is ever adopted. It turns every future
colour decision into a handful of lines instead of a 338-file sweep. **Release one is 13 to 25
days of the 33 to 63 above.**

**Release two: swap the values,** plus the non-CSS surfaces in section 5, which have to be done
by hand regardless of which palette wins.

**The risk, plainly.** Release one touches the most reused component in the app and roughly 937
call sites. Doing it now puts a very large, very wide diff on top of a release that cannot
currently prove itself green. If something breaks afterwards, you will not be able to tell
whether it came from the repaint or from the uncertified release underneath it. That is the
whole risk, and waiting removes it.

**What I would not do:** adopt the palette without the role layer. It would look right on day
one and rebuild the exact defect the website just finished repaying.

---

## 8. Corrections to the earlier findings

I re-counted rather than repeating. Five figures were wrong.

| Claim | Verified | Verdict |
|---|---|---|
| `var(--teal)` 858 times across 298 files | **937 across 338 files** | Understated |
| 696 control-state sites, 46 ink, 117 bare | **779 control, 63 ink, 95 bare** | Understated |
| 169 literal colours behind 636 declarations | 169 and 636 | **Exact** |
| Light block 118 declarations, 148 dark re-asserts | **120 and 149** | Slightly off |
| 16 light-mode contrast patches | **15** | Slightly off |
| Focus ring hardcoded at `globals.css:180` | Confirmed | **Exact** |
| Effectively zero Tailwind palette classes | **3 in total, 2 of them in a unit test** | Confirmed, stronger |
| All contrast ratios quoted | Recomputed independently | **All exact** |
| 38 email templates, 6 API routes | Confirmed | **Exact** |
| CrowMark four degrees from refusal | **Identical in light mode** | Worse than stated |
| `brand-lint.sh` enforces the discipline | True for changed files. Its whole-tree fallback scans only `web/app` and `web/components`, missing `web/src`, which holds 482 of the 937 teal sites | Weaker than stated |

---

## 9. Still unverified

1. **How the 158 ambiguous sites split** between "verified" and "clickable". Counted, not read.
2. **Portal parity.** I did not diff its 160 hex values against the main token file. Nothing
   guarantees they agree.
3. **The `--coral` defect at runtime.** Confirmed in source, not confirmed on a running app.
4. **Effort lines C3, E, F and G** are sized from verified file counts but not from opening
   every file. Treat them as estimates, not measurements.
5. **No chart is shown in the preview.** A chart needs data and there is no honest placeholder
   for a series. The chart risk is read from source, not demonstrated.
6. **Where the 8 orphan accent hues go.** Named as homeless. No proposal made.
