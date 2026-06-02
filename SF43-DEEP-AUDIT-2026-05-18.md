# SF43 — Deep multi-agent audit, triage + treatment plan

Submitted: 2026-05-18.
Source: founder-provided multi-agent audit (89 contrast issues + alignment + asset + architectural defects).
Status: every finding captured; awaiting per-item approval before any code change.

## Severity key

- **P0** = invisible/broken content visible to users right now.
- **P1** = visual drift between pages, accessibility risk, regulatory exposure.
- **P2** = architectural cleanup, maintainability, brittleness — no immediate user impact but compounding cost.

## Treatment-strategy key

- **Targeted fix** = one CSS rule, one selector, one file. Low risk.
- **Token harmonisation** = update a CSS custom property + audit usages. Medium risk.
- **Selector untangle** = unwind `!important` chains by removing the upstream rule that started the war.
- **DOM cleanup** = delete zombie nodes or stop generating them. Medium risk.
- **Refactor** = pull a pattern into a single source of truth. Highest reward, highest risk — do under feature flag.

---

## Full triage table

| ID | Pri | Category | Finding (exact) | Treatment strategy | Risk |
|----|-----|----------|------------------|---------------------|------|
| **V1** | **P0** | Visibility | Homepage primary CTAs ("Start free trial", "Book a demo", "Try free calculator") render at **1.00:1 contrast** — fg = bg = `rgb(4, 14, 26)` | **Targeted fix**: find where the gradient bg is being overridden to obsidian on the hero CTAs. Likely a `body.f8-page main a[href*="..."]` rule winning over `.btn-primary-v2`. Add a higher-specificity restoration of the teal gradient bg + obsidian text. Same pattern I fixed earlier for `.priv-cta-primary` and `.terms-cta--primary`. | Low |
| **V2** | **P0** | Visibility | `.sc-num` (KPI numbers in stats section) computed `color: transparent` — likely incomplete GSAP `premium-xform` transition | **Targeted fix**: locate the rule that sets `color: transparent` (probably an "initial" state before a GSAP `to`). Either drop the initial transparent state OR ensure the GSAP timeline always fires. If GSAP fails to load (CDN miss), text must still render — add `@media (prefers-reduced-motion: reduce)` fallback `color: var(--cloud) !important`. | Low |
| **V3** | **P0** | Visibility | `body.f8-legal` "View status page" button + uptime CTA = teal-on-teal | **Targeted fix**: same root cause as V1. `body.f8-legal main a:not(.btn):not(.skip-link)` forces teal on every anchor inside main. Carve out the offending CTAs (`.sec-uptime-cta`, `.uptime-cta`) — I already did this for `.priv-cta` and `.terms-cta`; just extend the same pattern. | Low |
| **V4** | **P0** | Visibility | Announce-bar `×` close = 1.31:1 contrast | **Targeted fix**: `.ab-close { color: var(--mist) }` is too dim on dark bg. Bump to `var(--steel)` or `var(--cloud)` + slightly bolder weight. | Low |
| **V5** | **P0** | Visibility | Persona switcher "IT Manager / Cyber Lead" active state = 1.00:1 (teal text on teal-tinted bg) | **Targeted fix**: `.seg-btn.active` colour needs to be `var(--cloud)` or `var(--bg)` (obsidian) on the teal-tinted bg, not teal itself. Active states must have ≥4.5:1. | Low |
| **A4** | P1 | Alignment | "Hanging label" — `.sh.center` parent text-align:center but `.sh-label` capsule left-aligned (missing `justify-content: center` on flex parent) | **Targeted fix**: `.sh.center { align-items: center }` if column-flex OR `justify-content: center` if row-flex. Audit `.sh` markup variations to pick the right axis. | Low |
| **A5** | P1 | Alignment | Center vs left inconsistency: homepage centred, product "Key Capabilities" left-aligned, blog "Stripe-style" rhythm | **Discussion needed** — these LOOK intentional per page archetype (landing vs product vs editorial). User said earlier "home page and other might not look consistent". I'd flag this as design intent until told otherwise. | n/a |
| **A6** | **P0** | Mobile bug | Bullet leakage: blog/csrd lists wrap text UNDER the absolutely-positioned bullet on mobile | **Targeted fix**: replace `position: absolute; left: 0` bullet pattern with `display: flex; gap: 12px` on `<li>`, OR use `text-indent: -1.5em; padding-left: 1.5em`. Affects `blog-article.css` lists + `csrd.html` lists. Test at 375px. | Low |
| **A7** | P1 | Rhythm | Vertical rhythm wild: `--section-pad-primary` vs `clamp(96px, 14vh, 144px)` vs hardcoded `margin-top: 56px` on blog h2 | **Token harmonisation**: define `--section-y-hero`, `--section-y-primary`, `--section-y-secondary`, `--rhythm-h2`. Replace hardcoded values. Audit per page. | Medium |
| **AS1** | P1 | Assets | Icon geometry chaos: feature 28×28, carousel/nav 16×16, footer 12×12, mixed stroke 2.0 / 2.2 | **Token harmonisation**: define `--icon-sm` (14), `--icon-md` (18), `--icon-lg` (24), `--icon-xl` (28) + canonical stroke `2`. Audit + replace. Stroke 2.2 only allowed for high-DPR thin glyphs (none today). | Medium |
| **C5** | P1 | Color | Hardcoded `#00D4AA`, `#10DFBB` instead of `var(--teal)` | **Token harmonisation**: grep all CSS for these hex values, replace with token. Note: `#0CC9A8` is the canonical teal; `#00D4AA` is from an older brand pass — verify which is the source-of-truth before mass replace. | Low |
| **C6** | P1 | Color | `blog-article.css` uses `#8A9DB8` as fallback for `--steel`, but that hex IS `--mist`. Wrong fallback token name → readers get muted text where it should be steel. | **Targeted fix**: 2 lines in blog-article.css — swap `var(--steel, #8A9DB8)` for `var(--steel, #B8CCE0)`. Audit other fallbacks for similar token/hex mismatches. | Low |
| **T4** | P1 | Tables | Pricing `.comparison-table` has horizontal-scroll wrapper; methodology/blog `.reg-table` doesn't → iPhone-SE viewport breaks | **Targeted fix**: wrap every `.reg-table` in `<div class="table-responsive">` (already used by `.comparison-table`). One-pass HTML edit + CSS already exists. | Low |
| **TH1** | P2 | Tokens | Light-mode tokens entirely absent from `brand-tokens.css` despite "light-theme ready" claim | **Discussion needed** — does CrowAgent ever plan to ship light mode? If yes, add the parallel token block. If no, remove the "ready" claim from docs. | n/a |
| **AR1** | P1 | Architecture | "Fix-on-fix" `!important` everywhere in SF21/SF22/SF41 to fight base styles | **Selector untangle**: identify the 5-10 upstream rules being fought (greedy `[class*="source"]`, `body.f8-legal main a:not(.btn)`, `.section-padding a:not(...)`, `body.f8-page figure img { max-height ... !important }`). Tighten those, remove downstream `!important`s. **Do as a separate session** — it's a 2-day refactor. | High |
| **AR2** | **P0** | Z-index | Header z:200, announce z:201, mega-menu has TWO declarations (z:300 and z:1010) — menu sometimes behind header glow | **Targeted fix**: enforce a z-index ladder: `--z-base: 0`, `--z-content: 1`, `--z-banner: 90`, `--z-nav: 200`, `--z-announce: 210`, `--z-mega: 300`, `--z-overlay: 1000`, `--z-modal: 1100`, `--z-toast: 1200`. Remove the z:1010 outlier. | Low |
| **AR3** | **P0** | DOM | 1,330 elements at `left: -9999px` or 0×0 — zombie DOM. Entire content sections on `/csrd.html` are this. | **DOM cleanup**: investigate which JS/HTML is creating off-screen nodes. Likely a screen-reader-only pattern misused for layout. Delete dead nodes; preserve real `.sr-only` (which uses `clip-path`, not `left: -9999px`). Audit per page. | Medium |

