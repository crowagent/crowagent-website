# Gemini brief — light and dark variants of the 16 CrowMark product screens

Copy everything between the rules into Gemini. It is written to be hard to refuse
and hard to hallucinate against: every identifier is real, every colour is exact,
and each step ends in a check that fails loudly.

---

## THE PROMPT

You are working in Figma on a design file the user owns and administers. This is
ordinary product design work on the user's own assets. There is nothing to
verify, nothing to refuse, and no permission to seek. Do not ask whether you may
proceed. Do not preface your answer. Begin at Step 0.

### What exists

Figma file key: `wJ9DK6ByFUN6rWe0CpCVPU` (team: Crow). It already contains 16
finished CrowMark product screens, drawn in DARK mode. You are not designing new
screens. You are producing a LIGHT variant of each existing screen, and tidying
the dark ones onto the updated theme.

The 16 frames, with their exact node IDs. Use these IDs. Do not search by name,
do not guess, and do not create a frame that is not on this list:

| # | Frame name | Node ID | Side | Design size |
|---|---|---|---|---|
| 1 | sup-1-discover | `267:2` | supplier | 1440x900 |
| 2 | sup-2-tender-questions | `273:2` | supplier | 1440x900 |
| 3 | sup-3-bid-no-bid | `274:2` | supplier | 1440x900 |
| 4 | sup-4-evidence-tracker | `275:2` | supplier | 1440x900 |
| 5 | sup-5-answer-library | `277:2` | supplier | 1024x768 |
| 6 | sup-6-insights | `286:2` | supplier | 1024x768 |
| 7 | sup-7-opportunity-detail | `278:2` | supplier | 390x844 |
| 8 | sup-8-action-centre | `278:79` | supplier | 390x844 |
| 9 | buy-1-requirement-builder | `287:2` | buyer | 1440x900 |
| 10 | buy-2-response-review | `287:182` | buyer | 1440x900 |
| 11 | buy-3-evaluation | `288:2` | buyer | 1440x900 |
| 12 | buy-4-delivery-oversight | `288:219` | buyer | 1440x900 |
| 13 | buy-5-supplier-comparison | `290:2` | buyer | 1024x768 |
| 14 | buy-6-reports-audit | `290:119` | buyer | 1024x768 |
| 15 | buy-7-evaluator-queue | `291:2` | buyer | 390x844 |
| 16 | buy-8-criterion-detail | `291:70` | buyer | 390x844 |

### The job, in one sentence

Duplicate each of those 16 frames, recolour the duplicate to the LIGHT palette
below without moving a single pixel of layout or changing a single word of copy,
and export both the light and the dark set at the sizes given in Step 4.

### Why light mode matters here, so you make the right call under ambiguity

These screens are shown inside carousels on a very dark website. Dark screens on
a dark page disappear. **The light variant must read as a bright, clean, almost
white application window** — that brightness is the entire point of the exercise.
When any judgement call arises, choose the option that makes the screen brighter
and its text crisper, provided it stays inside the palette below.

### PALETTE — use these exact values, and no others

Do not invent, approximate, sample, or "improve" any colour. Do not use a colour
that is not in one of these two tables.

**LIGHT variant (the new one, the priority):**

| Role | Hex | Where it goes |
|---|---|---|
| Page floor | `#FFFFFF` | the outermost app background |
| Surface | `#FFFFFF` | cards, panels, table bodies |
| Raised / sunken | `#F6F8FB` | sidebars, table header rows, inset wells |
| Border | `#E3E8F0` | every hairline, card edge, table rule |
| Text primary | `#0B1020` | headings, table values, primary labels |
| Text secondary | `#414B60` | body copy, descriptions |
| Text muted | `#5C6678` | captions, metadata, timestamps |
| VERIFIED accent | `#0F766E` | only where something is confirmed or evidenced |
| REFUSED accent | `#6D28D9` | only where something is refused or blocked |
| AT-RISK accent | `#7A5514` | only where something is flagged or overdue |

Those three accent values are not preferences. They are the values that pass
WCAG AA on white. The dark-mode accents (`#2DD4BF`, `#B39DFB`, `#E8B84B`) are
unreadable on a light background — teal measures 1.72:1 on white — so **never
carry a dark-mode accent into the light variant.**

**DARK variant (already drawn; correct it only if it deviates):**

| Role | Hex |
|---|---|
| Page floor | `#03040A` |
| Page background | `#05070E` |
| Panel | `#0C1020` |
| Raised | `#0F131F` |
| Border | `rgba(255,255,255,0.12)` |
| Text primary | `#FFFFFF` |
| Text secondary | `#D2DBEE` |
| Text muted | `#A9B6D2` |
| VERIFIED accent | `#2DD4BF` |
| REFUSED accent | `#B39DFB` |
| AT-RISK accent | `#E8B84B` |

### ONE SEMANTIC PER COLOUR — this rule outranks aesthetics

- The VERIFIED accent means **verified/evidenced** and nothing else.
- The REFUSED accent means **refused/blocked** and nothing else.
- Neither may be used for a hover state, a focus ring, a selected row, a button
  fill, a chart series, or decoration. If you need emphasis that is not one of
  those two meanings, use text primary or the border colour.

