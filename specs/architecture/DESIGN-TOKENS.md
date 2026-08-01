# Design Tokens — crowagent-website (Astro rebuild)

**Status:** living document, single source of truth for every visual value on the
site. **Source file:** `astro/src/styles/tokens.css` — the ONLY token source. No other
file in `astro/src/` may declare a custom property that is a design value (colour,
size, spacing, motion, elevation); component `<style>` blocks consume tokens via
`var()`, they do not invent new ones.

**Rule: a value not in this file is a defect, not a decision** (`tokens.css:61`). If a
component's `<style>` block contains a hardcoded hex, px or duration that is not
already one of the 51 tokens below, that is a bug to fix by either using the matching
existing token or, if genuinely new, adding it here first.

There are **51 tokens** declared in `:root` (`astro/src/styles/tokens.css:70-176`),
plus 3 of those redeclared with different values inside a
`@media (prefers-reduced-motion: reduce)` block (§10). Counted directly:

```js
// node -e "<this>", run from the repo root
const fs = require('fs');
const css = fs.readFileSync('astro/src/styles/tokens.css', 'utf8');
console.log([...css.matchAll(/^\s*(--[a-z0-9-]+):/gm)].length); // -> 54 (51 unique + 3 reduced-motion overrides)
```

---

## 1. Naming convention

| Prefix | Category | Example |
|---|---|---|
| `--t-` | Type scale: size (`--t-h1`…`--t-micro`) and weight (`--t-w-h1`…`--t-w-h3`) | `--t-h2` |
| `--radius-` | Border-radius scale | `--radius-card` |
| `--btn-` | Control (button) dimensions | `--btn-h-sm` |
| `--sec-`, `--blk-`, `--stack-` | Vertical rhythm scale, keyed to the structural unit each governs: `sec-` = whole section, `blk-` = a block inside one (card, cell), `stack-` = the gap between two adjacent lines/elements | `--sec-pad-y`, `--blk-pad`, `--stack-2` |
| `--c-` | Colour, further grouped by comment block into surface / brand / text | `--c-teal`, `--c-bg`, `--c-text-sub` |
| `--font-` | Font-family stacks | `--font-display` |
| `--ease`, `--dur` | Motion: one easing curve, three durations | `--dur-fast` |
| `--shadow-`, `--blur-` | Elevation (the glass recipe) | `--shadow-card`, `--blur-glass` |

Every token name states what it is for, not what it looks like — `--radius-card` not
`--radius-20`, `--c-text-muted` not `--c-grey`. This is a deliberate difference from
the legacy `crowagent-brand-tokens.css`, whose back half is a long tail of ~50 tokens
named after their own hex value (`--ca-c-2ee6c4:#2ee6c4`, etc. —
`migration/CSS-AUDIT.md` §5), which record a colour a component happened to hardcode
rather than a semantic decision. None of that tail was carried into this file.

---

## 2. Type scale

| Token | Value | Rendered range | Purpose |
|---|---|---|---|
| `--t-h1` | `clamp(2.6rem, 6.2vw, 5.2rem)` | 41.6–83.2px | The hero, and nothing else |
| `--t-h2` | `clamp(1.9rem, 3.5vw, 2.9rem)` | 30.4–46.4px | Every section heading |
| `--t-h3` | `clamp(1.5rem, 2.3vw, 2.05rem)` | 24–32.8px | A heading inside a section |
| `--t-h4` | `clamp(1.0625rem, 1.35vw, 1.28rem)` | 17–20.48px | A heading inside a card |
| `--t-lede` | `1.02rem` | 16.32px, fixed | Lead paragraph under a heading |
| `--t-body` | `0.9375rem` | 15px, fixed | Body copy |
| `--t-micro` | `11.5px` | 11.5px, fixed | Eyebrow labels, badges, meta text |
| `--t-w-h1` | `800` | — | H1 weight |
| `--t-w-h2` | `700` | — | H2 weight |
| `--t-w-h3` | `700` | — | H3 weight (H4 weight is set per-component, typically `700`–`800`; no dedicated token) |

