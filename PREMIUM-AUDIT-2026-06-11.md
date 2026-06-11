# PREMIUM-AUDIT-2026-06-11 — R2.2 top-1% premium pass (crowagent.ai marketing site)

Benchmark: Linear / Stripe / Vercel / Ramp marketing patterns. Pages audited: index.html,
pricing.html, crowmark.html, crowcyber.html, crowcash.html, crowagent-core.html, crowesg.html,
plus the live CSS stack.

## Critical discovery (read before any future CSS work)

**`styles.css` (1.2MB) and `styles.min.css` (262KB) are referenced by ZERO HTML pages.**
Verified by grep across all root, blog, tools and glossary HTML: no page links either file.
The live CSS stack is `/Assets/css/sovereign-core-v2.compiled.css` + the sovereign set
(`premium-transformation-2026-05-27.css`, `nav-global-fix-2026-05-27.css`,
`premium-gloss-2026-05-31.css`, `ultra-premium-*.css`) + `/crowagent-brand-tokens.css`.
The CLAUDE.md rule "all CSS changes in BOTH styles.css AND styles.min.css" is stale; CSS-only
edits to those two files are no-ops in production. Both files are cleanup-audit candidates.
For this pass, real fixes land in the live files; the radius-token normalisation is mirrored
into styles.css + styles.min.css to keep them consistent if ever re-linked.

`/Assets/*` is served `max-age=31536000, immutable` (_headers), so any edited Asset CSS file
requires a `?v=` bump on every referencing page (64 pages reference
premium-transformation-2026-05-27.css).

## Gap ledger (ranked)

| # | Gap | Evidence | Premium standard | Action |
|---|-----|----------|------------------|--------|
| 1 | Card system slop: every `.ca-card`/`.sv-block` site-wide gets `border-radius:20px !important`, a heavy resting drop shadow (`0 10px 30px -10px rgba(0,0,0,.5)` + inset ring) AND `backdrop-filter:blur(16px)`, hover adds `scale(1.01)` | Assets/css/premium-transformation-2026-05-27.css:248-267 | Linear/Stripe: 6-8px radii, hairline 1px borders on resting cards, shadow reserved for overlays; hover = border highlight + 2px lift, never scale | FIX (F1) |
| 2 | Off-grid control radii: `.sv-btn` 12px, newsletter card 16px, share buttons 10px, device frames 24-32px, carousel context bar `rounded-2xl` (16px) | premium-transformation:285,199,503,614; markup `rounded-[32px]`/`rounded-2xl` on index + 4 product pages | Two-step radius scale: 8px controls/cards, 12px device-frame exception only | FIX (F2) |
| 3 | Structured-data integrity: all 5 product pages ship JSON-LD `"price":"29"` while pages/pricing say From £99 (Mark), £99 (Cyber), £79 (Cash), £149 (Core); CrowESG is an unreleased Q3 2026 waitlist product yet advertises a £29 offer | crowmark/crowcyber/crowcash/crowagent-core/crowesg.html JSON-LD vs pricing.html panels | Stripe-grade sites never ship contradictory machine-readable pricing (also a Google rich-result trust risk) | FIX (F3) |
| 4 | crowmark.html ends with a duplicate `</body></html>` pair (invalid HTML); product FAQ contradicts the page: FAQ says CrowMark does "not draft bid responses directly" while the hero/features sell "AI-drafted narratives" / "Bid Narrative AI" | crowmark.html:428-433, 415-417 vs 76-80, 277-278 | Copy coherence: one claim per capability, no self-contradiction; valid markup | FIX (F4) |
| 5 | Em-dash in user-facing carousel caption | crowcyber.html:117 `data-caption="... readiness — 86% ..."` (rendered in the context bar) | House rule: no em-dashes in user-facing text | FIX (F5) |
| 6 | Final-CTA mega-pills: `px-20 py-10 rounded-full text-3xl hover:scale-110 shadow-2xl` giant buttons on 4 product pages, inconsistent with the canonical `sv-btn` primitive used by every hero; index final CTA keeps `hover:scale-110`/`hover:scale-105` utilities that still fire | crowmark.html:397, crowcyber.html:465, crowcash.html:425, crowagent-core.html:424, index.html:964-965 | One CTA primitive everywhere; hover = lift/colour, never 110% scale | FIX (F6) |

## Noted but NOT actioned (out of scope for this pass, with reason)

- Heading scale: markup carries `text-6xl md:text-8xl ... leading-[0.8]` but
  nav-global-fix-2026-05-27.css:1228-1268 already caps ALL `text-5xl..text-huge` h2s to the
  canonical clamp(1.9rem..2.75rem)/1.15 site-wide (layered, !important). Runtime type scale is
  already coherent; rewriting markup classes would be churn with no pixel change.
- index.html hero: owner-locked permanent rebuild (2026-05-31). Untouched per repo CLAUDE.md
  ("Task 1.3 hero redesign skipped. Do NOT attempt").
- AI-word scan: zero hits for revolutionize/seamless/harness/unleash/cutting-edge/game-changing
  (and supercharge/effortless/empower variants) across root pages. Nothing to fix.
- Em-dashes in index/privacy/security/terms/partners are inside CSS/JS comments, not
  user-facing text; left as-is.
- `ca-section-light * { color: var(--bg) !important }` nuclear overrides: load-bearing
  (white-on-white fix LM-041); do not refactor in a polish pass.

## Fixes executed (see report for file:line)

F1 Card de-slop. F2 Radius rhythm 8px (12px device frames) + `?v=20260611a` cache bump on all
64 referencing pages. F3 JSON-LD price corrections (99/99/79/149, ESG offer removed).
F4 crowmark duplicate close tags + FAQ contradiction. F5 caption em-dash. F6 final-CTA
normalisation to the sv-btn primitive.
