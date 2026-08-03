# Product screens for the carousels — drawn in Figma, not captured

Owner instruction, 2026-08-03: *"create crowmark buyers and suppliers screens with
data to use in carousel … 8 pages for buyers and 8 pages for suppliers … i dont
want to use screenshot captured from products … 4 screens must be for desktop
size, 2 screens must be tab size and 2 must be mobile size."*

Figma file `wJ9DK6ByFUN6rWe0CpCVPU`.

| Page | Node |
|---|---|
| Product — CrowMark Supplier (8) | `265:2` |
| Product — CrowMark Buyer (8) | `265:3` |

---

## Why these are drawn rather than captured

This replaces the four real screenshots the `/crowmark` showcase carousel is
currently using, and it answers OA-34 in the direction the owner chose: the site
stops shipping captures of a pre-launch product and ships purpose-drawn screens
of the same surfaces instead.

**No screen carries a "Sample data" or "illustrative" label.** That marking is a
website concern and the owner is calling it out separately in the page copy, so
putting it inside the artwork would say it twice and weaken both.

---

## The research these were built from, so nothing is invented

**Colour** comes from `crowagent-platform/packages/tokens/src/tokens.css`, the
platform's own token file, and was then **verified against pixels sampled from a
real capture** (`Assets/shots/_raw/disc-marking.png`): the dominant page colour
there is `#040E1A`, the product rail `#0A1F3A`, the raised surface `#0D2847`.
All three match the token file exactly.

| Token | Value |
|---|---|
| page / sidebar / rail | `#040E1A` · `#05172D` · `#0A1F3A` |
| raised / inset / field | `#0D2847` · `#0F2D52` · `#081B33` |
| teal (brand) | `#0CC9A8` |
| mark (CrowMark violet) | `#A78BFA` |
| text primary / secondary / muted | `#E8F0FA` · `#B8CCE0` · `#8A9DB8` |
| hairline | `#1E3A58` |
| warn / error / success | `#F59E0B` · `#EF4444` · `#22C55E` |

Recorded in Figma as the variable collection **`Product App`** so the next person
does not have to re-derive it.

**Type** is the product's own stack: Plus Jakarta Sans (display), Inter (body),
JetBrains Mono (labels and figures). Note the style-string trap — Inter is
`Semi Bold` with a space, Plus Jakarta Sans is `SemiBold` without one.

**The app shell** is reproduced from the raw capture rather than imagined: a
64px product rail with the active product accented, a 248px sidebar carrying the
CrowMark PRO badge and the WORKSPACE / CROWMARK sections, and a topbar with
breadcrumb, centred search with its `Ctrl K` hint, and avatar. At tablet the
sidebar collapses to the icon rail; at mobile it becomes a bottom tab bar.

---

## Supplier set — DONE

| # | Screen | Size | Node |
|---|---|---|---|
| 1 | Discover — live notices scored for relevance | 1440x900 | `267:2` |
| 2 | Tender questions — weightings, and the grounding boundary | 1440x900 | `273:2` |
| 3 | Bid / no-bid — fit score and its refusal | 1440x900 | `274:2` |
| 4 | Evidence tracker — coverage, commitments, s.52/s.71 | 1440x900 | `275:2` |
| 5 | Answer library | 1024x768 | `277:2` |
| 6 | Insights | 1024x768 | `277:75` |
| 7 | Opportunity detail | 390x844 | `278:2` |
| 8 | Action centre | 390x844 | `278:79` |

**Two of them put the product's own refusals on screen**, which is the whole
positioning argument shown rather than asserted: screen 2 carries the banner
stating that every figure comes from computed commitments and never from the
model and that a named human approves every answer, and screen 3 says in the
interface that the fit score *"is not a probability of award, and CrowMark does
not produce one."*

## Buyer set — TO BUILD

Same shell, same tokens, same rules. Mapped to the buyer surface the site already
describes: *you publish the requirement, we locate the evidence* · *the AI reads,
it never scores* · *one criterion, one located quote* · *four bands, no
flattering rounding*.

| # | Screen | Size |
|---|---|---|
| 1 | Requirement builder — publishing the criteria | 1440x900 |
| 2 | Response review — one criterion, one located quote | 1440x900 |
| 3 | Evaluation — four bands, moderation, no rounding | 1440x900 |
| 4 | Delivery oversight — KPI assurance across suppliers | 1440x900 |
| 5 | Supplier comparison | 1024x768 |
| 6 | Audit trail / reports | 1024x768 |
| 7 | Evaluator queue | 390x844 |
| 8 | Criterion detail | 390x844 |

---

## Traps hit, recorded so they are not hit again

- **`figma.createAutoLayout()` defaults to a WHITE fill.** Seven frames painted a
  white block over the sidebar and made two labels invisible on the first build.
  Node properties all read as correct — only a render showed it. The helper now
  clears `fills` on creation.
- **Fonts do not persist between `use_figma` calls.** Every script must load its
  own, or `set_fontName` throws on the first text node.
- **Screenshot with `contentsOnly: true`** and clear the selection first,
  otherwise canvas chrome is easy to mistake for a layout defect.

## When these land on the site

`Carousel.astro` currently renders a "Sample data" chip in the browser chrome.
When these screens replace the captures that chip comes out, because the owner is
calling out the data question separately in the page copy.
