# Homepage Stripe-Grade Polish — Honest Tracker
**Owner:** Claude (working myself — no agent delegation)
**Updated:** 2026-05-23
**Rule:** Every fix pixel-verified via Playwright + Read PNG. NEVER trust agent reports.

## Reference target
Stripe.com homepage qualities:
- Calm focused hero with concrete value prop
- 6-8 sections max (Stripe has ~7)
- Card grids (3-col desktop, 1-col mobile)
- Premium 8px spacing rhythm
- Total height ~6,000-7,000px
- Footer 4-5 column grid with proper spacing

## Current state (honest)
- **Homepage desktop height: 17,989px** (was 17,920, target ~10-12k for now)
- **Sections: 17** (target 8-10)
- **All sections now dark navy** ✓ (light-mode leak FIXED this session)
- **Footer 5-col grid** ✓ (was working — my earlier probe was wrong)
- **Stats 3×2 grid** ✓ (was single column, FIXED this session)
- **Path cards 3-col** ✓ (was bulleted lists, FIXED this session)
- **Frameworks 3×2 grid** ✓ (was working)
- **Brand globe icon separator** ✓ (FIXED previous turn)
- **Privacy/terms/security CTAs visible** ✓ (FIXED earlier this turn)
- **Announce bar CTA visible** ✓ (FIXED earlier this turn)

## Defect ledger — pixel-verified status

| ID | Issue | Status | Verified |
|---|---|---|---|
| HG-001 | Light-mode bg leak → white on 7+ mid-page sections | ✅ FIXED | dark-lock at end of styles.css; both dark+light browsers show navy |
| HG-002 | Footer grid `template-columns: none` claimed by agent | ✅ FALSE ALARM | Actually 5-col (314+157×4); my earlier selector was wrong |
| HG-003 | Stats section stacks vertically | ✅ FIXED | 3-col now: 332×332×332; pixel-verified |
| HG-004 | Path cards (Comply/Adapt/Win) bulleted lists | ✅ FIXED | 3-col 450×450×450 premium cards; pixel-verified |
| HG-005 | Frameworks card grid verification | ✅ ALREADY WORKING | 3×2 grid (456×3), 6 framework cards; pixel-verified |
| HG-006 | Section curation 17→10 | ⏳ PARTIAL | Section padding tightened; page still 17,989px (target ~10-12k) |
| HG-007 | Mobile page 28,720px tall | ⏳ NEEDS RE-MEASURE | Not re-checked yet after fixes |
| HG-008 | Trust badges cramped/small | ⏳ PENDING | |
| HG-009 | Section eyebrows 11.5px | ⏳ PENDING | |
| HG-010 | Hero dashboard widget design | ⏳ PENDING | |
| HG-011 | Skeleton placeholder dark cards mid-page | ⏳ INVESTIGATE | Need to identify which sections |
| HG-012 | Globe separator on ALL pages | ⏳ NEEDS VERIFY | Only nav+footer of index pixel-checked |
| HG-013 | Logo "1×1px" claim | ✅ FALSE | Logo PNG renders at 44px height per spec |
| HG-014 | Stop Claude button never appears | ⏳ NEEDS RE-VERIFY | Probe showed 0 instances; visual not re-checked |
| HG-015 | Carousel 2400w stretch | ⏳ NEEDS RE-VERIFY | Agent claimed fixed |
| HG-016 | Section padding rhythm | ⏳ PARTIAL | Tightened but limited effect |
| HG-017 | Card border-radius consistency | ⏳ PENDING | |
| HG-018 | Section transitions abrupt | ⏳ PENDING | |
| HG-019 | Mobile menu/nav | ⏳ PENDING | |
| HG-020 | CTAs alignment + sizing | ⏳ PENDING | |

## Big remaining problems (honest)
1. **Sectors section 2,167px tall** — way too much content vertical space
2. **How section 1,372px tall** — too long
3. **Trust section 1,024px tall** — could be tighter
4. **Page height 17,989px** — still ~3× Stripe.com
5. **Mobile page** — needs re-measurement and aggressive optimisation

## What's working well now
- Brand identity consistent (dark navy + teal)
- All sections render dark (no light-mode leak)
- Path cards Stripe-grade
- Stats grid 3×2 Stripe-grade
- Frameworks 3×2 grid Stripe-grade
- Footer 5-col grid Stripe-grade
- Globe icon in tagline matches brand logo
- Cookie banner slim 69px
- Back-to-top button working
- All 4 internal validators GREEN
- Smoke 25/25 chromium

## Charter
1. **No agent delegation for this work**
2. **Pixel-verify every change**
3. **Probe computed styles**
4. **Grep served CSS to confirm rules in output** (PurgeCSS may drop)
5. **Document each fix here**
6. **No false claims**

## Past lessons (false claims by agents)
- BUG-004 footer missing — was actually false alarm (footer DID render, agent was right)
- BUG-011 footer 5-col — agent claim was right; my earlier probe was wrong
- BUG-029 Stop Claude — agent's MutationObserver fix may work; not pixel-verified
- BUG-013 carousel stretch — claimed 2400w; not pixel-verified
- BUG-022 ISO footnote — claimed visible; not pixel-verified