Before this scale existed the homepage carried five different H2 sizes (56px,
46.4px ×4, 43.2px, 41.6px and 60.8px at 1440px viewport width) and two weights,
because every section sized its own heading (`tokens.css:72-75`). Roughly a 1.25×
step between tiers at the top of each clamp.

**Do not confuse this with the legacy inner-page scale.** `migration/SPACING-AUDIT.md`
§2 measured 5 distinct H1 rules and 13 distinct H2 rules in active use across 19
legacy inner pages, none matching each other or this token set — including one
confirmed hierarchy inversion (`security.html`'s own H2 rendering smaller than a
plain H3 elsewhere on the site). None of that is carried into `astro/src`; this table
is the only H1–H4 scale that exists there.

---

## 3. Radius

| Token | Value | Purpose |
|---|---|---|
| `--radius-card` | `20px` | Cards |
| `--radius-panel` | `16px` | Panels, dropdowns, blockquotes, code blocks |
| `--radius-chip` | `10px` | Chips, small icon containers |
| `--radius-pill` | `100px` | Pill buttons and badges |

The homepage previously rendered cards at 28, 26, 24, 20, 16, 14, 12 and 10px, none
from a shared token (`tokens.css:89-92`). One scale replaces all of them.

### 3.1 The two resolved duplications

Two duplications existed inside the homepage's own original token block
(`homepage-claude-v1.html`) and were resolved in favour of the single scale above
rather than carried forward as two names:

| Legacy pair | Values | Resolution |
|---|---|---|
| `--r-card` and `--nt-radius-lg` | both `20px` | Collapsed to `--radius-card: 20px` |
| `--r-pill` and `--nt-radius-pill` | `100px` and `999px` | Collapsed to `--radius-pill: 100px` — both clamp to the same rendered shape on any real control, and one number is better than two that pretend to differ (`tokens.css:57-59`) |

Legacy scope for comparison, not carried forward: `migration/SPACING-AUDIT.md` §4.1
found at least four separate radius token scales simultaneously live across the 19
inner legacy pages (13+ distinct non-pill radii, plus three different pill encodings —
`100px`, `999px`, `9999px`), with `.ca-card` hardcoded to `48px` — more than double
`--radius-card`.

---

## 4. Controls (buttons)

| Token | Value | Purpose |
|---|---|---|
| `--btn-h` | `54px` | Primary control height |
| `--btn-h-sm` | `44px` | Secondary control height — also the WCAG 2.2 minimum target size, so this is the smallest a control may ever be (`tokens.css:103-106`) |
| `--btn-fs` | `15px` | Control label font size |
| `--btn-fw` | `600` | Control label font weight |

Legacy comparison: buttons were rendering at 54px and 44px with three font sizes and
three weights between them before this token set existed. `migration/SPACING-AUDIT.md`
§4.2 separately found at minimum 5 distinct legacy `.sv-btn` height/font/weight
combinations (12–16.96px, weight 800–900, always uppercase), none matching `--btn-fs`
(15px) or `--btn-fw` (600) — the legacy inner pages render every CTA in shouting case
at black/extra-bold weight; this token set does not.

---

## 5. Vertical rhythm (spacing)

Keyed to `vh`, not `vw`, deliberately: a section's height is a vertical problem, and a
`vw` clamp hands a 768px laptop exactly the padding it hands a 1080px screen, which is
what pushed every legacy section past the fold (`tokens.css:109-111`). Deliberately
generous — an earlier pass tuned these down until every section fit one screen, which
produced 49.5px of section padding at 1440×900 and read as squeezed. A section is
allowed to run a little past the fold. Each step is roughly 1.4× the one below it.

| Token | Value | Rendered range | Purpose |
|---|---|---|---|
| `--sec-pad-y` | `clamp(64px, 8vh, 128px)` | 64–128px | Top and bottom of every section |
| `--sec-gap` | `clamp(36px, 4.5vh, 64px)` | 36–64px | Head block down to the content |
| `--sec-media` | `clamp(240px, 32vh, 420px)` | 240–420px | Any large media block or stage |
| `--sec-band` | `clamp(100px, 13vh, 176px)` | 100–176px | Decorative band closing a section |
| `--blk-pad` | `clamp(22px, 3vh, 36px)` | 22–36px | Padding inside a card or cell |
| `--stack-2` | `clamp(16px, 2vh, 24px)` | 16–24px | Normal gap between stacked lines |
| `--stack-1` | `clamp(10px, 1.3vh, 15px)` | 10–15px | Tight gap between stacked lines |