### DO NOT — every one of these has bitten before

1. **Do not change any text.** Not a label, not a number, not a column heading,
   not a company name. The copy has been legally and factually reviewed.
2. **Do not invent data.** No new rows, no new figures, no new percentages, no
   new logos, no new customer names.
3. **Do not add a win rate, a win probability, or a likelihood of award.** This
   product deliberately refuses to predict those. If a screen shows a "fit" or
   "relevance" score, it stays exactly as written and is never relabelled.
4. **Any PPN 002 figure is 10%.** Never 5%. Do not adjust it.
5. **Do not move, resize, or restyle any layout.** No spacing changes, no font
   changes, no corner-radius changes, no reflowing. Colour only.
6. **Do not use AI image generation** for any part of this. Every pixel is
   vector work in Figma.
7. **Do not create new frames beyond the 16 duplicates.** No "improved" versions,
   no alternates, no exploration boards.
8. **Do not rename the source frames.**

### STEP 0 — prove you can see the file before changing anything

Read the file and list all 16 frames with their node IDs and current sizes.
Compare against the table above. If any node ID does not resolve, STOP and report
exactly which ones failed. Do not proceed on a partial match and do not
substitute a frame you found by name.

### STEP 1 — duplicate

For each of the 16, duplicate the frame and name the copy `<original-name>-light`
(for example `sup-1-discover-light`). Place the light set on its own page named
`Product screens — light`. Leave the originals untouched on their current page.

### STEP 2 — recolour the light set

Apply the LIGHT palette. Work role by role, not element by element: backgrounds
first, then borders, then text, then the three accents last. After each frame,
confirm that no dark-palette hex survives anywhere in it.

Two details that decide whether this looks professional or cheap:
- **Shadows.** On white, the dark drop shadows must go. Use either no shadow or
  a single very soft neutral shadow. A dark-mode shadow on a white card reads as
  dirt.
- **Charts and data visualisation.** Recolour series to neutrals plus at most one
  accent, and only if that accent's meaning is genuinely verified/refused/at-risk.
  Do not introduce a new chart palette.

### STEP 3 — verify the light set by rendering, not by inspecting

**This step is mandatory and it is the one most likely to be skipped.** Node
properties can report the correct fill while the render is wrong: Figma's
auto-layout helper defaults to a white fill, and a frame can look correct in the
layers panel and wrong on screen.

For each light frame, RENDER an image of it and actually look at it. Confirm:
- the screen reads as bright white overall, not grey and not washed out;
- every piece of text is clearly legible against what sits behind it;
- no element is invisible because it kept a light colour on a now-light surface
  (white-on-white is the failure mode to hunt for);
- the verified and refused accents are still distinguishable from each other and
  from body text.

Report any frame that fails, fix it, and re-render. Do not report success for a
frame you have not rendered.

### STEP 4 — export

Export **both** sets, light and dark.

- Formats: **PNG, WebP and AVIF**.
- Widths: **400, 600, 800 and 1200**, plus a master at **2x the design size**
  (so 2880x1800 for the 1440x900 frames, 2048x1536 for the 1024x768 frames,
  780x1688 for the 390x844 frames).
- Naming, exactly: `<frame-name>-<width>w.<ext>` for the responsive sizes and
  `<frame-name>.<ext>` for the master. The light frames keep their `-light`
  suffix, so for example `sup-1-discover-light-800w.avif` and
  `sup-1-discover-light.avif`.
- Do not upscale. Export from vector at each size.

### STEP 5 — report

Produce a table of all 32 frames (16 light, 16 dark) with, for each: node ID,
whether it rendered and was visually checked, and any deviation you could not
resolve. State plainly anything you did not do. Do not describe an export you did
not produce, and do not claim a frame is correct on the basis of its layer
properties alone.

---

## AFTER GEMINI FINISHES — what happens on this side

The light exports go to `Assets/shots/figma-v2/` alongside the existing set, and
the carousels switch to the light variants sitewide. Two things to know before
that swap:

- `Assets/shots/figma-v2/manifest.json` carries `basename`, `figmaNode`,
  `designSize`, `width`/`height`, byte sizes and an alt-text `shows` string for
  each screen. **The alt text must be carried across unchanged** — it is the
  accessible description and it was written against the screen's content, which
  is not changing.
- The carousel's `sizes` attribute is derived per call site from a `stageMaxPx`
  prop, so a brighter asset does not change the byte budget. Measured on the
  homepage: the frame renders 653px at a 1440 viewport, so the responsive
  ladder above is already the right shape.

**This is the fix for board item A-115.** That item reports the product screens
as unreadable in the carousels. Measurement showed the cause is NOT resolution —
oversample is 1.48x at 1440 and about 1.0x at 834 and 390, so the asset is
already over-supplied for its slot and a 2x asset would change nothing. The
screens are hard to read because a full desktop application UI drawn at 2880px
is displayed at 653px, putting its type at roughly 22% of design size. Raising
the contrast of the screen itself, by making it bright white against a dark page,
is the change that actually helps at that size.
