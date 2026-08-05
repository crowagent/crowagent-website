# Prompt for Gemini — CrowAgent homepage

Copy everything between the rules into Gemini. It is written to stop the four
things the previous attempt got wrong, which are named explicitly so the model
cannot repeat them.

**What was wrong with `final-production-homepage.html` (measured, not guessed):**

| Defect | Evidence |
|---|---|
| Claimed a win rate | `"win-rate acceleration with grounded evidence"` — the one claim this company categorically refuses to make |
| Invented a metric | `94% FIT SCORE`, `3x` — figures that exist in no source |
| Invented three image assets | `hero_dashboard.jpg`, `bento_triage.jpg`, `evidence_graph.jpg` — none exist in the build |
| Loaded third-party origins | `fonts.googleapis.com`, `fonts.gstatic.com` — the site ships **zero** third-party origins and a build gate enforces it |

---

You are designing the homepage for **CrowAgent**, a UK bid and tender platform.
Produce **one self-contained HTML file** called `homepage-concept.html`. It is a
**visualisation for review**, not a deployment. Treat every rule below as a hard
constraint: a beautiful page that breaks one of them is a failed answer.

## 1. ABSOLUTE PROHIBITIONS

1. **Never claim a win rate, a success rate, or an accuracy percentage.** This
   company's entire positioning is that it refuses to claim these, because it
   cannot evidence them. Do not write "win-rate acceleration", "win more bids",
   "94% fit score", "3x faster", or any cousin of these. If you want to express
   value, express **coverage, traceability and time**, never probability of
   winning.
2. **Invent no numbers.** The only figures permitted are the four in §3, each
   with its citation. If a design needs a number you do not have, use the real
   one or remove the element.
3. **Invent no image files.** Do not reference a `.jpg` or `.png` you have not
   been given a real path for in §4. No AI-generated imagery of any kind — that
   is a standing company rule. No stock photography of people in offices.
4. **No third-party requests.** No Google Fonts, no CDN, no analytics, no
   external scripts, no remote images. Everything inline or from §4. The
   production site loads zero third-party origins and a build gate fails on any.
5. **No product screenshots of the real app.** Publishing app captures on the
   marketing site is a recorded credibility defect here. Use the drawn artefacts
   in §4 or draw new ones in inline SVG/CSS.
6. **British English.** Organise, optimise, recognise, colour, licence (noun).
   No em-dashes in visible copy — use commas, semicolons or separate sentences.

## 2. VISUAL SYSTEM — use these tokens, do not invent a palette

Declare these in `:root` and reference them by role. Never write a raw hex in a
component rule; the production build fails on it.

```css
:root {
  /* ground */
  --c-floor: #03040A;  --c-bg: #05070E;  --c-panel: #0C1020;
  --c-card: rgba(255,255,255,0.05);  --c-border: rgba(255,255,255,0.12);
  /* ink */
  --c-text: #FFFFFF;  --c-text-sub: #D2DBEE;  --c-text-muted: #A9B6D2;
  /* meaning — these three carry semantics and may NOT be used decoratively */
  --c-verified: #2DD4BF;   /* teal   — this was evidenced */
  --c-refused:  #B39DFB;   /* violet — the engine refused this */
  --c-at-risk:  #FFB454;   /* amber  — this needs attention */
  /* emphasis — non-semantic, use for CTAs, selected states, indicators */
  --c-interactive: #FFFFFF;
  /* ambient ramp, decoration only */
  --c-ambient-start: #2DD4BF; --c-ambient-mid: #22D3EE; --c-ambient-end: #A78BFA;
}
```

**The rule that matters most:** *one semantic per hue, and violet is spoken for.*
Violet means **refused**. Never use violet for a "recommended" badge, a "you are
here" marker, or decoration near a control — on a site whose argument is that
violet means the engine refused something, a violet badge is a credibility
hazard. Teal means **verified** and may never appear on a hover, focus ring or
button fill, because a control asserts no evidence.