Legacy comparison: `migration/SPACING-AUDIT.md` §1.2 found **at least 17 distinct
section-padding values** in active use across 19 legacy inner pages (five different
mechanisms: flat Tailwind `py-*` utilities, a `.ca-hero`-specific override chain, three
different page-scoped inline "band" systems, one CSS file silently overriding a
page's own markup, and one page-family with no padding source at all), against a
single `--sec-pad-y` here applied uniformly.

---

## 6. Surface

| Token | Value | Purpose |
|---|---|---|
| `--c-bg` | `#05070E` | Page background |
| `--c-panel` | `#0C1020` | Panel/band background (nav dropdown, CTA bands, footer) |
| `--c-card` | `rgba(12, 16, 32, 0.55)` | Card background — translucent so the drift/glow behind it shows through |
| `--c-card-hover` | `rgba(18, 23, 52, 0.72)` | Card hover state |
| `--c-border` | `rgba(160, 180, 228, 0.18)` | Hairline borders — `.18` not `.12`: the hairlines that structure every section have to be visible on a near-black page rather than implied (`tokens.css:130-132`) |
| `--c-border-glow` | `rgba(45, 212, 191, 0.38)` | Accent border/glow (hero radial, focus rings, blockquote rule) |

**Legacy note, load-bearing.** `migration/CSS-AUDIT.md` §4 found that
`crowagent-brand-tokens.css`'s nominal `:root` values for background/surface/border do
**not** match what actually renders on any legacy page — `ultra-premium-responsive.css`'s
unconditional `:root[data-theme=dark]` override wins the cascade everywhere, and it is
*that* file's values (`--bg:#05070E`, `--surf:#0C1020`) which agree with this token
set, not `crowagent-brand-tokens.css`'s plain `:root` (`--bg:#040E1A`,
`--surf:#0A1F3A`). This tokens.css file was seeded from what actually renders, not
from the file that claims to be canonical.

---

## 7. Brand

