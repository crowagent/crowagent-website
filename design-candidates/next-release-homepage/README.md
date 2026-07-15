# Homepage redesign — shortlisted candidates (next release)

**Status:** shortlisted by owner 2026-07-15, decision pending. Build the chosen direction in a FUTURE release, not R2.5.2.

Owner asked for a homepage that is **less text-heavy** and **not** the current globe / cinematic space hero, and asked to explore **colour palettes beyond teal** (the palette will carry across the marketing site AND app.crowagent.ai — buttons, links, focus states, chart series, status badges).

Three static, self-contained HTML candidates (open directly in a browser; no build step, no external assets). Each keeps deliberately short copy — one headline, one subhead, one CTA, one slim product/statute row — so the page never reads text-heavy.

| File | Direction | Palette | Layout |
|------|-----------|---------|--------|
| `c1-ledger-indigo.html` | **Ledger** | Indigo `#4F46E5` + ink `#0B1020` | Product-forward split: headline beside a clean live "compliance overview" card (readiness score, MEES / Cyber / overdue invoices / PPN 002). Shows the product value instead of an abstract graphic; palette fits the app dashboard. |
| `c3-signal-blue.html` | **Signal** | Electric blue `#2563EB` + slate `#0F172A` | Subtle dotted-grid backdrop, centred headline, five products as a bento grid. Crisp, techy, enterprise-credible. |
| `c2-meadow-green.html` | **Meadow** | Forest green `#166534` + cream `#F6F4EA` | Warm editorial: serif headline with an italic green accent, clean 5-product strip. Premium; ties to the sustainability / ESG story. |

**Dropped from the shortlist:** C4 Ember (amber on warm charcoal) and C5 Aurora (rich gradient + glass).

## Notes for the build (next release)
- Palette and layout are independent — the owner may pair any palette with any layout (e.g. indigo palette with the C3 bento layout).
- The current live hero is a dark Three.js globe + starfield (`js/modules/hero-citadel.js`, `index.html` `#hero`). Replacing it means retiring / re-scoping that module and the `#hero` CSS block.
- Production CSP is `script-src 'self'` (inline blocked) — any JS must be an external module, and colours must use `var(--*)` tokens per the website CLAUDE.md (no bare hex in shipped CSS). These candidates use inline styles for preview only; production must tokenise.
- Whichever palette is chosen, align the app's accent tokens (`packages/tokens`, `--ca-*`) so the marketing site and app.crowagent.ai match.

_These are preview mockups, not production code. No live site or app has changed._