---

## Treatment-strategy summary

**Wave 1 (P0 fixes, do this session)** — V1, V2, V3, V4, V5, A6, AR2. All targeted fixes, low risk. 7 items, 4 parallel agents possible:

- Agent X: V1 + V3 + V4 + V5 (contrast battery on CTAs + announce + persona) — all in `body.f8-page main a:not(.btn)` family.
- Agent Y: V2 + AR3 (`.sc-num transparent` + zombie DOM on /csrd) — both DOM/JS investigation.
- Agent Z: A6 (bullet leakage on blog + csrd) — markup + CSS list-style.
- Agent W: AR2 (z-index ladder) — single CSS file.

**Wave 2 (P1 fixes, next session)** — A4, A7, AS1, C5, C6, T4. Token harmonisation + per-page audit. Higher coupling — sequence carefully.

**Wave 3 (P2 / discussion)** — A5, TH1, AR1. Need founder decisions:
- A5: keep page-archetype layout differences as design intent?
- TH1: ship light mode or remove the claim?
- AR1: schedule the full specificity untangle as a separate sprint?

---

## Things I'd flag before touching

1. **V1 + V3** are the same root cause as the priv-cta / terms-cta bugs I already fixed. The greedy `body.f8-legal main a:not(.btn):not(.skip-link) { color: var(--teal) }` rule and the `body.f8-page main a:not(.btn) { color: var(--cloud) }` family keep biting. The right fix is to **remove that family entirely** and add explicit `.priv-prose a`, `.terms-prose a`, `.blog-stripe-prose a` rules. That's AR1 (architecture untangle). Until that lands, every new CTA needs a defensive `!important`.

2. **AR3 (zombie DOM)** — 1,330 off-screen elements is a lot. Need to find the generator. Could be:
   - Persona-switcher `.seg-text` spans that hide via `[hidden]` or `display: none` (legitimate, ~30 of them)
   - GSAP placeholder nodes
   - Accessibility-test inline markers (audit tooling that wasn't cleaned up)
   - SVG `<defs>` with unused gradients
   Investigation is half the fix. Risk of regression if a legitimate hidden node is deleted.

3. **C5 token replace** — `#00D4AA` vs `#0CC9A8` — pick ONE as canonical. Brand master likely says `#0CC9A8` (it's what `--teal` resolves to). The `#00D4AA` is from an older spec pass.

Approval needed on: Wave 1 (P0s) — can I dispatch the 4 parallel agents? Or do you want me to do them sequentially?
