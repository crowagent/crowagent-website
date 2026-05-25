# CrowAgent Website — Open Issues Ledger (live)

Rule: nothing is marked `FIXED` until verified visually (Playwright + read PNG) or by
measurement. Unverified work stays `OPEN`/`IN-PROGRESS`. Anything unclear → log as `OPEN`.

State: `OPEN` · `IN-PROGRESS` · `FIXED` (verified) · `WONTFIX` (with reason)

## Batch — CTO report 2026-05-25 (round: pricing/tools/home)
| ID | Issue | Page | State | Note |
|---|---|---|---|---|
| O-1 | "Built for UK SMEs across these sectors" still left-aligned | index (sectors) | OPEN | should align/centre |
| O-2 | Breadcrumb shows "Home /// Free Tools /// tool name" (triple slash) | tools/* | OPEN | separator duplicated |
| O-3 | Breadcrumb position not aligned like product pages | tools/* | OPEN | |
| O-4 | Missing central top "Back to all free tools" link (product pages have it) | tools/* | OPEN | |
| O-5 | Pricing monthly/yearly toggle — verify it works + looks correct | pricing | OPEN | |
| O-6 | "Start Pro trial" button is black, should be white like the others | pricing | OPEN | |
| O-7 | Compare-plans table has duplicate ticks and dashes | pricing | OPEN | |
| O-8 | Pricing page mobile responsiveness issues (multiple) | pricing | OPEN | identify all |

## Batch — CTO report 2026-05-25 (round 2: privacy/security/pricing detail)
| ID | Issue | Page | State | Note |
|---|---|---|---|---|
| O-1 | Marquee heading "Built for UK SMEs across these sectors" left-aligned | index | FIXED | max-width:100%+centre, verified left≈right |
| O-2 | Breadcrumb "Home /// Free Tools /// tool" (triple slash) | tools/* | FIXED | literal seps hidden, single CSS sep, verified |
| O-3 | Breadcrumb position align like products | tools/* | FIXED | commit 51d2a95; verified PNG: "Home / Free Tools / Late Payment Calculator" centred single-slash, matches product pages |
| O-4 | Missing central "Back to all free tools" link | tools/* | FIXED | commit 51d2a95; verified PNG: "← Back to all free tools" centred above breadcrumb |
| O-5 | Pricing monthly/yearly toggle — verify | pricing | FIXED | toggle renders + functions (Save 10% badge) |
| O-9 | Duplicate "Most Popular" badge on Pro card | pricing | FIXED | hid .ca-popular-badge, verified 0 visible dups |
| O-10 | Pro CTA black/invisible (transparent bg + dark text) | pricing | FIXED | forced teal bg + dark text, verified rgb(9,126,111) |
| O-11 | Compare-plans table DOUBLE ticks (✓✓) / dashes | pricing | FIXED | killed pseudo glyphs, verified ::before none |
| O-12 | Privacy hero/top LEFT-aligned; centre like others | privacy | FIXED | flex-centred .priv-wrap, verified left≈right |
| O-13 | Statement/bullet overlap (Gemini DPA, Sentry, many) | privacy | OPEN | NOT reproduced at 1280 or 390 — need CTO viewport/zoom |
| O-14 | Uneven spacing between sections | privacy | OPEN | NOT clearly reproduced — need CTO viewport |
| O-15 | "AES-256 encryption" section issue | security | OPEN→likely-fixed | cards render clean after box-sizing fix; confirm exact issue |

## Batch — CTO report 2026-05-25 (round 3: contact/partners/faq/global)
| ID | Issue | Page | State | Note |
|---|---|---|---|---|
| O-16 | Partner form consent broken (checkbox floated centre, text squished right column) | partners | FIXED | forced full-width flex row, verified checkbox+text same row |
| O-17 | "Become a partner" button black/invisible | partners | FIXED | added sv-btn--primary (both), verified teal bg |
| O-20 | GLOBAL hero centring: heroes left-aligned across many pages | all info pages | PARTIAL | global rule centres security/about/roadmap/changelog/contact/glossary (verified); faq/terms/cookies still left (nested .sh / TOC-beside-hero structures — need structural pass) |
| O-21 | partners form "Partner type" select shows overlapping label text | partners | FIXED | commit 0e1fb34; verified PNG: "PARTNER TYPE *" label above "Select…", no overlap |
| O-18 | text "Response within 3 to 5 business days · Founded in the UK · No outsourced support" hidden behind reach cards | contact | FIXED | ROOT CAUSE: `.sf20-reach__grid .sf20-panel{height:100%}` (transform-company-2026-05-25.css) over-computed vs the indefinite grid row (464px vs 406px track), overflowing the grid bottom by 58px so the `.sf20-footnote` (positioned off grid-bottom) rode up behind the panels. Removed the redundant height:100% (grid `align-items:stretch` already equalises). Verified 0 overlaps + PNG at 1280/1024/768/390. CTO had mislabelled it "Office/Company cards"; measured culprit was the reach footnote. |
| O-22 | contact reach cards rendered with full inline-link underline (whole card is an `<a>`) | contact | FIXED | NEW (found pixel-verifying O-18). Global `.section-padding a:not(...)` (styles.css:1164) :not()-chain specificity overrode base `.sf20-panel{text-decoration:none}`. Added `:not(.sf20-panel)` to base+hover in styles.css + styles.min.css. Verified computed `none` + PNG. |
| O-19 | Full page needs revisit: card sizes + multiple overlaps | about | OPEN→not-reproduced | overlap probe CLEAN at 1280/1024/768/390. Re-checking card-size unevenness next; may be CTO-viewport-specific |

## Verified-FIXED earlier this session (for traceability)
- O-1 marquee heading centred (transform-home margin-inline:auto) — FIXED (verify visually)
- O-2 tool breadcrumb "///" → single "/" (hide literal seps) — FIXED (sep display:none confirmed)
- Security "Operational standards" ALL-CAPS heading → sentence case (8643818) — FIXED
- Nav Products/Tools dropdown vertical on laptop + reorder + desc wrap (0bcfed4) — FIXED
- Product carousels mismatched → animated message-matched showcases ×6 + homepage (0bcfed4) — FIXED
- Empty zero-state hero screenshot removed from 6 product pages (0bcfed4) — FIXED
- Card overlap + clipped "View full pricing" button (box-sizing:border-box engine root fix, 0bcfed4) — FIXED (related grids 0 overlaps all 6 product pages; pricing button visible)
- products/ & tools/ hero left-aligned → centred (2c079a4) — FIXED
