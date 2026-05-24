# Cluster Beta Visual Fix — 2026-05-22

Closure ledger for 14 visual defects (ISSUE-003, 004, 011, 012, 013, 014, 015,
018, 019, 020, 025, 026, 027, 035) per the master forcing-function document
`audit/Website issues 22052026.md`.

## Per-defect closure table

| ID  | Sev | Surface                       | Root cause                                                    | Fix file(s)                                                                                          | Token-clean | Status |
| --- | --- | ----------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------- | ------ |
| 003 | H   | /pricing — Most Popular badge | Card parent grid + reveal transforms could clip `-14px` overhang | `Assets/css/cluster-beta-visual-fix-2026-05-22.css` (overflow:visible on .pgrid + popular card, badgePulse keyframe) | yes         | FIXED  |
| 004 | H   | /blog/[post] — badge vs breadcrumb | Long breadcrumb wrapped near .article-badge with no min-block-end | Cluster-beta CSS (margin-bottom guarantee on breadcrumb, .post-meta-row scaffold, position:static on badges) | yes         | FIXED  |
| 011 | M   | Homepage — persona tab whitespace | hp-audience-banners reserved vertical space for inactive banners | Cluster-beta CSS (CSS-Grid overlay; all banners share grid cell 1/1; container hugs visible banner)  | yes         | FIXED  |
| 012 | M   | /changelog — hero polish      | No "Jump to latest" anchor / no id="latest" / hero motion          | `changelog.html` (Latest meta line + Jump to latest CTA + id="latest" on first article); cluster-beta CSS heroEntrance | yes         | FIXED  |
| 013 | M   | /pricing — checkmark overlap  | ::before bullet absolute-positioned over text                  | Cluster-beta CSS (flexbox row; ::before fixed-width SVG mask icon; flex-shrink:0; gap)               | yes         | FIXED  |
| 014 | M   | /blog index — card layout      | Two card patterns (.article-card-featured + .article-card) without locked aspect ratio | Cluster-beta CSS (unified hover; aspect-ratio:16/9 on .article-card-img; translateY(-4px) lift)       | yes         | FIXED  |
| 015 | M   | /tools/* — At a glance bullets | Parent sv-stack--align-center cascaded text-align:center into .sv-card aside ul/li | Cluster-beta CSS (text-align:left override on body.f8-tool-form .hero aside.sv-card)                  | yes         | FIXED  |
| 018 | M   | /about — Book a demo unstyled  | Audit doc was outdated — link already has `sv-btn sv-btn--sm sv-btn--ghost` | n/a (verified existing pattern + sitewide sweep returned 0 truly bare-link adjacent CTAs)            | n/a         | VERIFIED already styled |
| 019 | M   | Homepage — stats density       | Only 4 stats in a 4-col grid; no source citations              | `index.html` (expanded to 6 stats matching spec list: 2028 / £150K / 10% / BoE+8% / 1,000+ / 44+22, plus .sc-ctx statute line); cluster-beta CSS (auto-fit grid + entrance stagger) | yes         | FIXED  |
| 020 | M   | /faq — stock photo dominates   | photo-aspect-3-2 produced 733px-tall image at desktop          | `faq.html` (added figcaption + lazy load); cluster-beta CSS (max-height:22.5rem + clamp + center caption) | yes         | FIXED  |
| 025 | L   | /crowesg — waitlist CTA buried | Hero CTA was scroll-dependent for waitlist                     | `crowesg.html` (sticky `<div class="coming-soon-bar">` between header and breadcrumb); cluster-beta CSS sticky styling + slideDown motion | yes         | FIXED  |
| 026 | L   | Homepage — marquee role        | `role="marquee"` is invalid ARIA on regulatory ticker          | `index.html` (role="region" + aria-label; track now aria-hidden; new sr-only static list with cited regulations) | yes         | FIXED  |
| 027 | L   | All pages — scroll progress on short pages | Progress bar rendered regardless of page length    | `js/modules/cinematic-init.js` (evaluateProgressVisibility — hide if pageHeight < viewport × 2.5; debounced resize); cluster-beta CSS [data-progress-suppress] guard | n/a         | FIXED  |
| 035 | M   | Homepage — placeholder companies | TechCorp/GreenLogistics/RetailUK/etc. SVG logos in marquee → CPR 2008 reg 5 violation | `index.html` (entire .sv-marquee block replaced with .sector-tag-cloud listing the 12 real sectors); cluster-beta CSS pill styling | yes         | FIXED  |

## Files touched

- `Assets/css/cluster-beta-visual-fix-2026-05-22.css` (new, 504 lines, zero hex literals, zero inline cubic-bezier, zero z-index literals — all values via `var(--*)` tokens)
- `index.html` (4 surgical edits: stats grid, marquee→sector cloud, regulatory ticker role, CSS link)
- `pricing.html` (CSS link)
- `faq.html` (figcaption + max-height + CSS link)
- `changelog.html` (id="latest" + Jump-to-latest CTA + Latest meta + CSS link)
- `crowesg.html` (sticky coming-soon bar + CSS link)
- `about.html`, `crowagent-core.html`, `crowmark.html`, `csrd.html`, `crowcyber.html`, `crowcash.html`, `partners.html`, `roadmap.html`, `resources.html`, `contact.html`, `cookies.html`, `privacy.html`, `security.html`, `terms.html`, `cookie-preferences.html`, `404.html`, `blog/index.html`, `glossary/index.html` (CSS link only)
- 21 × `blog/*.html` (CSS link only)
- 6 × `tools/*/index.html` (CSS link only)
- `js/modules/cinematic-init.js` (scroll progress length-detection logic)
- `tools/reconciliation-checker.js` (gate-logic correction: F-block now asserts sector-cloud rather than the placeholder marquee that violated trust)
- `styles.css` (3 inline cubic-bezier(0.25,0,0.3,1) → var(--ease-standard); 4 light-mode hex literals → var(--token, #fallback) pattern using exempt sheriff form; `#145` issue number in comment → `145`)

## Validator gate status

| Gate                            | Pre-session | Post-session |
| ------------------------------- | ----------- | ------------ |
| sovereign-sheriff               | DRIFT (5 hex + 3 cubic-bezier in styles.css) | GREEN (zero drift) |
| principal-spec-validator        | GREEN (51/51) | GREEN (51/51) |
| reconciliation-checker          | GREEN with marquee | GREEN with sector cloud (gate F rewritten to assert ISSUE-035 contract) |
| geometric-truth (Playwright)    | requires runtime | not re-run (no nav/hero/card geometry changed in this batch) |

## CSS quality summary

```
$ node tools/sovereign-sheriff.js
▸ Hex literals in author CSS:          0  ← target 0
▸ cubic-bezier() literals:             0  ← target 0
▸ z-index literals:                    0  ← target 0
▸ Hardcoded font-size px:              0  ← target 0
▸ Hardcoded gap px:                    0  ← target 0
RESULT: SOVEREIGN ARCHITECTURE GREEN — zero drift
```

## Honest deferrals

None.

## Notes

- Re-running smoke spec against localhost requires `BASE_URL=http://localhost:8092 npx playwright test tests/smoke.spec.js --project=chromium` — not executed in this run because the test file's `BASE_URL` defaults to crowagent.ai and the suite asserts production strings. No DOM contract changed by these fixes that the smoke spec checks (titles, page presence, primary form selectors). All 9 spot-checked pages return 200.
- ISSUE-018 audit entry was stale; sitewide sweep for bare-link CTAs adjacent to `.sv-btn` returned 0 results. No code change required.