| Token | Value | Purpose |
|---|---|---|
| `--c-teal` | `#2DD4BF` | Primary brand colour |
| `--c-teal-dark` | `#0CC9A8` | Teal hover/active state |
| `--c-teal-glow` | `rgba(45, 212, 191, 0.45)` | Teal radial glow (hero backgrounds) |
| `--c-cyan` | `#22D3EE` | Secondary accent (footer hairline, sector step accent) |
| `--c-violet` | `#A78BFA` | Tertiary accent (sector step accent, CrowMark's mega-nav column colour) |
| `--c-violet-deep` | `#7C3AED` | Deeper violet, reserved for gradient stops |
| `--c-orchid` | `#C77DFF` | Fourth ramp stop |

The ramp turns one way: 172° teal → 199° cyan → 255° violet → 283° orchid.
`--c-orchid` replaced an earlier `#F472B6`, in which red was the dominant channel, so
the last stop read pink against a teal-and-violet identity; here blue dominates, so it
reads orchid (`tokens.css:136-139`). Measured **7.33:1** contrast for `--c-teal` on
`--c-bg`.

---

## 8. Text

| Token | Value | Measured contrast on `--c-bg` | Purpose |
|---|---|---|---|
| `--c-text` | `#FFFFFF` | 20.6:1 (pure white on `#05070E`, not independently re-measured here — treat as not verified beyond the arithmetic sRGB ratio) | Primary text, headings |
| `--c-text-sub` | `#D2DBEE` | **14.48:1** (stated in `tokens.css:149`) | Secondary/body text inside cards and prose |
| `--c-text-muted` | `#A9B6D2` | **9.88:1** (stated in `tokens.css:149`) | Tertiary/meta text (timestamps, captions, labels) |

Both `--c-text-sub` and `--c-text-muted` were dimmer previously and were brightened
for legibility. **Neither may be darkened again without re-measuring** — this is a
binding rule stated in the token file itself (`tokens.css:150-151`), not a suggestion.
`--c-text`'s 20.6:1 figure above is arithmetic (pure white on `#05070E`), not
independently re-measured against a calibrated contrast tool as part of this audit —
treat it as not verified in the same sense the other two are.

---

## 9. Fonts

| Token | Value | Purpose |
|---|---|---|
| `--font-display` | `'Plus Jakarta Sans', system-ui, -apple-system, sans-serif` | Headings, eyebrows, buttons |
| `--font-body` | `'Inter', system-ui, -apple-system, sans-serif` | Body copy |
| `--font-mono` | `'JetBrains Mono', ui-monospace, monospace` | Code blocks |

These three family stacks are the one part of the legacy token systems that already
agreed before the rebuild — `migration/CSS-AUDIT.md` §4's mapping table found
`crowagent-brand-tokens.css` and the homepage's inline system matched exactly on all
three, and they were adopted as-is.

---

## 10. Motion

| Token | Value | Purpose |
|---|---|---|
| `--ease` | `cubic-bezier(0.16, 1, 0.3, 1)` | The one easing curve for the whole site |
| `--dur-fast` | `0.18s` | Micro-interactions (hover states, chevrons) |
| `--dur` | `0.3s` | Standard transitions |
| `--dur-slow` | `0.6s` | Larger/entrance transitions |

Anything that needs a different curve needs a reason recorded next to it
(`tokens.css:162-163`) — there is no second easing token today, and none of the 8
`.astro` files in `astro/src` declare one.

**Reduced-motion override** (`tokens.css:182-188`), the one place this file
deliberately breaks its own "no `!important`" rule's *spirit* without breaking its
letter — it overrides the token value, not the rule, inside
`@media (prefers-reduced-motion: reduce)`:

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --dur-fast: 0.01ms;
    --dur:      0.01ms;
    --dur-slow: 0.01ms;
  }
}
```

Every motion primitive resolves to its final state instead of being disabled, because
an element that never animates and never arrives is invisible content, which is worse
than an animation somebody did not want (`tokens.css:178-181`). See
`MOTION-AND-INTERACTION.md` for the full rule set this token pairs with.

---

## 11. Elevation

| Token | Value | Purpose |
|---|---|---|
| `--shadow-card` | `inset 0 1px 0 rgba(255,255,255,0.07), 0 20px 50px rgba(2,4,10,0.45)` | Card elevation |
| `--shadow-panel` | `inset 0 1px 0 rgba(255,255,255,0.07), 0 24px 60px rgba(2,4,10,0.45)` | Panel/dropdown elevation (larger blur/spread than card) |
| `--blur-glass` | `blur(22px) saturate(150%)` | Backdrop-filter recipe for glass surfaces (nav) |

One glass recipe, as three variables rather than repeated per component. The inset
hairline (`inset 0 1px 0 rgba(255,255,255,0.07)`, shared by both shadow tokens) is what
makes a card read as a lit surface rather than a flat rectangle (`tokens.css:170-172`).

---

## 12. Full token count by category

| Category | Count |
|---|---:|
| Type scale | 10 |
| Radius | 4 |
| Controls | 4 |
| Vertical rhythm | 7 |
| Surface | 6 |
| Brand | 7 |
| Text | 3 |
| Fonts | 3 |
| Motion | 4 |
| Elevation | 3 |
| **Total unique tokens** | **51** |
| Reduced-motion overrides (redeclare 3 of the above with a different value) | 3 |
| **Total declarations in the file** | **54** |

---

## 13. The rule, restated

A value not in this file is a defect, not a decision. Before adding a hardcoded hex,
px or duration inside any component `<style>` block in `astro/src`, check this table
first. If the value genuinely does not exist yet, add it here — with a category, a
purpose comment, and (for colour) a measured contrast ratio if it will sit on
`--c-bg` — before using it anywhere else.