**Type:** dark, editorial, high contrast. Display headings run large — the page
title tier is ~83px at 1440. Body text never below 12px. All body text must
reach 4.5:1 against **what is actually behind it**, including gradient panels.

**Motion:** arrival on scroll, nothing looping in the reader's periphery.
Everything must be inert under `@media (prefers-reduced-motion: reduce)`.

## 3. THE ONLY NUMBERS YOU MAY PUBLISH

These are statutory facts with citations. Use them verbatim, with the citation
visible or one interaction away. Do not round, restyle or extrapolate them.

| Figure | Label | Citation |
|---|---|---|
| **10%** | minimum social value weighting | PPN 002, published 13 February 2025, mandatory 1 October 2025 |
| **£5m** | contract value threshold | Procurement Act 2023, s.52 |
| **3** | KPIs published before signing | Procurement Act 2023, s.52, in force 24 February 2025 |
| **12** | months between published assessments | Procurement Act 2023, s.71, in force 1 January 2026 |

PPN 002's threshold is **always 10%**. Never 5%.

## 4. REAL ASSETS — the only images you may reference

Drawn product artefacts live at `/Assets/product-shots/`. Each has `.avif`,
`.webp` and `.png`. Reference them in a `<picture>` with the AVIF first. Real
filenames include:

```
/Assets/product-shots/app-mark-ppn002.avif   (+ .webp .png)
/Assets/product-shots/app-cash-dashboard.avif
/Assets/product-shots/app-cash-analytics.avif
/Assets/product-shots/app-cash-collections.avif
/Assets/product-shots/app-cash-invoices.avif
```

If you are unsure a path exists, **draw the artefact in inline SVG instead**.
An invented `src` is worse than no image. Every `<img>` needs `alt`, `width` and
`height`.

## 5. WHAT THE PAGE MUST ARGUE

CrowAgent finds UK tenders, drafts answers **cited** to the regulations, the
tender document and the supplier's own past bids, and evidences delivery after
award. The product's distinguishing behaviour is that **it refuses to state a
figure it cannot trace** — that refusal is the sales argument, not a caveat.

Sections, in this order:

1. **Hero** — the positioning line, one primary CTA ("Book a demo"), one
   secondary. Access is by request; there is **no free trial and no free plan**,
   so never offer one.
2. **The four numbers** — §3, as a band, each with its citation.
3. **Both sides** — suppliers answering, buyers evaluating. Equal weight.
4. **The refusal** — the centrepiece. Show the engine tracing three figures and
   **refusing a fourth**, with the refused one in `--c-verified`'s opposite,
   `--c-refused`. This is the moment the page earns trust.
5. **Evidence sources** — it reads evidence where it already lives. Name the
   integrations in text; do not draw third-party logos, they are unlicensed.
6. **Close** — "See it on your own tender", CTA to book a demo.

## 6. OUTPUT

One file, `homepage-concept.html`. Inline `<style>`, inline `<svg>`, system font
stack (`ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`).
Responsive and free of horizontal scroll at **320px**, 390, 834 and 1440.
Semantic landmarks, one `<h1>`, no skipped heading levels, visible focus rings,
and every interactive target at least 24×24 CSS pixels.

**Do not modify, read from, or write to any existing project file.** This is a
standalone concept file for review.

## 7. SELF-CHECK BEFORE YOU ANSWER

State your answer to each, honestly:

1. Does the page claim a win rate, success rate or accuracy figure anywhere? It
   must not.
2. Is every number on the page one of the four in §3, with its citation?
3. Does every `src` point at a path given in §4, or is the graphic inline SVG?
4. Does the file make **zero** external network requests?
5. Is violet used for anything other than "refused"? Is teal used on any control?
6. Is any body text under 12px, or under 4.5:1 against what is truly behind it?
7. Does it scroll horizontally at 320px?
8. Any em-dashes or American spellings in visible copy?

If the answer to any of these is wrong, fix it before you reply.
