# Comprehensive Backlog — Every User-Reported Issue Re-tracked
**Date:** 2026-05-23
**Source:** All user messages from this session
**Rule:** Pixel-verify EACH item myself, no agent trust.

## P0 — User insists still seeing these (re-verify + fix definitively)

### B-001: Chatbot + Back-to-top on SAME side (user reports overlap)
- User repeatedly: "back to top must be in right side", "chatbot and back to the top are appearing same side and overlapping"
- Last probe: btt bottom=165, chat bottom=85, both right=24 (stacked vertical)
- **Action:** Re-verify visually with scroll-triggered screenshot at multiple viewports. Confirm there's no animation glitch or floating position bug.

### B-002: Light mode polish — must look as premium as dark
- User: "do very detailed deep dive on my light color branding and fix all the issues of color as light mode also must look as premium"
- Currently I forced dark-only via `color-scheme: dark only` and `:root { --bg: dark navy !important }` overrides ALL light-mode rules
- **Action:** Build a proper light theme — off-white bg, navy text, teal accents — that's actually used when prefers-color-scheme: light. Don't just lock dark.

### B-003: Carousel screenshots enhancement — animated dashboard mockups
- User: "enhance all the carousels screenshots and created animated auto play of insight dashboard"
- Current state: static product screenshots in carousel
- **Action:** Build animated dashboard mockups using SVG/CSS for the carousel — live counters, chart animations, status changes that auto-play

### B-004: Globe icon in ALL tagline instances (not just nav + footer)
- User: "earth logo in between sustainability intelligence in footer and some other places"
- Fixed: nav + footer (`BRAND_TAGLINE_HTML` in nav-inject.js)
- **Action:** Grep all HTML files for "Sustainability•Intelligence", "Sustainability &middot; Intelligence", "SUSTAINABILITY INTELLIGENCE" — replace ALL bullet/dot separators with globe icon

### B-005: Logo "blue background" reported
- User: "logo, company name and tagline has blue background"
- Logo lockup BG is `rgba(0,0,0,0)` per probe but user sees blue
- **Action:** Visually screenshot logo at multiple viewports; if logo PNG itself has bluish tint behind chart icon, may need transparent PNG variant OR change rendering

### B-006: Cards "connected" — no spacing on various pages
- User: "so many cards are connected placed in various pages"
- **Action:** Audit all card grids for adequate gap. Default should be `gap: var(--space-4)` (16px) minimum

### B-007: Bullet point overlap with text — multiple places
- User: "so many places has bullet point overlap with text"
- Verified clean on pricing Enterprise card. May exist elsewhere.
- **Action:** Audit all `<ul>` lists across product pages, FAQ, blog posts for icon/text overlap

### B-008: Black text hard to read
- User: "various text are in black color and hard to visible like in home page and various buttons text"
- DOM probe showed 0 black-text elements but user persists
- **Action:** Take screenshots at multiple sections, look for low-contrast text. May be teal-on-teal still hiding somewhere

### B-009: Pages green/blue color inconsistency
- User: "some pages looks greenish and some blueish"
- **Action:** Visual sweep product pages — they each have unique hero photo (different colors). May need unify per-product accent

## P1 — Confirmed broken, partially addressed

### B-010: "Top section far right" on product pages
- User: "you have seen various text are in black color and hard to visible like in home page and various buttons text" + "top section is in very far righ side of page"
- May refer to hero alignment shifted right OR something specific
- **Action:** Take fold screenshot at 1440 of each product page, check H1 + content left/center/right alignment

### B-011: "Bottom product 4 screenshots are very odd aligned"
- User specifically said 4 screenshots at bottom — fixed 5-card grid earlier, but user said 4
- **Action:** Check if there's another section with 4 screenshots — possibly the walkthrough tabs (Step 1/2/3/4)

## P2 — Modern aesthetic, motion, creativity

### B-012: More animations and special effects (like Stripe.com)
- User repeated several times: "hardly see any animations like Stripe"
- Shipped: scroll-reveal, parallax, magnetic, cursor-glow, shimmer
- **Action:** Add MORE visible effects: number count-up on stats, scroll-tied scrubbing, parallax depth on multiple layers

### B-013: Responsive fixes across all viewports
- User: "do all the responsiveness fix"
- **Action:** Test at 320, 375, 390, 428, 768, 1024, 1280, 1440, 1920px

### B-014: Free tool currently EPC — change to highest-converting
- DONE — Late Payment Calculator now inline

### B-015: Revenue Trinity reorder — CrowCash/Cyber/Mark as in-force products
- DONE — Path A (Get paid & Win bids) CrowCash + CrowMark leads

## Verification approach
For each item: take screenshot myself, READ the PNG, probe DOM state, only mark fixed when visually confirmed.

## Memory rule
- No agent trust
- No false claims
- Document EVERY defect found in this file
