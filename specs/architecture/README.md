# Architecture Governance — crowagent.ai

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
| [MODERNISATION-ARCHITECTURE.md](../MODERNISATION-ARCHITECTURE.md) | The migration contract: why, target stack, rollout, rollback, success criteria |
| [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) | Cascade layers, component inventory, the no-`!important` rule |
| [DESIGN-TOKENS.md](DESIGN-TOKENS.md) | Every token, its value, and its purpose |
| [MOTION-AND-INTERACTION.md](MOTION-AND-INTERACTION.md) | The six primitives and their binding rules |
| [CONTENT-MODEL.md](CONTENT-MODEL.md) | Collections, schemas, and what is data rather than markup |
| [INFORMATION-ARCHITECTURE.md](INFORMATION-ARCHITECTURE.md) | Routes, navigation, URL preservation |
| [SEO-STANDARDS.md](SEO-STANDARDS.md) | Metadata, structured data, sitemap, canonicals |
| [ACCESSIBILITY-STANDARDS.md](ACCESSIBILITY-STANDARDS.md) | WCAG 2.2 AA target and the specific behaviours that implement it |
| [PERFORMANCE-BUDGETS.md](PERFORMANCE-BUDGETS.md) | Payload ceilings and what is measured |
| [TESTING-AND-QUALITY-GATES.md](TESTING-AND-QUALITY-GATES.md) | Every gate, its command, what it protects against |
| [DEPLOYMENT-AND-RELEASE.md](DEPLOYMENT-AND-RELEASE.md) | Cloudflare Pages, caching, rollback, known traps |
| [CODING-STANDARDS.md](CODING-STANDARDS.md) | Conventions, folder structure, naming |
| [ADR/](ADR/) | Architecture Decision Records |

## Target end state

- Component-based architecture with a single source of truth
- Enterprise design system: reusable components, design tokens, one motion system
- Structured content driving data-generated pages
- Zero unnecessary duplication, technical debt, or legacy complexity
- Top 1% accessibility, SEO, performance and maintainability
- Cloudflare Pages, no increase in recurring hosting cost

## Where the repository actually stands

Measured, not asserted. Update these numbers when they change.

| Metric | Legacy | Rebuild (`astro/`) |
|---|---|---|
| `!important` declarations | **2,279** | **0** |
| Stylesheets | 34 (~1.03 MB) | 1 token file + scoped component styles |
| CSS on the homepage | 575 KB (435 linked + 140 inline) | not yet ported |
| Overlapping motion systems | **11** | **1** |
| Pages as hand-written HTML | 45 | 18 are Markdown behind 4 templates |
| Routes building from templates | 0 | **22** |
| Duplicated `<head>` blocks | 45 | 1 (`Seo.astro`) |

## Honest status

The rebuild is **not** ready to cut over. `tests/parity.spec.js` compares every ported
route against legacy and currently fails, by design, on real differences. Cutover happens
only when that harness is green or every remaining difference is a recorded, intentional
decision. See [ADR/0005](ADR/0005-url-preservation-is-binding.md).
