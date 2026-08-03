# Architecture Governance: crowagent.ai

These specifications are the **single source of truth** for this repository. Code that
conflicts with them is a defect in the code, not in the spec. When an architectural
decision changes, the spec changes first and an ADR records why.

## The governance rule

Before any significant change, four questions. If any answer is "no", redesign before coding.

1. Does this align with the target architecture?
2. Does it reduce architectural debt?
3. Does it improve maintainability, scalability, consistency, or developer experience?
4. Can this become the permanent production implementation?

**Patch mode is not permitted.** A temporary fix, a local workaround, a duplication, or a
change that preserves legacy architecture where a proper implementation is feasible is
rejected. Every commit should leave the repository architecturally cleaner.

## The documents

| Spec | Owns |
|---|---|
| [../PLATFORM-CHARTER.md](../PLATFORM-CHARTER.md) | **The governing document.** Wins over everything here |
| [ARCHITECTURE-VISION.md](ARCHITECTURE-VISION.md) | The technical position, the stack, and where the repository actually stands |
| [MODERNISATION-ARCHITECTURE.md](../MODERNISATION-ARCHITECTURE.md) | The migration contract: why, target stack, rollout, rollback, success criteria |
| [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) | Cascade layers, component inventory, the no-`!important` rule |
| [DESIGN-TOKENS.md](DESIGN-TOKENS.md) | Every token, its value, and its purpose |
| [COMPONENT-LIBRARY.md](COMPONENT-LIBRARY.md) | Every component and layout, what it owns, its props, and the duplicates |
| [MOTION-AND-INTERACTION.md](MOTION-AND-INTERACTION.md) | The motion grammar: beat, cycle, drift, three curves, and the one trigger |
| [CONTENT-ARCHITECTURE.md](CONTENT-ARCHITECTURE.md) | Collections, schemas, and where each fact has its single home |
| [INFORMATION-ARCHITECTURE.md](INFORMATION-ARCHITECTURE.md) | The 41 routes, how they group, navigation, URL preservation |
| [RESPONSIVE-STANDARDS.md](RESPONSIVE-STANDARDS.md) | Breakpoints, the measure scale, overflow and target size |
| [SEO-STANDARDS.md](SEO-STANDARDS.md) | Metadata, structured data, sitemap, canonicals |
| [ACCESSIBILITY-STANDARDS.md](ACCESSIBILITY-STANDARDS.md) | WCAG 2.2 AA target and the specific behaviours that implement it |
| [PERFORMANCE-BUDGETS.md](PERFORMANCE-BUDGETS.md) | Payload ceilings and what is measured |
| [TESTING-AND-QUALITY-GATES.md](TESTING-AND-QUALITY-GATES.md) | Every gate, its command, what it protects against. §12 is the `astro/` build |
| [DEPLOYMENT-AND-RELEASE.md](DEPLOYMENT-AND-RELEASE.md) | Cloudflare Pages, caching, rollback, known traps |
| [CODING-STANDARDS.md](CODING-STANDARDS.md) | Conventions, folder structure, naming, and what is enforced against what is intended |
| [ADR/](ADR/) | Architecture Decision Records |

Two links in the previous version of this table pointed at files that had never existed:
`CONTENT-MODEL.md` (now `CONTENT-ARCHITECTURE.md`) and `CODING-STANDARDS.md` (now written).
`INFORMATION-ARCHITECTURE.md` was also linked and missing; it now exists.

## Target end state

- Component-based architecture with a single source of truth
- Enterprise design system: reusable components, design tokens, one motion system
- Structured content driving data-generated pages
- Zero unnecessary duplication, technical debt, or legacy complexity
- Top 1% accessibility, SEO, performance and maintainability
- Cloudflare Pages, no increase in recurring hosting cost

## Where the repository actually stands

Measured, not asserted. Update these numbers when they change. **Re-measured 2026-08-03.**

| Metric | Legacy | Rebuild (`astro/`) |
|---|---|---|
| `!important` declarations | **2,279** | **0** |
| Stylesheets | 34 (~1.03 MB) | 4 shared + scoped component styles |
| CSS shipped | 575 KB on the homepage (435 linked + 140 inline) | **162 KB total, 17 route bundles** |
| JavaScript files | many | **0** (~7 KB inline per route, all enhancement) |
| Overlapping motion systems | **11** | **1** |
| Routes | 45 hand-written HTML | **41 built**, 18 from Markdown behind 4 templates |
| Duplicated `<head>` blocks | 45 | 1 (`Seo.astro`) |
| Third-party origins at first paint | PostHog, Calendly, Turnstile, Railway | **0** |
| Build gates that fail the build | 7 sub-checks in `build-dist.js` | **5**, all failing-by-default |

## Honest status

**The rebuild is not ready to cut over**, and there are now two reasons rather than one.

1. `tests/parity.spec.js` compares every ported route against legacy and fails, by design, on
   real differences. Cutover happens only when that harness is green or every remaining
   difference is a recorded, intentional decision. See
   [ADR/0005](ADR/0005-url-preservation-is-binding.md).
2. **The `astro/` build's own gates are not clean.** At 2026-08-03 00:45 the design-system gate
   failed on one unrecorded alignment violation, with 5 stale allow-list entries and 9 named debt
   items; 35 minutes later the debt was 7 and the violation was gone, because it was being cleared
   in the same session. **Run the gate rather than trusting a number in a document.**
   `PartnerForm`'s submission to `formspree.io` is separately blocked by the shipped CSP, and no
   gate can see it. All of this is detailed in
   [TESTING-AND-QUALITY-GATES.md](TESTING-AND-QUALITY-GATES.md) §12.

Three routes linked from all 41 pages do not ship yet (`/integrations`, `/roadmap`,
`/cookie-preferences`), each blocked on an owner decision. See
[INFORMATION-ARCHITECTURE.md](INFORMATION-ARCHITECTURE.md) §2.
