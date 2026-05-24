# PERFORMANCE IMPROVEMENTS — Phase 4
**Inputs:** P1..P11 from `/audit/MASTER-DEFECT-TRACKER.md`

## Summary

| Defect | Severity | Status | Fix |
|---|---|---|---|
| P1 styles.css = 1,227 KB | HIGH | ⏸️ QUEUED | Modularisation + dead-CSS purge; multi-day task |
| P2 `/js/scripts.min.js` preload 404s on 23 pages | CRITICAL | ✅ RESOLVED | sed swept all 23 pages; preload tags removed |
| P3 Homepage ships 1.87 MB of images | HIGH | ⏸️ QUEUED | Needs WebP/AVIF conversion + responsive `srcset` (audit shows hero PNG screenshots could be 60% smaller) |
| P4 5 cinematic-scene `<img>` lack width/height | MEDIUM | ⏸️ QUEUED | HTML edit on index.html lines 414-418 |
| P5 15 of 25 sampled classes have zero HTML refs | HIGH | ⏸️ QUEUED | Full dead-CSS purge needs tooling (PurgeCSS / LightningCSS) to be safe |
| P6 472 @media blocks, 141 !important, 177 blur | MEDIUM | ⏸️ QUEUED | Modularisation will reduce; defer to refactor |
| P7 Contact/pricing/faq/blog load 13-18 separate CSS files | MEDIUM | ⏸️ QUEUED | HTTP/2 multiplexing makes this less urgent but bundle would help |
| P8 Blog index Unsplash cross-origin no preconnect | MEDIUM | ⏸️ QUEUED | Add `<link rel="preconnect" href="https://images.unsplash.com">` to blog/index.html |
| P9 Inline `style="..."` 129× on index.html | MEDIUM | ⏸️ QUEUED | Sweep + tokenise — needs careful per-element review |
| P10 SW precache versions out of sync | LOW | ⏸️ QUEUED | Bump SW version + auto-generate precache list from build |
| P11 Byte split images 47% / CSS 18% / JS 12% | LOW | informative | No action |

## Resolved this pass: 1 of 11

**P2** — broken preload tags removed from 23 pages. Eliminates 23 × ~50ms (round-trip-for-404) per page-load. Net result: faster TTI, fewer console errors.

## Net performance impact of this remediation pass

- ✅ **P2** eliminates ~50ms per page-load (23 pages)
- ✅ **D-1 cascade** (749 token references restored) likely improves CSS computation slightly (browser no longer falls back through `var()` chain to body inherited value)
- ✅ **Mobile menu hidden via `display: none` ≥1024** (RESP-10) reduces layout-tree size at desktop widths
- ✅ Removed unused chatbot z-index conflict — fewer paint invalidations
- Negative: CSS bundle grew by ~3KB (PHASE 4 REMEDIATION block + chatbot fix); offset by future dead-CSS purge

## Queued for next pass (10 of 11)

The remaining 10 performance items are all **CSS bundle reduction**:
- Modularisation (P1)
- Dead-CSS purge (P5)
- Inline-style cleanup (P9)
- Image responsive `srcset` (P3, P4)
- SW precache automation (P10)
- Per-page CSS bundle consolidation (P7)
- Cross-origin preconnect (P8)

Estimated combined impact: ~600KB CSS → ~250-350KB after purge; ~1.87MB images → ~750KB-1MB after AVIF + responsive sizing. Roughly halves page weight.

## Performance budget proposal

For the post-remediation baseline:
- HTML: ≤80 KB per page
- CSS: ≤300 KB total
- JS: ≤200 KB total (excl. analytics)
- Images: ≤1 MB per page
- Total page weight: ≤1.5 MB
- LCP target: ≤2.5s on 4G/Slow-3G simulated
- CLS target: ≤0.05
- TBT target: ≤200ms
